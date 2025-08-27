"use client";
import React, { useEffect, useState } from 'react';
import { admin, DuplicateIpUserDto } from '../../../../lib/api';
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Table, TableHeader, TableBody, TableColumn, TableRow, TableCell } from "@heroui/table";
import Link from 'next/link';
import { useTranslations } from 'next-intl';

const DuplicateIpsPage = () => {
    const t = useTranslations('Admin');
    const [duplicateIps, setDuplicateIps] = useState<DuplicateIpUserDto[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDuplicateIps = async () => {
            try {
                setLoading(true);
                const data = await admin.getDuplicateIps();
                setDuplicateIps(data);
            } catch (error) {
                console.error("Failed to fetch duplicate IPs:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDuplicateIps();
    }, []);

    return (
        <div className="container mx-auto p-4 space-y-8">
            <h1 className="text-3xl font-bold mb-6">{t('duplicateIps.title')}</h1>

            <Card>
                <CardHeader>{t('duplicateIps.cardTitle')}</CardHeader>
                <CardBody>
                    {loading ? (
                        <p>{t('duplicateIps.loading')}</p>
                    ) : (
                        <Table aria-label={t('duplicateIps.cardTitle')}>
                            <TableHeader>
                                <TableColumn>{t('duplicateIps.table.ipAddress')}</TableColumn>
                                <TableColumn>{t('duplicateIps.table.users')}</TableColumn>
                            </TableHeader>
                            <TableBody items={duplicateIps}>
                                {(item) => (
                                    <TableRow key={item.ip}>
                                        <TableCell>{item.ip}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                {item.users?.map(user => (
                                                    <Link key={user.id} href={`/users/${user.id}`} className="text-blue-500 hover:underline">
                                                        {user.userName}
                                                    </Link>
                                                ))}
                                            </div>
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

export default DuplicateIpsPage;
