import { readFile, readdir } from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';

/**
 * 文档元数据接口
 */
export interface DocumentMeta {
  title: string;
  description?: string;
  date?: string;
  author?: string;
  tags?: string[];
  [key: string]: any;
}

/**
 * 文档数据接口
 */
export interface DocumentData {
  slug: string;
  meta: DocumentMeta;
  content: string;
}

/**
 * 文档导航项接口
 */
export interface DocumentNavItem {
  slug: string;
  title: string;
  path: string;
}

/**
 * 内容目录的基础路径
 */
const CONTENT_DIR = path.join(process.cwd(), 'src', 'content');

/**
 * 根据语言和 slug 获取 MDX 文档的完整路径
 */
export async function getDocumentPath(locale: string, slug: string[]): Promise<string> {
  const { stat } = await import('fs/promises');
  const slugPath = slug.join('/');
  
  // 如果 slug 为空，尝试查找根 index.mdx
  if (!slugPath) {
    return path.join(CONTENT_DIR, locale, 'index.mdx');
  }
  
  // 尝试直接的 .mdx 文件
  const directFile = path.join(CONTENT_DIR, locale, `${slugPath}.mdx`);
  try {
    await stat(directFile);
    return directFile;
  } catch {
    // 如果直接文件不存在，尝试目录中的 index.mdx
    return path.join(CONTENT_DIR, locale, slugPath, 'index.mdx');
  }
}

/**
 * 读取并解析 MDX 文档
 */
export async function getMDXDocument(
  locale: string,
  slug: string[]
): Promise<DocumentData> {
  try {
    const filePath = await getDocumentPath(locale, slug);
    const fileContent = await readFile(filePath, 'utf-8');
    
    // 使用 gray-matter 解析 frontmatter
    const { data, content } = matter(fileContent);
    
    return {
      slug: slug.join('/'),
      meta: data as DocumentMeta,
      content
    };
  } catch (error) {
    console.error(`Error reading MDX document at ${slug.join('/')}:`, error);
    throw new Error(`Document not found: ${slug.join('/')}`);
  }
}

/**
 * 获取指定语言下的所有文档路径
 */
export async function getAllDocuments(locale: string): Promise<string[]> {
  const localeDir = path.join(CONTENT_DIR, locale);
  const documents: string[] = [];

  async function scanDirectory(dir: string, basePath: string = ''): Promise<void> {
    try {
      const entries = await readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        const relativePath = basePath ? path.join(basePath, entry.name) : entry.name;

        if (entry.isDirectory()) {
          // 递归扫描子目录
          await scanDirectory(fullPath, relativePath);
        } else if (entry.isFile() && entry.name.endsWith('.mdx')) {
          // 添加 MDX 文件路径（移除 .mdx 扩展名和 index）
          const slug = relativePath
            .replace(/\.mdx$/, '')
            .replace(/\/index$/, '')
            .replace(/\\index$/, ''); // Windows 路径兼容
          if (slug) {
            documents.push(slug);
          }
        }
      }
    } catch (error) {
      console.error(`Error scanning directory ${dir}:`, error);
    }
  }

  await scanDirectory(localeDir);
  return documents;
}

/**
 * 获取指定语言的文档导航列表
 */
export async function getDocumentNavigation(locale: string): Promise<DocumentNavItem[]> {
  const slugs = await getAllDocuments(locale);
  const navigation: DocumentNavItem[] = [];

  for (const slug of slugs) {
    try {
      const { meta } = await getMDXDocument(locale, slug.split('/'));
      navigation.push({
        slug,
        title: meta.title || slug,
        path: `/docs/${slug}`
      });
    } catch (error) {
      console.error(`Error loading navigation for ${slug}:`, error);
    }
  }

  return navigation;
}

/**
 * 检查文档是否存在
 */
export async function documentExists(locale: string, slug: string[]): Promise<boolean> {
  try {
    const filePath = await getDocumentPath(locale, slug);
    await readFile(filePath);
    return true;
  } catch {
    return false;
  }
}