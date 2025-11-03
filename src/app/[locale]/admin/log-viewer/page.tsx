"use client";
import React, { useEffect, useState } from 'react';
import { admin, SystemLogDto } from '../../../../lib/api';
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Table, TableHeader, TableBody, TableColumn, TableRow, TableCell } from "@heroui/table";
import { CustomInput } from '../../components/CustomInputs';
import { useTranslations } from 'next-intl';

const LogViewerPage = () => {
    const t = useTranslations('Admin');
    const [systemLogs, setSystemLogs] = useState<SystemLogDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [q, setQ] = useState('');
    const [level, setLevel] = useState('');

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                setLoading(true);
                const systemLogsData = await admin.getSystemLogs(q, level);
                setSystemLogs(systemLogsData);
            } catch (error) {
                console.error("Failed to fetch logs:", error);
            } finally {
                setLoading(false);
            }
        };

        const delayDebounceFn = setTimeout(() => {
            fetchLogs();
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [q, level]);

    return (
        <div className="container mx-auto p-4 space-y-8">
            <h1 className="text-3xl font-bold mb-6">{t('logViewer.systemLogsTab')}</h1>

            <Card>
                <CardHeader>
                    <div className="flex space-x-4">
                        <CustomInput
                            label={t('logViewer.searchLabel')}
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                        />
                        <CustomInput
                            label={t('logViewer.levelLabel')}
                            value={level}
                            onChange={(e) => setLevel(e.target.value)}
                        />
                    </div>
                </CardHeader>
                <CardBody>
                    {loading ? (
                        <p>{t('logViewer.loading')}</p>
                    ) : (
                        <Table aria-label={t('logViewer.systemLogsTab')}>
                            <TableHeader>
                                <TableColumn>{t('logViewer.systemLogs.table.level')}</TableColumn>
                                <TableColumn>{t('logViewer.systemLogs.table.timestamp')}</TableColumn>
                                <TableColumn>{t('logViewer.systemLogs.table.message')}</TableColumn>
                            </TableHeader>
                            <TableBody items={systemLogs}>
                                {(item) => (
                                    <TableRow key={item.id}>
                                        <TableCell>{item.level}</TableCell>
                                        <TableCell>{new Date(item.timestamp).toLocaleString()}</TableCell>
                                        <TableCell>{item.message}</TableCell>
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

export default LogViewerPage;
