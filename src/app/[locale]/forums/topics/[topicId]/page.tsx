'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { forum, ForumTopicDetailDto, CreateForumPostDto } from '@/lib/api';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import ForumPost from '../../components/ForumPost';

const TopicDetailPage = () => {
    const params = useParams();
    const topicId = Number(params.topicId);
    const [topic, setTopic] = useState<ForumTopicDetailDto | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [replyContent, setReplyContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const t = useTranslations('forumPage');

    const fetchTopicDetails = useCallback(async () => {
        if (!topicId) return;
        try {
            // Set loading to true only on initial fetch
            if (!topic) setIsLoading(true);
            const data = await forum.getTopicById(topicId);
            setTopic(data);
        } catch (err) {
            setError(t('error_loading_topic_details'));
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [topicId, t]);

    useEffect(() => {
        fetchTopicDetails();
    }, [fetchTopicDetails]);

    const handleReplySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!replyContent.trim()) return;

        setIsSubmitting(true);
        try {
            const postData: CreateForumPostDto = { content: replyContent };
            await forum.createPost(topicId, postData);
            setReplyContent('');
            // Refresh topic details to show the new post
            await fetchTopicDetails();
        } catch (err) {
            alert(t('error_posting_reply'));
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return <p className="text-center p-8">{t('loading_topic_details')}</p>;
    }

    if (error) {
        return <p className="text-center text-red-500 p-8">{error}</p>;
    }

    if (!topic) {
        return <p className="text-center p-8">{t('topic_not_found')}</p>;
    }

    return (
        <div className="container mx-auto p-4 sm:p-6">
            <h1 className="text-3xl font-bold text-[var(--color-foreground)] mb-2">{topic.title}</h1>
            <p className="text-sm text-[var(--color-text-muted)] mb-6">
                <Link href={`/forums/category/${topic.categoryId}`}>{t('back_to_category', { category: topic.categoryName || '' })}</Link>
            </p>

            <div className="card p-0">
                {topic.posts.map(post => (
                    <ForumPost key={post.id} post={post} />
                ))}
            </div>

            {/* Reply Form */}
            <div className="card mt-8">
                <h2 className="text-xl font-bold mb-4">{t('post_a_reply')}</h2>
                <form onSubmit={handleReplySubmit}>
                    <textarea
                        rows={8}
                        className="input-field"
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        placeholder={t('write_your_reply')}
                        required
                    />
                    <div className="flex justify-end mt-4">
                        <button type="submit" className="btn-primary" disabled={isSubmitting}>
                            {isSubmitting ? t('submitting_reply') : t('submit_reply')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TopicDetailPage;
