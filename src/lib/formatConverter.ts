/**
 * Format converter utilities for RichEditor
 * Supports conversion between Markdown, BBCode, and HTML
 */

import TurndownService from 'turndown';
import DOMPurify from 'dompurify';

/**
 * Convert BBCode to Markdown
 */
export function bbcodeToMarkdown(bbcode: string): string {
    let markdown = bbcode;

    // Bold: [b]text[/b] -> **text**
    markdown = markdown.replace(/\[b\](.*?)\[\/b\]/gi, '**$1**');

    // Italic: [i]text[/i] -> *text*
    markdown = markdown.replace(/\[i\](.*?)\[\/i\]/gi, '*$1*');

    // Underline: [u]text[/u] -> <u>text</u> (Markdown doesn't have native underline)
    markdown = markdown.replace(/\[u\](.*?)\[\/u\]/gi, '<u>$1</u>');

    // Strikethrough: [s]text[/s] -> ~~text~~
    markdown = markdown.replace(/\[s\](.*?)\[\/s\]/gi, '~~$1~~');

    // Links: [url=link]text[/url] -> [text](link)
    markdown = markdown.replace(/\[url=(.*?)\](.*?)\[\/url\]/gi, '[$2]($1)');
    
    // Simple links: [url]link[/url] -> [link](link)
    markdown = markdown.replace(/\[url\](.*?)\[\/url\]/gi, '[$1]($1)');

    // Images: [img]url[/img] -> ![](url)
    markdown = markdown.replace(/\[img\](.*?)\[\/img\]/gi, '![]($1)');

    // Images with alt: [img=url]alt[/img] -> ![alt](url)
    markdown = markdown.replace(/\[img=(.*?)\](.*?)\[\/img\]/gi, '![$2]($1)');

    // Quotes: [quote]text[/quote] -> > text
    markdown = markdown.replace(/\[quote\]([\s\S]*?)\[\/quote\]/gi, (match, content) => {
        return content.split('\n').map((line: string) => `> ${line}`).join('\n');
    });

    // Code: [code]text[/code] -> ```text```
    markdown = markdown.replace(/\[code\]([\s\S]*?)\[\/code\]/gi, '```\n$1\n```');

    // Inline code: [c]text[/c] -> `text`
    markdown = markdown.replace(/\[c\](.*?)\[\/c\]/gi, '`$1`');

    // Lists: [list][*]item[/list] -> - item
    markdown = markdown.replace(/\[list\]([\s\S]*?)\[\/list\]/gi, (match, content) => {
        return content.replace(/\[\*\](.*?)(?=\[\*\]|\[\/list\])/gi, '- $1\n');
    });

    // Ordered lists: [list=1][*]item[/list] -> 1. item
    markdown = markdown.replace(/\[list=1\]([\s\S]*?)\[\/list\]/gi, (match, content) => {
        let counter = 1;
        return content.replace(/\[\*\](.*?)(?=\[\*\]|\[\/list\])/gi, () => {
            return `${counter++}. $1\n`;
        });
    });

    // Headings: [h1]text[/h1] -> # text
    markdown = markdown.replace(/\[h1\](.*?)\[\/h1\]/gi, '# $1');
    markdown = markdown.replace(/\[h2\](.*?)\[\/h2\]/gi, '## $1');
    markdown = markdown.replace(/\[h3\](.*?)\[\/h3\]/gi, '### $1');
    markdown = markdown.replace(/\[h4\](.*?)\[\/h4\]/gi, '#### $1');

    // Colors: [color=red]text[/color] -> <span style="color: red">text</span>
    markdown = markdown.replace(/\[color=(.*?)\](.*?)\[\/color\]/gi, '<span style="color: $1">$2</span>');

    // Size: [size=5]text[/size] -> <span style="font-size: 5px">text</span>
    markdown = markdown.replace(/\[size=(.*?)\](.*?)\[\/size\]/gi, '<span style="font-size: $1px">$2</span>');

    // Center: [center]text[/center] -> <center>text</center>
    markdown = markdown.replace(/\[center\](.*?)\[\/center\]/gi, '<center>$1</center>');

    // Align: [align=left|right|center]text[/align]
    markdown = markdown.replace(/\[align=(.*?)\](.*?)\[\/align\]/gi, '<div style="text-align: $1">$2</div>');

    return markdown;
}

/**
 * Convert HTML to Markdown
 */
export function htmlToMarkdown(html: string): string {
    const turndownService = new TurndownService({
        headingStyle: 'atx',
        codeBlockStyle: 'fenced',
        emDelimiter: '*',
        strongDelimiter: '**',
    });

    // Sanitize HTML first
    const cleanHtml = DOMPurify.sanitize(html, {
        ALLOWED_TAGS: [
            'p', 'br', 'strong', 'em', 'u', 's', 'del', 'b', 'i',
            'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
            'ul', 'ol', 'li',
            'a', 'img',
            'blockquote', 'pre', 'code',
            'table', 'thead', 'tbody', 'tr', 'th', 'td',
            'span', 'div', 'center'
        ],
        ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'style', 'align']
    });

    return turndownService.turndown(cleanHtml);
}

/**
 * Detect format type from content
 */
export function detectFormat(content: string): 'markdown' | 'bbcode' | 'html' | 'unknown' {
    // Check for BBCode tags
    if (/\[(?:b|i|u|s|url|img|quote|code|list)\]/i.test(content)) {
        return 'bbcode';
    }

    // Check for HTML tags
    if (/<(?:p|div|span|strong|em|a|img|h[1-6]|ul|ol|li|blockquote|pre|code)[\s>]/i.test(content)) {
        return 'html';
    }

    // Check for Markdown syntax
    if (/(?:^|\n)(?:#{1,6}\s|[-*]\s|\d+\.\s|>\s|```|\*\*|__|\[.*?\]\(.*?\)|!\[.*?\]\(.*?\))/.test(content)) {
        return 'markdown';
    }

    return 'unknown';
}

/**
 * Convert any format to Markdown
 */
export function toMarkdown(content: string, sourceFormat?: 'markdown' | 'bbcode' | 'html'): string {
    if (!content) return '';

    const format = sourceFormat || detectFormat(content);

    switch (format) {
        case 'bbcode':
            return bbcodeToMarkdown(content);
        case 'html':
            return htmlToMarkdown(content);
        case 'markdown':
        default:
            return content;
    }
}

/**
 * Sanitize HTML content
 */
export function sanitizeHtml(html: string): string {
    return DOMPurify.sanitize(html, {
        ALLOWED_TAGS: [
            'p', 'br', 'strong', 'em', 'u', 's', 'del', 'b', 'i',
            'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
            'ul', 'ol', 'li',
            'a', 'img',
            'blockquote', 'pre', 'code',
            'table', 'thead', 'tbody', 'tr', 'th', 'td',
            'span', 'div', 'center'
        ],
        ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'style', 'align', 'class']
    });
}