import React, { useState } from "react"
import CodeBlock from "@theme/CodeBlock"
import styles from "./styles.module.css"

type PlaygroundProps = Partial<React.ComponentProps<typeof CodeBlock>> & {
	code: string
	children: React.ReactNode
}
const Playground: React.FC<PlaygroundProps> = (props) => {
	const { language = "jsx", showLineNumbers = true, children, code, ...rest } = props

	const [showCode, setShowCode] = useState(false)

	return (
		<div className={styles.playground}>
			<div className={styles.cpnArea}>{children}</div>
			<div className={styles.sourceArea}>
				<div className={styles.codeBar}>
					<button onClick={() => setShowCode(!showCode)}>toggle</button>
				</div>
				{showCode && (
					<div className={styles.codeArea}>
						<CodeBlock language={language} showLineNumbers={showLineNumbers} {...rest}>
							{code}
						</CodeBlock>
					</div>
				)}
			</div>
		</div>
	)
}

export default Playground
