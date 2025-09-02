'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { forum, ForumTopicDto, ForumCategoryDto } from '@/lib/api';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { Card, CardBody, CardFooter } from "@heroui/card";
import { Button } from "@heroui/button";
import { Breadcrumbs, BreadcrumbItem } from "@heroui/breadcrumbs";
import { Pagination } from "@heroui/pagination";

const CategoryPage = () => {
    const params = useParams();
    const categoryId = Number(params.categoryId);
    const [category, setCategory] = useState<ForumCategoryDto | null>(null);
    const [topics, setTopics] = useState<ForumTopicDto[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [pageSize] = useState(20);
    const [totalCount, setTotalCount] = useState(0);
    const t = useTranslations('forumPage');
    const t_cat = useTranslations('forum_categories');
    const t_header = useTranslations('header');

    const getCategoryName = (code: string) => {
        return t_cat(code);
    };

    const getCategoryDescription = (code: string) => {
        return t_cat(`${code}_description`);
    };

    const fetchTopics = useCallback(async () => {
        if (!categoryId) return;
        try {
            setIsLoading(true);
            const [categoriesData, topicsData] = await Promise.all([
                forum.getCategories(),
                forum.getTopics(categoryId, page, pageSize)
            ]);
            const currentCategory = categoriesData.find((c: ForumCategoryDto) => c.id === categoryId);
            setCategory(currentCategory || null);
            setTopics(topicsData.items);
            setTotalCount(topicsData.totalCount || 0);
        } catch (err) {
            setError(t('error_loading_topics'));
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [categoryId, page, pageSize, t]);

    useEffect(() => {
        fetchTopics();
    }, [fetchTopics]);

    return (
        <div className="container mx-auto p-4 sm:p-6">
            <Breadcrumbs className="mb-4">
                <BreadcrumbItem href="/forums">{t_header('forums')}</BreadcrumbItem>
                <BreadcrumbItem>{category ? getCategoryName(category.code) : '...'}</BreadcrumbItem>
            </Breadcrumbs>
            
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-4xl font-extrabold text-primary drop-shadow-lg">
                        {category ? getCategoryName(category.code) : t('topics')}
                    </h1>
                    {category && <p className="text-lg text-default-500 mt-1">{getCategoryDescription(category.code)}</p>}
                </div>
                <Button as={Link} href={`/forums/new-topic?categoryId=${categoryId}`} color="primary">
                    {t('new_topic')}
                </Button>
            </div>

            {isLoading ? (
                <p className="text-center">{t('loading_topics')}</p>
            ) : error ? (
                <p className="text-center text-danger">{error}</p>
            ) : topics.length === 0 ? (
                <p className="text-center">{t('no_topics_found')}</p>
            ) : (
                <>
                    <div className="space-y-4">
                        {topics.map(topic => (
                            <Card key={topic.id} isHoverable isPressable className="w-full">
                                <Link href={`/forums/topics/${topic.id}`} className="block w-full h-full">
                                    <CardBody>
                                        <div className="grid grid-cols-12 gap-4 items-center">
                                            <div className="col-span-8">
                                                <h3 className="text-lg font-semibold text-foreground">{topic.title}</h3>
                                                <p className="text-sm text-default-500">{t('by')} {topic.authorName}</p>
                                            </div>
                                            <div className="col-span-2 text-center text-sm text-default-500">
                                                <p>{t('posts')}</p>
                                                <p className="font-bold text-foreground">{topic.postCount}</p>
                                            </div>
                                            <div className="col-span-2 text-right text-sm text-default-500">
                                                {topic.lastPostTime && (
                                                    <>
                                                        <p>{t('last_reply')}</p>
                                                        <p className="font-semibold text-foreground">{new Date(topic.lastPostTime).toLocaleString()}</p>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </CardBody>
                                </Link>
                            </Card>
                        ))}
                    </div>
                    <Card>
                        <CardFooter>
                            <Pagination
                                total={Math.ceil(totalCount / pageSize)}
                                page={page}
                                onChange={(p) => setPage(p)}
                            />
                        </CardFooter>
                    </Card>
                </>
            )}
        </div>
    );
};

export default CategoryPage;