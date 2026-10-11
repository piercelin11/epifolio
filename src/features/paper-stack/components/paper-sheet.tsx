import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type PaperTone = "paper" | "primary";

interface PaperSheetProps {
	tone: PaperTone;
	/** Punch holes down the right edge, like a notebook page. */
	perforated?: boolean;
	className?: string;
	children: ReactNode;
}

const toneClasses: Record<PaperTone, string> = {
	paper: "bg-background text-foreground",
	primary: "bg-primary text-primary-foreground",
};

/** One textured sheet of paper. Layout and stacking belong to PaperStack. */
export function PaperSheet({
	tone,
	perforated = false,
	className,
	children,
}: PaperSheetProps) {
	return (
		// The mask would clip a box-shadow, so the shadow sits on this wrapper.
		<div className="h-full drop-shadow-xl">
			<div
				className={cn(
					"relative isolate h-full",
					toneClasses[tone],
					perforated && "paper-perforated",
					className
				)}
			>
				{children}
				<div
					aria-hidden
					className="paper-texture pointer-events-none absolute inset-0"
				/>
			</div>
		</div>
	);
}
