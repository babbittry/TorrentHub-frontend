# 项目结构说明

## 📁 目录结构概览

```
sakura-pt-frontend/
├── .source/                    # ⚠️ 自动生成 - Fumadocs MDX 索引文件
├── content/                    # 📝 文档内容（MDX 格式）
│   └── docs/                   # 文档文件
├── messages/                   # 🌍 国际化翻译文件
├── public/                     # 🖼️ 静态资源
├── src/
│   ├── app/                    # 📄 Next.js App Router 页面
│   │   ├── [locale]/          # 国际化路由
│   │   │   ├── components/    # 页面组件
│   │   │   ├── docs/          # 📚 文档页面
│   │   │   │   ├── layout.tsx
│   │   │   │   └── [[...slug]]/  # 文档动态路由
│   │   │   │       └── page.tsx
│   │   │   └── ...            # 其他页面
│   │   └── api/               # 🔌 API 路由
│   │       └── search/        # 文档搜索 API
│   ├── context/               # ⚡ React Context
│   ├── i18n/                  # 🌐 国际化配置
│   ├── lib/                   # 🛠️ 工具函数和配置
│   │   ├── api.ts            # API 客户端
│   │   ├── source.ts         # Fumadocs 数据源
│   │   └── layout.shared.tsx # 布局配置
│   └── middleware.ts          # Next.js 中间件
├── source.config.ts           # Fumadocs MDX 配置
└── tsconfig.json              # TypeScript 配置
```

## 🔍 关键文件和目录说明

### 1. **`.source/`** - 自动生成目录 ⚠️
- **作用**：Fumadocs MDX 根据 `content/docs/` 自动生成的索引
- **内容**：MDX 文件的元数据、导入和页面树结构
- **生成时机**：每次运行 `npm run dev` 或 `npm run build` 时
- **注意事项**：
  - ✅ 已添加到 `.gitignore`
  - ❌ 不要手动编辑此目录
  - ❌ 不要提交到 Git

### 2. **`content/docs/`** - 文档源文件 📝
- **作用**：存放所有 MDX 格式的文档内容
- **文件格式**：`.mdx` (Markdown + JSX)
- **示例**：
  ```mdx
  ---
  title: 快速开始
  description: 了解如何使用本系统
  ---
  
  ## 介绍
  欢迎使用...
  ```

### 3. **`src/app/api/search/route.ts`** - 搜索 API 🔌
- **作用**：提供文档全文搜索功能
- **技术栈**：Orama 搜索引擎
- **位置说明**：
  - ✅ 必须放在 `app/api/` 下（Next.js 约定）
  - ❌ 不能移动到 `src/lib/`（那是工具函数目录）
- **URL**：`/api/search`

### 4. **`src/lib/source.ts`** - 文档数据源 📚
- **作用**：导出 Fumadocs 文档源，供页面组件使用
- **导入路径**：`@/lib/source`
- **使用示例**：
  ```typescript
  import { source } from '@/lib/source';
  const page = source.getPage(params.slug);
  ```

### 5. **`source.config.ts`** - Fumadocs 配置 ⚙️
- **作用**：配置文档源的位置和选项
- **当前配置**：
  ```typescript
  export const docs = defineDocs({
    dir: 'content/docs',  // 文档目录
  });
  ```

### 6. **`src/app/[locale]/docs/[[...slug]]/`** - 文档路由 📄
- **路由模式**：Catch-all 可选段
- **匹配规则**：
  - `/docs` → 文档首页
  - `/docs/getting-started` → 单层路径
  - `/docs/guide/installation` → 多层路径
- **注意**：必须使用 `[[...slug]]` (三个点)，不能是 `[[..slug]]` (两个点)

## 🎯 最佳实践

### ✅ 应该做的
1. 在 `content/docs/` 中编写和组织文档
2. 使用 `.mdx` 格式，支持 JSX 组件
3. 保持 API 路由在 `app/api/` 目录
4. 工具函数放在 `src/lib/`
5. 共享组件放在 `src/app/[locale]/components/`

### ❌ 不应该做的
1. 不要手动修改 `.source/` 目录
2. 不要将 API 路由移出 `app/api/`
3. 不要提交 `.source/` 到 Git
4. 不要在 `.next/` 中查找或修改文件

## 🔄 工作流程

### 添加新文档
1. 在 `content/docs/` 创建 `.mdx` 文件
2. 添加 frontmatter (title, description)
3. 编写文档内容
4. Fumadocs 自动更新 `.source/` 索引
5. 文档自动出现在文档网站中

### 修改现有文档
1. 直接编辑 `content/docs/` 中的 `.mdx` 文件
2. 保存后自动热重载
3. 无需手动重启开发服务器

## 📚 参考资料

- **Fumadocs 文档**：https://fumadocs.vercel.app
- **Next.js App Router**：https://nextjs.org/docs/app
- **MDX 语法**：https://mdxjs.com

## 🆘 常见问题

### Q: 为什么 `.source/` 目录一直变化？
A: 这是正常的！它会根据 `content/docs/` 的变化自动更新。已添加到 `.gitignore`。

### Q: 可以把搜索 API 移到 `src/lib/` 吗？
A: 不可以。API 路由必须在 `app/api/` 下，这是 Next.js 的硬性要求。

### Q: 如何添加新的文档页面？
A: 只需在 `content/docs/` 中创建新的 `.mdx` 文件即可，无需修改路由代码。

### Q: 文档支持哪些功能？
A: 支持 Markdown 语法、JSX 组件、代码高亮、目录导航、全文搜索等。