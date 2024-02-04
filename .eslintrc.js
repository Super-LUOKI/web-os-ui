module.exports = {
	env: {
		browser: true,
		es2021: true,
		node: true,
	},
	extends: [
		"eslint:recommended",
		"plugin:react/recommended",
		"plugin:@typescript-eslint/recommended",
		"prettier",
		"plugin:prettier/recommended",
	],
	overrides: [],
	parser: "@typescript-eslint/parser",
	parserOptions: {
		ecmaVersion: "latest",
		sourceType: "module",
	},
	plugins: ["react", "@typescript-eslint", "prettier"],
	rules: {
		"@typescript-eslint/no-unused-vars": "off",
		// "prettier/prettier": ["error", { endOfLine: "auto" }],
		"prettier/prettier": "off",
		"@typescript-eslint/no-var-requires": "off",
		"react/react-in-jsx-scope": "off",
	},
}
