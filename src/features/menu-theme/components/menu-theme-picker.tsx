"use client";

import { Palette } from "lucide-react";

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { type MenuThemeId, isMenuThemeId, menuThemes } from "../menu-themes";

interface MenuThemePickerProps {
	themeId: MenuThemeId;
	onChange: (themeId: MenuThemeId) => void;
}

/** A small button that opens the list of menu themes. */
export function MenuThemePicker({ themeId, onChange }: MenuThemePickerProps) {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger
				aria-label="Change menu theme"
				className="text-primary grid size-6 cursor-pointer place-items-center focus-visible:outline-2 focus-visible:outline-offset-2"
			>
				<Palette className="size-4" />
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-44">
				<DropdownMenuRadioGroup
					value={themeId}
					onValueChange={(value: string) => {
						if (isMenuThemeId(value) && value !== themeId) onChange(value);
					}}
				>
					{menuThemes.map((theme) => (
						<DropdownMenuRadioItem key={theme.id} value={theme.id} closeOnClick>
							{/* The menu paper with a band of the title colour */}
							<span
								aria-hidden
								className="ring-foreground/20 size-4 shrink-0 rounded-sm ring-1"
								style={{
									background: `linear-gradient(135deg, ${theme.colors.background} 55%, ${theme.colors.primary} 55%)`,
								}}
							/>
							{theme.label}
						</DropdownMenuRadioItem>
					))}
				</DropdownMenuRadioGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
