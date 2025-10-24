import Link from 'next/link';
import { getDocumentNavigation, type DocumentNavItem } from '@/lib/mdx-utils';

interface DocsNavigationProps {
  locale: string;
  currentSlug?: string;
}

/**
 * 文档导航组件
 * 显示文档的侧边栏导航
 */
export async function DocsNavigation({ locale, currentSlug }: DocsNavigationProps) {
  const navigation = await getDocumentNavigation(locale);

  return (
    <nav className="w-64 flex-shrink-0 sticky top-20 h-[calc(100vh-5rem)] overflow-y-auto">
      <div className="space-y-1">
        {navigation.map((item: DocumentNavItem) => {
          const isActive = currentSlug === item.slug;
          
          return (
            <Link
              key={item.slug}
              href={`/${locale}${item.path}`}
              className={`
                block px-4 py-2 rounded-lg text-sm transition-colors
                ${isActive 
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 font-medium' 
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }
              `}
            >
              {item.title}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}