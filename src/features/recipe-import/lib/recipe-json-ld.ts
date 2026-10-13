// Reads the schema.org Recipe that many recipe sites embed as JSON-LD for
// search engines, and writes it out as plain text for the model (ADR-0023).

type Json = unknown;

const isObject = (value: Json): value is Record<string, Json> =>
	typeof value === "object" && value !== null && !Array.isArray(value);

function hasType(node: Record<string, Json>, type: string): boolean {
	const value = node["@type"];
	return Array.isArray(value) ? value.includes(type) : value === type;
}

/** The first Recipe node anywhere in a JSON-LD document. */
export function findRecipeNode(json: Json): Record<string, Json> | undefined {
	if (Array.isArray(json)) {
		for (const item of json) {
			const found = findRecipeNode(item);
			if (found) return found;
		}
		return undefined;
	}
	if (!isObject(json)) return undefined;
	if (hasType(json, "Recipe")) return json;
	return findRecipeNode(json["@graph"]);
}

const text = (value: Json): string =>
	typeof value === "string" || typeof value === "number"
		? String(value).trim()
		: Array.isArray(value)
			? value.map(text).filter(Boolean).join(", ")
			: "";

/** Instructions as lines: plain strings, HowToStep, or HowToSection. */
function instructionLines(value: Json): string[] {
	if (typeof value === "string") return [value.trim()];
	if (Array.isArray(value)) return value.flatMap(instructionLines);
	if (!isObject(value)) return [];
	if (hasType(value, "HowToSection")) {
		return [`${text(value.name)}:`, ...instructionLines(value.itemListElement)];
	}
	return [text(value.text) || text(value.name)];
}

/** The recipe as labelled plain text; empty fields are left out. */
export function recipeNodeToText(node: Record<string, Json>): string {
	const ingredients = Array.isArray(node.recipeIngredient)
		? node.recipeIngredient.map(text)
		: [];
	const steps = instructionLines(node.recipeInstructions).filter(Boolean);
	return [
		`Name: ${text(node.name)}`,
		node.description && `Description: ${text(node.description)}`,
		node.recipeYield && `Yield: ${text(node.recipeYield)}`,
		ingredients.length > 0 && `Ingredients:\n${ingredients.join("\n")}`,
		steps.length > 0 && `Instructions:\n${steps.join("\n")}`,
	]
		.filter(Boolean)
		.join("\n\n");
}
