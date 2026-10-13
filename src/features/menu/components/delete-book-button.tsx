"use client";

import { Trash2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";

interface DeleteBookButtonProps {
	/** The book's name, for the confirmation. */
	label: string;
	/** Resolves true once the book is deleted. */
	onDelete: () => Promise<boolean>;
}

/** A small button on the menu sheet that deletes the book after asking. */
export function DeleteBookButton({ label, onDelete }: DeleteBookButtonProps) {
	// Closed explicitly: the shelf reuses this button for the book that
	// takes the deleted one's place, so it would stay open, naming that book.
	const [open, setOpen] = useState(false);
	const [deleting, setDeleting] = useState(false);
	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger
				aria-label="Delete menu"
				className="text-primary grid size-6 cursor-pointer place-items-center focus-visible:outline-2 focus-visible:outline-offset-2"
			>
				<Trash2 className="size-4" />
			</DialogTrigger>
			<DialogContent showCloseButton={false}>
				<DialogHeader>
					<DialogTitle>Delete “{label}”?</DialogTitle>
					<DialogDescription>
						The menu and its sections are deleted. The recipes behind its dishes
						are kept.
					</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<DialogClose render={<Button variant="outline" />}>
						Cancel
					</DialogClose>
					<Button
						variant="destructive"
						disabled={deleting}
						onClick={async () => {
							setDeleting(true);
							if (await onDelete()) setOpen(false);
							setDeleting(false);
						}}
					>
						{deleting ? "Deleting" : "Delete"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
