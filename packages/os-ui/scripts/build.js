const { exec } = require("child_process")
const { glob } = require("glob")

const outputDirMap = {
	umd: "lib",
	esm: "es",
	umdFull: "dist",
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
			return 'echo "full output"'
	}
	return `tsc ${files.join(" ")} --declaration --emitDeclarationOnly --esModuleInterop --skipLibCheck --target esnext --module ${module} --jsx react --declarationDir ${outputDirMap[chunkType]}`
}

// 使用 glob 模块匹配文件路径
glob("src/*/*.{ts,tsx}")
	.then((files) => {
		// 如果有匹配到文件，则执行命令
		if (files.length > 0) {
			// 要执行的命令
			const command = `pnpm webpack --config webpack.components.js && ${tscCmd(files, process.env.chunk_type)}`

			// 执行命令
			exec(command, (error, stdout, stderr) => {
				if (error) {
					console.error("\x1B[31m%s\x1B[0m", `exec scripts/build.js error: ${error.message}`)
					console.error(stdout)
					// TODO: 删除构建出来的文件
					return
				}
				if (stderr) {
					console.error("\x1B[31m%s\x1B[0m", `exec scripts/build.js command error: : ${stderr}`)
					console.error(stdout)
					// TODO: 删除构建出来的文件
					return
				}
				console.log(`Generated .d.ts file: ${stdout}`)
			})
		} else {
			console.error("\x1B[31m%s\x1B[0m", "Not found files in scripts/build.js")
		}
	})
	.catch((err) => {
		console.error("\x1B[31m%s\x1B[0m", "Resolve files error in scripts/build.js")
		console.error(err)
	})
