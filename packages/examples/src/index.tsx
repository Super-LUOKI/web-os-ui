import React from "react"
import ReactDOM from "react-dom/client"
import { Button } from "@web-os-ui/os-ui"
const App = () => {
	return (
		<div>
			hello world111<Button type="primary">Hello</Button>
		</div>
	)
}

const root = ReactDOM.createRoot(document.getElementById("app")!)
// v18 的新方法
root.render(<App />)
