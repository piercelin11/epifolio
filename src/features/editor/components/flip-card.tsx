"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

import { editorMotion } from "../editor-motion";

interface FlipCardProps {
	/** Show the back face. */
	flipped: boolean;
	front: ReactNode;
	back: ReactNode;
}

/** Two faces of one card, turned over around its vertical centre line. */
export function FlipCard({ flipped, front, back }: FlipCardProps) {
	const reduceMotion = useReducedMotion();
	const { perspective, ...transition } = editorMotion.flip;
	return (
		<div style={{ perspective }}>
			<motion.div
				className="grid transform-3d"
				initial={false}
				animate={{ rotateY: flipped ? 180 : 0 }}
				transition={reduceMotion ? { duration: 0 } : transition}
			>
				<div
					inert={flipped}
					className="col-start-1 row-start-1 backface-hidden"
				>
					{front}
				</div>
				<div
					inert={!flipped}
					className="col-start-1 row-start-1 rotate-y-180 backface-hidden"
				>
					{back}
				</div>
			</motion.div>
		</div>
	);
}
