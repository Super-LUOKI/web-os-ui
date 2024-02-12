#!/usr/bin/env node

import { exec } from "child_process"
import { program } from "commander"
import inquirer from "inquirer"
import ora from "ora"
import download from "download-git-repo"
import chalk from "chalk"
import symbols from "log-symbols"

import pkgInfo from "../package.json" assert { type: "json" }

const remoteTemplate = {
	ts: {
		address: "https://github.com/Super-LUOKI/webos-ui-template.git",
		branch: "ts-template",
	},
	js: {
		address: "https://github.com/Super-LUOKI/webos-ui-template.git",
		branch: "js-template",
	},
}
const questions = [
	{
		type: "list", // 问题类型为列表选择框
		name: "lang", // 响应的属性名
		message: "What is the language used in your project?", // 问题内容
		choices: ["JavaScript", "TypeScript"], // 选项列表
		default: "JavaScript",
	},
	{
		type: "list", // 问题类型为列表选择框
		name: "pkgTool", // 响应的属性名
		message: "What package management tool do you want to use?", // 问题内容
		choices: ["npm", "pnpm", "yarn"], // 选项列表
		default: "npm",
	},
]
let spinner = ora("Downloading...")

async function enquireOptions(baseOptions) {
	const { typescript: enableTs } = baseOptions
	if (enableTs) questions.shift()
	const answer = await inquirer.prompt(questions)
	if (enableTs) answer.lang = "TypeScript"
	return answer
}

program
	.version(pkgInfo.version)
	.description("Initialize a React project with a WebOS UI component library.")
	.arguments("<project_name>")
	.option("--typescript", "Use TypeScript")
	.action(async (projName, options) => {
		const userOptions = await enquireOptions(options)
		spinner.start()
		const { address, branch } = userOptions.lang === "TypeScript" ? remoteTemplate.ts : remoteTemplate.js
		download(`direct:${address}#${branch}`, `./${projName}`, { clone: true }, (err) => {
			if (err) {
				spinner.fail()
				console.log(chalk.red(symbols.error), chalk.red(`Download template failed. ${err}`))
				return
			}
			// 结束加载图标
			spinner.succeed()
			console.log(chalk.green(symbols.success), chalk.green("Download template completed!"))
			spinner.text = "Installing dependencies"
			spinner.start()
			exec(`cd ./${projName} && ${userOptions.pkgTool} install`, (error, stdout, stderr) => {
				if (error) {
					spinner.fail()
					console.log(stderr)
					console.log(chalk.red(symbols.error), chalk.red(`Install dependencies faild. ${error}`))
					return
				}
				console.log(stdout)
				spinner.succeed()
				console.log("\n	To get started")
				console.log(chalk.bold.green(`	cd ${projName}`))
				console.log(chalk.bold.green(`	${userOptions.pkgTool} run dev`))
			})
		})
	})

program.parse()
