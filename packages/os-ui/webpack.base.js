// 打包完分析包大小插件
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin
// 删除上次打包文件的插件
const { CleanWebpackPlugin } = require("clean-webpack-plugin")

module.exports = {
	mode: "production",
	resolve: {
		// 配置 extensions 来告诉 webpack 在没有书写后缀时，以什么样的顺序去寻找文件
		extensions: [".js", ".json", ".jsx", ".ts", ".tsx"], // 如果项目中只有 tsx 或 ts 可以将其写在最前面
	},
	module: {
		rules: [
			{
				test: /.(jsx?)|(tsx?)$/,
				exclude: /node_modules/,
				use: [
					{
						loader: "babel-loader",
						options: {
							presets: [
								[
									"@babel/preset-env",
									{
										targets: "last 2 versions, > 0.2%, not dead", // 根据项目去配置
										useBuiltIns: "usage", // 会根据配置的目标环境找出需要的polyfill进行部分引入
										corejs: 3, // 使用 core-js@3 版本
									},
								],
								["@babel/preset-typescript"],
								["@babel/preset-react"],
							],
						},
					},
				],
			},
		],
	},
	optimization: {
		minimize: false,
	},
	plugins: [new CleanWebpackPlugin()],
	// 不打包指定的包，减小包体积
	externals: {
		react: "react",
		"react-dom": "react-dom",
	},
}

/**
 * if need report
 */
if (process.env.analyse === "on") {
	module.exports.plugins = (module.exports.plugins || []).concat([new BundleAnalyzerPlugin()])
}
