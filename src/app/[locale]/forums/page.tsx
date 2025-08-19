'use client';

import React, { useEffect, useState } from 'react';
import { forum, ForumCategoryDto } from '@/lib/api';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

const ForumHomePage = () => {
    const [categories, setCategories] = useState<ForumCategoryDto[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const t = useTranslations('forumPage');
    const t_cat = useTranslations('forum_categories');

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setIsLoading(true);
                const data = await forum.getCategories();
                setCategories(data);
            } catch (err) {
                setError(t('error_loading_categories'));
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchCategories();
    }, [t]);

    const getCategoryName = (code: string) => {
        return t_cat(code);
    };

    const getCategoryDescription = (code: string) => {
        return t_cat(`${code}_description`);
    };

    return (
        <div className="container mx-auto p-4 sm:p-6">
            <h1 className="text-4xl font-extrabold text-[var(--color-primary)] mb-8 text-center drop-shadow-lg">{t('title')}</h1>
            
            {isLoading ? (
                <p className="text-center">{t('loading_categories')}</p>
            ) : error ? (
                <p className="text-center text-red-500">{error}</p>
            ) : (
                <div className="space-y-4">
                    {categories.map(category => (
                        <Link key={category.id} href={`/forums/category/${category.id}`}>
                            <div className="card flex justify-between items-center hover:border-[var(--color-primary)] transition-colors duration-200">
                                <div>
                                    <h2 className="text-xl font-bold text-[var(--color-primary)]">{getCategoryName(category.code)}</h2>
                                    <p className="text-sm text-[var(--color-text-muted)] mt-1">{getCategoryDescription(category.code)}</p>
                                </div>
                                <div className="text-right text-sm text-[var(--color-text-muted)]">
                                    <p>{t('topics')}: {category.topicCount}</p>
                                    <p>{t('posts')}: {category.postCount}</p>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ForumHomePage;
