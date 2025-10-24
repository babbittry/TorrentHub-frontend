'use client';

import { useEffect, useState } from 'react';
import type { TocItem } from '@/lib/mdx-utils';

interface TableOfContentsProps {
  items: TocItem[];
}

/**
 * 文档目录组件
 * 显示文档标题的目录，支持点击跳转和当前位置高亮
 */
export function TableOfContents({ items }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    // 使用 IntersectionObserver 监听标题元素的可见性
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        // 设置根边距，使得标题在视口上方 20% 到下方 80% 之间时被认为是"活动"的
        rootMargin: '-20% 0% -80% 0%',
        threshold: 0
      }
    );

    // 观察所有标题元素
    items.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) {
        observer.observe(element);
      }
    });

    // 清理函数
    return () => {
      observer.disconnect();
    };
  }, [items]);

  /**
   * 处理目录项点击事件
   */
  const handleClick = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  // 如果没有目录项，不渲染组件
  if (items.length === 0) {
    return null;
  }

  return (
    <nav className="w-64 flex-shrink-0 sticky top-20 h-[calc(100vh-5rem)] overflow-y-auto hidden xl:block">
      <div className="space-y-2 pr-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 px-2">
          目录
        </h3>
        <div className="space-y-1">
          {items.map((item) => {
            const isActive = activeId === item.id;
            const paddingLeft = item.level === 2 ? 'pl-2' : item.level === 3 ? 'pl-6' : 'pl-10';
            
            return (
              <button
                key={item.id}
                onClick={() => handleClick(item.id)}
                className={`
                  block w-full text-left text-sm py-1 px-2 rounded transition-all duration-200
                  ${paddingLeft}
                  ${isActive
                    ? 'text-blue-600 dark:text-blue-400 font-medium bg-blue-50 dark:bg-blue-900/20 border-l-2 border-blue-600 dark:border-blue-400'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 border-l-2 border-transparent'
                  }
                `}
                aria-current={isActive ? 'location' : undefined}
              >
                {item.text}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
