"use client";
import React, { useEffect, useState } from 'react';
import { admin, BannedClientDto } from '../../../../lib/api';
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Table, TableHeader, TableBody, TableColumn, TableRow, TableCell } from "@heroui/table";
import { CustomInput } from '../../components/CustomInputs';
import { Button } from "@heroui/button";
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
                <CardHeader>{t('bannedClients.addNew')}</CardHeader>
                <CardBody>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <CustomInput
                            label={t('bannedClients.peerIdPrefixLabel')}
                            name="peer_id_prefix"
                            value={newClient.peer_id_prefix ?? ''}
                            onChange={handleInputChange}
                            fullWidth
                        />
                        <CustomInput
                            label={t('bannedClients.userAgentPatternLabel')}
                            name="user_agent_pattern"
                            value={newClient.user_agent_pattern ?? ''}
                            onChange={handleInputChange}
                            fullWidth
                        />
                        <CustomInput
                            label={t('bannedClients.reasonLabel')}
                            name="reason"
                            value={newClient.reason ?? ''}
                            onChange={handleInputChange}
                            fullWidth
                        />
                        <Button type="submit" color="primary">{t('bannedClients.addButton')}</Button>
                    </form>
                </CardBody>
            </Card>

            <Card>
                <CardHeader>{t('bannedClients.existing')}</CardHeader>
                <CardBody>
                    {loading ? (
                        <p>{t('bannedClients.loading')}</p>
                    ) : (
                        <Table aria-label={t('bannedClients.existing')}>
                            <TableHeader>
                                <TableColumn>{t('bannedClients.table.peerIdPrefix')}</TableColumn>
                                <TableColumn>{t('bannedClients.table.userAgentPattern')}</TableColumn>
                                <TableColumn>{t('bannedClients.table.reason')}</TableColumn>
                                <TableColumn>{t('bannedClients.table.actions')}</TableColumn>
                            </TableHeader>
                            <TableBody items={clients}>
                                {(item) => (
                                    <TableRow key={item.id}>
                                        <TableCell>{item.peer_id_prefix}</TableCell>
                                        <TableCell>{item.user_agent_pattern}</TableCell>
                                        <TableCell>{item.reason}</TableCell>
                                        <TableCell>
                                            <Button isIconOnly onClick={() => handleDelete(item.id)} color="danger" variant="light">
                                                <FontAwesomeIcon icon={faTrash} />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardBody>
            </Card>
        </div>
    );
};

export default BannedClientsPage;
