import { source } from '@/lib/source';
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
} from 'fumadocs-ui/page';
import { notFound } from 'next/navigation';
import { getMDXComponents } from '@/app/[locale]/components/mdx-components';
import type { Metadata } from 'next';
import { createRelativeLink } from 'fumadocs-ui/mdx';

interface PageProps {
  params: Promise<{
    locale: string;
    slug?: string[]
  }>;
}

export default async function Page(props: PageProps) {
  const params = await props.params;
  
  // 构建完整路径，包含语言前缀
  const fullSlug = params.slug ? [params.locale, ...params.slug] : [params.locale];
  
  const page = source.getPage(fullSlug);
  if (!page) notFound();

  const MDX = page.data.body;

  return (
    <DocsPage toc={page.data.toc} full={page.data.full}>
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription>{page.data.description}</DocsDescription>
      <DocsBody>
        <MDX components={getMDXComponents({a: createRelativeLink(source, page),})} />
      </DocsBody>
    </DocsPage>
  );
}

export async function generateStaticParams() {
  // 为所有语言的所有页面生成路径
  return source.generateParams().map((params) => {
    const slugArray = params.slug || [];
    const [locale, ...slug] = slugArray;
    return {
      locale: locale || 'zh-CN',
      slug: slug.length > 0 ? slug : undefined,
    };
  });
}

export async function generateMetadata(
  props: PageProps,
): Promise<Metadata> {
  const params = await props.params;
  const fullSlug = params.slug ? [params.locale, ...params.slug] : [params.locale];
  const page = source.getPage(fullSlug);
  if (!page) notFound();

  return {
    title: page.data.title,
    description: page.data.description,
  };
}