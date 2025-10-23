import { source } from '@/lib/source';
import { createFromSource } from 'fumadocs-core/search/server';
import { createTokenizer } from '@orama/tokenizers/mandarin';

// 创建搜索处理器，支持所有语言
// 注意：Orama 不支持 Chinese，但支持以下语言：
// arabic, armenian, bulgarian, czech, danish, dutch, english, finnish, french,
// german, greek, hungarian, indian, indonesian, irish, italian, lithuanian,
// nepali, norwegian, portuguese, romanian, russian, serbian, slovenian, spanish,
// swedish, tamil, turkish, ukrainian, sanskrit
export const { GET } = createFromSource(source, {
    language: 'english', // 使用英语作为默认语言（对中文也有基本支持）
});