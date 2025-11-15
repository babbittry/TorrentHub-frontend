'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { forum, comments, ForumTopicDetailDto, CreateCommentDto, ForumCategoryDto, CommentDto, COMMENT_TYPE } from '@/lib/api';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import UserDisplay from '@/app/[locale]/components/UserDisplay';
import ForumPostTree from '@/app/[locale]/components/ForumPostTree';
import ReplyEditor from '@/app/[locale]/components/ReplyEditor';
import { toast } from 'sonner';
import { Link } from '@/i18n/navigation';

const TopicDetailPage = () => {
    const params = useParams();
    const topicId = Number(params.topicId);
    const [topic, setTopic] = useState<ForumTopicDetailDto | null>(null);
    const [categories, setCategories] = useState<ForumCategoryDto[]>([]);
    const [posts, setPosts] = useState<CommentDto[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [hasMore, setHasMore] = useState<boolean>(true);
    const [loadingMore, setLoadingMore] = useState<boolean>(false);
    const [replyTarget, setReplyTarget] = useState<{ parentId: number; user: CommentDto['user'] } | null>(null);
    const t = useTranslations();

    const getCategoryName = useCallback((code: string) => {
        return t(`forum_categories.${code}`);
    }, [t]);

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
            
            // The posts are now fetched separately using the comments API
            const commentsResponse = await comments.getComments(COMMENT_TYPE.FORUM_TOPIC, topicId, 1, 30);
            setPosts(commentsResponse.items);
            setHasMore(commentsResponse.hasMore);
            setCurrentPage(1);
        } catch (err) {
            setError(t('forumPage.error_loading_topic_details'));
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
            return { id: foundCategory.id, name: getCategoryName(foundCategory.code) };
        }
        if (topic.categoryName) {
            return { id: topic.categoryId, name: topic.categoryName };
        }
        return null;
    }, [topic, categories, getCategoryName]);

    const handleLoadMore = async () => {
        if (loadingMore || !hasMore) return;
        
        setLoadingMore(true);
        try {
            const nextPage = currentPage + 1;
            const response = await comments.getComments(COMMENT_TYPE.FORUM_TOPIC, topicId, nextPage, 30);
            const newPosts = response.items || [];
            setPosts(prev => [...prev, ...newPosts]);
            setHasMore(response.hasMore);
            setCurrentPage(nextPage);
        } catch (err) {
            toast.error(t('forumPage.error_loading_topic_details'));
            console.error(err);
        } finally {
            setLoadingMore(false);
        }
    };

    const handleSubmitTopLevelPost = async (data: CreateCommentDto) => {
        try {
            const newPost = await comments.createComment(COMMENT_TYPE.FORUM_TOPIC, topicId, data);
            setPosts(prev => [...prev, newPost]);
            toast.success(t('forumPage.success_posting_reply'));
        } catch (err) {
            toast.error(t('forumPage.error_posting_reply'));
            throw err;
        }
    };

    const handleSubmitReply = async (data: CreateCommentDto) => {
        try {
            const newPost = await comments.createComment(COMMENT_TYPE.FORUM_TOPIC, topicId, data);
            setPosts(prev => [...prev, newPost]);
            setReplyTarget(null);
            toast.success(t('forumPage.success_posting_reply'));
        } catch (err) {
            toast.error(t('forumPage.error_posting_reply'));
            throw err;
        }
    };

    const handleDeletePost = async (postId: number) => {
        try {
            await comments.deleteComment(postId);
            setPosts(prev => prev.filter(p => p.id !== postId));
            toast.success(t('forumPage.success_deleting_post'));
        } catch (err) {
            toast.error(t('forumPage.error_deleting_post'));
            console.error(err);
        }
    };

    const handleReplyClick = (parentId: number, replyToUser: CommentDto['user']) => {
        setReplyTarget({ parentId, user: replyToUser });
    };

    if (isLoading) {
        return <p className="text-center p-8">{t('forumPage.loading_topic_details')}</p>;
    }

    if (error) {
        return <p className="text-center text-destructive p-8">{error}</p>;
    }

    if (!topic) {
        return <p className="text-center p-8">{t('forumPage.topic_not_found')}</p>;
    }

    return (
        <div className="container mx-auto p-4 sm:p-6">
            <Breadcrumb className="mb-4">
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                            <Link href="/forums">{t('header.forums')}</Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    {categoryForBreadcrumb && (
                        <>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbLink asChild>
                                    <Link href={`/forums/category/${categoryForBreadcrumb.id}`}>
                                        {categoryForBreadcrumb.name}
                                    </Link>
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                        </>
                    )}
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <span>{topic.title}</span>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <h1 className="text-3xl font-bold text-foreground mb-6">{topic.title}</h1>

            <Card className="mt-8">
                <CardContent className="p-4">
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
                                variant="outline"
                            >
                                {loadingMore ? t('reply.loading') : t('reply.load_more')}
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="mt-8">
                <h2 className="text-xl font-bold text-foreground mb-4">{t('forumPage.post_a_reply')}</h2>
                <ReplyEditor
                    onSubmit={handleSubmitTopLevelPost}
                    placeholder={t('forumPage.write_reply_placeholder')}
                />
            </div>
        </div>
    );
};

export default TopicDetailPage;