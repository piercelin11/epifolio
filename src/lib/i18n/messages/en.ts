// Interface text in English. This file defines the dictionary's shape:
// zh.ts must have the same keys (ADR-0029). Messages that take values are
// functions of one object.

export const en = {
	locale: {
		/** The switch shows the current locale; this names what a click does. */
		switchTo: "Switch to Chinese",
	},
	shelf: {
		menu: "Menu",
		openBook: ({ name }: { name: string }) => `Open ${name}`,
	},
	stack: {
		showMenu: "Show menu",
		showRecipe: "Show recipe",
	},
	menuSheet: {
		edit: "Edit menu",
		changeTheme: "Change menu theme",
		delete: "Delete menu",
		priceIncomplete:
			"Ingredient cost per serving. Some ingredients have no price or weight yet and are left out.",
	},
	deleteBook: {
		title: ({ name }: { name: string }) => `Delete “${name}”?`,
		description:
			"The menu and its sections are deleted. The recipes behind its dishes are kept.",
		delete: "Delete",
		deleting: "Deleting",
	},
	recipeSheet: {
		edit: "Edit recipe",
		ingredients: "Ingredients",
		instructions: "Instructions",
		fewerServings: "Fewer servings",
		moreServings: "More servings",
		serving: "serving",
		servings: "servings",
		toTaste: "To taste",
		nutrition: "Nutrition",
		perServing: "Per serving",
		wholeRecipe: "Whole recipe",
		nutritionIncomplete:
			"Some ingredients are left out: their nutrition or weight is missing.",
	},
	ingredientCard: {
		calories: "Calories",
		protein: "Protein",
		carbs: "Carbs",
		fat: "Fat",
		per100g: "Per 100 g",
		edit: "Edit ingredient",
		englishName: "English name",
		chineseName: "Chinese name",
		englishPlaceholder: "EN name",
		chinesePlaceholder: "ZH name",
		priceTag: "Price tag",
		price: "Price",
		quantity: "Num",
		unit: "Unit",
		nutrition: "Nutrition",
		units: "Units",
		defaultUnit: "Default unit",
		addUnit: "Add unit",
		removeUnit: "Remove unit",
		gramsPer: ({ unit }: { unit: string }) => `Grams per ${unit}`,
		density: "Density",
		densityHint: "1 ml =",
		aliases: "Alias",
		aliasesPlaceholder: "Other names, separated by commas",
	},
	editor: {
		save: "Save",
		saving: "Saving",
		cancel: "Cancel",
		next: "Next",
		back: "Back",
		loading: "Loading…",
		editingLanguage: "Editing language",
		group: "Group",
		groupPlaceholder: "Group (optional)",
		removeGroup: "Remove group",
	},
	menuCard: {
		menuName: "Menu name",
		section: "Section",
		sectionName: "Section name",
		removeSection: "Remove section",
		dish: "Dish",
		dishName: "Dish name",
		description: "Description",
		removeDish: "Remove dish from menu",
		editRecipe: "Edit recipe",
		saveToAddDishes: "Save the menu to add dishes here",
	},
	importCard: {
		heading: "Import from",
		sources: { scratch: "Scratch", text: "Text", photo: "Photo", url: "URL" },
		dishName: "Dish name",
		descriptionOptional: "Description (optional)",
		pasteRecipe: "Paste a recipe here: ingredients, steps or a whole post.",
		chooseFiles: "Choose files or drag them here",
		fileLimits: ({
			imageMb,
			pdfMb,
			count,
			totalMb,
		}: {
			imageMb: number;
			pdfMb: number;
			count: number;
			totalMb: number;
		}) =>
			`Photos (JPEG, PNG, WebP) up to ${imageMb} MB, PDFs up to ${pdfMb} MB; up to ${count} files, ${totalMb} MB in all`,
		removeFile: ({ name }: { name: string }) => `Remove ${name}`,
		reading: "Reading…",
	},
	recipeCard: {
		recipeName: "Recipe name",
		ingredient: "Ingredient",
		removeIngredient: "Remove ingredient",
		emptyIngredient: "Empty ingredient",
		quantity: "Quantity",
		quantityShort: "Qty",
		unit: "Unit",
		note: "Note",
		step: "Step",
		removeStep: "Remove step",
		emptyStep: "Empty step",
		highlight: "Highlight",
		highlightOptional: "Highlight (optional)",
		instruction: "Instruction",
		references: "References",
		url: "URL",
		removeReference: "Remove reference",
	},
	reviewCard: {
		heading: "Ingredients",
		summary: ({ matched, unmatched }: { matched: number; unmatched: number }) =>
			`${matched} matched · ${unmatched} not matched`,
		createNew: "Create new",
		linkTo: "Link to",
		ingredientFor: ({ wording }: { wording: string }) =>
			`Ingredient for ${wording}`,
		search: "Search ingredients",
		showList: "Show ingredients",
		noneFound: "No ingredient found.",
		englishName: "English name",
		chineseName: "Chinese name",
		englishPlaceholder: "EN name",
		chinesePlaceholder: "ZH name",
		showMatched: ({ count }: { count: number }) => `Show matched (${count})`,
		hideMatched: ({ count }: { count: number }) => `Hide matched (${count})`,
	},
	/**
	 * Messages that can come from outside a component: Server Actions, zod
	 * schemas and the import route send these keys (ErrorMessage).
	 */
	errors: {
		invalidField: "Check this field.",
		fieldsNeedAttention: "Some fields need attention.",
		saveFailed: "Could not save. Please try again.",
		serverUnreachable: "Could not reach the server. Try again.",
		menuNotFound: "Menu not found.",
		menuChanged: "This menu changed. Reopen it to edit.",
		sectionNotFound: "Section not found.",
		recipeNotFound: "Recipe not found.",
		recipeChanged: "This recipe changed. Reopen it to edit.",
		ingredientNotFound: "Ingredient not found.",
		ingredientExists: ({ name }: { name: string }) =>
			`An ingredient named "${name}" already exists.`,
		unknownTheme: "Unknown theme.",
		themeSaveFailed: "Could not save the theme.",
		deleteMenuFailed: "Could not delete the menu.",
		textRequired: "Enter text in at least one language.",
		dishNameRequired: "Enter a dish name.",
		quantityFormat:
			"Enter a number, a fraction or a range, e.g. 2, 1/2, 80-100.",
		unitInvalid: "Pick a unit from the list.",
		lineNeedsIngredient: "Each ingredient line needs an ingredient.",
		stepNeedsText: "Each step needs an instruction.",
		urlInvalid: "Enter a full web address.",
		newIngredientNeedsName: "Each new ingredient needs a name.",
		nameRequired: "Enter a name.",
		priceNeedsUnit: "Enter a price and pick its unit.",
		numberInvalid: "Enter a number of 0 or more.",
		positiveNumber: "Enter a number greater than 0.",
		unitRepeated: "List each unit once.",
		aliasTaken: ({ name, ingredient }: { name: string; ingredient: string }) =>
			`"${name}" is already a name of ${ingredient}.`,
		pickIngredient: "Pick an ingredient.",
		alreadyInCatalog: ({ name }: { name: string }) =>
			`"${name}" already exists. Link to it instead.`,
		fileType: "Use JPEG, PNG, WebP or PDF.",
		fileTooLarge: ({ mb }: { mb: number }) => `Larger than ${mb} MB.`,
		tooManyFiles: ({ count }: { count: number }) =>
			`Choose up to ${count} files.`,
		filesTooLarge: ({ mb }: { mb: number }) =>
			`The files add up to more than ${mb} MB.`,
		pasteFirst: "Paste a recipe first.",
		textTooLong: "The text is too long.",
		chooseFileFirst: "Choose a file first.",
		chooseSource: "Choose what to import from.",
		uploadUnreadable: "Could not read the upload.",
		importFailed: "Could not read the recipe. Try again.",
		importTimeout: "Reading the recipe took too long. Try again.",
		apiKeyMissing: "Set ANTHROPIC_API_KEY in .env to import recipes.",
		apiUnreachable: "Could not reach the Anthropic API.",
		apiKeyInvalid: "The Anthropic API key is missing or invalid.",
		rateLimited: "Too many requests. Try again in a minute.",
		apiFailed: ({ status }: { status: number }) =>
			`The Anthropic API failed (${status}).`,
		/** The API's own explanation, e.g. a low credit balance; not translated. */
		apiMessage: ({ detail }: { detail: string }) =>
			`The Anthropic API said: ${detail}`,
		modelDeclined: "The model declined to read this source.",
		recipeTooLong: "The recipe is too long to read in one go.",
		noRecipeFound: "No recipe found in this source.",
		urlScheme: "Enter a web address starting with http or https.",
		siteNotFound: "Could not find that website.",
		notPublicSite: "That address is not a public website.",
		pageTooLarge: "That page is too large to read.",
		pageStatus: ({ status }: { status: number }) =>
			`The page could not be read (${status}).`,
		notWebPage: "That address is not a web page.",
		tooManyRedirects: "That page redirects too many times.",
		pageLoadFailed: "Could not load that page.",
		noRecipeText:
			"No recipe text on that page. Paste the text or a screenshot instead.",
	},
};

export type Messages = typeof en;
