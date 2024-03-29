const fs = require("fs")
const path = require("path")
const { merge } = require("webpack-merge")
const baseConfig = require("./webpack.base")

// 多Chunk打包，用于支持按需引入
const basePath = path.resolve(__dirname, "src")
const entries = {}
fs.readdirSync(basePath, { withFileTypes: true })
	.filter((file) => file.isDirectory())
	.forEach((dirName) => {
		entries[dirName.name] = path.resolve(basePath, dirName.name, "index.tsx")
	})

// 区分打包出的不同模块化规范

// umd 组件单独打包，从实现分包按需加载
const outputDirMap = {
	umd: "lib",
	esm: "es",
	umdFull: "dist",
}
const umdConfig = {
	entry: entries,
	output: {
		path: path.resolve(__dirname, outputDirMap["umd"]),
		filename: "[name]/index.js",
		chunkFilename: "[id].js",
		library: "[name]", // 指定的就是你使用require时的模块名
		libraryTarget: "umd",
		umdNamedDefine: true, // 会对 UMD 的构建过程中的 AMD 模块进行命名。否则就使用匿名的 define
	},
}

// ESModule 组件单独打包
const esmConfig = {
	entry: entries,
	output: {
		path: path.resolve(__dirname, outputDirMap["esm"]),
		filename: "[name]/index.js",
		chunkFilename: "[id].js",
		library: {
			type: "module",
		},
	},
	experiments: {
		outputModule: true,
	},
}

let optConfig = ""
switch (process.env.chunk_type) {
	case "umd":
		optConfig = umdConfig
		break
	case "esm":
		optConfig = esmConfig
		break
	default:
		console.error(
			"\x1B[31m%s\x1B[0m",
			`Error: chunk_type is expected in [umd, esm, umdFull], but got ${process.env.chunk_type}.`
		)
		return
}

module.exports = merge(baseConfig, optConfig)
