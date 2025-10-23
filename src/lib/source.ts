import { docs } from '../../.source';
import { loader } from 'fumadocs-core/source';
import { defineI18n } from 'fumadocs-core/i18n';
import { fumadocsI18n } from '@/i18n/fumadocs-i18n';

// 定义 i18n 配置
export const i18n = defineI18n({
  defaultLanguage: 'zh-CN',
  languages: ['zh-CN', 'en', 'ja', 'fr'],
});

export const source = loader({
  baseUrl: '/docs',
  source: docs.toFumadocsSource(),
  fumadocsI18n,
});