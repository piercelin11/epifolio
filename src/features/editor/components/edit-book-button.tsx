import { PencilLine } from "lucide-react";

/** A small button beside the chef name that opens the menu card. */
export function EditBookButton({ onClick }: { onClick: () => void }) {
	return (
		<button
			type="button"
			aria-label="Edit menu"
			onClick={onClick}
			className="text-primary grid size-6 cursor-pointer place-items-center focus-visible:outline-2 focus-visible:outline-offset-2"
		>
			<PencilLine className="size-4" />
		</button>
	);
}
