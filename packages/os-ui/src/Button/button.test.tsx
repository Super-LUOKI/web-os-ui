import React from "react"
import { render, waitFor } from "@testing-library/react"
import Button from "./index"

describe("Button component", () => {
	it("renders button with children correctly", () => {
		const { getByText } = render(<Button>Test Button</Button>)
		expect(getByText("Test Button")).toBeInTheDocument()
	})

	it("renders button with primary type correctly", () => {
		const { container } = render(<Button type="primary">Primary Button</Button>)
		const button = container.querySelector("button")
		expect(button).toHaveClass("primary")
	})

	it("renders button with secondary type correctly", () => {
		const { container } = render(<Button type="secondary">Secondary Button</Button>)
		const button = container.querySelector("button")
		expect(button).toHaveClass("secondary")
	})
})
