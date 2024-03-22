const fs = require("fs")
const path = require("path")
const { parseReactElement, parsePropsTsTypeByPath, getExportDefVarDef } = require("./utils/tsx-ast-analyse")
const { getOptions } = require("loader-utils")

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
			return `<Playground code={${JSON.stringify(newCode)}}>${newCode}</Playground>[import-${expName}]`
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
	let extraImport = "\nimport Playground from '@theme/Playground';\n"
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
		lastSource = lastSource.replaceAll(/import Playground from ['"]@theme\/Playground['"];?/g, "")
		// 获取用到的组件名
		let usedCpns = [...lastSource.matchAll(/\[import-(.*)\]/g)]
		usedCpns = Array.from(new Set(usedCpns.map((item) => item[1])))
		// 删除标记
		lastSource = lastSource.replaceAll(/\[import-(.*)\]/g, "")
		const usedCpnImports = usedCpns.map((cpn) => `import { ${cpn} } from "@web-os-ui/os-ui"`)
		const additionImport = `\n${usedCpnImports.join("\n")}\n${extraImport}`
		if (/(---\n[^]*\n---)([^]*)/.test(lastSource)) {
			lastSource = lastSource.replace(/(---\n[^]*\n---)([^]*)/, `$1${additionImport}$2`)
		} else {
			lastSource = `${additionImport}\n${lastSource}`
		}
	}

	return lastSource
}
