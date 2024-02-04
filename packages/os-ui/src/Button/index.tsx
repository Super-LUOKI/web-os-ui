import React from "react"

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
	/** 按钮文本 */
	children: React.ReactNode
	/** 按钮类型 */
	type: "primary" | "secondary"
}
export const Button: React.FC<ButtonProps> = ({ children }) => {
	return <button>{children}</button>
}

export default Button
