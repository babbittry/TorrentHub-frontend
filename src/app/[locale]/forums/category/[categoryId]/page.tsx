'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { forum, ForumTopicDto, ForumCategoryDto } from '@/lib/api';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@heroui/table";
import { Button } from "@heroui/button";
import { Breadcrumbs, BreadcrumbItem } from "@heroui/breadcrumbs";

const CategoryPage = () => {
    const params = useParams();
    const categoryId = Number(params.categoryId);
    const [category, setCategory] = useState<ForumCategoryDto | null>(null);
    const [topics, setTopics] = useState<ForumTopicDto[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
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
                forum.getTopics(categoryId)
            ]);
            const currentCategory = categoriesData.find(c => c.id === categoryId);
            setCategory(currentCategory || null);
            setTopics(topicsData);
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

    const renderCell = useCallback((topic: ForumTopicDto, columnKey: React.Key) => {
        switch (columnKey) {
            case "title":
                return (
                    <Link href={`/forums/topics/${topic.id}`}>
                        <p className="font-semibold text-md text-foreground hover:text-primary transition-colors">
                            {topic.title}
                        </p>
                        <p className="text-sm text-default-500">
                            {t('by')} {topic.authorName}
                        </p>
                    </Link>
                );
            case "stats":
                return (
                    <div className="text-center">
                        <p>{t('posts')}: {topic.postCount}</p>
                    </div>
                );
            case "last_reply":
                return (
                    <div className="text-right">
                        {topic.lastPostTime && (
                            <p>{new Date(topic.lastPostTime).toLocaleString()}</p>
                        )}
                    </div>
                );
            default:
                return null;
        }
    }, [t]);

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

            <Table aria-label="Topics list">
                <TableHeader>
                    <TableColumn key="title">{t('topic_title')}</TableColumn>
                    <TableColumn key="stats" align="center">{t('stats')}</TableColumn>
                    <TableColumn key="last_reply" align="end">{t('last_reply')}</TableColumn>
                </TableHeader>
                <TableBody items={topics} isLoading={isLoading} emptyContent={t('no_topics_found')}>
                    {(item) => (
                        <TableRow key={item.id}>
                            {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
};

export default CategoryPage;