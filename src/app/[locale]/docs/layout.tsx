import { ReactNode } from 'react';
import { DocsNavigation } from '@/components/DocsNavigation';

interface DocsLayoutProps {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}

/**
 * 文档布局组件
 * 为文档页面提供统一的布局结构
 */
export default async function DocsLayout({ children, params }: DocsLayoutProps) {
  const { locale } = await params;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-[1600px]">
        <div className="flex gap-8">
          {/* 侧边栏导航 */}
          <DocsNavigation locale={locale} />
          
          {/* 主内容区域 - 包含文档内容和目录 */}
          <main className="flex-1 min-w-0">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}