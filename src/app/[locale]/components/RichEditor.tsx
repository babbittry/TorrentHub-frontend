'use client';

import React, { useState, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { Card, CardBody } from '@heroui/card';
import { toMarkdown } from '@/lib/formatConverter';
import { useTheme } from '@/context/ThemeContext';

// Dynamic import to avoid SSR issues with MDEditor
const MDEditor = dynamic(
    () => import('@uiw/react-md-editor').then((mod) => mod.default),
    { ssr: false }
);

export interface RichEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    height?: number;
    maxLength?: number;
    label?: string;
    labelPlacement?: 'outside' | 'inside';
    description?: string;
    isRequired?: boolean;
    isDisabled?: boolean;
    onBlur?: () => void;
}

export default function RichEditor({
    value,
    onChange,
    placeholder = '',
    height = 400,
    maxLength,
    label,
    labelPlacement = 'outside',
    description,
    isRequired = false,
    isDisabled = false,
    onBlur,
}: RichEditorProps) {
    const { currentMode } = useTheme();
    const [internalValue, setInternalValue] = useState(value);

    // Auto-convert BBCode/HTML to Markdown on paste
    const handlePaste = useCallback((event: React.ClipboardEvent) => {
        const pastedText = event.clipboardData.getData('text');
        if (pastedText) {
            const markdown = toMarkdown(pastedText);
            if (markdown !== pastedText) {
                event.preventDefault();
                const textarea = event.target as HTMLTextAreaElement;
                const start = textarea.selectionStart;
                const end = textarea.selectionEnd;
                const newValue = 
                    internalValue.substring(0, start) + 
                    markdown + 
                    internalValue.substring(end);
                setInternalValue(newValue);
                onChange(newValue);
            }
        }
    }, [internalValue, onChange]);

    const handleChange = useCallback((val?: string) => {
        const newValue = val || '';
        setInternalValue(newValue);
        onChange(newValue);
    }, [onChange]);

    // Character counter
    const characterCount = useMemo(() => {
        return maxLength ? `${internalValue.length} / ${maxLength}` : null;
    }, [internalValue, maxLength]);

    // Validate max length
    const isOverLimit = useMemo(() => {
        return maxLength ? internalValue.length > maxLength : false;
    }, [internalValue, maxLength]);

    return (
        <div className="w-full">
            {label && labelPlacement === 'outside' && (
                <label className="block text-sm font-medium mb-2">
                    {label}
                    {isRequired && <span className="text-danger ml-1">*</span>}
                </label>
            )}
            
            <Card className={isDisabled ? 'opacity-50' : ''}>
                <CardBody className="p-0">
                    <div
                        onPaste={handlePaste}
                        data-color-mode={currentMode}
                        className="rich-editor-wrapper"
                    >
                        <MDEditor
                            value={internalValue}
                            onChange={handleChange}
                            height={height}
                            preview="live"
                            hideToolbar={false}
                            enableScroll={true}
                            textareaProps={{
                                placeholder: placeholder,
                                disabled: isDisabled,
                                maxLength: maxLength,
                                onBlur: onBlur,
                            }}
                            previewOptions={{
                                rehypePlugins: [],
                            }}
                        />
                    </div>
                </CardBody>
            </Card>

            {(description || characterCount) && (
                <div className="flex justify-between items-center mt-2 text-sm">
                    <span className="text-default-500">{description}</span>
                    {characterCount && (
                        <span className={isOverLimit ? 'text-danger' : 'text-default-500'}>
                            {characterCount}
                        </span>
                    )}
                </div>
            )}

            {isOverLimit && (
                <p className="text-danger text-sm mt-1">
                    Content exceeds maximum length of {maxLength} characters
                </p>
            )}
        </div>
    );
}