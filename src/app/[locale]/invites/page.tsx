'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { invites, InviteDto } from '@/lib/api';
import { useTranslations } from 'next-intl';
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@heroui/table";
import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from '@heroui/card';

const InvitesPage = () => {
    const [invitesList, setInvitesList] = useState<InviteDto[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const t = useTranslations('invitesPage');
    const t_common = useTranslations('common');

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
    }, [fetchInvites]);

    const handleCreateInvite = async () => {
        try {
            await invites.createInvite();
            fetchInvites(); // Refresh the list
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
                    <Button onClick={handleCreateInvite} color="primary">
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
        </div>
    );
};

export default InvitesPage;
