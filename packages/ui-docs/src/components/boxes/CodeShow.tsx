import React from "react"

type CodeShowProps = {
	/** 加载代码文件路径 与children二选一, children 优先级更高*/
	src?: string
	/** 直接传入代码片段 与src二选一, children 优先级更高 */
	children?: React.ReactNode
}
const CodeShow: React.FC<CodeShowProps> = () => <></>

export default CodeShow
