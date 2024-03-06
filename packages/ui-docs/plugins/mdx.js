const path = require("path")
module.exports = function (context, opt = {}) {
	return {
		name: "docusaurus-plugin-mdx",
		configureWebpack(config) {
			const { siteDir } = context
			// console.log(JSON.stringify(config.resolve, null, 2))
			return {
				resolve: {
					alias: {
						"@components": path.resolve(__dirname, "../src/components"),
					},
				},
				module: {
					rules: [
						{
							test: /(\.mdx?)$/,
							include: [siteDir],
							use: [
								{
									loader: require.resolve("../loaders/props-table"),
									options: { alias: config.resolve.alias, ...opt },
								},
								{
									loader: require.resolve("../loaders/code-show"),
									options: { alias: config.resolve.alias, ...opt },
								},
							],
						},
					],
				},
			}
		},
	}
}
