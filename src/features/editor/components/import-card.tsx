"use client";

import { X } from "lucide-react";
import { type ReactNode, useEffect, useId, useRef, useState } from "react";
import { toast } from "sonner";

import { Spinner } from "@/components/ui/spinner";
import type { DishDraft } from "@/features/menu/schema";
import { importConfig } from "@/features/recipe-import/config";
import {
	canImport,
	emptyImportInput,
	fileProblem,
	filesProblem,
	type ImportInput,
	requestImport,
} from "@/features/recipe-import/lib/import-input";
import type { ImportResponseData } from "@/features/recipe-import/types";
import {
	useErrorText,
	useLocale,
	useMessages,
} from "@/lib/i18n/locale-provider";
import type { Locale } from "@/lib/i18n/localized";
import { cn } from "@/lib/utils";

import { CardButton, EditorCard, EditorCardLayout } from "./editor-card";
import { LanguageToggle } from "./language-toggle";

/** Where a new dish comes from: typed by hand, or read by the LLM (#52). */
const sources = ["scratch", "text", "photo", "url"] as const;

export type Source = (typeof sources)[number];

interface ImportCardProps {
	dish: DishDraft;
	onChange: (dish: DishDraft) => void;
	source: Source;
	onSourceChange: (source: Source) => void;
	input: ImportInput;
	onInputChange: (input: ImportInput) => void;
	/** Scratch: carry on with the typed dish. */
	onNext: () => void;
	/** Text, Photo or URL: the import came back. */
	onImported: (data: ImportResponseData) => void;
	onCancel: () => void;
	ghost?: ReactNode;
}

const fieldClass =
	"border-editor-card-foreground placeholder:text-editor-card-foreground/50 bg-transparent focus:outline-none disabled:opacity-60";

function Field({
	value,
	onChange,
	placeholder,
	disabled,
}: {
	value: string;
	onChange: (value: string) => void;
	placeholder: string;
	disabled?: boolean;
}) {
	return (
		<input
			value={value}
			onChange={(event) => onChange(event.target.value)}
			placeholder={placeholder}
			disabled={disabled}
			className={cn(fieldClass, "w-2/3 border-b py-1.5 uppercase")}
		/>
	);
}

/** The import card's heading, level with the language toggle. */
export function ImportHeading({ id }: { id?: string }) {
	const t = useMessages();
	return (
		<p id={id} className="text-subheading font-bold uppercase">
			{t.importCard.heading}
		</p>
	);
}

/** Choose or drop photos and PDFs; lists them with their problems. */
function FilePicker({
	files,
	onChange,
	disabled,
}: {
	files: File[];
	onChange: (files: File[]) => void;
	disabled?: boolean;
}) {
	const t = useMessages();
	const errorText = useErrorText();
	const inputRef = useRef<HTMLInputElement>(null);
	const [over, setOver] = useState(false);
	const { maxCount, maxImageBytes, maxPdfBytes, maxTotalBytes, types } =
		importConfig.files;
	const mb = (bytes: number) => bytes / 1024 / 1024;
	const tooMuch = filesProblem(files);

	function add(list: FileList | null) {
		if (!list) return;
		const next = [...files, ...Array.from(list)];
		if (next.length > maxCount) {
			toast.error(
				errorText({ key: "tooManyFiles", values: { count: maxCount } })
			);
		}
		onChange(next.slice(0, maxCount));
	}

	return (
		<div className="flex flex-col gap-2">
			<button
				type="button"
				disabled={disabled}
				onClick={() => inputRef.current?.click()}
				onDragOver={(event) => {
					event.preventDefault();
					setOver(true);
				}}
				onDragLeave={() => setOver(false)}
				onDrop={(event) => {
					event.preventDefault();
					setOver(false);
					if (!disabled) add(event.dataTransfer.files);
				}}
				className={cn(
					"border-editor-card-foreground flex h-28 cursor-pointer flex-col items-center justify-center gap-1 border border-dashed text-center disabled:cursor-default disabled:opacity-60",
					over && "bg-editor-card-foreground/10"
				)}
			>
				<span className="font-bold uppercase">{t.importCard.chooseFiles}</span>
				<span className="text-caption">
					{t.importCard.fileLimits({
						imageMb: mb(maxImageBytes),
						pdfMb: mb(maxPdfBytes),
						count: maxCount,
						totalMb: mb(maxTotalBytes),
					})}
				</span>
			</button>
			<input
				ref={inputRef}
				type="file"
				multiple
				accept={types.join(",")}
				className="hidden"
				onChange={(event) => {
					add(event.target.files);
					event.target.value = "";
				}}
			/>
			{files.length > 0 && (
				<ul className="text-caption flex flex-col gap-1">
					{files.map((file, i) => {
						const problem = fileProblem(file);
						return (
							<li key={`${file.name}-${i}`} className="flex items-center gap-2">
								<span className="min-w-0 truncate">{file.name}</span>
								{problem && (
									<span className="font-bold">{errorText(problem)}</span>
								)}
								<button
									type="button"
									aria-label={t.importCard.removeFile({ name: file.name })}
									disabled={disabled}
									onClick={() => onChange(files.filter((_, j) => j !== i))}
									className="ml-auto cursor-pointer disabled:cursor-default"
								>
									<X className="size-[1.1em]" />
								</button>
							</li>
						);
					})}
				</ul>
			)}
			{tooMuch && (
				<p className="text-caption font-bold">{errorText(tooMuch)}</p>
			)}
		</div>
	);
}

/** The import card's body: pick a source, then fill it in. */
export function ImportForm({
	dish,
	onChange,
	locale,
	source,
	onSourceChange,
	input = emptyImportInput,
	onInputChange,
	busy = false,
	labelledBy,
}: {
	dish: DishDraft;
	onChange: (dish: DishDraft) => void;
	locale: Locale;
	source: Source;
	onSourceChange: (source: Source) => void;
	input?: ImportInput;
	onInputChange?: (input: ImportInput) => void;
	/** While an import is running: everything waits. */
	busy?: boolean;
	/** Id of the heading that names the source choice. */
	labelledBy?: string;
}) {
	const t = useMessages();
	// Unique per form: the mirrored copy on the menu card's back has its own
	// radios, and one shared name would make them a single group.
	const name = useId();
	const setInput = (change: Partial<ImportInput>) =>
		onInputChange?.({ ...input, ...change });
	return (
		<div className="text-body flex flex-col gap-4">
			<fieldset aria-labelledby={labelledBy} disabled={busy}>
				<div className="flex gap-6">
					{sources.map((id) => (
						<label
							key={id}
							className="flex cursor-pointer items-center gap-2 uppercase"
						>
							<input
								type="radio"
								name={name}
								value={id}
								checked={source === id}
								onChange={() => onSourceChange(id)}
								className="border-editor-card-foreground checked:bg-editor-card-foreground size-[1em] cursor-pointer appearance-none rounded-full border checked:shadow-[inset_0_0_0_2px_var(--editor-menu-card)]"
							/>
							{t.importCard.sources[id]}
						</label>
					))}
				</div>
			</fieldset>
			{source === "scratch" && (
				<div className="flex flex-col gap-3">
					<Field
						value={dish.name[locale] ?? ""}
						onChange={(value) =>
							onChange({ ...dish, name: { ...dish.name, [locale]: value } })
						}
						placeholder={t.importCard.dishName}
					/>
					<Field
						value={dish.description?.[locale] ?? ""}
						onChange={(value) =>
							onChange({
								...dish,
								description: { ...dish.description, [locale]: value },
							})
						}
						placeholder={t.importCard.descriptionOptional}
					/>
				</div>
			)}
			{source === "text" && (
				<textarea
					value={input.text}
					onChange={(event) => setInput({ text: event.target.value })}
					disabled={busy}
					maxLength={importConfig.maxTextLength}
					placeholder={t.importCard.pasteRecipe}
					className={cn(fieldClass, "h-32 resize-none border p-2")}
				/>
			)}
			{source === "photo" && (
				<FilePicker
					files={input.files}
					onChange={(files) => setInput({ files })}
					disabled={busy}
				/>
			)}
			{source === "url" && (
				<Field
					value={input.url}
					onChange={(url) => setInput({ url })}
					placeholder="https://"
					disabled={busy}
				/>
			)}
		</div>
	);
}

/** The back of the menu card: starts a new dish for a section. */
export function ImportCard({
	dish,
	onChange,
	source,
	onSourceChange,
	input,
	onInputChange,
	onNext,
	onImported,
	onCancel,
	ghost,
}: ImportCardProps) {
	const siteLocale = useLocale();
	const t = useMessages();
	const errorText = useErrorText();
	// Starts in the site language; the toggle only picks what is being edited.
	const [locale, setLocale] = useState<Locale>(siteLocale);
	const [request, setRequest] = useState<AbortController | null>(null);
	const headingId = useId();
	const busy = request !== null;
	const ready = source === "scratch" || canImport(source, input);

	// Leaving the card (Esc, back) stops the import it was waiting for.
	useEffect(() => () => request?.abort(), [request]);

	async function next() {
		if (source === "scratch") {
			onNext();
			return;
		}
		const controller = new AbortController();
		setRequest(controller);
		try {
			const result = await requestImport(source, input, controller.signal);
			if (result.ok) onImported(result.data);
			else toast.error(errorText(result.error));
		} catch (error) {
			if (!controller.signal.aborted) {
				console.error(error);
				toast.error(errorText({ key: "serverUnreachable" }));
			}
		} finally {
			setRequest(null);
		}
	}

	return (
		<EditorCard variant="menu" ghost={ghost} reverse>
			<EditorCardLayout
				variant="menu"
				header={
					<div className="flex items-baseline justify-between gap-6">
						<ImportHeading id={headingId} />
						<LanguageToggle value={locale} onChange={setLocale} />
					</div>
				}
				footer={
					<div className="flex gap-3">
						<CardButton
							variant="primary"
							onClick={next}
							disabled={!ready || busy}
						>
							{busy ? (
								<span className="flex items-center justify-center gap-2">
									<Spinner
										aria-label={t.editor.loading}
										className="size-[1em]"
									/>
									{t.importCard.reading}
								</span>
							) : (
								t.editor.next
							)}
						</CardButton>
						<CardButton
							variant="outline"
							onClick={() => (busy ? request.abort() : onCancel())}
						>
							{t.editor.cancel}
						</CardButton>
					</div>
				}
			>
				<ImportForm
					dish={dish}
					onChange={onChange}
					locale={locale}
					source={source}
					onSourceChange={onSourceChange}
					input={input}
					onInputChange={onInputChange}
					busy={busy}
					labelledBy={headingId}
				/>
			</EditorCardLayout>
		</EditorCard>
	);
}
