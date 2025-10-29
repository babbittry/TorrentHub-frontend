'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { users, API_BASE_URL } from '@/lib/api';
import type { ChangePasswordDto } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Tabs, Tab } from "@heroui/tabs";
import { Avatar } from "@heroui/avatar";
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@heroui/modal';
import { Image } from '@heroui/image';
import { addToast } from '@heroui/toast';
import CredentialManagement from './CredentialManagement';
import RssFeedManagement from './RssFeedManagement';

function TwoFactorAuthSettings() {
    const t = useTranslations('settingsPage');
    const { user, refreshUser } = useAuth();

    const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
    const [isDowngradeModalOpen, setIsDowngradeModalOpen] = useState(false);
    const [setupInfo, setSetupInfo] = useState<{ qrCodeUri: string; manualEntryKey: string } | null>(null);
    const [verificationCode, setVerificationCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleUpgradeClick = async () => {
        setIsLoading(true);
        try {
            const data = await users.generate2faSetup();
            setSetupInfo(data);
            setIsUpgradeModalOpen(true);
        } catch (error) {
            addToast({ title: t('api_error'), color: 'danger' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyAndEnable = async () => {
        setIsLoading(true);
        try {
            await users.switchToApp({ code: verificationCode });
            await refreshUser();
            addToast({ title: t('upgrade_success'), color: 'success' });
            setIsUpgradeModalOpen(false);
            setVerificationCode('');
        } catch (error) {
            addToast({ title: t('api_error'), color: 'danger' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleConfirmDowngrade = async () => {
        setIsLoading(true);
        try {
            await users.switchToEmail({ code: verificationCode });
            await refreshUser();
            addToast({ title: t('downgrade_success'), color: 'success' });
            setIsDowngradeModalOpen(false);
            setVerificationCode('');
        } catch (error) {
            addToast({ title: t('api_error'), color: 'danger' });
        } finally {
            setIsLoading(false);
        }
    };
    
    if (!user) {
        return <p>{t('common.loading')}</p>;
    }

    return (
        <Card className="mt-6">
            <CardHeader className="flex flex-col items-start gap-1">
                <h2 className="text-xl font-semibold">{t('two_factor_auth_title')}</h2>
            </CardHeader>
            <CardBody>
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-default-500">{t('current_2fa_method')}</p>
                        <p className="font-semibold">
                            {user.twoFactorMethod === 'AuthenticatorApp' ? t('method_app') : t('method_email')}
                        </p>
                    </div>
                    {user.twoFactorMethod === 'AuthenticatorApp' ? (
                        <Button color="warning" onPress={() => setIsDowngradeModalOpen(true)}>
                            {t('downgrade_to_email_button')}
                        </Button>
                    ) : (
                        <Button color="primary" onPress={handleUpgradeClick} isLoading={isLoading}>
                            {t('upgrade_to_app_button')}
                        </Button>
                    )}
                </div>
            </CardBody>

            {/* Upgrade Modal */}
            <Modal isOpen={isUpgradeModalOpen} onOpenChange={setIsUpgradeModalOpen}>
                <ModalHeader>{t('upgrade_modal_title')}</ModalHeader>
                <ModalBody>
                    {setupInfo && (
                        <div className="space-y-4">
                            <p>{t('upgrade_modal_step1')}</p>
                            <div className="flex justify-center p-4 bg-white rounded-lg">
                                <Image src={setupInfo.qrCodeUri} alt="QR Code" width={200} height={200} />
                            </div>
                            <p>{t('upgrade_modal_step2')}</p>
                            <p className="font-mono bg-default-100 p-2 rounded">{setupInfo.manualEntryKey}</p>
                            <p className="pt-4">{t('upgrade_modal_step3')}</p>
                            <Input
                                label={t('verification_code')}
                                value={verificationCode}
                                onValueChange={setVerificationCode}
                                maxLength={6}
                            />
                        </div>
                    )}
                </ModalBody>
                <ModalFooter>
                    <Button variant="ghost" onPress={() => setIsUpgradeModalOpen(false)}>{t('common.cancel')}</Button>
                    <Button color="primary" onPress={handleVerifyAndEnable} isLoading={isLoading}>
                        {t('verify_and_enable')}
                    </Button>
                </ModalFooter>
            </Modal>

            {/* Downgrade Modal */}
            <Modal isOpen={isDowngradeModalOpen} onOpenChange={setIsDowngradeModalOpen}>
                <ModalHeader>{t('downgrade_modal_title')}</ModalHeader>
                <ModalBody>
                    <p>{t('downgrade_modal_prompt')}</p>
                    <Input
                        label={t('verification_code')}
                        value={verificationCode}
                        onValueChange={setVerificationCode}
                        maxLength={6}
                    />
                </ModalBody>
                <ModalFooter>
                    <Button variant="ghost" onPress={() => setIsDowngradeModalOpen(false)}>{t('common.cancel')}</Button>
                    <Button color="danger" onPress={handleConfirmDowngrade} isLoading={isLoading}>
                        {t('confirm_downgrade')}
                    </Button>
                </ModalFooter>
            </Modal>
        </Card>
    );
}


export default function SettingsPage() {
    const t = useTranslations('settingsPage');
    const { user, refreshUser } = useAuth();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [userTitle, setUserTitle] = useState('');
    const [isUpdatingTitle, setIsUpdatingTitle] = useState(false);
    const [titleMessage, setTitleMessage] = useState<string | null>(null);
    const [titleMessageType, setTitleMessageType] = useState<'success' | 'error' | null>(null);

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

    const currentUserAvatar = user?.avatar ? `${API_BASE_URL}${user.avatar}` : null;

    useEffect(() => {
        if (user?.userTitle) {
            setUserTitle(user.userTitle);
        }
    }, [user?.userTitle]);

    const handleUpdateTitle = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsUpdatingTitle(true);
        setTitleMessage(null);

        try {
            await users.updateUserTitle(userTitle);
            await refreshUser();
            setTitleMessage(t('title_updated_success'));
            setTitleMessageType('success');
        } catch (err: unknown) {
            setTitleMessage((err as Error).message || t('title_updated_error'));
            setTitleMessageType('error');
        } finally {
            setIsUpdatingTitle(false);
        }
    };

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
                                <Avatar src={avatarPreview || currentUserAvatar || undefined} className="w-24 h-24 text-large" />
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
                     <Card className="mt-6">
                        <CardHeader className="flex flex-col items-start gap-1">
                            <h2 className="text-xl font-semibold">{t('change_title_title')}</h2>
                            <p className="text-sm text-default-500">{t('change_title_description')}</p>
                        </CardHeader>
                        <CardBody>
                            <form onSubmit={handleUpdateTitle} className="space-y-4">
                                <Input
                                    label={t('custom_title')}
                                    value={userTitle}
                                    onValueChange={setUserTitle}
                                    maxLength={50}
                                    classNames={inputClassNames}
                                />
                                {titleMessage && <p className={titleMessageType === 'success' ? 'text-success' : 'text-danger'}>{titleMessage}</p>}
                                <div className="flex justify-end">
                                    <Button
                                        type="submit"
                                        color="primary"
                                        isLoading={isUpdatingTitle}
                                    >
                                        {t('save_changes')}
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
                    <TwoFactorAuthSettings />
                </Tab>
                <Tab key="credentials" title={t('credentials_settings')}>
                    <CredentialManagement />
                </Tab>
                <Tab key="rss" title={t('rss_settings')}>
                    <RssFeedManagement />
                </Tab>
            </Tabs>
        </div>
    );
}
