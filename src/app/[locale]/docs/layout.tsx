import { source, i18n } from '@/lib/source';
import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import type { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function Layout({ children, params }: LayoutProps) {
  const { locale } = await params;

  return (
    <DocsLayout
      tree={source.pageTree}
      i18n
      nav={{
        title: 'TorrentHub',
      }}
    >
      {children}
    </DocsLayout>
  );
}