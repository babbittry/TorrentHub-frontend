'use client';

import React from 'react';
import { MdPreview } from 'md-editor-rt';
import 'md-editor-rt/lib/preview.css';
import { useTheme } from 'next-themes';

interface MarkdownRendererProps {
  content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const { resolvedTheme } = useTheme();

  return (
    <MdPreview
      modelValue={content}
      theme={resolvedTheme === 'dark' ? 'dark' : 'light'}
      previewTheme="github"
      className="markdown-preview-transparent"
    />
  );
}