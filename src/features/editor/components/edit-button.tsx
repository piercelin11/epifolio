import { PencilLine } from "lucide-react";

/**
 * A small button on a menu or recipe sheet that opens its editor card. It
 * takes the sheet's text colour.
 */
export function EditButton({
	label,
	onClick,
}: {
	/** e.g. "Edit menu". */
	label: string;
	onClick: () => void;
}) {
	return (
		<button
			type="button"
			aria-label={label}
			onClick={onClick}
			className="grid size-6 cursor-pointer place-items-center focus-visible:outline-2 focus-visible:outline-offset-2"
		>
			<PencilLine className="size-4" />
		</button>
	);
}
