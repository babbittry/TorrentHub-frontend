import {defineRouting} from 'next-intl/routing';

export const routing = defineRouting({
    locales: ['en', 'zh-CN', 'ja', 'fr'],
    defaultLocale: 'zh-CN'
});
