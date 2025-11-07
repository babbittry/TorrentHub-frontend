'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { users, API_BASE_URL } from '@/lib/api';
import type { ChangePasswordDto } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import CredentialManagement from './CredentialManagement';
import RssFeedManagement from './RssFeedManagement';

function TwoFactorAuthSettings() {
    const t = useTranslations('settingsPage');
    const { user, refreshUser } = useAuth();

    const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
    const [isDowngradeModalOpen, setIsDowngradeModalOpen] = useState(false);
    const [setupInfo, setSetupInfo] = useState<{ qrCodeImageUrl: string; manualEntryKey: string } | null>(null);
    const [verificationCode, setVerificationCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleUpgradeClick = async () => {
        setIsLoading(true);
        try {
            const data = await users.generate2faSetup();
            setSetupInfo(data);
            setIsUpgradeModalOpen(true);
        } catch (error) {
            toast.error(t('api_error'));
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyAndEnable = async () => {
        setIsLoading(true);
        try {
            await users.switchToApp({ code: verificationCode });
            await refreshUser();
            toast.success(t('upgrade_success'));
            setIsUpgradeModalOpen(false);
            setVerificationCode('');
        } catch (error) {
            toast.error(t('api_error'));
        } finally {
            setIsLoading(false);
        }
    };

    const handleConfirmDowngrade = async () => {
        setIsLoading(true);
        try {
            await users.switchToEmail({ code: verificationCode });
            await refreshUser();
            toast.success(t('downgrade_success'));
            setIsDowngradeModalOpen(false);
            setVerificationCode('');
        } catch (error) {
            toast.error(t('api_error'));
        } finally {
            setIsLoading(false);
        }
    };
    
    if (!user) {
        return <p>{t('common.loading')}</p>;
    }

    return (
        <Card className="mt-6">
            <CardHeader>
                <CardTitle>{t('two_factor_auth_title')}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-muted-foreground">{t('current_2fa_method')}</p>
                        <p className="font-semibold">
                            {user.twoFactorMethod === 'AuthenticatorApp' ? t('method_app') : t('method_email')}
                        </p>
                    </div>
                    {user.twoFactorMethod === 'AuthenticatorApp' ? (
                        <Button variant="outline" onClick={() => setIsDowngradeModalOpen(true)}>
                            {t('downgrade_to_email_button')}
                        </Button>
                    ) : (
                        <Button onClick={handleUpgradeClick} disabled={isLoading}>
                            {t('upgrade_to_app_button')}
                        </Button>
                    )}
                </div>
            </CardContent>

            {/* Upgrade Modal */}
            <Dialog open={isUpgradeModalOpen} onOpenChange={setIsUpgradeModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('upgrade_modal_title')}</DialogTitle>
                    </DialogHeader>
                    {setupInfo && (
                        <div className="space-y-4">
                            <p>{t('upgrade_modal_step1')}</p>
                            <div className="flex justify-center p-4 bg-white rounded-lg">
                                <img src={setupInfo.qrCodeImageUrl} alt="QR Code" width={200} height={200} />
                            </div>
                            <p>{t('upgrade_modal_step2')}</p>
                            <p className="font-mono bg-secondary p-2 rounded">{setupInfo.manualEntryKey}</p>
                            <p className="pt-4">{t('upgrade_modal_step3')}</p>
                            <FormField
                                label={t('verification_code')}
                                value={verificationCode}
                                onChange={(e) => setVerificationCode(e.target.value)}
                                maxLength={6}
                            />
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsUpgradeModalOpen(false)}>{t('common.cancel')}</Button>
                        <Button onClick={handleVerifyAndEnable} disabled={isLoading}>
                            {t('verify_and_enable')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Downgrade Modal */}
            <Dialog open={isDowngradeModalOpen} onOpenChange={setIsDowngradeModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('downgrade_modal_title')}</DialogTitle>
                    </DialogHeader>
                    <p>{t('downgrade_modal_prompt')}</p>
                    <FormField
                        label={t('verification_code')}
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        maxLength={6}
                    />
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsDowngradeModalOpen(false)}>{t('common.cancel')}</Button>
                        <Button variant="destructive" onClick={handleConfirmDowngrade} disabled={isLoading}>
                            {t('confirm_downgrade')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
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
            <Tabs defaultValue="personal">
                <TabsList>
                    <TabsTrigger value="personal">{t('personal_settings')}</TabsTrigger>
                    <TabsTrigger value="security">{t('security_settings')}</TabsTrigger>
                    <TabsTrigger value="credentials">{t('credentials_settings')}</TabsTrigger>
                    <TabsTrigger value="rss">{t('rss_settings')}</TabsTrigger>
                </TabsList>
                <TabsContent value="personal">
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('change_avatar_title')}</CardTitle>
                            <p className="text-sm text-muted-foreground">{t('change_avatar_description')}</p>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleChangeAvatar} className="space-y-4">
                                <Avatar className="w-24 h-24">
                                    <AvatarImage src={avatarPreview || currentUserAvatar || undefined} />
                                    <AvatarFallback>{user?.userName[0]}</AvatarFallback>
                                </Avatar>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    accept="image/*"
                                    className="hidden"
                                />
                                <Button type="button" onClick={() => fileInputRef.current?.click()}>
                                    {t('select_avatar_file')}
                                </Button>
                                {avatarMessage && <p className={avatarMessageType === 'success' ? 'text-green-600' : 'text-destructive'}>{avatarMessage}</p>}
                                <div className="flex justify-end">
                                    <Button
                                        type="submit"
                                        disabled={!selectedAvatarFile || isUploadingAvatar}
                                    >
                                        {t('upload_avatar')}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                     <Card className="mt-6">
                        <CardHeader>
                            <CardTitle>{t('change_title_title')}</CardTitle>
                            <p className="text-sm text-muted-foreground">{t('change_title_description')}</p>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleUpdateTitle} className="space-y-4">
                                <FormField
                                    label={t('custom_title')}
                                    value={userTitle}
                                    onChange={(e) => setUserTitle(e.target.value)}
                                    maxLength={50}
                                />
                                {titleMessage && <p className={titleMessageType === 'success' ? 'text-green-600' : 'text-destructive'}>{titleMessage}</p>}
                                <div className="flex justify-end">
                                    <Button
                                        type="submit"
                                        disabled={isUpdatingTitle}
                                    >
                                        {t('save_changes')}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="security">
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('change_password_title')}</CardTitle>
                            <p className="text-sm text-muted-foreground">{t('change_password_description')}</p>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleChangePassword} className="space-y-4">
                                <FormField
                                    label={t('current_password')}
                                    type="password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    required
                                />
                                <FormField
                                    label={t('new_password')}
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                />
                                <FormField
                                    label={t('confirm_new_password')}
                                    type="password"
                                    value={confirmNewPassword}
                                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                                    required
                                />
                                {passwordMessage && <p className={passwordMessageType === 'success' ? 'text-green-600' : 'text-destructive'}>{passwordMessage}</p>}
                                <div className="flex justify-end">
                                    <Button
                                        type="submit"
                                        disabled={isChangingPassword}
                                    >
                                        {t('change_password_button')}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                    <TwoFactorAuthSettings />
                </TabsContent>
                <TabsContent value="credentials">
                    <CredentialManagement />
                </TabsContent>
                <TabsContent value="rss">
                    <RssFeedManagement />
                </TabsContent>
            </Tabs>
        </div>
    );
}
