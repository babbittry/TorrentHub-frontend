// src/app/[locale]/settings/page.tsx
'use client';

import { useState, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { users } from '@/lib/api';
import type { ChangePasswordDto } from '@/lib/api';
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Tabs, Tab } from "@heroui/tabs";
import { Avatar } from "@heroui/avatar";

export default function SettingsPage() {
    const t = useTranslations('settingsPage');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [selectedAvatarFile, setSelectedAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [avatarMessage, setAvatarMessage] = useState<string | null>(null);
    const [avatarMessageType, setAvatarMessageType] = useState<'success' | 'error' | null>(null);
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
    const [passwordMessageType, setPasswordMessageType] = useState<'success' | 'error' | null>(null);
    const [isChangingPassword, setIsChangingPassword] = useState(false);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            setSelectedAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
            setAvatarMessage(null);
        } else {
            setSelectedAvatarFile(null);
            setAvatarPreview(null);
        }
    };

    const handleChangeAvatar = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedAvatarFile) {
            setAvatarMessage(t('no_file_selected'));
            setAvatarMessageType('error');
            return;
        }

        setIsUploadingAvatar(true);
        setAvatarMessage(null);

        console.log("Attempting to upload avatar file:", selectedAvatarFile.name);
        setAvatarMessage(t('avatar_upload_api_missing'));
        setAvatarMessageType('error');
        setIsUploadingAvatar(false);
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordMessage(null);

        if (newPassword !== confirmNewPassword) {
            setPasswordMessage(t('passwords_do_not_match'));
            setPasswordMessageType('error');
            return;
        }

        setIsChangingPassword(true);

        try {
            const passwordData: ChangePasswordDto = { currentPassword, newPassword };
            await users.changePassword(passwordData);
            setPasswordMessage(t('password_updated_success'));
            setPasswordMessageType('success');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmNewPassword('');
        } catch (err: unknown) {
            setPasswordMessage((err as Error).message || t('password_updated_error'));
            setPasswordMessageType('error');
        } finally {
            setIsChangingPassword(false);
        }
    };

    const inputClassNames = {
        inputWrapper: "bg-transparent border shadow-sm border-default-300/50 hover:border-default-400",
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6">{t('title')}</h1>
            <Tabs aria-label="Settings tabs">
                <Tab key="personal" title={t('personal_settings')}>
                    <Card>
                        <CardHeader className="flex flex-col items-start gap-1">
                            <h2 className="text-xl font-semibold">{t('change_avatar_title')}</h2>
                            <p className="text-sm text-default-500">{t('change_avatar_description')}</p>
                        </CardHeader>
                        <CardBody>
                            <form onSubmit={handleChangeAvatar} className="space-y-4">
                                <Avatar src={avatarPreview || undefined} className="w-24 h-24 text-large" />
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    accept="image/*"
                                    className="hidden"
                                />
                                <Button onPress={() => fileInputRef.current?.click()}>
                                    {t('select_avatar_file')}
                                </Button>
                                {avatarMessage && <p className={avatarMessageType === 'success' ? 'text-success' : 'text-danger'}>{avatarMessage}</p>}
                                <div className="flex justify-end">
                                    <Button
                                        type="submit"
                                        color="primary"
                                        isDisabled={!selectedAvatarFile}
                                        isLoading={isUploadingAvatar}
                                    >
                                        {t('upload_avatar')}
                                    </Button>
                                </div>
                            </form>
                        </CardBody>
                    </Card>
                </Tab>
                <Tab key="security" title={t('security_settings')}>
                    <Card>
                        <CardHeader className="flex flex-col items-start gap-1">
                            <h2 className="text-xl font-semibold">{t('change_password_title')}</h2>
                            <p className="text-sm text-default-500">{t('change_password_description')}</p>
                        </CardHeader>
                        <CardBody>
                            <form onSubmit={handleChangePassword} className="space-y-4">
                                <Input
                                    label={t('current_password')}
                                    type="password"
                                    value={currentPassword}
                                    onValueChange={setCurrentPassword}
                                    isRequired
                                    classNames={inputClassNames}
                                />
                                <Input
                                    label={t('new_password')}
                                    type="password"
                                    value={newPassword}
                                    onValueChange={setNewPassword}
                                    isRequired
                                    classNames={inputClassNames}
                                />
                                <Input
                                    label={t('confirm_new_password')}
                                    type="password"
                                    value={confirmNewPassword}
                                    onValueChange={setConfirmNewPassword}
                                    isRequired
                                    classNames={inputClassNames}
                                />
                                {passwordMessage && <p className={passwordMessageType === 'success' ? 'text-success' : 'text-danger'}>{passwordMessage}</p>}
                                <div className="flex justify-end">
                                    <Button
                                        type="submit"
                                        color="primary"
                                        isLoading={isChangingPassword}
                                    >
                                        {t('change_password_button')}
                                    </Button>
                                </div>
                            </form>
                        </CardBody>
                    </Card>
                </Tab>
            </Tabs>
        </div>
    );
}
