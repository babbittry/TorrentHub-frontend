'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { forum, ForumTopicDto, ForumCategoryDto } from '@/lib/api';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import UserDisplay from '@/app/[locale]/components/UserDisplay';

const CategoryPage = () => {
    const params = useParams();
    const categoryId = Number(params.categoryId);
    const [category, setCategory] = useState<ForumCategoryDto | null>(null);
    const [topics, setTopics] = useState<ForumTopicDto[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [pageSize] = useState(20);
    const [totalPages, setTotalPages] = useState(0);
    const t = useTranslations();

    const getCategoryName = useCallback((code: string) => {
        return t(`forum_categories.${code}`);
    }, [t]);

    const getCategoryDescription = useCallback((code: string) => {
        return t(`forum_categories.${code}_description`);
    }, [t]);

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
            setTopics(topicsData.items || []);
            setTotalPages(topicsData.totalPages || 0);
        } catch (err) {
            setError(t('forumPage.error_loading_topics'));
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
            <Breadcrumb className="mb-4">
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                            <Link href="/forums">{t('forumPage.title')}</Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <span>{category ? getCategoryName(category.code) : '...'}</span>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>
            
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-4xl font-extrabold text-primary">
                        {category ? getCategoryName(category.code) : t('forumPage.topics')}
                    </h1>
                    {category && <p className="text-lg text-muted-foreground mt-1">{getCategoryDescription(category.code)}</p>}
                </div>
                <Button asChild>
                    <Link href={`/forums/new-topic?categoryId=${categoryId}`}>{t('forumPage.new_topic')}</Link>
                </Button>
            </div>

            {isLoading ? (
                <p className="text-center">{t('forumPage.loading_topics')}</p>
            ) : error ? (
                <p className="text-center text-destructive">{error}</p>
            ) : topics.length === 0 ? (
                <p className="text-center">{t('forumPage.no_topics_found')}</p>
            ) : (
                <>
                    <div className="space-y-4">
                        {topics.map(topic => (
                            <Card key={topic.id} className="w-full hover:border-primary transition-colors">
                                <CardContent className="p-4">
                                    <div className="grid grid-cols-12 gap-4 items-center">
                                        <div className="col-span-8">
                                            <Link href={`/forums/topics/${topic.id}`} className="text-lg font-semibold text-foreground hover:text-primary transition-colors">
                                                {topic.title}
                                            </Link>
                                            <div className="text-sm text-muted-foreground flex items-center">{t('forumPage.by')} <UserDisplay user={topic.author} /></div>
                                        </div>
                                        <div className="col-span-2 text-center text-sm text-muted-foreground">
                                            <p>{t('forumPage.posts')}</p>
                                            <p className="font-bold text-foreground">{topic.postCount}</p>
                                        </div>
                                        <div className="col-span-2 text-right text-sm text-muted-foreground">
                                            {topic.lastPostTime && (
                                                <>
                                                    <p>{t('forumPage.last_reply')}</p>
                                                    <p className="font-semibold text-foreground">{new Date(topic.lastPostTime).toLocaleString()}</p>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                    {totalPages > 1 && (
                        <Card className="mt-6">
                            <CardFooter className="p-2">
                                <Pagination>
                                    <PaginationContent>
                                        <PaginationItem>
                                            <PaginationPrevious
                                                href="#"
                                                onClick={(e) => { e.preventDefault(); if (page > 1) setPage(p => p - 1); }}
                                                aria-disabled={page === 1}
                                                className={page === 1 ? "pointer-events-none opacity-50" : ""}
                                            />
                                        </PaginationItem>
                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                                            <PaginationItem key={p}>
                                                <PaginationLink href="#" onClick={(e) => { e.preventDefault(); setPage(p); }} isActive={page === p}>
                                                    {p}
                                                </PaginationLink>
                                            </PaginationItem>
                                        ))}
                                        <PaginationItem>
                                            <PaginationNext
                                                href="#"
                                                onClick={(e) => { e.preventDefault(); if (page < totalPages) setPage(p => p + 1); }}
                                                aria-disabled={page === totalPages}
                                                className={page === totalPages ? "pointer-events-none opacity-50" : ""}
                                            />
                                        </PaginationItem>
                                    </PaginationContent>
                                </Pagination>
                            </CardFooter>
                        </Card>
                    )}
                </>
            )}
        </div>
    );
};

export default CategoryPage;