import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import betterTailwindcss from "eslint-plugin-better-tailwindcss";

const eslintConfig = defineConfig([
	...nextVitals,
	...nextTs,
	// Only canonical class names; Prettier sorts classes (ADR-0021)
	{
		files: ["src/**/*.{ts,tsx}"],
		plugins: { "better-tailwindcss": betterTailwindcss },
		settings: {
			"better-tailwindcss": { entryPoint: "src/app/globals.css" },
		},
		rules: {
			// collapse would swap theme tokens for same-valued defaults
			// (text-body leading-snug -> text-base/snug)
			"better-tailwindcss/enforce-canonical-classes": [
				"error",
				{ collapse: false },
			],
		},
	},
	// Override default ignores of eslint-config-next.
	globalIgnores([
		// Default ignores of eslint-config-next:
		".next/**",
		"out/**",
		"build/**",
		"next-env.d.ts",
		// Prisma generated client
		"src/generated/**",
		// MkDocs build output and Python venv
		"site/**",
		".venv/**",
	]),
]);

export default eslintConfig;
