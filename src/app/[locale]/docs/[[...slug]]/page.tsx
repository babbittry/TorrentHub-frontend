import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { getMDXDocument, getAllDocuments, documentExists, extractTableOfContents } from '@/lib/mdx-utils';
import { MDXComponents } from '@/components/MDXComponents';
import { TableOfContents } from '@/components/TableOfContents';
import type { Metadata } from 'next';

interface PageProps {
  params: Promise<{
    locale: string;
    slug?: string[];
  }>;
}

/**
 * 生成静态路径参数
 */
export async function generateStaticParams() {
  const locales = ['en', 'zh-CN', 'ja', 'fr'];
  const params: { locale: string; slug: string[] }[] = [];

  for (const locale of locales) {
    try {
      const documents = await getAllDocuments(locale);
      
      // 为每个文档添加路径参数
      for (const doc of documents) {
        params.push({
          locale,
          slug: doc.split('/')
        });
      }

      // 添加根路径 (index)
      params.push({
        locale,
        slug: []
      });
    } catch (error) {
      console.error(`Error generating static params for ${locale}:`, error);
    }
  }

  return params;
}

/**
 * 生成元数据
 */
export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const params = await props.params;
  let { locale, slug = [] } = params;

  // 如果 slug 为空，使用 home
  if (slug.length === 0) {
    slug = ['home'];
  }

  try {
    const { meta } = await getMDXDocument(locale, slug);
    
    return {
      title: meta.title,
      description: meta.description,
    };
  } catch {
    return {
      title: 'Document Not Found',
      description: 'The requested document could not be found.'
    };
  }
}

/**
 * 文档页面组件
 */
export default async function DocumentPage(props: PageProps) {
  const params = await props.params;
  let { locale, slug = [] } = params;

  // 如果访问根路径 /docs，重定向到 /docs/home
  if (slug.length === 0) {
    slug = ['home'];
  }

  // 检查文档是否存在
  const exists = await documentExists(locale, slug);
  if (!exists) {
    notFound();
  }

  // 获取文档内容
  const { content, meta } = await getMDXDocument(locale, slug);
  
  // 提取目录
  const toc = extractTableOfContents(content);

  return (
    <div className="flex gap-8">
      <article className="flex-1 max-w-3xl prose prose-slate dark:prose-invert">
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-2">{meta.title}</h1>
          {meta.description && (
            <p className="text-lg text-gray-600 dark:text-gray-400">
              {meta.description}
            </p>
          )}
          {meta.date && (
            <time className="text-sm text-gray-500 dark:text-gray-500">
              {new Date(meta.date).toLocaleDateString(locale)}
            </time>
          )}
        </header>
        
        <div className="mdx-content">
          <MDXRemote source={content} components={MDXComponents} />
        </div>
      </article>
      
      <TableOfContents items={toc} />
    </div>
  );
}