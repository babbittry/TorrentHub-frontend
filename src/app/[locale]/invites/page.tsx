'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { invites, InviteDto, store, StoreActionType } from '@/lib/api';
import { useTranslations } from 'next-intl';
import { Table, TableHeader, TableBody, TableRow, TableCell, TableHead } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

const InvitesPage = () => {
    const [invitesList, setInvitesList] = useState<InviteDto[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const t = useTranslations();
    const { refreshUser } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [invitePrice, setInvitePrice] = useState<number | null>(null);

    const fetchInvites = useCallback(async () => {
        try {
            setIsLoading(true);
            const data = await invites.getInvites();
            setInvitesList(data);
        } catch (err) {
            toast.error((err as Error).message || t('common.error'));
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
            await fetchInvites();
            setIsModalOpen(false);
            toast.success(t('invitesPage.purchase_success'));
        } catch (err) {
            toast.error((err as Error).message || t('common.error'));
        }
    };

    return (
        <div className="container mx-auto p-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h1 className="text-3xl font-bold">{t('invitesPage.title')}</h1>
                <Button onClick={() => setIsModalOpen(true)}>
                    {t('invitesPage.createNew')}
                </Button>
            </div>
            <Card>
                <CardContent className='mt-6'>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>{t('invitesPage.tableId')}</TableHead>
                                <TableHead>{t('invitesPage.tableCode')}</TableHead>
                                <TableHead>{t('invitesPage.tableCreatedAt')}</TableHead>
                                <TableHead>{t('invitesPage.tableExpiresAt')}</TableHead>
                                <TableHead>{t('invitesPage.tableUsedBy')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center">{t('common.loading')}</TableCell>
                                </TableRow>
                            ) : invitesList.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center">{t('invitesPage.noInvites')}</TableCell>
                                </TableRow>
                            ) : (
                                invitesList.map((invite) => (
                                    <TableRow key={invite.id}>
                                        <TableCell>{invite.id}</TableCell>
                                        <TableCell>
                                            {invite.usedByUsername ? (
                                                <s className="text-muted-foreground">{invite.code}</s>
                                            ) : (
                                                <span>{invite.code}</span>
                                            )}
                                        </TableCell>
                                        <TableCell>{new Date(invite.createdAt).toLocaleString()}</TableCell>
                                        <TableCell>{new Date(invite.expiresAt).toLocaleString()}</TableCell>
                                        <TableCell>{invite.usedByUsername || '-'}</TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('invitesPage.purchaseInvite')}</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        {invitePrice !== null ? (
                            <p>{t('Store.price')}: {invitePrice}</p>
                        ) : (
                            <p>{t('common.loading')}</p>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
                            {t('Store.cancel')}
                        </Button>
                        <Button onClick={handlePurchaseConfirm} disabled={invitePrice === null}>
                            {t('Store.confirm')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default InvitesPage;
