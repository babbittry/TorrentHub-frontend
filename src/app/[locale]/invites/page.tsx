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
    const t = useTranslations('invitesPage');
    const t_common = useTranslations('common');
    const t_store = useTranslations('Store');
    const { refreshUser } = useAuth();
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [invitePrice, setInvitePrice] = useState<number | null>(null);

    const fetchInvites = useCallback(async () => {
        try {
            setIsLoading(true);
            const data = await invites.getInvites();
            setInvitesList(data);
        } catch (err) {
            setError((err as Error).message || t_common('error'));
        } finally {
            setIsLoading(false);
        }
    }, [t_common]);

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
            alert((err as Error).message || t_common('error'));
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
            <h1 className="text-3xl font-bold mb-6">{t('title')}</h1>

            <Card>
                <CardHeader>
                    <Button onClick={onOpen} color="primary">
                        {t('createNew')}
                    </Button>
                </CardHeader>
                <CardBody>
                    <Table aria-label="Invites list">
                        <TableHeader>
                            <TableColumn key="id">{t('tableId')}</TableColumn>
                            <TableColumn key="code">{t('tableCode')}</TableColumn>
                            <TableColumn key="createdAt">{t('tableCreatedAt')}</TableColumn>
                            <TableColumn key="expiresAt">{t('tableExpiresAt')}</TableColumn>
                            <TableColumn key="usedByUsername">{t('tableUsedBy')}</TableColumn>
                        </TableHeader>
                        <TableBody items={invitesList} isLoading={isLoading} emptyContent={t('noInvites')}>
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
                            <ModalHeader>{t_store('confirmPurchase')}</ModalHeader>
                            <ModalBody>
                                {invitePrice !== null ? (
                                    <p>{t_store('price')}: {invitePrice}</p>
                                ) : (
                                    <p>{t_common('loading')}</p>
                                )}
                            </ModalBody>
                            <ModalFooter>
                                <Button variant="light" onPress={onClose}>
                                    {t_store('cancel')}
                                </Button>
                                <Button color="primary" onPress={handlePurchaseConfirm} disabled={invitePrice === null}>
                                    {t_store('confirm')}
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
