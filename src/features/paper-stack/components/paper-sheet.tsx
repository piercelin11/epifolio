import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Which paper a sheet is cut from: its colour, text colour and texture.
 * `paper` is the menu sheet; the others make up the recipe folder.
 */
type PaperTone =
	"paper" | "folder" | "folder-deep" | "instruction" | "nutrition";

interface PaperSheetProps {
	tone: PaperTone;
	/** Punch holes down the right edge, like a notebook page. */
	perforated?: boolean;
	/** Classes for the sheet itself, e.g. a clip-path; the shadow wrapper fills the space given. */
	className?: string;
	/** Classes for the shadow wrapper, e.g. its position. */
	wrapperClassName?: string;
	/** Classes for the box around the children, e.g. a height to fill. */
	contentClassName?: string;
	children: ReactNode;
}

const toneClasses: Record<PaperTone, string> = {
	paper: "bg-background text-foreground",
	folder: "bg-primary text-primary-foreground",
	"folder-deep": "bg-primary-deep text-primary-foreground",
	instruction: "bg-instruction-sheet text-stationery-foreground",
	nutrition: "bg-nutrition-card text-stationery-foreground",
};

/** One textured sheet of paper. Layout and stacking belong to PaperStack. */
export function PaperSheet({
	tone,
	perforated = false,
	className,
	wrapperClassName,
	contentClassName,
	children,
}: PaperSheetProps) {
	return (
		// The mask would clip a box-shadow, so the shadow sits on this wrapper.
		<div
			className={cn("flex flex-1 flex-col drop-shadow-xl", wrapperClassName)}
		>
			<div
				data-paper-tone={tone}
				className={cn(
					"relative isolate flex-1",
					toneClasses[tone],
					perforated && "paper-perforated",
					className
				)}
			>
				{/* Texture sits under the content, so text stays a clean solid colour */}
				<div
					aria-hidden
					className="paper-texture pointer-events-none absolute inset-0"
				/>
				<div className={cn("relative", contentClassName)}>{children}</div>
			</div>
		</div>
	);
}
