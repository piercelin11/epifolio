"use client";

import { Timer } from "lucide-react";

import { useMessages } from "@/lib/i18n/locale-provider";

import { splitMinutes } from "../lib/duration";
import type { Recipe, Step } from "../types";
import { GroupLabel } from "./ingredient-list";

function StepItem({ number, step }: { number: number; step: Step }) {
	const t = useMessages();
	const text = step.text.map((part) => part.text).join("");
	return (
		<li className="grid grid-cols-[1.75em_1fr_auto] gap-x-2 gap-y-0.5">
			<span className="text-body font-bold">{number}.</span>
			<p className="text-body font-bold">{step.title && `${step.title}.`}</p>
			{step.minutes ? (
				<span className="text-caption flex items-center gap-1 opacity-70">
					<Timer aria-hidden className="size-[1em]" />
					{t.recipeSheet.stepTime(splitMinutes(step.minutes))}
				</span>
			) : (
				<span />
			)}
			{/* Keeps the line breaks typed with Shift+Enter */}
			<p className="text-caption col-span-2 col-start-2 whitespace-pre-line">
				{text}
			</p>
		</li>
	);
}

/** The recipe's steps and notes, on the instruction sheet. */
export function InstructionSheet({ recipe }: { recipe: Recipe }) {
	const t = useMessages();
	// Steps are numbered on through every group.
	const firstStep = recipe.stepGroups.map((_, i) =>
		recipe.stepGroups
			.slice(0, i)
			.reduce((count, group) => count + group.steps.length, 1)
	);

	return (
		<div className="flex flex-col gap-6">
			<h3 className="text-subheading border-b border-current/40 pb-3 font-bold uppercase">
				{t.recipeSheet.instructions}
			</h3>
			{recipe.stepGroups.map((group, g) => (
				<section key={g} className="flex flex-col gap-3">
					{group.label && <GroupLabel>{group.label}</GroupLabel>}
					<ol className="flex flex-col gap-3">
						{group.steps.map((step, i) => (
							<StepItem key={i} number={firstStep[g] + i} step={step} />
						))}
					</ol>
				</section>
			))}
			{recipe.notes.length > 0 && (
				<section className="flex flex-col gap-3 border-t border-current/40 pt-6">
					<GroupLabel>{t.recipeSheet.notes}</GroupLabel>
					<ol className="text-caption flex flex-col gap-2">
						{recipe.notes.map((note, i) => (
							<li key={i} className="grid grid-cols-[1.75em_1fr] gap-x-2">
								<span>{i + 1}.</span>
								<p className="whitespace-pre-line">{note}</p>
							</li>
						))}
					</ol>
				</section>
			)}
		</div>
	);
}
