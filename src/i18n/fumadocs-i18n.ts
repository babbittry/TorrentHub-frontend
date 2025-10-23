import { defineI18n } from 'fumadocs-core/i18n';
import type { I18nConfig } from 'fumadocs-core/i18n';

export const fumadocsI18n = defineI18n({
    defaultLanguage: 'zh-CN',
    languages: ['en', 'zh-CN', 'ja', 'fr'],
    parser: 'dir',
});