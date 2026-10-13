"use client";

import {
	type CollisionDetection,
	closestCenter,
	DndContext,
	type DragEndEvent,
	DragOverlay,
	KeyboardSensor,
	MeasuringStrategy,
	PointerSensor,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import {
	arrayMove,
	SortableContext,
	sortableKeyboardCoordinates,
	useSortable,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
	type FocusEvent,
	type KeyboardEvent,
	type ReactNode,
	useEffect,
	useState,
} from "react";
import { createPortal } from "react-dom";

import type { Locale, LocalizedText } from "@/lib/i18n/localized";
import { cn } from "@/lib/utils";

import { editorDrag } from "../editor-motion";
import { newKey } from "../keys";
import {
	groupBlock,
	type OutlineEntry,
	type OutlineGroup,
	type OutlineRow,
	removeGroup,
} from "../outline";
import { AddRow, RemoveButton, rowListeners, sortableStyle } from "./card-rows";
import { InlineText } from "./inline-text";

/** What an entry's editor gets from the list. */
export interface EntryEditor<E> {
	update: (entry: OutlineEntry<E>) => void;
	/** For the first field: Shift+Tab there turns the entry into a heading. */
	onFirstFieldKeyDown: (event: KeyboardEvent<HTMLElement>) => void;
	/**
	 * For every field: Enter finishes (Shift+Enter is a new line in a text
	 * area), Esc restores the entry.
	 */
	onFieldKeyDown: (event: KeyboardEvent<HTMLElement>) => void;
}

interface OutlineListProps<E> {
	rows: OutlineRow<E>[];
	onChange: (rows: OutlineRow<E>[]) => void;
	locale: Locale;
	/** "Ingredient" or "Step", for the add buttons. */
	entryLabel: string;
	newEntry: () => E;
	/** An entry with nothing filled in; it is dropped when editing ends. */
	isEmptyEntry: (entry: E) => boolean;
	/** Heading text for an entry turned into a heading. */
	entryToHeading: (entry: E) => LocalizedText;
	/** Entry fields for a heading turned into an entry. */
	headingToEntry: (label: LocalizedText) => E;
	/** The entry as one line of text, when it is not being edited. */
	renderEntry: (entry: OutlineEntry<E>) => ReactNode;
	renderEditor: (entry: OutlineEntry<E>, editor: EntryEditor<E>) => ReactNode;
	/** Plain text of a row, for the copy that follows the pointer. */
	rowText: (row: OutlineRow<E>) => string;
}

type DragKind = "group" | "entry";
const kindOf = (data: unknown) =>
	(data as { kind?: DragKind } | undefined)?.kind;

/** While a heading is dragged it only lands on other headings. */
const collision: CollisionDetection = (args) =>
	kindOf(args.active.data.current) === "group"
		? closestCenter({
				...args,
				droppableContainers: args.droppableContainers.filter(
					(c) => kindOf(c.data.current) === "group"
				),
			})
		: closestCenter(args);

function SortableRow({
	id,
	kind,
	disabled,
	className,
	children,
}: {
	id: string;
	kind: DragKind;
	disabled: boolean;
	className: string;
	children: ReactNode;
}) {
	const {
		setNodeRef,
		transform,
		transition,
		isDragging,
		attributes,
		listeners,
	} = useSortable({ id, data: { kind }, disabled });
	return (
		<div
			ref={setNodeRef}
			style={sortableStyle(transform, transition, isDragging)}
			{...attributes}
			{...rowListeners(listeners)}
			className={className}
		>
			{children}
		</div>
	);
}

/**
 * One recipe card list: group headings with entries under them. Entries are
 * edited in place, dragged within and across groups, and turned into
 * headings (Shift+Tab) or back (Tab); a dragged heading takes its entries.
 */
export function OutlineList<E>({
	rows,
	onChange,
	locale,
	entryLabel,
	newEntry,
	isEmptyEntry,
	entryToHeading,
	headingToEntry,
	renderEntry,
	renderEditor,
	rowText,
}: OutlineListProps<E>) {
	const [editingKey, setEditingKey] = useState<string | null>(null);
	const [autoEditKey, setAutoEditKey] = useState<string | null>(null);
	const [activeKey, setActiveKey] = useState<string | null>(null);
	// The entry as it was when editing started, for Esc.
	const [snapshot, setSnapshot] = useState<OutlineEntry<E> | null>(null);
	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: { distance: editorDrag.activationDistance },
		}),
		useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
	);

	// Esc during a drag cancels the drag, not the card.
	useEffect(() => {
		if (!activeKey) return;
		const onKeyDown = (event: globalThis.KeyboardEvent) => {
			if (event.key === "Escape") event.preventDefault();
		};
		window.addEventListener("keydown", onKeyDown, true);
		return () => window.removeEventListener("keydown", onKeyDown, true);
	}, [activeKey]);

	const replaceRow = (key: string, row: OutlineRow<E>) =>
		onChange(rows.map((r) => (r.key === key ? row : r)));

	function startEditing(entry: OutlineEntry<E>) {
		setSnapshot(entry);
		setEditingKey(entry.key);
	}

	/** Shift+Tab: the entry becomes a heading over the entries after it. */
	function entryToGroup(entry: OutlineEntry<E>) {
		const group: OutlineGroup = {
			kind: "group",
			key: entry.key,
			label: entryToHeading(entry),
		};
		setEditingKey(null);
		setAutoEditKey(entry.key);
		replaceRow(entry.key, group);
	}

	/** Tab: the heading becomes an entry of the group above. */
	function groupToEntry(group: OutlineGroup) {
		if (rows.findIndex((r) => r.key === group.key) === 0) return;
		const entry = {
			...headingToEntry(group.label),
			kind: "entry",
			key: group.key,
		} as OutlineEntry<E>;
		replaceRow(group.key, entry);
		startEditing(entry);
	}

	function addEntry(groupKey: string) {
		const { end } = groupBlock(rows, groupKey);
		const entry = {
			...newEntry(),
			kind: "entry",
			key: newKey(),
		} as OutlineEntry<E>;
		onChange([...rows.slice(0, end), entry, ...rows.slice(end)]);
		startEditing(entry);
	}

	function addGroup() {
		const key = newKey();
		setAutoEditKey(key);
		onChange([...rows, { kind: "group", key, label: {} }]);
	}

	function remove(row: OutlineRow<E>) {
		if (row.kind === "entry") onChange(rows.filter((r) => r.key !== row.key));
		else onChange(removeGroup(rows, row.key));
	}

	/** Ends editing; an entry left empty is dropped. */
	function finishEditing() {
		const entry = rows.find((r) => r.key === editingKey);
		setEditingKey(null);
		if (entry?.kind === "entry" && isEmptyEntry(entry)) {
			onChange(rows.filter((r) => r.key !== entry.key));
		}
	}

	function onDragEnd({ active, over }: DragEndEvent) {
		setActiveKey(null);
		if (!over || active.id === over.id) return;
		if (kindOf(active.data.current) === "group") {
			// Move whole blocks: a heading and its entries.
			const blocks: OutlineRow<E>[][] = [];
			for (const row of rows) {
				if (row.kind === "group" || blocks.length === 0) blocks.push([row]);
				else blocks.at(-1)!.push(row);
			}
			const from = blocks.findIndex((b) => b[0].key === active.id);
			const to = blocks.findIndex((b) => b[0].key === over.id);
			if (from < 0 || to < 0) return;
			onChange(arrayMove(blocks, from, to).flat());
			return;
		}
		const from = rows.findIndex((r) => r.key === active.id);
		const to = rows.findIndex((r) => r.key === over.id);
		if (from < 0 || to < 0) return;
		const next = arrayMove(rows, from, to);
		// An entry cannot sit above the first heading.
		if (next[0]?.kind === "entry" && next.length > 1) {
			[next[0], next[1]] = [next[1], next[0]];
		}
		onChange(next);
	}

	// A dragged heading hides its entries until it is dropped.
	const hidden = new Set<string>();
	const active = rows.find((r) => r.key === activeKey);
	if (active?.kind === "group") {
		const { start, end } = groupBlock(rows, active.key);
		rows.slice(start + 1, end).forEach((r) => hidden.add(r.key));
	}
	const visible = rows.filter((r) => !hidden.has(r.key));

	function entryEditor(entry: OutlineEntry<E>): EntryEditor<E> {
		return {
			update: (next) => replaceRow(entry.key, next),
			onFirstFieldKeyDown: (event) => {
				if (event.key === "Tab" && event.shiftKey) {
					event.preventDefault();
					entryToGroup(entry);
				}
			},
			onFieldKeyDown: (event) => {
				if (
					event.key === "Enter" &&
					!(event.shiftKey && event.target instanceof HTMLTextAreaElement)
				) {
					event.preventDefault();
					finishEditing();
				} else if (event.key === "Escape") {
					event.preventDefault();
					if (snapshot?.key === entry.key) {
						// A new entry restored to empty is dropped like any other.
						if (isEmptyEntry(snapshot)) {
							onChange(rows.filter((r) => r.key !== entry.key));
						} else replaceRow(entry.key, snapshot);
					}
					setEditingKey(null);
				}
			},
		};
	}

	/** Leaving the row's fields for somewhere else ends editing. */
	const onRowBlur = (event: FocusEvent<HTMLElement>) => {
		if (!event.currentTarget.contains(event.relatedTarget)) finishEditing();
	};

	return (
		<div className="text-body pl-6">
			<DndContext
				sensors={sensors}
				collisionDetection={collision}
				measuring={{ droppable: { strategy: MeasuringStrategy.Always } }}
				onDragStart={({ active }) => {
					setEditingKey(null);
					setActiveKey(String(active.id));
				}}
				onDragEnd={onDragEnd}
				onDragCancel={() => setActiveKey(null)}
			>
				<SortableContext
					items={visible.map((r) => r.key)}
					strategy={verticalListSortingStrategy}
				>
					{visible.map((row, i) => {
						const next = visible[i + 1];
						const endsGroup = !next || next.kind === "group";
						const groupKey =
							row.kind === "group"
								? row.key
								: [...visible.slice(0, i + 1)]
										.reverse()
										.find((r) => r.kind === "group")?.key;
						const addEntryRow = endsGroup && groupKey && !hidden.size && (
							<AddRow
								label={entryLabel}
								onClick={() => addEntry(groupKey)}
								className="ml-8 w-[calc(100%-2rem)]"
							/>
						);
						if (row.kind === "group") {
							return (
								<div key={row.key}>
									<SortableRow
										id={row.key}
										kind="group"
										disabled={editingKey === row.key}
										className="group border-editor-card-foreground relative border-b py-1.5 outline-none focus-visible:outline-2"
									>
										<RemoveButton
											label="Remove group"
											onClick={() => remove(row)}
										/>
										<InlineText
											value={row.label[locale] ?? ""}
											onChange={(value) =>
												replaceRow(row.key, {
													...row,
													label: { ...row.label, [locale]: value },
												})
											}
											placeholder="Group (optional)"
											autoEdit={autoEditKey === row.key}
											onEditingChange={(editing) =>
												setEditingKey((current) =>
													editing
														? row.key
														: current === row.key
															? null
															: current
												)
											}
											onFieldKeyDown={(event) => {
												if (event.key === "Tab" && !event.shiftKey) {
													event.preventDefault();
													groupToEntry(row);
												}
											}}
											className="font-bold uppercase"
										/>
									</SortableRow>
									{addEntryRow}
								</div>
							);
						}
						const editing = editingKey === row.key;
						return (
							<div key={row.key}>
								<SortableRow
									id={row.key}
									kind="entry"
									disabled={editing}
									// While editing, the fields' own underlines replace the row's.
									className={cn(
										"group border-editor-card-foreground relative ml-8 border-b py-1.5 outline-none focus-visible:outline-2",
										editing && "border-transparent"
									)}
								>
									<RemoveButton
										label={`Remove ${entryLabel.toLowerCase()}`}
										onClick={() => remove(row)}
									/>
									{editing ? (
										<div onBlur={onRowBlur}>
											{renderEditor(row, entryEditor(row))}
										</div>
									) : (
										<button
											type="button"
											onClick={() => startEditing(row)}
											onKeyDown={(event) => {
												if (event.key === "Tab" && event.shiftKey) {
													event.preventDefault();
													entryToGroup(row);
												}
											}}
											className="w-full cursor-text text-left"
										>
											{renderEntry(row)}
										</button>
									)}
								</SortableRow>
								{addEntryRow}
							</div>
						);
					})}
				</SortableContext>
				{activeKey &&
					createPortal(
						<DragOverlay dropAnimation={null}>
							{active && (
								<div
									className={cn(
										"bg-editor-recipe-card text-editor-card-foreground text-body cursor-grabbing px-3 py-1.5 shadow-lg",
										active.kind === "group" && "font-bold uppercase"
									)}
								>
									{rowText(active)}
								</div>
							)}
						</DragOverlay>,
						document.body
					)}
			</DndContext>
			<AddRow label="Group" onClick={addGroup} className="font-bold" />
		</div>
	);
}
