'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { forum, CreateForumTopicDto, ForumCategoryDto } from '@/lib/api';
import { useTranslations } from 'next-intl';

const NewTopicPage = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const t = useTranslations('forumPage');
    const t_cat = useTranslations('forum_categories');

    const [categories, setCategories] = useState<ForumCategoryDto[]>([]);
    const [categoryId, setCategoryId] = useState(searchParams.get('categoryId') || '');
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        forum.getCategories().then(setCategories).catch(console.error);
    }, []);

    const getCategoryName = (code: string) => {
        return t_cat(code);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        if (!categoryId || !title.trim() || !content.trim()) {
            setError(t('error_all_fields_required'));
            setIsSubmitting(false);
            return;
        }

        const topicData: CreateForumTopicDto = {
            categoryId: Number(categoryId),
            title,
            content,
        };

        try {
            const newTopic = await forum.createTopic(topicData);
            router.push(`/forums/topics/${newTopic.id}`);
        } catch (err) {
            setError(t('error_creating_topic'));
            console.error(err);
            setIsSubmitting(false);
        }
    };

    return (
        <div className="container mx-auto p-4 sm:p-6">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-extrabold text-[var(--color-primary)] mb-8 text-center drop-shadow-lg">{t('new_topic')}</h1>
                <div className="card">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="category" className="block text-sm font-medium text-[var(--color-foreground)]">{t('category')}</label>
                            <select
                                id="category"
                                value={categoryId}
                                onChange={(e) => setCategoryId(e.target.value)}
                                className="input-field mt-1"
                                required
                            >
                                <option value="" disabled>{t('select_category')}</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{getCategoryName(cat.code)}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label htmlFor="title" className="block text-sm font-medium text-[var(--color-foreground)]">{t('topic_title')}</label>
                            <input
                                type="text"
                                id="title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="input-field mt-1"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="content" className="block text-sm font-medium text-[var(--color-foreground)]">{t('content')}</label>
                            <textarea
                                id="content"
                                rows={12}
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                className="input-field mt-1"
                                required
                            />
                        </div>

                        {error && <p className="text-red-500 text-sm">{error}</p>}

                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="btn-primary disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? t('submitting') : t('submit_topic')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default NewTopicPage;
