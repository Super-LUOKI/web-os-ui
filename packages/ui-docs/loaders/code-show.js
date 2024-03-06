const fs = require("fs")
const path = require("path")
const { parseReactElement, parsePropsTsTypeByPath, getExportDefVarDef } = require("./utils/tsx-ast-analyse")
const { getOptions } = require("loader-utils")

// module.exports = function codeShow(source) {
// 	const allCodeShowRegExp = /(```[^`]+)?<CodeShow[\s\n][^>]+(?!\/>).>([^]*?)<\/CodeShow>/gi // 格式为 <CodeShow ...><Example /></CodeShow>
// 	const allCodeShowNoChildrenRegExp = /(```[^`]+)?<CodeShow[\s\n][^>]*\/>/gi // 格式为 <CodeShow .../>
// 	const sourceUrlRegExp = /demoSourceUrl:\s(.*)/
// 	const sourceUrlMatch = source.match(sourceUrlRegExp)
// 	const matchedCode = source.match(allCodeShowRegExp)
// 	const matchedNoChildCode = source.match(allCodeShowNoChildrenRegExp)
// 	let lastSource = source
// 	let extraImport = "\n\nimport Playground from '@theme/Playground';\n"
//
// 	if (matchedCode || matchedNoChildCode) {
// 		const allMatchCode = (matchedCode || []).concat(matchedNoChildCode).filter(Boolean)
//
// 		allMatchCode.forEach((code) => {
// 			if (/^<CodeShow[*<]*/.test(code)) {
// 				const {source: replacedSource, extraImport: addImport} = replaceSource(
// 					lastSource,
// 					code,
// 					sourceUrlMatch && sourceUrlMatch[1],
// 				)
// 				lastSource = replacedSource
// 				extraImport += addImport
// 			}
// 		})
// 		// 替换可能多余的引入
// 		lastSource = lastSource.replace("import Playground from '@theme/Playground';", "")
// 		lastSource = lastSource.replace("import Playground from '@theme/Playground'", "")
// 		if (/(---\n[^]*\n---)([^]*)/.test(lastSource)) {
// 			lastSource = lastSource.replace(/(---\n[^]*\n---)([^]*)/, `$1${extraImport}$2`)
// 		} else {
// 			lastSource = `${extraImport}\n${lastSource}`
// 		}
// 	}
//
// 	return lastSource
// }
//
// function replaceSource(source, code, demoSourceUrl) {
// 	const childrenRegExp = /<CodeShow[\s\n][^>]*>([^]*)<\/CodeShow>/
// 	const childrenMatch = code.match(childrenRegExp)
// 	let extraImport = ""
// 	let children = ((childrenMatch && childrenMatch[1]) || "").trim()
// 	const result = getJsxCodeAst(code)
// 	// console.log(JSON.stringify(result, null, 2));
// 	const {props} = result
// 		.map((re) => {
// 			if (re.name === "CodeShow") {
// 				const {file, fileList = [].concat(file)} = re.props
// 				const newfileList = fileList?.map((filePath, index) => {
// 					const filePathMatch = filePath.match(/.*\/([^/]*)\.([^.]*)/)
// 					const fileName = filePathMatch ? filePathMatch[1] : filePath.match(/.*\/([^/]*)\.?([^.]*)/)[1]
// 					const fileSuffix = filePathMatch ? filePathMatch[2] : "tsx"
// 					const randomString = Math.random().toString(36).substring(2)
//
// 					if (index === 0 && !children) {
// 						// 随机字符串保证组件不会重复命名
// 						const componentName = `${fileName.replace(/\./g, "")}${randomString}`.toUpperCase()
// 						// 没有 CodeShow children 默认展示第一个文件的组件。
// 						children = `<${componentName} />`
// 						extraImport += `import ${componentName} from '${filePath}';\n`
// 					}
//
// 					return {
// 						fileName,
// 						fileSuffix,
// 						fileContent: `require('!!raw-loader!${filePath}')`,
// 					}
// 				})
//
// 				return {
// 					...re,
// 					props: {
// 						...re.props,
// 						fileList: newfileList,
// 						sourceUrl: fileList[0].replace("$", "") || demoSourceUrl,
// 					},
// 				}
// 			}
// 			return false
// 		})
// 		.filter(Boolean)[0]
//
// 	const propsString = Object.keys(props).reduce((pStr, curName) => {
// 		let re = pStr
//
// 		if (props[curName]) {
// 			if (typeof props[curName] === "string") {
// 				re += `${curName}="${props[curName]}"\n`
// 			} else {
// 				re += `${curName}={${JSON.stringify(props[curName])}}\n`
// 			}
// 		}
//
// 		return re
// 	}, "")
//
// 	const replacedCode = `
// <Playground
//   ${propsString.trim()}
// >
//   ${children}
// </Playground>`.replace(/"(require\('!!raw-loader![^()]*'\))"/g, "$1")
//
// 	const lastSource = source.replace(code, replacedCode)
//
// 	return {source: lastSource, extraImport}
// }

function getPropsCombination(attrMap, attrKeys, index, obj = {}, rst) {
	if (index === attrKeys.length) {
		return rst.push(obj)
	}
	const values = attrMap[attrKeys[index]]
	for (let i = 0; i < values.length; i++) {
		obj[attrKeys[index]] = values[i].trim()
		getPropsCombination(attrMap, attrKeys, index + 1, obj, rst)
		obj = Object.assign({}, obj)
		delete obj[attrKeys[index]]
	}
}

function getComponentsByType(typeInfos, cpnName) {
	const attrMap = {}
	typeInfos.forEach((item) => {
		const allCases = item?.docs
			.map((attr) => {
				const cases = attr.tags
					?.map((cmt) => {
						if (cmt.tagName === "examples") {
							return cmt?.comment?.trim().split("<|>")
						}
					})
					.filter(Boolean)
					.flat()
				if (cases && cases.length !== 0) return [...cases]
			})
			.filter(Boolean)
			.flat()
		attrMap[item.name] = allCases
	})

	const combination = []
	getPropsCombination(attrMap, Object.keys(attrMap), 0, {}, combination)

	let cpnCodeArr = combination.map((item) => {
		const { children, ...rest } = item
		const attrFragment = Object.keys(rest)
			.map((key) => `${key}={${rest[key]}}`)
			.join(" ")
		return `<${cpnName} ${attrFragment}>{${children ?? ""}}</${cpnName}>`
	})

	let rst = cpnCodeArr.join("\n")
	return rst
}

function getTruthyCode(replacedCode, externalAlias) {
	if (!externalAlias) return replacedCode
	const elementInfo = parseReactElement(replacedCode)
	if (elementInfo) {
		let src = elementInfo.props?.src
		const chilren = elementInfo.props?.children
		if (chilren) {
			return `<Playground code={${JSON.stringify(chilren)}}>${chilren}</Playground>`
		}
		if (src) {
			Object.keys(externalAlias).forEach((key) => {
				if (RegExp(`^${key.replace("$", "\\$")}.*`).test(src)) {
					src = path.resolve(src.replace(key, externalAlias[key]))
				}
			})
			const stat = fs.statSync(src)
			if (stat.isDirectory()) {
				src = path.join(src, "index.tsx")
				if (!fs.statSync(src).isFile()) {
					throw new Error(`找不到文件：${src}`)
				}
			}
			const [typeInfos, expName] = parsePropsTsTypeByPath(src)
			const newCode = getComponentsByType(typeInfos, expName)
			return `<Playground code={${JSON.stringify(newCode)}}>${newCode}</Playground>`
		}
	}
	return replacedCode
}

module.exports = function (source) {
	const { externalAlias } = getOptions(this)
	const allCodeShowRegExp = /(```[^`]+)?<CodeShow[\s\n][^>]+(?!\/>).>([^]*?)<\/CodeShow>/gi // 格式为 <CodeShow ...><Example /></CodeShow>
	const allCodeShowNoChildrenRegExp = /(```[^`]+)?<CodeShow[\s\n][^>]*\/>/gi // 格式为 <CodeShow .../>

	const matchedCode = source.match(allCodeShowRegExp)
	const matchedNoChildCode = source.match(allCodeShowNoChildrenRegExp)
	// let extraImport = "\n\nimport Playground from '@theme/Playground';\n"
	let extraImport = ""
	let lastSource = source

	if (matchedCode || matchedNoChildCode) {
		const allMatchCode = (matchedCode || []).concat(matchedNoChildCode).filter(Boolean)
		allMatchCode.forEach((code) => {
			if (/^<CodeShow[*<]*/.test(code)) {
				const truthCode = getTruthyCode(code, externalAlias)
				lastSource = lastSource.replace(code, extraImport + truthCode)
			}
		})
		// 替换可能多余的引入
		// lastSource = lastSource.replace("import Playground from '@theme/Playground';", "")
		// lastSource = lastSource.replace("import Playground from '@theme/Playground'", "")
		// if (/(---\n[^]*\n---)([^]*)/.test(lastSource)) {
		// 	lastSource = lastSource.replace(/(---\n[^]*\n---)([^]*)/, `$1${extraImport}$2`)
		// } else {
		// 	lastSource = `${extraImport}\n${lastSource}`
		// }
	}

	return lastSource
}
