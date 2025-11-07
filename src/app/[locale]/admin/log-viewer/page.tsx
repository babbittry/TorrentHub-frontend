"use client";
import React, { useEffect, useState } from 'react';
import { admin, SystemLogDto } from '../../../../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
                    <CardTitle>{t('logViewer.systemLogsTab')}</CardTitle>
                    <div className="flex space-x-4 mt-4">
                        <div className="space-y-2 flex-1">
                            <Label htmlFor="search">{t('logViewer.searchLabel')}</Label>
                            <Input
                                id="search"
                                value={q}
                                onChange={(e) => setQ(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2 flex-1">
                            <Label htmlFor="level">{t('logViewer.levelLabel')}</Label>
                            <Input
                                id="level"
                                value={level}
                                onChange={(e) => setLevel(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <p>{t('logViewer.loading')}</p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>{t('logViewer.systemLogs.table.level')}</TableHead>
                                    <TableHead>{t('logViewer.systemLogs.table.timestamp')}</TableHead>
                                    <TableHead>{t('logViewer.systemLogs.table.message')}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {systemLogs.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell>{item.level}</TableCell>
                                        <TableCell>{new Date(item.timestamp).toLocaleString()}</TableCell>
                                        <TableCell>{item.message}</TableCell>
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

export default LogViewerPage;
