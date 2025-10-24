import { ReactNode } from 'react';
import Link from 'next/link';
import Image from 'next/image';

/**
 * 自定义 MDX 组件
 * 用于替换 MDX 中的默认 HTML 元素
 */

interface HeadingProps {
  children?: ReactNode;
  id?: string;
}

// 标题组件 - 自动生成锚点
const H1 = ({ children, id }: HeadingProps) => (
  <h1 id={id} className="scroll-mt-20">
    {children}
  </h1>
);

const H2 = ({ children, id }: HeadingProps) => (
  <h2 id={id} className="scroll-mt-20">
    {children}
  </h2>
);

const H3 = ({ children, id }: HeadingProps) => (
  <h3 id={id} className="scroll-mt-20">
    {children}
  </h3>
);

const H4 = ({ children, id }: HeadingProps) => (
  <h4 id={id} className="scroll-mt-20">
    {children}
  </h4>
);

// 自定义链接组件
interface CustomLinkProps {
  href?: string;
  children?: ReactNode;
}

const CustomLink = ({ href = '', children }: CustomLinkProps) => {
  // 外部链接
  if (href.startsWith('http')) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline"
      >
        {children}
      </a>
    );
  }

  // 内部链接
  return (
    <Link href={href} className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline">
      {children}
    </Link>
  );
};

// 自定义图片组件
interface CustomImageProps {
  src?: string;
  alt?: string;
  width?: number;
  height?: number;
}

const CustomImage = ({ src = '', alt = '', width, height }: CustomImageProps) => {
  // 如果提供了宽高，使用 Next.js Image 组件
  if (width && height) {
    return (
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className="rounded-lg"
      />
    );
  }

  // 否则使用普通 img 标签
  return (
    <img
      src={src}
      alt={alt}
      className="rounded-lg max-w-full h-auto"
    />
  );
};

// 代码块组件
interface CodeProps {
  children?: ReactNode;
  className?: string;
}

const Code = ({ children, className }: CodeProps) => {
  const isInline = !className;

  if (isInline) {
    return (
      <code className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-sm font-mono">
        {children}
      </code>
    );
  }

  return (
    <code className={className}>
      {children}
    </code>
  );
};

// 预格式化文本块
interface PreProps {
  children?: ReactNode;
}

const Pre = ({ children }: PreProps) => (
  <pre className="overflow-x-auto p-4 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
    {children}
  </pre>
);

// 引用块
interface BlockquoteProps {
  children?: ReactNode;
}

const Blockquote = ({ children }: BlockquoteProps) => (
  <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-700 dark:text-gray-300">
    {children}
  </blockquote>
);

// 表格组件
interface TableProps {
  children?: ReactNode;
}

const Table = ({ children }: TableProps) => (
  <div className="overflow-x-auto">
    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
      {children}
    </table>
  </div>
);

const THead = ({ children }: TableProps) => (
  <thead className="bg-gray-50 dark:bg-gray-800">
    {children}
  </thead>
);

const TBody = ({ children }: TableProps) => (
  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
    {children}
  </tbody>
);

const TH = ({ children }: TableProps) => (
  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
    {children}
  </th>
);

const TD = ({ children }: TableProps) => (
  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
    {children}
  </td>
);

/**
 * MDX 组件映射
 * 这些组件会替换 MDX 中的默认 HTML 元素
 */
export const MDXComponents = {
  h1: H1,
  h2: H2,
  h3: H3,
  h4: H4,
  a: CustomLink,
  img: CustomImage,
  code: Code,
  pre: Pre,
  blockquote: Blockquote,
  table: Table,
  thead: THead,
  tbody: TBody,
  th: TH,
  td: TD,
};