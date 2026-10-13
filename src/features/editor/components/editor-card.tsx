import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type EditorCardVariant = "menu" | "recipe";

interface EditorCardProps {
	/** Menu: punched along the top, with a paper clip. Recipe: a ticket. */
	variant: EditorCardVariant;
	/** The card's other face, showing faintly through the stock, mirrored. */
	ghost?: ReactNode;
	children: ReactNode;
}

/** The card stock an editor card is drawn on; content sits in children. */
export function EditorCard({ variant, ghost, children }: EditorCardProps) {
	const menu = variant === "menu";
	return (
		// The mask would clip a shadow, so the shadow sits on this wrapper.
		<div
			className={cn(
				"relative drop-shadow-2xl",
				menu ? "w-(--editor-menu-card-width)" : "w-(--editor-recipe-card-width)"
			)}
		>
			<div
				data-editor-card
				className={cn(
					"text-editor-card-foreground relative isolate flex flex-col",
					menu
						? "editor-punched bg-editor-menu-card h-(--editor-menu-card-height)"
						: "editor-ticket bg-editor-recipe-card h-(--editor-recipe-card-height)"
				)}
			>
				<div
					aria-hidden
					className="paper-texture pointer-events-none absolute inset-0"
				/>
				{ghost && (
					<div
						aria-hidden
						inert
						className="pointer-events-none absolute inset-0 flex -scale-x-100 flex-col opacity-(--editor-ghost-opacity) select-none"
					>
						{ghost}
					</div>
				)}
				<div className="relative flex min-h-0 flex-1 flex-col">{children}</div>
			</div>
			{menu && (
				<div
					aria-hidden
					className="pointer-events-none absolute top-(--editor-paper-clip-top) right-(--editor-paper-clip-right) aspect-[160/700] w-(--editor-paper-clip-width) rotate-(--editor-paper-clip-rotate) bg-(image:--editor-paper-clip) bg-contain bg-no-repeat"
				/>
			)}
		</div>
	);
}

interface EditorCardLayoutProps {
	variant: EditorCardVariant;
	header: ReactNode;
	footer: ReactNode;
	children: ReactNode;
}

/** Header, a scrolling body and a footer, clear of the punched holes. */
export function EditorCardLayout({
	variant,
	header,
	footer,
	children,
}: EditorCardLayoutProps) {
	return (
		<div
			className={cn(
				"flex min-h-0 flex-1 flex-col gap-4 px-(--editor-card-padding) pb-(--editor-card-padding)",
				variant === "menu"
					? "pt-[calc(var(--editor-hole-top)+var(--editor-hole-size)+1.25rem)]"
					: "pt-(--editor-card-padding)"
			)}
		>
			{header}
			<div className="editor-scrollbar -mr-4 min-h-0 flex-1 overflow-y-auto pr-4">
				{children}
			</div>
			{footer}
		</div>
	);
}

interface CardButtonProps {
	variant: "primary" | "outline";
	onClick?: () => void;
	disabled?: boolean;
	type?: "button" | "submit";
	children: ReactNode;
}

/** Save / Cancel style buttons at the foot of a card. */
export function CardButton({
	variant,
	onClick,
	disabled,
	type = "button",
	children,
}: CardButtonProps) {
	return (
		<button
			type={type}
			onClick={onClick}
			disabled={disabled}
			className={cn(
				"text-body border-editor-card-foreground min-w-20 cursor-pointer border px-4 py-1.5 uppercase disabled:cursor-default disabled:opacity-40",
				variant === "primary"
					? "bg-editor-card-foreground text-editor-menu-card"
					: "bg-transparent"
			)}
		>
			{children}
		</button>
	);
}
