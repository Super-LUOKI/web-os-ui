import type * as emotion from "@emotion/react"
import styled from "@emotion/styled"
import { withThemeDefault } from "@web-os-ui/provider"

export const ButtonWrapper = styled.button`
	color: ${(props) => withThemeDefault(props, "colors")?.primary};
`

export default ButtonWrapper
