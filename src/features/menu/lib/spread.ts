import type { MenuSpread, Section } from "../types";

/**
 * Splits sections across the left and right pages, keeping each section
 * whole. The left page takes sections in order while it holds at most
 * half of all items (rounded up).
 */
export function splitIntoSpread(sections: Section[]): MenuSpread {
	const total = sections.reduce((sum, s) => sum + s.items.length, 0);
	const leftCapacity = Math.ceil(total / 2);

	const left: Section[] = [];
	const right: Section[] = [];
	let leftCount = 0;

	for (const section of sections) {
		const fitsLeft =
			right.length === 0 &&
			(left.length === 0 || leftCount + section.items.length <= leftCapacity);
		if (fitsLeft) {
			left.push(section);
			leftCount += section.items.length;
		} else {
			right.push(section);
		}
	}

	return { left, right };
}
