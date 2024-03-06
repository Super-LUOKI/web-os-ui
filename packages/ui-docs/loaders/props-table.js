const fs = require("fs")
const path = require("path")
const { parseReactElement, parsePropsTsTypeByPath } = require("./utils/tsx-ast-analyse")
const { getOptions } = require("loader-utils")

function escapePipe(str = "") {
	return str.replace(/\|/g, "\\|")
}
function typeListToMdTable(typeList) {
	let mdTable = "| 属性名 | 类型 | 是否必选 | 描述 |\n"
	mdTable += "|------|------|----------|-------------|\n"

	typeList.forEach((item) => {
		const name = escapePipe(item.name)
		const type = escapePipe("`" + item.type + "`")
		const optional = item.optional ? "否" : "是"
		const docsInfo = item.docs
			.map((docItem) => {
				if (docItem.desc) return docItem.desc
			})
			.filter(Boolean)
			.join("<br/>")
		const docs = escapePipe(docsInfo)
		mdTable += `| ${name} | ${type} | ${optional} | ${docs} |\n`
	})

	return mdTable
}

function getTruthyCode(replacedCode, externalAlias) {
	if (!externalAlias) return replacedCode
	const elementInfo = parseReactElement(replacedCode)
	if (elementInfo) {
		let src = elementInfo.props?.src
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
			const [typeInfos] = parsePropsTsTypeByPath(src)
			return typeListToMdTable(typeInfos)
		}
	}
	return replacedCode
}

module.exports = function (source) {
	const { externalAlias } = getOptions(this)

	const allPropsTableRegExp = /(```[^`]+)?<PropsTable[\s\n][^>]*\/>/gi // 格式为 <PropsTable .../>
	const matchedCode = source.match(allPropsTableRegExp)
	let lastSource = source
	let summary = ""

	if (matchedCode) {
		matchedCode.forEach((code) => {
			if (/^<PropsTable[*<]*/.test(code)) {
				const truthCode = getTruthyCode(code, externalAlias)
				lastSource = lastSource.replaceAll(code, truthCode)
			}
		})
	}

	return lastSource
}
