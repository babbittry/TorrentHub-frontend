'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { forum, ForumCategoryDto, CreateForumTopicDto, UserRole } from '@/lib/api';
import { useTranslations } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@heroui/button';
import { CustomInput, CustomTextarea } from '../../components/CustomInputs';
import { Select, SelectItem } from '@heroui/select';
import { Card, CardBody, CardHeader } from '@heroui/card';
import { useAuth } from '@/context/AuthContext';

const NewTopicPage = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user } = useAuth();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
    const [categories, setCategories] = useState<ForumCategoryDto[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isForbidden, setIsForbidden] = useState(false);
    const t = useTranslations('forumPage');
    const t_cat = useTranslations('forum_categories');

    const getCategoryName = useCallback((code: string) => {
        return t_cat(code);
    }, [t_cat]);

    const categoryIdFromQuery = useMemo(() => searchParams.get('categoryId'), [searchParams]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await forum.getCategories();
                setCategories(data);
                if (categoryIdFromQuery) {
                    setSelectedCategoryId(categoryIdFromQuery);
                }
            } catch (err) {
                console.error(err);
                setError(t('error_loading_categories'));
            }
        };
        fetchCategories();
    }, [categoryIdFromQuery, t]);

    useEffect(() => {
        if (!selectedCategoryId || categories.length === 0) {
            setIsForbidden(false);
            return;
        }

        const selectedCategory = categories.find(c => c.id.toString() === selectedCategoryId);

        if (selectedCategory && selectedCategory.code === 'Announcement') {
            if (!user || user.role !== UserRole.Administrator) {
                setIsForbidden(true);
                setError(t('error_permission_denied'));
            } else {
                setIsForbidden(false);
                setError(null);
            }
        } else {
            setIsForbidden(false);
            setError(null);
        }
    }, [selectedCategoryId, categories, user, t]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isForbidden) return;

        if (!title.trim() || !content.trim() || !selectedCategoryId) {
            setError(t('error_all_fields_required'));
            return;
        }
        setError(null);
        setIsSubmitting(true);

        try {
            const topicData: CreateForumTopicDto = {
                title,
                content,
                categoryId: Number(selectedCategoryId),
            };
            const newTopic = await forum.createTopic(topicData);
            router.push(`/forums/topics/${newTopic.id}`);
        } catch (err) {
            console.error(err);
            setError(t('error_creating_topic'));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="container mx-auto p-4 sm:p-6">
            <Card className="max-w-2xl mx-auto">
                <CardHeader>
                    <h1 className="text-2xl font-bold">{t('new_topic')}</h1>
                </CardHeader>
                <CardBody>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <Select
                            label={t('category')}
                            labelPlacement="outside"
                            placeholder={t('select_category')}
                            selectedKeys={selectedCategoryId ? [selectedCategoryId] : []}
                            onSelectionChange={(keys) => setSelectedCategoryId(Array.from(keys)[0] as string)}
                            isRequired
                            isDisabled={!!categoryIdFromQuery || isForbidden}
                        >
                            {categories.map((cat) => (
                                <SelectItem key={cat.id.toString()}>
                                    {getCategoryName(cat.code)}
                                </SelectItem>
                            ))}
                        </Select>
                        <CustomInput
                            label={t('topic_title')}
                            labelPlacement="outside"
                            placeholder={t('title_placeholder')}
                            value={title}
                            onValueChange={setTitle}
                            isRequired
                            maxLength={100}
                            isDisabled={isForbidden}
                            description={`${title.length} / 100`}
                        />
                        <CustomTextarea
                            label={t('content')}
                            labelPlacement="outside"
                            placeholder={t('content_placeholder')}
                            value={content}
                            onValueChange={setContent}
                            isRequired
                            maxLength={1000}
                            isDisabled={isForbidden}
                            description={`${content.length} / 1000`}
                        />
                        {error && <p className="text-danger text-sm">{error}</p>}
                        <div className="flex justify-end">
                            <Button type="submit" color="primary" isLoading={isSubmitting} isDisabled={isForbidden}>
                                {t('submit_topic')}
                            </Button>
                        </div>
                    </form>
                </CardBody>
            </Card>
        </div>
    );
};

export default NewTopicPage;
