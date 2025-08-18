'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { forum, ForumTopicDto } from '@/lib/api';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import ForumTopicListItem from '../../components/ForumTopicListItem';

const CategoryPage = () => {
    const params = useParams();
    const categoryId = Number(params.categoryId);
    const [topics, setTopics] = useState<ForumTopicDto[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const t = useTranslations('forumPage');

    const fetchTopics = useCallback(async () => {
        if (!categoryId) return;
        try {
            setIsLoading(true);
            const data = await forum.getTopics(categoryId);
            setTopics(data);
        } catch (err) {
            setError(t('error_loading_topics'));
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [categoryId, t]);

    useEffect(() => {
        fetchTopics();
    }, [fetchTopics]);

    // TODO: Fetch category details to display category title on the page

    return (
        <div className="container mx-auto p-4 sm:p-6">
            <div className="flex justify-between items-center mb-8">
                {/* TODO: Replace with actual category title */}
                <h1 className="text-4xl font-extrabold text-[var(--color-primary)] drop-shadow-lg">{t('topics')}</h1>
                <Link href={`/forum/new-topic?categoryId=${categoryId}`} className="btn-primary">
                    {t('new_topic')}
                </Link>
            </div>

            {isLoading ? (
                <p className="text-center">{t('loading_topics')}</p>
            ) : error ? (
                <p className="text-center text-red-500">{error}</p>
            ) : (
                <div className="card p-4">
                    {/* Header */}
                    <div className="hidden md:grid grid-cols-12 gap-4 items-center p-3 font-semibold text-[var(--color-text-muted)] border-b-2 border-[var(--color-border)]">
                        <div className="col-span-7">{t('topic_title')}</div>
                        <div className="col-span-2 text-center">{t('stats')}</div>
                        <div className="col-span-3 text-right">{t('last_reply')}</div>
                    </div>
                    {/* Topic List */}
                    <div>
                        {topics.length > 0 ? (
                            topics.map(topic => <ForumTopicListItem key={topic.id} topic={topic} />)
                        ) : (
                            <p className="text-center p-8 text-[var(--color-text-muted)]">{t('no_topics_found')}</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CategoryPage;
