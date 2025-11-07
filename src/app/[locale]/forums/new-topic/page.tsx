'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { forum, ForumCategoryDto, CreateForumTopicDto, UserRole } from '@/lib/api';
import { useTranslations } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import RichEditor from '../../components/RichEditor';
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';

const NewTopicPage = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user } = useAuth();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
    const [categories, setCategories] = useState<ForumCategoryDto[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isForbidden, setIsForbidden] = useState(false);
    const t = useTranslations();

    const getCategoryName = useCallback((code: string) => {
        return t(`forum_categories.${code}`);
    }, [t]);

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
                toast.error(t('forumPage.error_loading_categories'));
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
                toast.error(t('forumPage.error_permission_denied'));
            } else {
                setIsForbidden(false);
            }
        } else {
            setIsForbidden(false);
        }
    }, [selectedCategoryId, categories, user, t]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isForbidden) return;

        if (!title.trim() || !content.trim() || !selectedCategoryId) {
            toast.error(t('forumPage.error_all_fields_required'));
            return;
        }
        setIsSubmitting(true);

        try {
            const topicData: CreateForumTopicDto = {
                title,
                content,
                categoryId: Number(selectedCategoryId),
            };
            const newTopic = await forum.createTopic(topicData);
            toast.success(t('forumPage.success_creating_topic'));
            router.push(`/forums/topics/${newTopic.id}`);
        } catch (err) {
            console.error(err);
            toast.error(t('forumPage.error_creating_topic'));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="container mx-auto p-4 sm:p-6">
            <Card className="max-w-2xl mx-auto">
                <CardHeader>
                    <CardTitle className="text-2xl">{t('forumPage.new_topic')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label>{t('forumPage.category')}</Label>
                            <Select
                                value={selectedCategoryId}
                                onValueChange={setSelectedCategoryId}
                                required
                                disabled={!!categoryIdFromQuery || isForbidden}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={t('forumPage.select_category')} />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map((cat) => (
                                        <SelectItem key={cat.id.toString()} value={cat.id.toString()}>
                                            {getCategoryName(cat.code)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <FormField
                            label={t('forumPage.topic_title')}
                            placeholder={t('forumPage.title_placeholder')}
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            maxLength={100}
                            disabled={isForbidden}
                        />
                        <p className="text-sm text-muted-foreground text-right">{`${title.length} / 100`}</p>
                        
                        <RichEditor
                            value={content}
                            onChange={setContent}
                            label={t('forumPage.content')}
                            placeholder={t('forumPage.content_placeholder')}
                            isRequired
                            maxLength={10000}
                            isDisabled={isForbidden}
                            height={400}
                        />
                        
                        <div className="flex justify-end">
                            <Button type="submit" disabled={isSubmitting || isForbidden}>
                                {isSubmitting ? t('common.loading') : t('forumPage.submit_topic')}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default NewTopicPage;
