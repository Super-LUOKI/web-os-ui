const ts = require("typescript")
const { readFileSync } = require("fs")

/**
 * 获取默认导出变量的声明语句的AST节点
 * @param {*} astRoot Node
 *
 */
function getExportDefVarDef(astRoot) {
	let exportDefNodeIdx = astRoot.statements.findIndex(ts.isExportAssignment)
	if (exportDefNodeIdx === -1) return null
	let expVarName = astRoot.statements[exportDefNodeIdx].expression.escapedText
	let varDeclarationIndex = -1
	let varDefNodeIdx = astRoot.statements.findIndex((item) => {
		if (ts.isVariableStatement(item)) {
			varDeclarationIndex = item.declarationList.declarations.findIndex(
				(declItem) => ts.isVariableDeclaration(declItem) && declItem.name.escapedText === expVarName
			)
			return varDeclarationIndex !== -1
		}
		return false
	})
	if (varDefNodeIdx === -1) return null
	return astRoot.statements[varDefNodeIdx].declarationList.declarations[varDeclarationIndex]
}

/**
 * 获取类型声明描述，如果是交叉或者联合类型，只会取“最后的类型”，比如 TypeA & TypeB 取 TypeB
 * @param {*} astRoot
 * @returns [Node, ...]
 */
function getExportDefTypeNode(astRoot) {
	const varDecl = getExportDefVarDef(astRoot)
	if (!varDecl) return null
	// 获取属性类型名称
	let typeName = ""
	if (varDecl.type && ts.isTypeReferenceNode(varDecl.type)) {
		const propsType = varDecl.type?.typeArguments?.[0]
		if (ts.isIntersectionTypeNode(propsType) || ts.isUnionTypeNode(propsType)) {
			const lastPropsIdx = propsType.types.length - 1
			typeName = propsType.types[lastPropsIdx].typeName.escapedText
		}
		if (ts.isTypeReferenceNode(propsType)) {
			typeName = propsType.typeName.escapedText
		}
	}
	// 获取类型定义节点
	const typeDefNodeIdx = astRoot.statements.findIndex(
		(item) => ts.isTypeAliasDeclaration(item) || ts.isInterfaceDeclaration(item)
	)
	return astRoot.statements[typeDefNodeIdx]
}

/**
 * 解析出类型信息
 * @param {*} typeNode type 或者 interface定义的节点
 */
function parseTypeInfo(typeNode, codeSource) {
	if (ts.isIntersectionTypeNode(typeNode.type) || ts.isUnionTypeNode(typeNode.type)) {
		typeNode = typeNode.type.types[typeNode.type.types.length - 1]
	}
	let typeMemebers = null
	if (ts.isTypeAliasDeclaration(typeNode)) {
		typeMemebers = typeNode?.type?.members
	}
	if (ts.isInterfaceDeclaration(typeNode) || ts.isTypeLiteralNode(typeNode)) {
		typeMemebers = typeNode?.members
	}
	if (!typeMemebers) return null
	const memberInfo = typeMemebers
		.map((item) => {
			if (ts.isPropertySignature(item)) {
				const isOptional = item.questionToken ? true : false
				const propName = item.name.escapedText
				const { pos, end } = item.type
				const propType = codeSource.slice(pos, end).trim()
				const docs = []
				item.jsDoc.forEach((item) => {
					const docItemInfo = {
						desc: item.comment,
					}
					const tags = item?.tags?.map((tag) => ({ tagName: tag.tagName.escapedText, comment: tag.comment }))
					docItemInfo.tags = tags
					docs.push(docItemInfo)
				})
				return {
					name: propName,
					type: propType,
					optional: isOptional,
					docs: docs,
				}
			}
		})
		.filter(Boolean)
	return memberInfo
}

/**
 * 从给定的源代码生成类型信息对象。
 *
 * @param {string} source - 生成类型信息的源代码
 * @return {typeInfo} 从给定源代码生成的类型信息对象
 */
function parsePropsTsType(source) {
	const ast = ts.createSourceFile("temp.tsx", source, ts.ScriptTarget.Latest, true)
	const typeNode = getExportDefTypeNode(ast)
	const typeInfo = parseTypeInfo(typeNode, source)
	return typeInfo
}

/**
 * 从源代码路径解析代码的类型信息和导出变量的定义
 * @param path
 * @returns {(*|(ts.__String & "const"))[]} [类型信息, 默认导出变量名]
 */
function parsePropsTsTypeByPath(path) {
	const codeSource = readFileSync(path, {
		encoding: "utf-8",
	})
	const ast = ts.createSourceFile("temp.tsx", codeSource, ts.ScriptTarget.Latest, true)
	const typeNode = getExportDefTypeNode(ast)
	const typeInfo = parseTypeInfo(typeNode, codeSource)
	const expVarName = getExportDefVarDef(ast)?.name?.escapedText
	return [typeInfo, expVarName]
}

/**
 * 解析ReactElement，对于属性只会解析string类型的属性，对于children，将会直接解析出代码片段
 * @param {*} source
 * @returns 属性等信息
 *
 * @example
 *
 {
  tagName: 'CodeShow',
  props: {
    src: 'value',
    abc: 'value',
    children: `<value>example<value/>'
  }
}
 */
function parseReactElement(source) {
	const ast = ts.createSourceFile("temp.tsx", source, ts.ScriptTarget.Latest, true)
	const expNode = ast.statements?.[0]
	if (ts.isExpressionStatement(expNode)) {
		let props = null
		let tagName = null
		if (ts.isJsxSelfClosingElement(expNode.expression)) {
			props = expNode.expression.attributes.properties
			tagName = expNode.expression.tagName.escapedText
		}
		if (ts.isJsxElement(expNode.expression)) {
			props = expNode.expression.openingElement.attributes.properties
			tagName = expNode.expression.openingElement.tagName.escapedText
		}
		const propsInfo = props
			.map((item) => {
				if (ts.isJsxAttribute(item) && ts.isStringLiteral(item.initializer)) {
					return {
						name: item.name.escapedText,
						val: item.initializer.text,
					}
				}
			})
			.filter(Boolean)
		if (ts.isJsxElement(expNode.expression)) {
			const { pos, end } = expNode.expression.children
			propsInfo.push({
				name: "children",
				val: source.slice(pos, end).trim(),
			})
		}

		return {
			tagName: tagName,
			props: propsInfo.reduce((pre, cur) => {
				pre[cur.name] = cur.val
				return pre
			}, {}),
		}
	}
	return null
}

module.exports = {
	getExportDefVarDef,
	parsePropsTsTypeByPath,
	parsePropsTsType,
	parseReactElement,
}
