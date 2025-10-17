'use client';

import React from 'react';
import { MdEditor, ToolbarNames, config } from 'md-editor-rt';
import 'md-editor-rt/lib/style.css';
import { useTheme } from '@/context/ThemeContext';
import { useLocale } from 'next-intl';

import FR_FR from '@vavt/cm-extension/dist/locale/fr-FR';
import JA_JP from '@vavt/cm-extension/dist/locale/jp-JP';

config({
    editorConfig: {
        languageUserDefined: {
            'fr-FR': FR_FR,
            'ja-JP': JA_JP,
        }
    }
});

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
    const locale = useLocale();

    const toolbarsToExclude: ToolbarNames[] = [
        'mermaid',
        'katex',
        'save',
        'fullscreen',
        'htmlPreview',
        'github',
    ];

    const languageMap: { [key: string]: string } = {
        en: 'en-US',
        'zh-CN': 'zh-CN',
        fr: 'fr-FR',
        ja: 'ja-JP',
    };

    const editorLanguage = languageMap[locale] || 'en-US';

    return (
        <div className="w-full">
            {label && labelPlacement === 'outside' && (
                <label className="block text-sm font-medium mb-2">
                    {label}
                    {isRequired && <span className="text-danger ml-1">*</span>}
                </label>
            )}
            <div className={isDisabled ? 'opacity-50' : ''}>
                <MdEditor
                    modelValue={value}
                    onChange={onChange}
                    theme={currentMode === 'dark' ? 'dark' : 'light'}
                    language={editorLanguage}
                    placeholder={placeholder}
                    style={{ height: `${height}px` }}
                    maxLength={maxLength}
                    onBlur={onBlur}
                    toolbarsExclude={toolbarsToExclude}
                />
            </div>
            {(description || maxLength) && (
                <div className="flex justify-between items-center mt-2 text-sm">
                    <span className="text-default-500">{description}</span>
                    {maxLength && (
                        <span className={value.length > maxLength ? 'text-danger' : 'text-default-500'}>
                            {value.length} / {maxLength}
                        </span>
                    )}
                </div>
            )}
        </div>
    );
}