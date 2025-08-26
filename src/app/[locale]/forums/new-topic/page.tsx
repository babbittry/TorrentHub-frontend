'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { forum, CreateForumTopicDto, ForumCategoryDto } from '@/lib/api';
import { useTranslations } from 'next-intl';
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Select, SelectItem } from "@heroui/select";
import { Input } from "@heroui/input";
import { Textarea } from "@heroui/input";
import { Button } from "@heroui/button";
import { Breadcrumbs, BreadcrumbItem } from "@heroui/breadcrumbs";

const NewTopicPage = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const t = useTranslations('forumPage');
    const t_cat = useTranslations('forum_categories');
    const t_header = useTranslations('header');

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

    const currentCategory = useMemo(() => {
        return categories.find(cat => cat.id.toString() === categoryId);
    }, [categories, categoryId]);

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
                <Breadcrumbs className="mb-4">
                    <BreadcrumbItem href="/forums">{t_header('forums')}</BreadcrumbItem>
                    {currentCategory && (
                        <BreadcrumbItem href={`/forums/category/${currentCategory.id}`}>
                            {getCategoryName(currentCategory.code)}
                        </BreadcrumbItem>
                    )}
                    <BreadcrumbItem>{t('new_topic')}</BreadcrumbItem>
                </Breadcrumbs>

                <Card>
                    <CardHeader>
                        <h1 className="text-2xl font-bold">{t('new_topic')}</h1>
                    </CardHeader>
                    <CardBody>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <Select
                                isRequired
                                label={t('category')}
                                placeholder={t('select_category')}
                                selectedKeys={categoryId ? [categoryId] : []}
                                onChange={(e) => setCategoryId(e.target.value)}
                            >
                                {categories.map(cat => (
                                    <SelectItem key={cat.id}>
                                        {getCategoryName(cat.code)}
                                    </SelectItem>
                                ))}
                            </Select>

                            <Input
                                isRequired
                                label={t('topic_title')}
                                value={title}
                                onValueChange={setTitle}
                            />

                            <Textarea
                                isRequired
                                label={t('content')}
                                value={content}
                                onValueChange={setContent}
                                minRows={10}
                                maxLength={1000}
                                description={`${content.length} / 1000`}
                            />

                            {error && <p className="text-danger text-sm">{error}</p>}

                            <div className="flex justify-end">
                                <Button type="submit" color="primary" isLoading={isSubmitting}>
                                    {t('submit_topic')}
                                </Button>
                            </div>
                        </form>
                    </CardBody>
                </Card>
            </div>
        </div>
    );
};

export default NewTopicPage;
