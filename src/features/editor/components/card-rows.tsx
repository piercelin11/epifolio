import type { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { CSSProperties, HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

import { editorDrag } from "../editor-motion";
import { SquareIcon } from "./square-icon";

// Pieces shared by the rows of the menu and recipe cards.

/** A row's drag listeners, minus the keyboard ones its inner buttons would trigger. */
export function rowListeners(
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

export function sortableStyle(
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

export function RemoveButton({
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
			// Centred on the row's first line, not the whole row (rows have py-1.5).
			// Shown for keyboard focus only: after a drag the row keeps focus.
			className="absolute top-[calc(0.375rem+0.5lh)] -left-5 grid -translate-y-1/2 cursor-pointer place-items-center opacity-0 group-hover:opacity-100 group-has-focus-visible:opacity-100"
		>
			<SquareIcon sign="minus" />
		</button>
	);
}

export function AddRow({
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
