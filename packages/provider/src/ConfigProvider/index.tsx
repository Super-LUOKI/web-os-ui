import React from "react"
import { ThemeProvider } from "@emotion/react"

export type Theme = {
	colors: {
		primary: string
		secondary: string
	}
}

export type Lang = {
	en?: string
}
export const defaultTheme: Theme = {
	colors: {
		primary: "blue",
		secondary: "red",
	},
}
export const defaultLang: Lang = {}

type ConfigProviderProps = {
	theme?: Partial<Theme>
	lang?: Partial<Lang>
	children?: React.ReactNode
}

export const ConfigProvider: React.FC<ConfigProviderProps> = (props) => {
	const { theme = defaultTheme, lang = defaultLang, children } = props
	return <ThemeProvider theme={theme}>{children}</ThemeProvider>
}

export default { ConfigProvider, defaultLang, defaultTheme }
