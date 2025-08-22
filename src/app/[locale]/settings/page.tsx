// src/app/[locale]/settings/page.tsx
'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { users } from '@/lib/api'; // Import users API
import type { ChangePasswordDto } from '@/lib/api'; // Import ChangePasswordDto

export default function SettingsPage() {
    const t = useTranslations('settingsPage');
    const [activeTab, setActiveTab] = useState('personal'); // 'personal' or 'security'

    const [selectedAvatarFile, setSelectedAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [avatarMessage, setAvatarMessage] = useState<string | null>(null);
    const [avatarMessageType, setAvatarMessageType] = useState<'success' | 'error' | null>(null);
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

    // State for Change Password
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

        // Placeholder for actual API call
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
            const passwordData: ChangePasswordDto = {
                currentPassword,
                newPassword,
            };
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

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6">{t('title')}</h1>

            <div className="flex border-b border-[var(--color-border)] mb-6">
                <button
                    className={`px-4 py-2 -mb-px border-b-2 ${activeTab === 'personal' ? 'border-[var(--color-primary)] text-[var(--color-primary)]' : 'border-transparent text-[var(--color-foreground-muted)] hover:text-[var(--color-primary)]'}`}
                    onClick={() => setActiveTab('personal')}
                >
                    {t('personal_settings')}
                </button>
                <button
                    className={`ml-4 px-4 py-2 -mb-px border-b-2 ${activeTab === 'security' ? 'border-[var(--color-primary)] text-[var(--color-primary)]' : 'border-transparent text-[var(--color-foreground-muted)] hover:text-[var(--color-primary)]'}`}
                    onClick={() => setActiveTab('security')}
                >
                    {t('security_settings')}
                </button>
            </div>

            {activeTab === 'personal' && (
                <div className="card p-6">
                    <h2 className="text-2xl font-semibold mb-4">{t('change_avatar_title')}</h2>
                    <p className="mb-4">{t('change_avatar_description')}</p>

                    <form onSubmit={handleChangeAvatar}>
                        <div className="mb-4">
                            <label htmlFor="avatarFile" className="block text-[var(--color-foreground)] text-lg font-semibold mb-3">
                                {t('select_avatar_file')}
                            </label>
                            <input
                                type="file"
                                id="avatarFile"
                                className="input-field"
                                accept="image/*"
                                onChange={handleFileChange}
                            />
                        </div>
                        {avatarPreview && (
                            <div className="mb-4">
                                <p className="text-sm text-[var(--color-foreground-muted)]">{t('preview')}:</p>
                                <img src={avatarPreview} alt="Avatar Preview" className="w-24 h-24 rounded-full object-cover mt-2" />
                            </div>
                        )}
                        {avatarMessage && <p className={`mb-4 ${avatarMessageType === 'success' ? 'text-green-500' : 'text-red-500'}`}>{avatarMessage}</p>}
                        <button
                            type="submit"
                            className="btn-primary px-6 py-3 font-bold"
                            disabled={!selectedAvatarFile || isUploadingAvatar}
                        >
                            {isUploadingAvatar ? t('uploading') : t('upload_avatar')}
                        </button>
                    </form>
                </div>
            )}

            {activeTab === 'security' && (
                <div className="card p-6">
                    <h2 className="text-2xl font-semibold mb-4">{t('change_password_title')}</h2>
                    <p className="mb-4">{t('change_password_description')}</p>

                    <form onSubmit={handleChangePassword}>
                        <div className="mb-4">
                            <label htmlFor="currentPassword" className="block text-[var(--color-foreground)] text-lg font-semibold mb-3">
                                {t('current_password')}
                            </label>
                            <input
                                type="password"
                                id="currentPassword"
                                className="input-field"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label htmlFor="newPassword" className="block text-[var(--color-foreground)] text-lg font-semibold mb-3">
                                {t('new_password')}
                            </label>
                            <input
                                type="password"
                                id="newPassword"
                                className="input-field"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label htmlFor="confirmNewPassword" className="block text-[var(--color-foreground)] text-lg font-semibold mb-3">
                                {t('confirm_new_password')}
                            </label>
                            <input
                                type="password"
                                id="confirmNewPassword"
                                className="input-field"
                                value={confirmNewPassword}
                                onChange={(e) => setConfirmNewPassword(e.target.value)}
                                required
                            />
                        </div>
                        {passwordMessage && <p className={`mb-4 ${passwordMessageType === 'success' ? 'text-green-500' : 'text-red-500'}`}>{passwordMessage}</p>}
                        <button
                            type="submit"
                            className="btn-primary px-6 py-3 font-bold"
                            disabled={isChangingPassword}
                        >
                            {isChangingPassword ? t('changing_password') : t('change_password_button')}
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}