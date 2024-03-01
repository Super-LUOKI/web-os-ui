const { exec } = require("child_process")
const { glob } = require("glob")
const path = require("path")
const fs = require("fs")

const outputDirMap = {
	umd: "lib",
	esm: "es",
}

function tscCmd(files, chunkType) {
	let module = ""
	switch (process.env.chunk_type) {
		case "umd":
			module = "commonjs"
			break
		case "esm":
			module = "esnext"
			break
		default:
			console.error(`chunk_type '${process.env.chunk_type}' is not support, use 'umd' or 'esm'`)
			process.exit(1)
	}
	const options = [
		"--declaration",
		"--emitDeclarationOnly",
		"--esModuleInterop",
		"--skipLibCheck",
		"--skipDefaultLibCheck",
		"--target esnext",
		`--module ${module}`,
		"--jsx react",
		`--declarationDir ${outputDirMap[chunkType]}`,
	]
	console.log({ cmd: `tsc ${files.join(" ")} ${options.join(" ")}` })
	return `tsc ${files.join(" ")} ${options.join(" ")}`
}

async function writeEntryFiles(chunkType) {
	const outputDir = outputDirMap[chunkType]
	let content = []
	let buildFiles = await glob(`${outputDir}/*/*.js`)
	const folderNames = buildFiles.map((file) => path.basename(path.dirname(file)))
	if (chunkType === "esm") {
		content = folderNames.map((folder) => `export * from './${folder}'`)
	} else if (chunkType === "umd") {
		content = folderNames.map((folder) => `const ${folder} = require('./${folder}')`)

		content.push(`module.exports = {`)
		content.push(`${folderNames.map((name) => `	${name}: ${name}.default`).join(`,\n`)}`)
		content.push("}")
	}
	if (content.length > 0) {
		fs.writeFileSync(`${outputDir}/index.js`, content.join(`\n`))
	}
}
async function writeTypeFiles(chunkType) {
	const outputDir = outputDirMap[chunkType]
	let content = []
	let typeFiles = await glob(`${outputDir}/*/*.d.ts`)
	const folderNames = typeFiles.map((file) => path.basename(path.dirname(file)))
	content = folderNames.map((file) => `export * from "./${file}"`)
	if (content.length > 0) {
		fs.writeFileSync(`${outputDir}/index.d.ts`, content.join(`\n`))
	}
}
const excludeFileReg = /(\.test|\.spec.ts)\.tsx?$/
// 使用 glob 模块匹配文件路径
glob("src/*/*.{ts,tsx}")
	.then((allFiles) => {
		const files = allFiles.filter((path) => !excludeFileReg.test(path))
		// 如果有匹配到文件，则执行命令
		if (files.length > 0) {
			// 要执行的命令
			const command = `pnpm webpack --config webpack.components.js && ${tscCmd(files, process.env.chunk_type)}`

			// 执行命令
			exec(command, async (error, stdout, stderr) => {
				if (error) {
					console.error("\x1B[31m%s\x1B[0m", `exec scripts/build.js error: ${error.message}`)
					console.error(stdout)
					process.exit(1)
					return
				}
				if (stderr) {
					console.error("\x1B[31m%s\x1B[0m", `exec scripts/build.js command error: : ${stderr}`)
					console.error(stdout)
					process.exit(1)
					return
				}
				await writeEntryFiles(process.env.chunk_type)
				await writeTypeFiles(process.env.chunk_type)
				console.log(`Generated .d.ts file: ${stdout}`)
			})
		} else {
			console.error("\x1B[31m%s\x1B[0m", "Not found files in scripts/build.js")
			process.exit(1)
		}
	})
	.catch((err) => {
		console.error("\x1B[31m%s\x1B[0m", "Resolve files error in scripts/build.js")
		console.error(err)
		process.exit(1)
	})
