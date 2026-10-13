"use client";

import { type KeyboardEvent, useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

interface InlineTextProps {
	value: string;
	onChange: (value: string) => void;
	/** Shown, faded, while the text is empty. */
	placeholder: string;
	/** Start in edit mode, e.g. for a row that was just added. */
	autoEdit?: boolean;
	/** Called when editing starts and stops, e.g. to pause dragging. */
	onEditingChange?: (editing: boolean) => void;
	className?: string;
}

/**
 * Text that turns into an input when clicked. Enter or leaving the field
 * keeps the change; Esc restores the text it had when editing started.
 */
export function InlineText({
	value,
	onChange,
	placeholder,
	autoEdit = false,
	onEditingChange,
	className,
}: InlineTextProps) {
	const [editing, setEditing] = useState(autoEdit);
	const initial = useRef(value);
	const input = useRef<HTMLInputElement>(null);
	// Read through a ref, so a new callback each render does not count as a change.
	const notify = useRef(onEditingChange);
	useEffect(() => {
		notify.current = onEditingChange;
	});

	useEffect(() => {
		notify.current?.(editing);
		if (editing) input.current?.focus();
	}, [editing]);

	function start() {
		initial.current = value;
		setEditing(true);
	}

	function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
		if (event.key === "Enter") {
			event.preventDefault();
			setEditing(false);
		} else if (event.key === "Escape") {
			// Keeps the editor from closing the card as well.
			event.preventDefault();
			onChange(initial.current);
			setEditing(false);
		}
	}

	const text = cn("w-full min-w-0 bg-transparent text-left", className);
	return editing ? (
		<input
			ref={input}
			value={value}
			placeholder={placeholder}
			onChange={(event) => onChange(event.target.value)}
			onBlur={() => setEditing(false)}
			onKeyDown={onKeyDown}
			className={cn(text, "placeholder:opacity-50 focus:outline-none")}
		/>
	) : (
		<button
			type="button"
			onClick={start}
			className={cn(text, "cursor-text", !value && "opacity-50")}
		>
			{value || placeholder}
		</button>
	);
}
