export type Theme = {
	colors: {
		primary: string
		secondary: string
	}
}

export type Langs = {
	[key: string]: {
		translation: Record<string, string>
	}
}

export type ConfigProviderProps = {
	theme?: Partial<Theme>
	langSet?: Langs
	lang?: string
	children?: React.ReactNode
}
