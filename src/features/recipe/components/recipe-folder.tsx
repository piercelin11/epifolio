"use client";

import {
	animate,
	motion,
	useMotionValue,
	useReducedMotion,
	useTransform,
} from "motion/react";
import { type ReactNode, useCallback, useLayoutEffect, useRef } from "react";

import { PaperSheet } from "@/features/paper-stack/components/paper-sheet";
import type { StackLayerState } from "@/features/paper-stack/types";
import { useMessages } from "@/lib/i18n/locale-provider";
import { cn } from "@/lib/utils";

import { defaultPanels, folderMotion } from "../folder-motion";
import { useColumnPages } from "../hooks/use-column-pages";
import { useElementHeight } from "../hooks/use-element-height";
import { useSheetPull } from "../hooks/use-sheet-pull";
import type { FolderPanel, Recipe, RecipeProgress } from "../types";
import {
	IngredientColumns,
	PageControl,
	ServingsControl,
} from "./ingredient-list";
import { InstructionSheet } from "./instruction-sheet";
import { NutritionCard } from "./nutrition-card";

interface RecipeFolderProps {
	recipe?: Recipe;
	/** Controls in the folder's top-right corner, e.g. an edit button. */
	actions?: ReactNode;
	/** Servings, ready ingredients and open papers; owned by the caller. */
	progress?: RecipeProgress;
	onProgressChange?: (progress: RecipeProgress) => void;
	/** Called with the id of an ingredient whose name is picked. */
	onSelectIngredient?: (ingredientId: string) => void;
	/** The stack layer the folder fills. */
	layer: StackLayerState;
	/** Hide the text, not the papers, e.g. while the folder is behind the menu. */
	blank?: boolean;
}

/**
 * Stands in for a surface's content while the folder cannot be used: the
 * content goes inert and a click anywhere on the surface calls the cover.
 * Only the first surface's button is in the tab order.
 */
function Surface({
	layer,
	primary = false,
	blank = false,
	className,
	children,
}: {
	layer: StackLayerState;
	primary?: boolean;
	blank?: boolean;
	className?: string;
	children: ReactNode;
}) {
	const { cover } = layer;
	return (
		<>
			<div inert={!!cover} className={cn(className, blank && "invisible")}>
				{children}
			</div>
			{cover && (
				<button
					type="button"
					aria-label={primary ? cover.label : undefined}
					aria-hidden={!primary}
					tabIndex={primary ? undefined : -1}
					className="absolute inset-0 cursor-pointer"
					onClick={cover.onActivate}
				/>
			)}
		</>
	);
}

/** A tab on a flap's top edge; its label turns bold italic while the paper is out. */
function FolderTab({
	label,
	open,
	onToggle,
}: {
	label: string;
	open: boolean;
	onToggle: () => void;
}) {
	return (
		<button
			type="button"
			aria-expanded={open}
			onClick={onToggle}
			className={cn(
				"text-caption absolute top-0 left-(--tab-left) flex h-(--folder-tab-height) w-(--folder-tab-width) cursor-pointer items-center justify-center uppercase",
				open && "font-bold italic"
			)}
		>
			{label}
		</button>
	);
}

/**
 * The recipe as a folder fixed to the bottom of the stack (ADR-0033). From
 * back to front: the instruction sheet, the back flap with the nutrition
 * tab, the nutrition card, and the front flap with the name, servings and
 * ingredients. Each tab slides its paper out of the folder or back in.
 * While the instruction sheet is longer than it can show, scrolling pulls
 * it out further; the pull drops once the folder goes behind the menu.
 */
export function RecipeFolder({
	recipe,
	actions,
	progress = { checked: [] },
	onProgressChange,
	onSelectIngredient,
	layer,
	blank = false,
}: RecipeFolderProps) {
	const t = useMessages();
	const reduceMotion = useReducedMotion();
	const stageRef = useRef<HTMLDivElement>(null);
	const slotRef = useRef<HTMLDivElement>(null);
	const contentRef = useRef<HTMLDivElement>(null);
	const listRef = useRef<HTMLDivElement>(null);
	const columns = useColumnPages(listRef);

	const panels = { ...defaultPanels, ...progress.panels };
	const usable = layer.inFront && !layer.cover;
	// How far the instruction sheet rises out of the folder before it is pulled.
	const contentHeight = useElementHeight(contentRef);
	const maxReveal = useElementHeight(slotRef);
	const rest = Math.min(contentHeight, maxReveal);
	const scope = useCallback(
		() => stageRef.current?.closest<HTMLElement>("[data-paper-stack]") ?? null,
		[]
	);
	const { pull, reset } = useSheetPull({
		enabled: usable && panels.instructions && contentHeight > rest,
		max: Math.max(contentHeight - rest, 0),
		page: rest,
		scope,
	});
	const reveal = useMotionValue(panels.instructions ? rest : 0);
	const sheetY = useTransform(() => -(reveal.get() + pull.get()));

	// Opening and closing slide the sheet; anything else, such as the
	// content changing height, moves it at once.
	const wasOpen = useRef(panels.instructions);
	useLayoutEffect(() => {
		const target = panels.instructions ? rest : 0;
		if (wasOpen.current === panels.instructions) {
			reveal.jump(target);
			return;
		}
		wasOpen.current = panels.instructions;
		// The pull folds into the slide, so the sheet closes from where it is.
		reveal.jump(reveal.get() + reset());
		const controls = animate(
			reveal,
			target,
			reduceMotion ? { duration: 0 } : folderMotion.slide
		);
		return () => controls.stop();
	}, [panels.instructions, rest, reveal, reset, reduceMotion]);

	// Behind the menu the sheet drops back to its resting height.
	useLayoutEffect(() => {
		if (!usable) reset();
	}, [usable, reset]);

	const change = (next: Partial<RecipeProgress>) =>
		onProgressChange?.({ ...progress, ...next });
	const toggle = (panel: FolderPanel) =>
		change({ panels: { ...progress.panels, [panel]: !panels[panel] } });
	const servings = recipe && (progress.servings ?? recipe.serves);
	const factor = recipe?.serves && servings ? servings / recipe.serves : 1;

	return (
		<div
			ref={stageRef}
			className="absolute inset-y-0 right-0 left-[calc(var(--paper-offset-x)+var(--folder-inset-x))]"
		>
			{/* Measures the most the instruction sheet shows before it is pulled */}
			<div
				ref={slotRef}
				aria-hidden
				className="invisible absolute inset-x-0 top-(--instruction-top) bottom-[calc(var(--folder-bottom)+var(--folder-height))] min-h-(--instruction-min-reveal)"
			/>

			{/* Instruction sheet, cut off at the folder's bottom edge */}
			<div className="clip-below absolute inset-x-(--instruction-inset-x) top-0 bottom-(--folder-bottom)">
				<motion.div
					style={{ y: sheetY }}
					className="pointer-events-auto absolute inset-x-0 top-[calc(100%-var(--folder-height))]"
				>
					<PaperSheet tone="instruction" perforated>
						<Surface layer={layer} primary blank={blank}>
							<div
								ref={contentRef}
								className="pt-(--instruction-padding) pr-[calc(var(--instruction-hole-inset)+var(--instruction-hole-size)/2+var(--instruction-padding))] pb-[calc(var(--folder-tab-height)+var(--folder-back-rise)+var(--instruction-padding))] pl-(--instruction-padding)"
							>
								{recipe && <InstructionSheet recipe={recipe} />}
							</div>
							{/* The part that stays inside the folder */}
							<div aria-hidden className="h-(--folder-height)" />
						</Surface>
					</PaperSheet>
				</motion.div>
			</div>

			{/* Back flap */}
			{/* Clicks pass the flap's box and land only on its tab-shaped sheet */}
			<div className="absolute inset-x-0 bottom-(--folder-bottom) flex h-[calc(var(--folder-height)+var(--folder-tab-height)+var(--folder-back-rise))] flex-col">
				<PaperSheet
					tone="folder-deep"
					className="folder-tab pointer-events-auto min-h-0 [--tab-left:calc(var(--folder-tab-offset)+var(--folder-tab-width)-var(--folder-tab-slant))]"
					wrapperClassName="min-h-0"
					contentClassName="h-full"
				>
					<Surface layer={layer} blank={blank}>
						<FolderTab
							label={t.recipeSheet.nutrition}
							open={panels.nutrition}
							onToggle={() => toggle("nutrition")}
						/>
					</Surface>
				</PaperSheet>
			</div>

			{/* Nutrition card, cut off at the folder's bottom edge */}
			<div className="clip-below absolute inset-x-0 top-0 bottom-(--folder-bottom)">
				<motion.div
					initial={false}
					animate={{ "--shown": panels.nutrition ? 1 : 0 }}
					transition={reduceMotion ? { duration: 0 } : folderMotion.slide}
					className="pointer-events-auto absolute top-[calc(100%-var(--folder-height))] right-(--nutrition-card-right) flex h-[calc(var(--nutrition-card-rise)+var(--nutrition-card-tuck))] w-(--nutrition-card-width) translate-y-[calc((1-var(--shown))*var(--nutrition-card-tuck)-var(--shown)*var(--nutrition-card-rise))] rotate-(--nutrition-card-rotate) flex-col"
				>
					<PaperSheet tone="nutrition">
						<Surface layer={layer} blank={blank}>
							{recipe && <NutritionCard totals={recipe.totals} />}
						</Surface>
					</PaperSheet>
					<div
						aria-hidden
						className="pointer-events-none absolute top-(--nutrition-clip-top) left-(--nutrition-clip-left) aspect-160/700 w-(--paper-clip-width) bg-(image:--nutrition-paper-clip) bg-contain bg-no-repeat"
					/>
				</motion.div>
			</div>

			{/* Front flap */}
			<div className="absolute inset-x-0 bottom-(--folder-bottom) flex h-[calc(var(--folder-height)+var(--folder-tab-height))] flex-col">
				<PaperSheet
					tone="folder"
					className="folder-tab pointer-events-auto min-h-0 [--tab-left:var(--folder-tab-offset)]"
					wrapperClassName="min-h-0"
					contentClassName="h-full"
				>
					<Surface
						layer={layer}
						blank={blank}
						className="flex h-full flex-col gap-5 px-(--folder-padding) pt-[calc(var(--folder-tab-height)+var(--folder-padding))] pb-(--folder-padding)"
					>
						<FolderTab
							label={t.recipeSheet.instructions}
							open={panels.instructions}
							onToggle={() => toggle("instructions")}
						/>
						{recipe && (
							<>
								<div className="flex items-start justify-between gap-4">
									<h2 className="font-heading text-headline font-bold">
										{recipe.name}
									</h2>
									{actions && (
										<div className="flex shrink-0 gap-1">{actions}</div>
									)}
								</div>
								<section className="flex min-h-0 flex-1 flex-col gap-4">
									<div className="flex min-h-7 items-center justify-between gap-6 border-b border-dashed border-current/50 pb-2">
										<h3 className="text-body uppercase">
											{t.recipeSheet.ingredients}
										</h3>
										<div className="flex items-center gap-6">
											<PageControl
												page={columns.page}
												pages={columns.pages}
												onChange={columns.setPage}
											/>
											{servings && (
												<ServingsControl
													servings={servings}
													onChange={(next) => change({ servings: next })}
												/>
											)}
										</div>
									</div>
									<IngredientColumns
										listRef={listRef}
										page={columns.page}
										groups={recipe.ingredientGroups}
										factor={factor}
										checked={progress.checked}
										onCheckedChange={(lineId, checked) =>
											change({
												checked: checked
													? [...progress.checked, lineId]
													: progress.checked.filter((id) => id !== lineId),
											})
										}
										onSelectIngredient={onSelectIngredient}
									/>
								</section>
							</>
						)}
					</Surface>
				</PaperSheet>
			</div>
		</div>
	);
}
