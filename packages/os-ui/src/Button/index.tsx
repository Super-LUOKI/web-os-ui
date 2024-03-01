import React from "react"
import { Tag } from "@web-os-ui/provider"

export type ButtonProps = {
	/** 按钮文本 */
	children: React.ReactNode
	/** 按钮类型 */
	type?: "primary" | "secondary"
}
export const Button: React.FC<ButtonProps> = (props) => {
	const { children } = props
	const t = Tag
	return <button>{children}</button>
}

export default Button
