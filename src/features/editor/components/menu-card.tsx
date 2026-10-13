"use client";

import {
	type CollisionDetection,
	closestCenter,
	DndContext,
	DragOverlay,
	type DragEndEvent,
	type DragOverEvent,
	KeyboardSensor,
	MeasuringStrategy,
	PointerSensor,
	pointerWithin,
	useDroppable,
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
import { CSS } from "@dnd-kit/utilities";
import { ArrowUpRight } from "lucide-react";
import {
	type CSSProperties,
	type HTMLAttributes,
	type ReactNode,
	useEffect,
	useRef,
	useState,
} from "react";
import { createPortal } from "react-dom";

import { defaultLocale, type Locale } from "@/lib/i18n/localized";
import { cn } from "@/lib/utils";

import { editorDrag } from "../editor-motion";
import {
	findSection,
	type MenuItemModel,
	type MenuModel,
	moveItem,
	newKey,
	type SectionModel,
} from "../menu-model";
import { CardButton, EditorCard, EditorCardLayout } from "./editor-card";
import { InlineText } from "./inline-text";
import { LanguageToggle } from "./language-toggle";
import { SquareIcon } from "./square-icon";

interface MenuCardProps {
	/** Null while the draft loads. */
	model: MenuModel | null;
	onChange: (model: MenuModel) => void;
	/** The recipe a menu item presents, if it is known. */
	recipeIdOf: (itemId: string) => string | undefined;
	onOpenRecipe: (recipeId: string) => void;
	/** Turns the card over to add a dish to a saved section. */
	onAddDish: (sectionId: string) => void;
	onSave: () => void;
	saving: boolean;
	onCancel: () => void;
	/** The import side, showing faintly through the card. */
	ghost?: ReactNode;
}

type DragData =
	| { type: "section" }
	| { type: "item"; sectionKey: string }
	| { type: "section-body"; sectionKey: string };

const dragType = (data: unknown) => (data as DragData | undefined)?.type;

/**
 * Sections only land on sections. Items land on the item under the
 * pointer, else an empty section's body, else the nearest item.
 */
const collision: CollisionDetection = (args) => {
	const type = dragType(args.active.data.current);
	const of = (...types: string[]) =>
		args.droppableContainers.filter((c) =>
			types.includes(dragType(c.data.current) ?? "")
		);
	if (type === "section") {
		return closestCenter({ ...args, droppableContainers: of("section") });
	}
	const within = pointerWithin({
		...args,
		droppableContainers: of("item", "section-body"),
	});
	const items = within.filter((hit) => of("item").some((c) => c.id === hit.id));
	if (items.length) return items;
	if (within.length) return within;
	return closestCenter({ ...args, droppableContainers: of("item") });
};

/** A row's drag listeners, minus the keyboard ones its inner buttons would trigger. */
function rowListeners(
	listeners: ReturnType<typeof useSortable>["listeners"]
): HTMLAttributes<HTMLElement> {
	const { onKeyDown, ...pointer } = listeners ?? {};
	return {
		...pointer,
		onKeyDown: (event) => {
			if (event.target === event.currentTarget) onKeyDown?.(event);
		},
	};
}

function sortableStyle(
	transform: Parameters<typeof CSS.Translate.toString>[0],
	transition: string | undefined,
	dragging: boolean
): CSSProperties {
	return {
		transform: CSS.Translate.toString(transform),
		transition,
		opacity: dragging ? editorDrag.draggingOpacity : undefined,
		position: "relative",
		zIndex: dragging ? 1 : undefined,
	};
}

function RemoveButton({
	label,
	onClick,
}: {
	label: string;
	onClick: () => void;
}) {
	return (
		<button
			type="button"
			aria-label={label}
			onClick={onClick}
			className="absolute top-1/2 -left-5 grid -translate-y-1/2 cursor-pointer place-items-center opacity-0 group-focus-within:opacity-100 group-hover:opacity-100"
		>
			<SquareIcon sign="minus" />
		</button>
	);
}

function AddRow({
	label,
	onClick,
	disabled,
	title,
	className,
}: {
	label: string;
	onClick: () => void;
	disabled?: boolean;
	title?: string;
	className?: string;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			disabled={disabled}
			title={title}
			className={cn(
				"border-editor-card-foreground flex w-full cursor-pointer items-center gap-1.5 border-b py-1.5 text-left uppercase disabled:cursor-default disabled:opacity-40",
				className
			)}
		>
			<SquareIcon sign="plus" />
			{label}
		</button>
	);
}

interface RowProps {
	locale: Locale;
	editingKey: string | null;
	onEditing: (key: string, editing: boolean) => void;
	autoEditKey: string | null;
}

function ItemRow({
	item,
	sectionKey,
	recipeId,
	onOpenRecipe,
	onChange,
	onRemove,
	locale,
	editingKey,
	onEditing,
}: RowProps & {
	item: MenuItemModel;
	sectionKey: string;
	recipeId?: string;
	onOpenRecipe: (recipeId: string) => void;
	onChange: (item: MenuItemModel) => void;
	onRemove: () => void;
}) {
	const {
		setNodeRef,
		transform,
		transition,
		isDragging,
		attributes,
		listeners,
	} = useSortable({
		id: item.key,
		data: { type: "item", sectionKey } satisfies DragData,
		disabled: editingKey === item.key,
	});
	return (
		<div
			ref={setNodeRef}
			style={sortableStyle(transform, transition, isDragging)}
			{...attributes}
			{...rowListeners(listeners)}
			className="group border-editor-card-foreground ml-8 border-b py-1.5 outline-none focus-visible:outline-2"
		>
			<RemoveButton label="Remove dish from menu" onClick={onRemove} />
			<div className="flex items-center gap-1.5">
				<InlineText
					value={item.name[locale] ?? ""}
					onChange={(value) =>
						onChange({ ...item, name: { ...item.name, [locale]: value } })
					}
					placeholder="Dish name"
					onEditingChange={(editing) => onEditing(item.key, editing)}
					className="w-auto uppercase"
				/>
				{recipeId && (
					<button
						type="button"
						aria-label="Edit recipe"
						onClick={() => onOpenRecipe(recipeId)}
						className="cursor-pointer opacity-0 group-focus-within:opacity-100 group-hover:opacity-100"
					>
						<ArrowUpRight className="size-[1.1em]" strokeWidth={1.5} />
					</button>
				)}
			</div>
			<InlineText
				value={item.description?.[locale] ?? ""}
				onChange={(value) =>
					onChange({
						...item,
						description: { ...item.description, [locale]: value },
					})
				}
				placeholder="Description"
				onEditingChange={(editing) => onEditing(item.key, editing)}
				className="text-caption font-light"
			/>
		</div>
	);
}

function SectionBlock({
	section,
	onChange,
	onRemove,
	onAddDish,
	children,
	locale,
	editingKey,
	onEditing,
	autoEditKey,
}: RowProps & {
	section: SectionModel;
	onChange: (section: SectionModel) => void;
	onRemove: () => void;
	onAddDish: () => void;
	children: ReactNode;
}) {
	const {
		setNodeRef,
		transform,
		transition,
		isDragging,
		attributes,
		listeners,
	} = useSortable({
		id: section.key,
		data: { type: "section" } satisfies DragData,
		disabled: editingKey === section.key,
	});
	const { setNodeRef: setBodyRef } = useDroppable({
		id: `body:${section.key}`,
		data: { type: "section-body", sectionKey: section.key } satisfies DragData,
	});
	return (
		<div
			ref={setNodeRef}
			style={sortableStyle(transform, transition, isDragging)}
		>
			<div
				{...attributes}
				{...rowListeners(listeners)}
				className="group border-editor-card-foreground relative border-b py-1.5 outline-none focus-visible:outline-2"
			>
				<RemoveButton label="Remove section" onClick={onRemove} />
				<InlineText
					value={section.label?.[locale] ?? ""}
					onChange={(value) =>
						onChange({
							...section,
							label: { ...section.label, [locale]: value },
						})
					}
					placeholder="Section name"
					autoEdit={autoEditKey === section.key}
					onEditingChange={(editing) => onEditing(section.key, editing)}
					className="font-bold uppercase"
				/>
			</div>
			<div ref={setBodyRef}>
				<SortableContext
					items={section.items.map((item) => item.key)}
					strategy={verticalListSortingStrategy}
				>
					{children}
				</SortableContext>
				<AddRow
					label="Dish"
					onClick={onAddDish}
					disabled={!section.id}
					title={section.id ? undefined : "Save the menu to add dishes here"}
					className="ml-8 w-[calc(100%-2rem)]"
				/>
			</div>
		</div>
	);
}

/** The copy of a dragged section or dish that follows the pointer. */
function DragPreview({
	model,
	activeKey,
	locale,
}: {
	model: MenuModel;
	activeKey: string | null;
	locale: Locale;
}) {
	const section = model.sections.find((s) => s.key === activeKey);
	const item = model.sections
		.flatMap((s) => s.items)
		.find((i) => i.key === activeKey);
	const text = (value: { en?: string; zh?: string } | null | undefined) =>
		value?.[locale] || value?.en || value?.zh || "";
	return (
		<div className="bg-editor-menu-card text-editor-card-foreground text-body cursor-grabbing px-3 py-1.5 uppercase shadow-lg">
			{section ? (
				<>
					<p className="font-bold">{text(section.label) || "Section"}</p>
					{section.items.map((i) => (
						<p key={i.key} className="pl-8">
							{text(i.name)}
						</p>
					))}
				</>
			) : (
				item && <p>{text(item.name)}</p>
			)}
		</div>
	);
}

/** Edits one menu book: its name, sections and dishes. */
export function MenuCard({
	model,
	onChange,
	recipeIdOf,
	onOpenRecipe,
	onAddDish,
	onSave,
	saving,
	onCancel,
	ghost,
}: MenuCardProps) {
	const [locale, setLocale] = useState<Locale>(defaultLocale);
	const [editingKey, setEditingKey] = useState<string | null>(null);
	const [autoEditKey, setAutoEditKey] = useState<string | null>(null);
	// The row being dragged; a copy of it follows the pointer in an overlay.
	const [activeKey, setActiveKey] = useState<string | null>(null);
	const dragging = activeKey !== null;
	// The draft before a drag, restored if the drag is cancelled.
	const beforeDrag = useRef<MenuModel | null>(null);
	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: { distance: editorDrag.activationDistance },
		}),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		})
	);

	// Esc during a drag cancels the drag, not the card.
	useEffect(() => {
		if (!dragging) return;
		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape") event.preventDefault();
		};
		window.addEventListener("keydown", onKeyDown, true);
		return () => window.removeEventListener("keydown", onKeyDown, true);
	}, [dragging]);

	const onEditing = (key: string, editing: boolean) =>
		setEditingKey((current) =>
			editing ? key : current === key ? null : current
		);

	function updateSection(index: number, section: SectionModel) {
		if (!model) return;
		const sections = [...model.sections];
		sections[index] = section;
		onChange({ ...model, sections });
	}

	function onDragOver({ active, over }: DragOverEvent) {
		if (!model || !over || dragType(active.data.current) !== "item") return;
		const key = String(active.id);
		const overData = over.data.current as DragData | undefined;
		const target =
			overData?.type === "section-body"
				? model.sections.findIndex((s) => s.key === overData.sectionKey)
				: findSection(model, String(over.id));
		const from = findSection(model, key);
		if (target < 0 || target === from) return;
		const items = model.sections[target].items;
		const index =
			overData?.type === "item"
				? items.findIndex((i) => i.key === over.id)
				: items.length;
		onChange(moveItem(model, key, model.sections[target].key, index));
	}

	function onDragEnd({ active, over }: DragEndEvent) {
		setActiveKey(null);
		beforeDrag.current = null;
		if (!model || !over || active.id === over.id) return;
		if (dragType(active.data.current) === "section") {
			const keys = model.sections.map((s) => s.key);
			const from = keys.indexOf(String(active.id));
			const to = keys.indexOf(String(over.id));
			if (from < 0 || to < 0) return;
			onChange({ ...model, sections: arrayMove(model.sections, from, to) });
			return;
		}
		const s = findSection(model, String(active.id));
		const items = model.sections[s]?.items ?? [];
		const from = items.findIndex((i) => i.key === active.id);
		const to = items.findIndex((i) => i.key === over.id);
		if (from < 0 || to < 0) return;
		updateSection(s, {
			...model.sections[s],
			items: arrayMove(items, from, to),
		});
	}

	function addSection() {
		if (!model) return;
		const key = newKey();
		setAutoEditKey(key);
		onChange({
			...model,
			sections: [...model.sections, { key, label: {}, items: [] }],
		});
	}

	const rowProps = { locale, editingKey, onEditing, autoEditKey };

	return (
		<EditorCard variant="menu" ghost={ghost}>
			<EditorCardLayout
				variant="menu"
				header={
					<div className="flex items-baseline justify-between gap-6">
						{model ? (
							<InlineText
								value={model.label[locale] ?? ""}
								onChange={(value) =>
									onChange({
										...model,
										label: { ...model.label, [locale]: value },
									})
								}
								placeholder="Menu name"
								className="text-title font-bold uppercase"
							/>
						) : (
							<span />
						)}
						<LanguageToggle value={locale} onChange={setLocale} />
					</div>
				}
				footer={
					<div className="flex gap-3">
						<CardButton
							variant="primary"
							onClick={onSave}
							disabled={!model || saving}
						>
							{saving ? "Saving" : "Save"}
						</CardButton>
						<CardButton variant="outline" onClick={onCancel}>
							Cancel
						</CardButton>
					</div>
				}
			>
				{model ? (
					<div className="text-body pl-6">
						<DndContext
							sensors={sensors}
							collisionDetection={collision}
							// Rows change height and move between sections mid-drag.
							measuring={{
								droppable: { strategy: MeasuringStrategy.Always },
							}}
							onDragStart={({ active }) => {
								setActiveKey(String(active.id));
								beforeDrag.current = model;
							}}
							onDragOver={onDragOver}
							onDragEnd={onDragEnd}
							onDragCancel={() => {
								setActiveKey(null);
								if (beforeDrag.current) onChange(beforeDrag.current);
								beforeDrag.current = null;
							}}
						>
							<SortableContext
								items={model.sections.map((s) => s.key)}
								strategy={verticalListSortingStrategy}
							>
								{model.sections.map((section, s) => (
									<SectionBlock
										key={section.key}
										section={section}
										onChange={(next) => updateSection(s, next)}
										onRemove={() =>
											onChange({
												...model,
												sections: model.sections.filter((_, i) => i !== s),
											})
										}
										onAddDish={() => section.id && onAddDish(section.id)}
										{...rowProps}
									>
										{section.items.map((item, i) => (
											<ItemRow
												key={item.key}
												item={item}
												sectionKey={section.key}
												recipeId={recipeIdOf(item.id)}
												onOpenRecipe={onOpenRecipe}
												onChange={(next) => {
													const items = [...section.items];
													items[i] = next;
													updateSection(s, { ...section, items });
												}}
												onRemove={() =>
													updateSection(s, {
														...section,
														items: section.items.filter((_, j) => j !== i),
													})
												}
												{...rowProps}
											/>
										))}
									</SectionBlock>
								))}
							</SortableContext>
							{/*
							 * In a portal: the card's drop shadow is a filter, which would
							 * make the overlay's fixed position relative to the card.
							 */}
							{dragging &&
								createPortal(
									<DragOverlay dropAnimation={null}>
										<DragPreview
											model={model}
											activeKey={activeKey}
											locale={locale}
										/>
									</DragOverlay>,
									document.body
								)}
						</DndContext>
						<AddRow
							label="Section"
							onClick={addSection}
							className="font-bold"
						/>
					</div>
				) : (
					<p className="text-body opacity-50">Loading…</p>
				)}
			</EditorCardLayout>
		</EditorCard>
	);
}
