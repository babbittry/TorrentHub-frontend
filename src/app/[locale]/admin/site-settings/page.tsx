"use client";
import React, { useEffect, useState } from 'react';
import { admin, SiteSettingsDto } from '../../../../lib/api';
import { Card, CardBody, CardHeader } from "@heroui/card";
import { CustomInput } from '../../components/CustomInputs';
import { Button } from "@heroui/button";
import { Switch } from '@heroui/react';
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
                <CardHeader>{t('siteSettings.configuration')}</CardHeader>
                <CardBody>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <CustomInput
                            label={t('siteSettings.siteNameLabel')}
                            name="siteName"
                            value={settings.siteName ?? ''}
                            onChange={handleInputChange}
                            fullWidth
                        />
                        <CustomInput
                            label={t('siteSettings.siteDescriptionLabel')}
                            name="siteDescription"
                            value={settings.siteDescription ?? ''}
                            onChange={handleInputChange}
                            fullWidth
                        />
                        <div className="flex items-center justify-between">
                            <label>{t('siteSettings.registrationOpenLabel')}</label>
                            <Switch
                                isSelected={settings.isRegistrationOpen}
                                onValueChange={(val) => handleSwitchChange('isRegistrationOpen', val)}
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <label>{t('siteSettings.inviteOnlyLabel')}</label>
                            <Switch
                                isSelected={settings.isInviteOnly}
                                onValueChange={(val) => handleSwitchChange('isInviteOnly', val)}
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <label>{t('siteSettings.maintenanceModeLabel')}</label>
                            <Switch
                                isSelected={settings.maintenanceMode}
                                onValueChange={(val) => handleSwitchChange('maintenanceMode', val)}
                            />
                        </div>
                        <div className="flex justify-end">
                            <Button type="submit" color="primary">{t('siteSettings.saveButton')}</Button>
                        </div>
                    </form>
                </CardBody>
            </Card>
        </div>
    );
};

export default SiteSettingsPage;
