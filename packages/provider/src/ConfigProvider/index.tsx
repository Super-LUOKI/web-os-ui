import React, { useEffect } from "react"
import { ThemeProvider } from "@emotion/react"
import i18n from "i18next"
import { I18nextProvider, initReactI18next, useTranslation } from "react-i18next"
import { ConfigProviderProps, Theme } from "./type"
import { defaultLangs } from "./langs"

export const defaultTheme: Theme = {
	colors: {
		primary: "blue",
		secondary: "red",
	},
}

i18n.use(initReactI18next).init({
	resources: defaultLangs,
	lng: "zh",
	fallbackLng: "en",
	interpolation: {
		escapeValue: false,
	},
})

export const ConfigProvider: React.FC<ConfigProviderProps> = (props) => {
	const { theme = defaultTheme, lang = "zh", langSet = defaultLangs, children } = props
	const { i18n } = useTranslation()
	useEffect(() => {
		i18n.changeLanguage(lang)
		Object.keys(langSet).forEach((lang) => {
			i18n.addResourceBundle(lang, "translation", langSet[lang], true, true)
		})
	}, [lang, langSet, i18n])

	return (
		<ThemeProvider theme={theme}>
			<I18nextProvider i18n={i18n}>{children}</I18nextProvider>
		</ThemeProvider>
	)
}

export default { ConfigProvider, defaultLang: defaultLangs, defaultTheme }
