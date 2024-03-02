import React from "react"
import { defaultTheme, Theme } from "../ConfigProvider"

export function withThemeDefault(rawProps: any, themeAttr: keyof Theme): (typeof defaultTheme)[keyof Theme] {
	const userThemeAttr = rawProps?.theme?.[themeAttr]
	const defaultThemeAttr = defaultTheme?.[themeAttr]
	if (!userThemeAttr && !defaultThemeAttr) throw new Error(`Theme ${themeAttr} not found`)
	if (userThemeAttr) return userThemeAttr
	return defaultThemeAttr
}

export default { withThemeDefault }
