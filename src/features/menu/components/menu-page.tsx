import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

import type { Section } from "../types";
import { MenuSection } from "./menu-section";

interface MenuPageProps {
	header: ReactNode;
	sections: Section[];
	className?: string;
}

/** One page of the menu book: a header row and its sections. */
export function MenuPage({ header, sections, className }: MenuPageProps) {
	return (
		<section className={cn("flex min-h-0 flex-col", className)}>
			<header className="flex h-16 shrink-0 items-center px-10">
				{header}
			</header>
			<div className="flex-1 overflow-y-auto px-10 pt-6 pb-10">
				<div className="mx-auto flex max-w-xl flex-col gap-12">
					{sections.map((section) => (
						<MenuSection key={section.id} section={section} />
					))}
				</div>
			</div>
		</section>
	);
}
