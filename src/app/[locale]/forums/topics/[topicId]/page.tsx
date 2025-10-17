'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { forum, ForumTopicDetailDto, CreateForumPostDto, ForumCategoryDto, ForumPostDto, CommentDto } from '@/lib/api';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { Card, CardBody, CardHeader, CardFooter } from "@heroui/card";
import { Button } from "@heroui/button";
import { Breadcrumbs, BreadcrumbItem } from "@heroui/breadcrumbs";
import UserDisplay from '@/app/[locale]/components/UserDisplay';
import ForumPostTree from '@/app/[locale]/components/ForumPostTree';
import ReplyEditor from '@/app/[locale]/components/ReplyEditor';

const TopicDetailPage = () => {
    const params = useParams();
    const topicId = Number(params.topicId);
    const [topic, setTopic] = useState<ForumTopicDetailDto | null>(null);
    const [categories, setCategories] = useState<ForumCategoryDto[]>([]);
    const [posts, setPosts] = useState<ForumPostDto[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [hasMore, setHasMore] = useState<boolean>(true);
    const [loadingMore, setLoadingMore] = useState<boolean>(false);
    const [replyTarget, setReplyTarget] = useState<{ parentId: number; user: ForumPostDto['author'] } | null>(null);
    const t = useTranslations('forumPage');
    const t_header = useTranslations('header');
    const t_cat = useTranslations('forum_categories');

    const getCategoryName = useCallback((code: string) => {
        return t_cat(code);
    }, [t_cat]);

    const fetchDetails = useCallback(async () => {
        if (!topicId) return;
        try {
            setIsLoading(true);
            const [topicData, categoriesData] = await Promise.all([
                forum.getTopicById(topicId, 1, 30),
                forum.getCategories()
            ]);
            setTopic(topicData);
            setCategories(categoriesData);
            
            // Extract posts from topic response
            const postsList = topicData.posts?.items || [];
            setPosts(postsList);
            setHasMore(topicData.posts.page < topicData.posts.totalPages);
            setCurrentPage(topicData.posts.page);
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

    const handleLoadMore = async () => {
        if (loadingMore || !hasMore) return;
        
        setLoadingMore(true);
        try {
            const nextPage = currentPage + 1;
            const response = await forum.getTopicPosts(topicId, nextPage, 30);
            const newPosts = response.items || [];
            setPosts(prev => [...prev, ...newPosts]);
            setHasMore(response.page < response.totalPages);
            setCurrentPage(response.page);
        } catch (err) {
            setError(t('error_loading_topic_details'));
            console.error(err);
        } finally {
            setLoadingMore(false);
        }
    };

    const handleSubmitTopLevelPost = async (data: { text: string; parentCommentId?: number | null; replyToUserId?: number | null }) => {
        try {
            const postData: CreateForumPostDto = {
                content: data.text,
                parentPostId: data.parentCommentId || undefined,
                replyToUserId: data.replyToUserId || undefined
            };
            const newPost = await forum.createPost(topicId, postData);
            setPosts(prev => [...prev, newPost]);
        } catch (err) {
            throw new Error(t('error_posting_reply'));
        }
    };

    const handleSubmitReply = async (data: { text: string; parentCommentId?: number | null; replyToUserId?: number | null }) => {
        try {
            const postData: CreateForumPostDto = {
                content: data.text,
                parentPostId: data.parentCommentId || undefined,
                replyToUserId: data.replyToUserId || undefined
            };
            const newPost = await forum.createPost(topicId, postData);
            setPosts(prev => [...prev, newPost]);
            setReplyTarget(null);
        } catch (err) {
            throw new Error(t('error_posting_reply'));
        }
    };

    const handleDeletePost = async (postId: number) => {
        try {
            await forum.deletePost(postId);
            setPosts(prev => prev.filter(p => p.id !== postId));
        } catch (err) {
            setError(t('error_loading_topic_details'));
            console.error(err);
        }
    };

    const handleReplyClick = (parentId: number, replyToUser: ForumPostDto['author']) => {
        setReplyTarget({ parentId, user: replyToUser });
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
            <Breadcrumbs className="mb-4 text-foreground">
                <BreadcrumbItem href="/forums">{t_header('forums')}</BreadcrumbItem>
                {categoryForBreadcrumb && (
                    <BreadcrumbItem href={`/forums/category/${categoryForBreadcrumb.id}`}>
                        {categoryForBreadcrumb.name}
                    </BreadcrumbItem>
                )}
                <BreadcrumbItem>{topic.title}</BreadcrumbItem>
            </Breadcrumbs>

            <h1 className="text-3xl font-bold text-foreground mb-6">{topic.title}</h1>

            <Card className="mt-8">
                <CardBody>
                    {replyTarget && (
                        <div className="mb-6 p-4 border border-gray-200 rounded-lg">
                            <ReplyEditor
                                onSubmit={handleSubmitReply}
                                onCancel={() => setReplyTarget(null)}
                                parentId={replyTarget.parentId}
                                replyToUser={replyTarget.user}
                            />
                        </div>
                    )}

                    <ForumPostTree
                        posts={posts}
                        onReply={handleReplyClick}
                        onDelete={handleDeletePost}
                        onSubmitReply={handleSubmitReply}
                    />
                    
                    {hasMore && (
                        <div className="mt-6 flex justify-center">
                            <Button
                                onClick={handleLoadMore}
                                disabled={loadingMore}
                                color="primary"
                                variant="flat"
                            >
                                {loadingMore ? t('loading') : t('load_more')}
                            </Button>
                        </div>
                    )}
                </CardBody>
            </Card>

            <Card className="mt-8">
                <CardHeader>
                    <h2 className="text-xl font-bold text-foreground">{t('post_a_reply')}</h2>
                </CardHeader>
                <CardBody>
                    <div className="mb-8">
                        <ReplyEditor
                            onSubmit={handleSubmitTopLevelPost}
                            onCancel={() => {}}
                        />
                    </div>
                </CardBody>
            </Card>
        </div>
    );
};

export default TopicDetailPage;