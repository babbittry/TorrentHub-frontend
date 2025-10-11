'use client';

import React, { useMemo } from 'react';
import MarkdownIt from 'markdown-it';
import DOMPurify from 'dompurify';
import { useTheme } from '@/context/ThemeContext';

export interface MarkdownRendererProps {
    content: string;
    className?: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
    const { currentMode } = useTheme();
    
    const md = useMemo(() => {
        return new MarkdownIt({
            html: true,
            linkify: true,
            typographer: true,
            breaks: true,
        });
    }, []);

    const renderedHTML = useMemo(() => {
        if (!content) return '';
        
        const rawHTML = md.render(content);
        
        // Sanitize HTML to prevent XSS attacks
        const cleanHTML = DOMPurify.sanitize(rawHTML, {
            ALLOWED_TAGS: [
                'p', 'br', 'strong', 'em', 'u', 's', 'del', 'code', 'pre',
                'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
                'ul', 'ol', 'li',
                'blockquote',
                'a', 'img',
                'table', 'thead', 'tbody', 'tr', 'th', 'td',
                'hr',
                'div', 'span'
            ],
            ALLOWED_ATTR: [
                'href', 'title', 'target', 'rel',
                'src', 'alt', 'width', 'height',
                'class', 'id'
            ],
            ALLOW_DATA_ATTR: false,
        });
        
        return cleanHTML;
    }, [content, md]);

    return (
        <div 
            className={`markdown-renderer prose dark:prose-invert max-w-none ${className}`}
            data-color-mode={currentMode}
            dangerouslySetInnerHTML={{ __html: renderedHTML }}
        />
    );
};

export default MarkdownRenderer;