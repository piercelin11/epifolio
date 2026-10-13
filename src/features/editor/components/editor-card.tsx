import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type EditorCardVariant = "menu" | "recipe";

interface EditorCardProps {
	/** Menu: punched along the top, with a paper clip. Recipe: a ticket. */
	variant: EditorCardVariant;
	/** The card's other face, showing faintly through the stock, mirrored. */
	ghost?: ReactNode;
	/**
	 * The back of a menu card: the paper clip on the front's top-right corner
	 * shows at the top left.
	 */
	reverse?: boolean;
	children: ReactNode;
}

/** The card stock an editor card is drawn on; content sits in children. */
export function EditorCard({
	variant,
	ghost,
	reverse = false,
	children,
}: EditorCardProps) {
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
					className={cn(
						"pointer-events-none absolute top-(--editor-paper-clip-top) right-(--editor-paper-clip-right) aspect-160/700 w-(--editor-paper-clip-width) rotate-(--editor-paper-clip-rotate) bg-(image:--editor-paper-clip) bg-contain bg-no-repeat",
						// Mirrored, angle included: scale applies before rotate, so the
						// angle has to be flipped as well.
						reverse &&
							"right-auto left-(--editor-paper-clip-right) -scale-x-100 -rotate-(--editor-paper-clip-rotate)"
					)}
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
				"flex min-h-0 flex-1 flex-col gap-4 px-(--card-padding) pb-(--card-padding)",
				variant === "menu"
					? "pt-[calc(var(--editor-hole-top)+var(--editor-hole-size)+1.25rem)] [--card-padding:var(--editor-card-padding)]"
					: "pt-(--card-padding) [--card-padding:var(--editor-recipe-card-padding)]"
			)}
		>
			{header}
			{/* Reaches into the right padding, up to where the scroll bar sits */}
			<div className="editor-scrollbar mr-[calc(var(--editor-scrollbar-inset)-var(--card-padding))] min-h-0 flex-1 overflow-y-auto pr-4">
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
