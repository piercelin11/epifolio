import { z } from "zod";

/**
 * Units an ingredient line can be measured in. The database stores the id;
 * this list is the only source of valid values (ADR-0016).
 */
export const units = ["g", "kg", "ml", "L", "tsp", "tbsp", "clove"] as const;

export type Unit = (typeof units)[number];

export const unitSchema = z.enum(units);

export function isUnit(value: string): value is Unit {
	return (units as readonly string[]).includes(value);
}
