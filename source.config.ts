import { defineDocs, defineConfig } from 'fumadocs-mdx/config';

export const docs = defineDocs({
  dir: 'content/docs',
  // 使用 docs 字段来支持按语言分组
});

export default defineConfig();