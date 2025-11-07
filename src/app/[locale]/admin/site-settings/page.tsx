"use client";
import React, { useEffect, useState } from 'react';
import { admin, SiteSettingsDto } from '../../../../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from '@/components/ui/switch';
import { useTranslations } from 'next-intl';

const SiteSettingsPage = () => {
    const t = useTranslations('Admin');
    const [settings, setSettings] = useState<SiteSettingsDto | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                setLoading(true);
                const data = await admin.getSiteSettings();
                setSettings(data);
            } catch (error) {
                console.error("Failed to fetch site settings:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setSettings(prev => prev ? { ...prev, [name]: value } : null);
    };

    const handleSwitchChange = (name: string, value: boolean) => {
        setSettings(prev => prev ? { ...prev, [name]: value } : null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!settings) return;
        try {
            await admin.updateSiteSettings(settings);
            alert(t('siteSettings.alert.updateSuccess'));
        } catch (error) {
            console.error("Failed to update site settings:", error);
            alert(t('siteSettings.alert.updateFailed'));
        }
    };

    if (loading) {
        return <div className="container mx-auto p-4">{t('siteSettings.loading')}</div>;
    }

    if (!settings) {
        return <div className="container mx-auto p-4">{t('siteSettings.loadFailed')}</div>;
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6">{t('siteSettings.title')}</h1>
            <Card>
                <CardHeader>
                    <CardTitle>{t('siteSettings.configuration')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="siteName">{t('siteSettings.siteNameLabel')}</Label>
                            <Input
                                id="siteName"
                                name="siteName"
                                value={settings.siteName ?? ''}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="siteDescription">{t('siteSettings.siteDescriptionLabel')}</Label>
                            <Input
                                id="siteDescription"
                                name="siteDescription"
                                value={settings.siteDescription ?? ''}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <Label htmlFor="isRegistrationOpen">{t('siteSettings.registrationOpenLabel')}</Label>
                            <Switch
                                id="isRegistrationOpen"
                                checked={settings.isRegistrationOpen}
                                onCheckedChange={(val) => handleSwitchChange('isRegistrationOpen', val)}
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <Label htmlFor="isInviteOnly">{t('siteSettings.inviteOnlyLabel')}</Label>
                            <Switch
                                id="isInviteOnly"
                                checked={settings.isInviteOnly}
                                onCheckedChange={(val) => handleSwitchChange('isInviteOnly', val)}
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <Label htmlFor="maintenanceMode">{t('siteSettings.maintenanceModeLabel')}</Label>
                            <Switch
                                id="maintenanceMode"
                                checked={settings.maintenanceMode}
                                onCheckedChange={(val) => handleSwitchChange('maintenanceMode', val)}
                            />
                        </div>
                        <div className="flex justify-end">
                            <Button type="submit">{t('siteSettings.saveButton')}</Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default SiteSettingsPage;
