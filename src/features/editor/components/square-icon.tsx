import { cn } from "@/lib/utils";

const paths = {
	// The sign is cut out of the square (even-odd), so the card shows through.
	plus: "M0 0h12v12H0z M5.1 2.5h1.8v2.6h2.6v1.8H6.9v2.6H5.1V6.9H2.5V5.1h2.6z",
	minus: "M0 0h12v12H0z M2.5 5.1h7v1.8h-7z",
};

/** A small filled square with a plus or minus, as on the editor cards. */
export function SquareIcon({
	sign,
	className,
}: {
	sign: keyof typeof paths;
	className?: string;
}) {
	return (
		<svg
			aria-hidden
			viewBox="0 0 12 12"
			className={cn("size-[0.75em] shrink-0", className)}
		>
			<path d={paths[sign]} fill="currentColor" fillRule="evenodd" />
		</svg>
	);
}
