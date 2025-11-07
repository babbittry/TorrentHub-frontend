"use client";
import React, { useEffect, useState } from 'react';
import { admin, BannedClientDto } from '../../../../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { useTranslations } from 'next-intl';

const BannedClientsPage = () => {
    const t = useTranslations('Admin');
    const [clients, setClients] = useState<BannedClientDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [newClient, setNewClient] = useState<Partial<BannedClientDto>>({});

    const fetchBannedClients = async () => {
        try {
            setLoading(true);
            const data = await admin.getBannedClients();
            setClients(data);
        } catch (error) {
            console.error("Failed to fetch banned clients:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBannedClients();
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setNewClient(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newClient.peer_id_prefix && !newClient.user_agent_pattern) {
            alert(t('bannedClients.alert.prefixOrPattern'));
            return;
        }
        try {
            await admin.addBannedClient(newClient as BannedClientDto);
            setNewClient({});
            fetchBannedClients();
        } catch (error) {
            console.error("Failed to add banned client:", error);
            alert(t('bannedClients.alert.addFailed'));
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm(t('bannedClients.alert.deleteConfirm'))) {
            try {
                await admin.deleteBannedClient(id);
                fetchBannedClients();
            } catch (error) {
                console.error('Failed to delete banned client:', error);
                alert(t('bannedClients.alert.deleteFailed'));
            }
        }
    };

    return (
        <div className="container mx-auto p-4 space-y-8">
            <h1 className="text-3xl font-bold mb-6">{t('bannedClients.title')}</h1>

            <Card>
                <CardHeader>
                    <CardTitle>{t('bannedClients.addNew')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="peer_id_prefix">{t('bannedClients.peerIdPrefixLabel')}</Label>
                            <Input
                                id="peer_id_prefix"
                                name="peer_id_prefix"
                                value={newClient.peer_id_prefix ?? ''}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="user_agent_pattern">{t('bannedClients.userAgentPatternLabel')}</Label>
                            <Input
                                id="user_agent_pattern"
                                name="user_agent_pattern"
                                value={newClient.user_agent_pattern ?? ''}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="reason">{t('bannedClients.reasonLabel')}</Label>
                            <Input
                                id="reason"
                                name="reason"
                                value={newClient.reason ?? ''}
                                onChange={handleInputChange}
                            />
                        </div>
                        <Button type="submit">{t('bannedClients.addButton')}</Button>
                    </form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>{t('bannedClients.existing')}</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <p>{t('bannedClients.loading')}</p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>{t('bannedClients.table.peerIdPrefix')}</TableHead>
                                    <TableHead>{t('bannedClients.table.userAgentPattern')}</TableHead>
                                    <TableHead>{t('bannedClients.table.reason')}</TableHead>
                                    <TableHead>{t('bannedClients.table.actions')}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {clients.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell>{item.peer_id_prefix}</TableCell>
                                        <TableCell>{item.user_agent_pattern}</TableCell>
                                        <TableCell>{item.reason}</TableCell>
                                        <TableCell>
                                            <Button size="icon" onClick={() => handleDelete(item.id)} variant="ghost">
                                                <FontAwesomeIcon icon={faTrash} className="text-red-600" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default BannedClientsPage;
