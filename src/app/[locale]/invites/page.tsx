'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { invites, InviteDto, store, StoreActionType } from '@/lib/api';
import { useTranslations } from 'next-intl';
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@heroui/table";
import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from '@heroui/card';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from '@heroui/react';
import { useAuth } from '@/context/AuthContext';

const InvitesPage = () => {
    const [invitesList, setInvitesList] = useState<InviteDto[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [, setError] = useState<string | null>(null);
    const t = useTranslations();
    const { refreshUser } = useAuth();
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [invitePrice, setInvitePrice] = useState<number | null>(null);

    const fetchInvites = useCallback(async () => {
        try {
            setIsLoading(true);
            const data = await invites.getInvites();
            setInvitesList(data);
        } catch (err) {
            setError((err as Error).message || t('common.error'));
        } finally {
            setIsLoading(false);
        }
    }, [t]);

    useEffect(() => {
        fetchInvites();
        store.getItems().then(items => {
            const inviteItem = items.find(item => item.actionType === StoreActionType.PurchaseWithQuantity && item.nameKey.includes('inviteone'));
            if (inviteItem) {
                setInvitePrice(inviteItem.price);
            }
        });
    }, [fetchInvites]);

    const handlePurchaseConfirm = async () => {
        try {
            await invites.createInvite();
            await refreshUser();
            await fetchInvites(); // Refresh the list
            onOpenChange(); // Close modal
        } catch (err) {
            alert((err as Error).message || t('common.error'));
        }
    };

    const renderCell = useCallback((invite: InviteDto, columnKey: React.Key) => {
        const cellValue = invite[columnKey as keyof InviteDto];

        switch (columnKey) {
            case 'code':
                return invite.usedByUsername ? <s className="text-default-500">{invite.code}</s> : <span>{invite.code}</span>;
            case 'createdAt':
                return new Date(invite.createdAt).toLocaleString();
            case 'expiresAt':
                return new Date(invite.expiresAt).toLocaleString();
            case 'usedByUsername':
                return invite.usedByUsername || '-';
            default:
                return String(cellValue);
        }
    }, []);

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6">{t('invitesPage.title')}</h1>

            <Card>
                <CardHeader>
                    <Button onClick={onOpen} color="primary">
                        {t('invitesPage.createNew')}
                    </Button>
                </CardHeader>
                <CardBody>
                    <Table aria-label="Invites list">
                        <TableHeader>
                            <TableColumn key="id">{t('invitesPage.tableId')}</TableColumn>
                            <TableColumn key="code">{t('invitesPage.tableCode')}</TableColumn>
                            <TableColumn key="createdAt">{t('invitesPage.tableCreatedAt')}</TableColumn>
                            <TableColumn key="expiresAt">{t('invitesPage.tableExpiresAt')}</TableColumn>
                            <TableColumn key="usedByUsername">{t('invitesPage.tableUsedBy')}</TableColumn>
                        </TableHeader>
                        <TableBody items={invitesList} isLoading={isLoading} emptyContent={t('invitesPage.noInvites')}>
                            {(item) => (
                                <TableRow key={item.id}>
                                    {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardBody>
            </Card>

            <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader>{t('invitesPage.purchaseInvite')}</ModalHeader>
                            <ModalBody>
                                {invitePrice !== null ? (
                                    <p>{t('Store.price')}: {invitePrice}</p>
                                ) : (
                                    <p>{t('common.loading')}</p>
                                )}
                            </ModalBody>
                            <ModalFooter>
                                <Button variant="light" onPress={onClose}>
                                    {t('Store.cancel')}
                                </Button>
                                <Button color="primary" onPress={handlePurchaseConfirm} disabled={invitePrice === null}>
                                    {t('Store.confirm')}
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </div>
    );
};

export default InvitesPage;
