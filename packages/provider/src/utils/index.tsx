import React from "react"
import { defaultTheme, Theme } from "../ConfigProvider"

export function withThemeDefault(rawProps: any, themeAttr: keyof Theme): (typeof defaultTheme)[keyof Theme] | null {
	const userThemeAttr = rawProps?.theme?.[themeAttr]
	const defaultThemeAttr = defaultTheme?.[themeAttr]
	if (!userThemeAttr && !defaultThemeAttr) {
		console.error(`WebOsUI Error: Theme ${themeAttr} not found`)
		return null
	}
	if (userThemeAttr) return userThemeAttr
	return defaultThemeAttr
}

const defaultExp = { withThemeDefault }
export default defaultExp
