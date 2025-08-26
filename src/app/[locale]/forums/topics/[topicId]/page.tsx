'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { forum, ForumTopicDetailDto, CreateForumPostDto, ForumCategoryDto } from '@/lib/api';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Textarea } from "@heroui/input";
import { User } from "@heroui/user";
import { API_BASE_URL } from "@/lib/apiClient";
import { Breadcrumbs, BreadcrumbItem } from "@heroui/breadcrumbs";

const TopicDetailPage = () => {
    const params = useParams();
    const topicId = Number(params.topicId);
    const [topic, setTopic] = useState<ForumTopicDetailDto | null>(null);
    const [categories, setCategories] = useState<ForumCategoryDto[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [replyContent, setReplyContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const t = useTranslations('forumPage');
    const t_header = useTranslations('header');
    const t_cat = useTranslations('forum_categories');

    const getCategoryName = (code: string) => {
        return t_cat(code);
    };

    const fetchDetails = useCallback(async () => {
        if (!topicId) return;
        try {
            setIsLoading(true);
            const [topicData, categoriesData] = await Promise.all([
                forum.getTopicById(topicId),
                forum.getCategories()
            ]);
            setTopic(topicData);
            setCategories(categoriesData);
        } catch (err) {
            setError(t('error_loading_topic_details'));
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [topicId, t]);

    useEffect(() => {
        fetchDetails();
    }, [fetchDetails]);

    const categoryForBreadcrumb = useMemo(() => {
        if (!topic) return null;

        const foundCategory = categories.find(cat => cat.id === topic.categoryId);
        if (foundCategory) {
            return {
                id: foundCategory.id,
                name: getCategoryName(foundCategory.code)
            };
        }

        if (topic.categoryName) {
            return {
                id: topic.categoryId,
                name: topic.categoryName
            };
        }

        return null;
    }, [topic, categories, getCategoryName]);

    const handleReplySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!replyContent.trim()) return;

        setIsSubmitting(true);
        try {
            const postData: CreateForumPostDto = { content: replyContent };
            await forum.createPost(topicId, postData);
            setReplyContent('');
            const topicData = await forum.getTopicById(topicId);
            setTopic(topicData);
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
        return <p className="text-center text-danger p-8">{error}</p>;
    }

    if (!topic) {
        return <p className="text-center p-8">{t('topic_not_found')}</p>;
    }

    return (
        <div className="container mx-auto p-4 sm:p-6">
            <Breadcrumbs className="mb-4">
                <BreadcrumbItem href="/forums">{t_header('forums')}</BreadcrumbItem>
                {categoryForBreadcrumb && (
                    <BreadcrumbItem href={`/forums/category/${categoryForBreadcrumb.id}`}>
                        {categoryForBreadcrumb.name}
                    </BreadcrumbItem>
                )}
                <BreadcrumbItem>{topic.title}</BreadcrumbItem>
            </Breadcrumbs>

            <h1 className="text-3xl font-bold text-foreground mb-6">{topic.title}</h1>

            <div className="space-y-6">
                {topic.posts.map(post => (
                    <Card key={post.id}>
                        <CardHeader>
                            <User
                                name={post.authorName}
                                description={new Date(post.createdAt).toLocaleString()}
                                avatarProps={{
                                    src: post.authorAvatar ? `${API_BASE_URL}${post.authorAvatar}` : undefined
                                }}
                            />
                        </CardHeader>
                        <CardBody>
                            <div className="prose dark:prose-invert max-w-none text-foreground">
                                {post.content}
                            </div>
                        </CardBody>
                    </Card>
                ))}
            </div>

            {/* Reply Form */}
            <Card className="mt-8">
                <CardHeader>
                    <h2 className="text-xl font-bold">{t('post_a_reply')}</h2>
                </CardHeader>
                <CardBody>
                    <form onSubmit={handleReplySubmit} className="flex flex-col gap-4">
                        <Textarea
                            label={t('your_reply')}
                            labelPlacement="outside"
                            placeholder={t('write_your_reply')}
                            value={replyContent}
                            onValueChange={setReplyContent}
                            isRequired
                            maxLength={500}
                            description={`${replyContent.length} / 500`}
                        />
                        <div className="flex justify-end">
                            <Button type="submit" color="primary" isLoading={isSubmitting}>
                                {t('submit_reply')}
                            </Button>
                        </div>
                    </form>
                </CardBody>
            </Card>
        </div>
    );
};

export default TopicDetailPage;