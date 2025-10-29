'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { credential } from '@/lib/api';
import type { CredentialDto } from '@/lib/api';
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@heroui/table";
import { Chip } from "@heroui/chip";
import { Modal, ModalHeader, ModalBody, ModalFooter, useDisclosure } from '@heroui/modal';
import { addToast } from '@heroui/toast';
import { Link } from '@/i18n/navigation';

export default function CredentialManagement() {
    const t = useTranslations('credentialManagement');
    const [credentials, setCredentials] = useState<CredentialDto[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [revokeTarget, setRevokeTarget] = useState<CredentialDto | null>(null);
    const { isOpen: isRevokeModalOpen, onOpen: onRevokeModalOpen, onClose: onRevokeModalClose } = useDisclosure();
    const { isOpen: isRevokeAllModalOpen, onOpen: onRevokeAllModalOpen, onClose: onRevokeAllModalClose } = useDisclosure();

    const loadCredentials = async () => {
        setIsLoading(true);
        try {
            const data = await credential.getMy(true); // 包含已撤销的凭证
            setCredentials(data);
        } catch (error) {
            addToast({ 
                title: t('load_error'), 
                description: (error as Error).message,
                color: 'danger' 
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadCredentials();
    }, []);

    const handleRevokeClick = (cred: CredentialDto) => {
        setRevokeTarget(cred);
        onRevokeModalOpen();
    };

    const handleConfirmRevoke = async () => {
        if (!revokeTarget) return;

        try {
            await credential.revoke(revokeTarget.credential);
            addToast({ 
                title: t('revoke_success'),
                color: 'success' 
            });
            await loadCredentials();
            onRevokeModalClose();
        } catch (error) {
            addToast({ 
                title: t('revoke_error'),
                description: (error as Error).message,
                color: 'danger' 
            });
        }
    };

    const handleRevokeAllClick = () => {
        onRevokeAllModalOpen();
    };

    const handleConfirmRevokeAll = async () => {
        try {
            // 撤销所有有效凭证
            const activeCredentials = credentials.filter(c => !c.isRevoked);
            await Promise.all(
                activeCredentials.map(c => credential.revoke(c.credential, t('revoke_all_reason')))
            );
            addToast({ 
                title: t('revoke_all_success'),
                color: 'success' 
            });
            await loadCredentials();
            onRevokeAllModalClose();
        } catch (error) {
            addToast({ 
                title: t('revoke_all_error'),
                description: (error as Error).message,
                color: 'danger' 
            });
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString();
    };

    const activeCount = credentials.filter(c => !c.isRevoked).length;

    return (
        <Card>
            <CardHeader className="flex flex-col items-start gap-2">
                <div className="flex justify-between items-center w-full">
                    <div>
                        <h2 className="text-xl font-semibold">{t('title')}</h2>
                        <p className="text-sm text-default-500 mt-1">{t('description')}</p>
                    </div>
                    <Button 
                        color="danger" 
                        variant="flat"
                        onPress={handleRevokeAllClick}
                        isDisabled={activeCount === 0}
                    >
                        {t('revoke_all_button')}
                    </Button>
                </div>
                <div className="flex gap-4 text-sm">
                    <span>{t('total_credentials', { count: credentials.length })}</span>
                    <span className="text-success">{t('active_credentials', { count: activeCount })}</span>
                    <span className="text-danger">{t('revoked_credentials', { count: credentials.length - activeCount })}</span>
                </div>
            </CardHeader>
            <CardBody>
                {isLoading ? (
                    <p className="text-center py-8">{t('loading')}</p>
                ) : credentials.length === 0 ? (
                    <p className="text-center py-8 text-default-500">{t('no_credentials')}</p>
                ) : (
                    <Table aria-label="Credentials table">
                        <TableHeader>
                            <TableColumn>{t('table.torrent_name')}</TableColumn>
                            <TableColumn>{t('table.created_at')}</TableColumn>
                            <TableColumn>{t('table.status')}</TableColumn>
                            <TableColumn>{t('table.actions')}</TableColumn>
                        </TableHeader>
                        <TableBody>
                            {credentials.map((cred) => (
                                <TableRow key={cred.id}>
                                    <TableCell>
                                        <Link 
                                            href={`/torrents/${cred.torrentId}`}
                                            className="text-primary hover:underline"
                                        >
                                            {cred.torrentName}
                                        </Link>
                                    </TableCell>
                                    <TableCell>{formatDate(cred.createdAt)}</TableCell>
                                    <TableCell>
                                        {cred.isRevoked ? (
                                            <Chip color="danger" size="sm">
                                                {t('status.revoked')} ({cred.revokedAt ? formatDate(cred.revokedAt) : ''})
                                            </Chip>
                                        ) : (
                                            <Chip color="success" size="sm">
                                                {t('status.active')}
                                            </Chip>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {!cred.isRevoked && (
                                            <Button
                                                size="sm"
                                                color="danger"
                                                variant="flat"
                                                onPress={() => handleRevokeClick(cred)}
                                            >
                                                {t('revoke_button')}
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </CardBody>

            {/* 单个撤销确认模态框 */}
            <Modal isOpen={isRevokeModalOpen} onClose={onRevokeModalClose}>
                <ModalHeader>{t('revoke_modal.title')}</ModalHeader>
                <ModalBody>
                    <p>{t('revoke_modal.description')}</p>
                    {revokeTarget && (
                        <p className="mt-2 font-semibold">{revokeTarget.torrentName}</p>
                    )}
                    <p className="mt-2 text-warning text-sm">{t('revoke_modal.warning')}</p>
                </ModalBody>
                <ModalFooter>
                    <Button variant="ghost" onPress={onRevokeModalClose}>
                        {t('revoke_modal.cancel')}
                    </Button>
                    <Button color="danger" onPress={handleConfirmRevoke}>
                        {t('revoke_modal.confirm')}
                    </Button>
                </ModalFooter>
            </Modal>

            {/* 批量撤销确认模态框 */}
            <Modal isOpen={isRevokeAllModalOpen} onClose={onRevokeAllModalClose}>
                <ModalHeader>{t('revoke_all_modal.title')}</ModalHeader>
                <ModalBody>
                    <p>{t('revoke_all_modal.description', { count: activeCount })}</p>
                    <p className="mt-2 text-danger text-sm font-semibold">{t('revoke_all_modal.warning')}</p>
                </ModalBody>
                <ModalFooter>
                    <Button variant="ghost" onPress={onRevokeAllModalClose}>
                        {t('revoke_all_modal.cancel')}
                    </Button>
                    <Button color="danger" onPress={handleConfirmRevokeAll}>
                        {t('revoke_all_modal.confirm')}
                    </Button>
                </ModalFooter>
            </Modal>
        </Card>
    );
}