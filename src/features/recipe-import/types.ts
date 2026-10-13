import type { CatalogIngredient } from "@/features/ingredient/types";
import type { ActionResult } from "@/lib/action-result";

import type { ImportedRecipe } from "./lib/to-draft";

/** Where an import reads from; Scratch is typed on the card instead. */
export type ImportSourceKind = "text" | "files" | "url";

/** What POST /api/recipe-import answers. */
export interface ImportResponseData {
	imported: ImportedRecipe;
	/** The catalog the import matched against, for the ingredient card. */
	catalog: CatalogIngredient[];
}

export type ImportResponse = ActionResult<ImportResponseData>;
