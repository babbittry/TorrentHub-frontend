# TorrentHub Frontend

本仓库是 TorrentHub（一个 Private Tracker 网站）的前端项目。

## ✨ 功能特性

-   基于 **Next.js App Router** 的现代化 Web 应用。
-   使用 **Tailwind CSS** 构建的响应式设计。
-   通过 **`next-intl`** 实现完整的国际化支持。
-   包含一套由 **`shadcn`** 提供的 UI 组件。
-   严格的 **TypeScript** 类型检查和 **ESLint** 代码规范。

## 🚀 快速开始

在开始之前，请确保您的开发环境中已安装 [Node.js](https://nodejs.org/) (建议版本 >= 18.0.0) 和 [npm](https://www.npmjs.com/)。

### 1. 安装依赖

克隆项目后，在根目录运行以下命令以安装所有必需的依赖项：

```bash
npm install
```

### 2. 启动开发服务器

安装完成后，运行以下命令以启动本地开发服务器：

```bash
npm run dev
```

服务器默认将在 `http://localhost:3000` 上启动。项目已启用 Turbopack 以提供更快的开发体验。

默认情况下，前端会通过 Next.js 同源代理把 `/api/*`、`/avatars/*` 和 `/badges/*` 转发到 `http://localhost:5014`，避免浏览器端跨域/CORS 问题。若后端不在默认地址，可设置 `API_URL` 指向后端服务；只有需要浏览器直连后端时才设置 `NEXT_PUBLIC_API_URL`。

## ⚙️ 可用命令

本项目在 `package.json` 中定义了以下脚本：

-   `npm run dev`: 启动开发服务器（使用 Turbopack）。
-   `npm run build`: 构建用于生产环境的应用。
-   `npm run start`: 启动生产模式服务器（需先执行 `build`）。
-   `npm run lint`: 对代码库执行 ESLint 检查。

## 🛠️ 技术栈

-   **框架**: [Next.js](https://nextjs.org/)
-   **UI 库**: [React](https://react.dev/)
-   **语言**: [TypeScript](https://www.typescriptlang.org/)
-   **样式**: [Tailwind CSS](https://tailwindcss.com/)
-   **UI 组件**: [shadcn](https://ui.shadcn.com/)
-   **国际化**: [next-intl](https://next-intl-docs.vercel.app/)
-   **图标**: [Font Awesome](https://fontawesome.com/)

## 📝 代码风格

项目遵循以下代码风格和规范：

-   **缩进**: 所有文件统一使用 **4 个空格**进行缩进。
-   **Linting**: 遵循 `next/core-web-vitals` 和 `next/typescript` 的 ESLint 配置。
-   **类型检查**: TypeScript 设置为 `strict` 模式。
