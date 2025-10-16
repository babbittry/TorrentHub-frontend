'use client';

import React from 'react';
import { MdPreview } from 'md-editor-rt';
import 'md-editor-rt/lib/preview.css';
import { useTheme } from '@/context/ThemeContext';

interface MarkdownRendererProps {
  content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const { currentMode } = useTheme();

  return (
    <MdPreview
      modelValue={content}
      theme={currentMode === 'dark' ? 'dark' : 'light'}
    />
  );
}