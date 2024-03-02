import React from "react"
import { defaultTheme } from "../ConfigProvider"
import { Theme } from "../ConfigProvider/type"

export function withThemeDefault(
	rawProps: {
		theme?: Partial<Theme>
	},
	themeAttr: keyof Theme
): (typeof defaultTheme)[keyof Theme] | null {
	const userThemeAttr = rawProps?.theme?.[themeAttr]
	const defaultThemeAttr = defaultTheme?.[themeAttr]
	if (!userThemeAttr && !defaultThemeAttr) {
		console.error(`WebOsUI Error: Theme ${themeAttr} not found`)
		return null
	}
	if (userThemeAttr) return userThemeAttr
	return defaultThemeAttr
}

export default { withThemeDefault }
