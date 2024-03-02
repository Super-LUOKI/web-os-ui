import React, { useEffect } from "react"
import { ButtonWrapper } from "./styles"
import { useTranslation } from "react-i18next"

export type ButtonProps = {
	/** 按钮文本 */
	children: React.ReactNode
	/** 按钮类型 */
	type?: "primary" | "secondary"
}
export const Button: React.FC<ButtonProps> = (props) => {
	const { children } = props
	const { t, i18n } = useTranslation()
	return <ButtonWrapper>{children}</ButtonWrapper>
}

export default Button
