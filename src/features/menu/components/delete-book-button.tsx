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
import { useMessages } from "@/lib/i18n/locale-provider";

interface DeleteBookButtonProps {
	/** The book's name, for the confirmation. */
	label: string;
	/** Resolves true once the book is deleted. */
	onDelete: () => Promise<boolean>;
}

/** A small button on the menu sheet that deletes the book after asking. */
export function DeleteBookButton({ label, onDelete }: DeleteBookButtonProps) {
	const t = useMessages();
	// Closed explicitly: the shelf reuses this button for the book that
	// takes the deleted one's place, so it would stay open, naming that book.
	const [open, setOpen] = useState(false);
	const [deleting, setDeleting] = useState(false);
	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger
				aria-label={t.menuSheet.delete}
				className="text-primary grid size-6 cursor-pointer place-items-center focus-visible:outline-2 focus-visible:outline-offset-2"
			>
				<Trash2 className="size-4" />
			</DialogTrigger>
			<DialogContent showCloseButton={false}>
				<DialogHeader>
					<DialogTitle>{t.deleteBook.title({ name: label })}</DialogTitle>
					<DialogDescription>{t.deleteBook.description}</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<DialogClose render={<Button variant="outline" />}>
						{t.editor.cancel}
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
						{deleting ? t.deleteBook.deleting : t.deleteBook.delete}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
