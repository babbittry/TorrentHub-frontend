'use client';

import React, { useEffect, useState } from 'react';
import { forum, ForumCategoryDto } from '@/lib/api';
import { usePublicSettings } from '@/context/PublicSettingsContext';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBullhorn, faComments, faVial, faPills, faFaucet, faQuestionCircle, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { normalizeForumCategoryCode } from '@/lib/utils';

const categoryIcons: { [key: string]: IconDefinition } = {
    'Announcement': faBullhorn,
    'General': faComments,
    'Feedback': faVial,
    'Invite': faPills,
    'Watering': faFaucet,
};

const getCategoryIcon = (categoryCode: string | number | undefined | null) => {
    const normalizedCode = normalizeForumCategoryCode(categoryCode);
    return categoryIcons[normalizedCode] || faQuestionCircle;
};

const ForumHomePage = () => {
    const { publicSettings, isLoading: settingsLoading } = usePublicSettings();
    const [categories, setCategories] = useState<ForumCategoryDto[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const t = useTranslations();

    useEffect(() => {
        const fetchCategories = async () => {
            // 等待配置加载完成
            if (settingsLoading) {
                return;
            }

            // 如果论坛功能被禁用，不需要加载分类数据
            if (publicSettings && !publicSettings.isForumEnabled) {
                setIsLoading(false);
                return;
            }

            try {
                setIsLoading(true);
                const data = await forum.getCategories();
                setCategories(data);
            } catch (err) {
                setError(t('forumPage.error_loading_categories'));
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchCategories();
    }, [t, settingsLoading, publicSettings]);

    const getCategoryName = (code: string | number | undefined | null) => {
        const normalizedCode = normalizeForumCategoryCode(code);
        return t(`forum_categories.${normalizedCode}`);
    };

    const getCategoryDescription = (code: string | number | undefined | null) => {
        const normalizedCode = normalizeForumCategoryCode(code);
        return t(`forum_categories.${normalizedCode}_description`);
    };

    // 检查论坛功能是否启用
    if (!settingsLoading && publicSettings && !publicSettings.isForumEnabled) {
        return (
            <div className="container mx-auto py-8 max-w-2xl">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl text-center">{t('feature.forum_disabled')}</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center space-y-4">
                        <p className="text-muted-foreground">{t('feature.forum_disabled_desc')}</p>
                        {publicSettings.contactEmail && (
                            <p className="text-sm text-muted-foreground">
                                {t('feature.contact_admin')}: {publicSettings.contactEmail}
                            </p>
                        )}
                        <Button asChild>
                            <Link href="/">{t('feature.back_to_home')}</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-4 sm:py-6">
            <h1 className="text-4xl font-extrabold text-primary mb-8 text-center drop-shadow-lg">{t('forumPage.title')}</h1>

            {isLoading ? (
                <p className="text-center">{t('forumPage.loading_categories')}</p>
            ) : error ? (
                <p className="text-center text-destructive">{error}</p>
            ) : (
                <div className="space-y-4">
                    {categories.map(category => (
                        <Link key={category.id} href={`/forums/category/${category.id}`} className="block">
                            <Card className="w-full hover:shadow-lg transition-shadow cursor-pointer">
                                <CardContent className="pt-6">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-4">
                                            <FontAwesomeIcon icon={getCategoryIcon(category.code)} className="text-2xl text-primary" />
                                            <div>
                                                <h2 className="text-xl font-bold text-primary">{getCategoryName(category.code)}</h2>
                                                <p className="text-sm text-muted-foreground mt-1">{getCategoryDescription(category.code)}</p>
                                            </div>
                                        </div>
                                        <div className="text-right text-sm text-muted-foreground space-y-1">
                                            <div className="flex items-center justify-end gap-2">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" /></svg>
                                                <span>{t('forumPage.topics')}: {category.topicCount}</span>
                                            </div>
                                            <div className="flex items-center justify-end gap-2">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                                                <span>{t('forumPage.posts')}: {category.postCount}</span>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ForumHomePage;