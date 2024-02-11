import { themes as prismThemes } from "prism-react-renderer"
import type { Config } from "@docusaurus/types"
import type * as Preset from "@docusaurus/preset-classic"

const config: Config = {
	title: "ConfigSiteTitle",
	tagline: "ConfigTagLine",
	favicon: "img/favicon.ico",

	// 下方二者共同决定页面请求静态资源的路径
	// Set the production url of your site here
	url: "https://your-docusaurus-site.example.com",
	// Set the /<baseUrl>/ pathname under which your site is served
	// For GitHub pages deployment, it is often '/<projectName>/'
	baseUrl: "/web-os-ui/",

	// 快速部署的配置
	// GitHub pages deployment config.
	// If you aren't using GitHub pages, you don't need these.
	organizationName: "facebook", // Usually your GitHub org/user name.
	projectName: "docusaurus", // Usually your repo name.

	// 代码中有引用但是却不存在的内容
	onBrokenLinks: "warn",
	onBrokenMarkdownLinks: "warn",

	// Even if you don't use internationalization, you can use this field to set
	// useful metadata like html lang. For example, if your site is Chinese, you
	// may want to replace "en" with "zh-Hans".
	i18n: {
		defaultLocale: "en",
		locales: ["en"],
	},

	presets: [
		[
			"classic",
			{
				docs: {
					// 是否在文章页面加载面包屑
					breadcrumbs: true,
					routeBasePath: "/",
					sidebarPath: "./sidebars.ts",
					// Please change this to your repo.
					// Remove this to remove the "edit this page" links.
					editUrl: "https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/",
				},
				theme: {
					customCss: "./src/css/custom.css",
				},
			} satisfies Preset.Options,
		],
	],

	themeConfig: {
		docs: {
			sidebar: {
				// 是否允许（手动）隐藏侧边栏（小屏幕仍然会自动隐藏）
				hideable: false,
				// 列表组项目自动折叠
				autoCollapseCategories: false,
			},
		},
		// Replace with your project's social card
		image: "img/docusaurus-social-card.jpg",
		navbar: {
			title: "WebOS UI",
			logo: {
				alt: "My Site Logo",
				src: "img/logo.svg",
			},
			items: [
				{
					type: "docSidebar",
					position: "right",
					label: "指南",
					sidebarId: "guides",
				},
				{
					type: "docSidebar",
					position: "right",
					label: "组件",
					sidebarId: "components",
				},
				{
					href: "https://github.com/Super-LUOKI/web-os-ui",
					label: "GitHub",
					position: "right",
				},
			],
		},
		footer: {
			style: "light",
			copyright: `Created with passion by<br/>LuoKing 🚀`,
		},
		prism: {
			theme: prismThemes.github,
			darkTheme: prismThemes.dracula,
		},
	} satisfies Preset.ThemeConfig,
}

export default config
