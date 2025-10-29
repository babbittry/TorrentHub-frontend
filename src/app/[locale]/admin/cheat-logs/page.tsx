'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { cheatLogs } from '@/lib/api';
import type { CheatLogDto, CheatLogFilters, CheatDetectionType } from '@/lib/api';
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Input } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@heroui/table";
import { Chip } from "@heroui/chip";
import { Pagination } from "@heroui/pagination";
import { Link } from '@/i18n/navigation';

export default function CheatLogsPage() {
    const t = useTranslations('cheatLogsPage');
    const [logs, setLogs] = useState<CheatLogDto[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    // 筛选和分页状态
    const [page, setPage] = useState(1);
    const [pageSize] = useState(20);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [userId, setUserId] = useState('');
    const [detectionType, setDetectionType] = useState<CheatDetectionType | ''>('');

    const loadLogs = async () => {
        setIsLoading(true);
        try {
            const filters: CheatLogFilters = {
                page,
                pageSize,
            };
            
            if (userId) {
                filters.userId = parseInt(userId);
            }
            if (detectionType) {
                filters.detectionType = detectionType as CheatDetectionType;
            }

            const result = await cheatLogs.getLogs(filters);
            setLogs(result.items);
            setTotalPages(result.totalPages);
            setTotalItems(result.totalItems);
        } catch (error) {
            console.error('Failed to load cheat logs:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadLogs();
    }, [page, userId, detectionType]);

    const handleSearch = () => {
        setPage(1); // 重置到第一页
        loadLogs();
    };

    const handleReset = () => {
        setUserId('');
        setDetectionType('');
        setPage(1);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString();
    };

    const getDetectionTypeColor = (type: CheatDetectionType) => {
        switch (type) {
            case 'AnnounceFrequency':
                return 'warning';
            case 'MultiLocation':
                return 'danger';
            default:
                return 'default';
        }
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6">{t('title')}</h1>
            
            <Card className="mb-6">
                <CardHeader>
                    <h2 className="text-xl font-semibold">{t('filters_title')}</h2>
                </CardHeader>
                <CardBody>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Input
                            label={t('user_id_label')}
                            placeholder={t('user_id_placeholder')}
                            value={userId}
                            onValueChange={setUserId}
                            type="number"
                        />
                        
                        <Select
                            label={t('detection_type_label')}
                            placeholder={t('detection_type_placeholder')}
                            selectedKeys={detectionType ? [detectionType] : []}
                            onChange={(e) => setDetectionType(e.target.value as CheatDetectionType | '')}
                        >
                            <SelectItem key="">{t('all_types')}</SelectItem>
                            <SelectItem key="AnnounceFrequency">{t('types.announce_frequency')}</SelectItem>
                            <SelectItem key="MultiLocation">{t('types.multi_location')}</SelectItem>
                        </Select>
                        
                        <div className="flex gap-2 items-end">
                            <button
                                onClick={handleSearch}
                                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors"
                            >
                                {t('search_button')}
                            </button>
                            <button
                                onClick={handleReset}
                                className="px-4 py-2 bg-default-200 text-default-700 rounded-lg hover:bg-default-300 transition-colors"
                            >
                                {t('reset_button')}
                            </button>
                        </div>
                    </div>
                </CardBody>
            </Card>

            <Card>
                <CardHeader className="flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-semibold">{t('logs_title')}</h2>
                        <p className="text-sm text-default-500 mt-1">
                            {t('total_logs', { count: totalItems })}
                        </p>
                    </div>
                </CardHeader>
                <CardBody>
                    {isLoading ? (
                        <p className="text-center py-8">{t('loading')}</p>
                    ) : logs.length === 0 ? (
                        <p className="text-center py-8 text-default-500">{t('no_logs')}</p>
                    ) : (
                        <>
                            <Table aria-label="Cheat logs table">
                                <TableHeader>
                                    <TableColumn>{t('table.user')}</TableColumn>
                                    <TableColumn>{t('table.torrent')}</TableColumn>
                                    <TableColumn>{t('table.detection_type')}</TableColumn>
                                    <TableColumn>{t('table.details')}</TableColumn>
                                    <TableColumn>{t('table.ip_address')}</TableColumn>
                                    <TableColumn>{t('table.detected_at')}</TableColumn>
                                </TableHeader>
                                <TableBody>
                                    {logs.map((log) => (
                                        <TableRow key={log.id}>
                                            <TableCell>
                                                <Link 
                                                    href={`/users/${log.userId}`}
                                                    className="text-primary hover:underline"
                                                >
                                                    {log.userName || `User #${log.userId}`}
                                                </Link>
                                            </TableCell>
                                            <TableCell>
                                                {log.torrentId && log.torrentName ? (
                                                    <Link 
                                                        href={`/torrents/${log.torrentId}`}
                                                        className="text-primary hover:underline"
                                                    >
                                                        {log.torrentName}
                                                    </Link>
                                                ) : (
                                                    <span className="text-default-400">N/A</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Chip 
                                                    color={getDetectionTypeColor(log.detectionType)} 
                                                    size="sm"
                                                >
                                                    {t(`types.${log.detectionType.toLowerCase()}`)}
                                                </Chip>
                                            </TableCell>
                                            <TableCell>
                                                <div className="max-w-md truncate" title={log.details}>
                                                    {log.details}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className="font-mono text-sm">{log.ipAddress}</span>
                                            </TableCell>
                                            <TableCell>{formatDate(log.detectedAt)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            
                            {totalPages > 1 && (
                                <div className="flex justify-center mt-6">
                                    <Pagination
                                        total={totalPages}
                                        page={page}
                                        onChange={setPage}
                                        showControls
                                    />
                                </div>
                            )}
                        </>
                    )}
                </CardBody>
            </Card>
        </div>
    );
}