'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { cheatLogs, CheatDetectionType, CheatSeverity } from '@/lib/api';
import type { CheatLogDto, CheatLogFilters } from '@/lib/api';
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Input } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@heroui/table";
import { Chip } from "@heroui/chip";
import { Pagination } from "@heroui/pagination";
import { Link } from '@/i18n/navigation';
import { Button } from '@heroui/button';
import { Checkbox } from '@heroui/checkbox';
import { Modal, ModalHeader, ModalBody, ModalFooter, useDisclosure } from '@heroui/modal';
import { Textarea } from '@heroui/input';
import { addToast } from '@heroui/toast';

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

    // 处理状态
    const [selectedLog, setSelectedLog] = useState<CheatLogDto | null>(null);
    const [selectedLogIds, setSelectedLogIds] = useState<Set<number>>(new Set());
    const [processingNotes, setProcessingNotes] = useState('');
    const { isOpen: isProcessModalOpen, onOpen: onProcessModalOpen, onClose: onProcessModalClose } = useDisclosure();

    const loadLogs = async () => {
        setIsLoading(true);
        // 在重新加载时清除选择
        setSelectedLogIds(new Set());
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
        // 注意：useEffect会因为page改变而自动调用loadLogs
    };

    const handleProcessClick = (log: CheatLogDto) => {
        setSelectedLog(log);
        setProcessingNotes(log.adminNotes || '');
        onProcessModalOpen();
    };

    const handleConfirmProcess = async () => {
        if (!selectedLog) return;
        try {
            await cheatLogs.processLog(selectedLog.id, { notes: processingNotes });
            addToast({ title: t('process_success'), color: 'success' });
            onProcessModalClose();
            loadLogs();
        } catch (error) {
            addToast({ title: t('process_error'), description: (error as Error).message, color: 'danger' });
        }
    };
    
    const handleUnprocessClick = async (logId: number) => {
        try {
            await cheatLogs.unprocessLog(logId);
            addToast({ title: t('unprocess_success'), color: 'success' });
            loadLogs();
        } catch (error) {
            addToast({ title: t('unprocess_error'), description: (error as Error).message, color: 'danger' });
        }
    };

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            const ids = logs.map(log => log.id);
            setSelectedLogIds(new Set(ids));
        } else {
            setSelectedLogIds(new Set());
        }
    };

    const handleSelectLog = (logId: number, checked: boolean) => {
        const newSelection = new Set(selectedLogIds);
        if (checked) {
            newSelection.add(logId);
        } else {
            newSelection.delete(logId);
        }
        setSelectedLogIds(newSelection);
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString();
    };

    const getDetectionTypeColor = (type: CheatDetectionType) => {
        switch (type) {
            case CheatDetectionType.AnnounceFrequency:
                return 'warning';
            case CheatDetectionType.MultiLocation:
                return 'danger';
            default:
                return 'default';
        }
    };

    const getSeverityColor = (severity: CheatSeverity) => {
        switch (severity) {
            case CheatSeverity.Low:
                return 'success';
            case CheatSeverity.Medium:
                return 'warning';
            case CheatSeverity.High:
                return 'danger';
            case CheatSeverity.Critical:
                return 'danger';
            default:
                return 'default';
        }
    };

    const getDetectionTypeName = (type: CheatDetectionType): string => {
        switch (type) {
            case CheatDetectionType.AnnounceFrequency:
                return 'announce_frequency';
            case CheatDetectionType.MultiLocation:
                return 'multi_location';
            default:
                return 'unknown';
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
                            selectedKeys={detectionType ? [detectionType.toString()] : []}
                            onChange={(e) => {
                                const value = e.target.value;
                                setDetectionType(value ? parseInt(value) as CheatDetectionType : '');
                            }}
                        >
                            <SelectItem key="">{t('all_types')}</SelectItem>
                            <SelectItem key={CheatDetectionType.AnnounceFrequency.toString()}>
                                {t('types.announce_frequency')}
                            </SelectItem>
                            <SelectItem key={CheatDetectionType.MultiLocation.toString()}>
                                {t('types.multi_location')}
                            </SelectItem>
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
                    <Button
                        color="primary"
                        variant="flat"
                        isDisabled={selectedLogIds.size === 0}
                        onPress={() => {
                            setSelectedLog(null); // 表示是批量操作
                            setProcessingNotes('');
                            onProcessModalOpen();
                        }}
                    >
                        {t('batch_process')} ({selectedLogIds.size})
                    </Button>
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
                                    <TableColumn width={50}>
                                        <Checkbox
                                            isSelected={selectedLogIds.size > 0 && selectedLogIds.size === logs.length}
                                            onValueChange={handleSelectAll}
                                        />
                                    </TableColumn>
                                    <TableColumn>{t('table.user')}</TableColumn>
                                    <TableColumn>{t('table.torrent')}</TableColumn>
                                    <TableColumn>{t('table.detection_type')}</TableColumn>
                                    <TableColumn>{t('table.severity')}</TableColumn>
                                    <TableColumn>{t('table.details')}</TableColumn>
                                    <TableColumn>{t('table.ip_address')}</TableColumn>
                                    <TableColumn>{t('table.detected_at')}</TableColumn>
                                    <TableColumn>{t('table.status')}</TableColumn>
                                    <TableColumn>{t('table.actions')}</TableColumn>
                                </TableHeader>
                                <TableBody>
                                    {logs.map((log) => (
                                        <TableRow key={log.id}>
                                            <TableCell>
                                                <Checkbox
                                                    isSelected={selectedLogIds.has(log.id)}
                                                    onValueChange={(checked) => handleSelectLog(log.id, checked)}
                                                />
                                            </TableCell>
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
                                                    {t(`types.${getDetectionTypeName(log.detectionType)}`)}
                                                </Chip>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    color={getSeverityColor(log.severity)}
                                                    size="sm"
                                                    variant="flat"
                                                >
                                                    {t(`severity.${log.severity}`)}
                                                </Chip>
                                            </TableCell>
                                            <TableCell>
                                                <div className="max-w-md truncate" title={log.details || undefined}>
                                                    {log.details || '-'}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className="font-mono text-sm">{log.ipAddress}</span>
                                            </TableCell>
                                            <TableCell>{formatDate(log.timestamp)}</TableCell>
                                            <TableCell>
                                                {log.isProcessed ? (
                                                    <Chip color="success" size="sm">{t('status.processed')}</Chip>
                                                ) : (
                                                    <Chip color="default" size="sm">{t('status.pending')}</Chip>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex gap-2">
                                                    <Button size="sm" variant="flat" onPress={() => handleProcessClick(log)}>
                                                        {log.isProcessed ? t('view_details') : t('process')}
                                                    </Button>
                                                    {log.isProcessed && (
                                                         <Button size="sm" variant="flat" color="warning" onPress={() => handleUnprocessClick(log.id)}>
                                                            {t('unprocess')}
                                                        </Button>
                                                    )}
                                                </div>
                                            </TableCell>
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

            {/* 处理日志模态框 */}
            <Modal isOpen={isProcessModalOpen} onClose={onProcessModalClose}>
                <ModalHeader>{selectedLog ? t('process_log_title') : t('batch_process_title')}</ModalHeader>
                <ModalBody>
                    {selectedLog && (
                        <div className="text-sm mb-4">
                            <p><strong>{t('table.user')}:</strong> {selectedLog.userName}</p>
                            <p><strong>{t('table.detection_type')}:</strong> {t(`types.${getDetectionTypeName(selectedLog.detectionType)}`)}</p>
                        </div>
                    )}
                    <Textarea
                        label={t('admin_notes_label')}
                        placeholder={t('admin_notes_placeholder')}
                        value={processingNotes}
                        onValueChange={setProcessingNotes}
                    />
                </ModalBody>
                <ModalFooter>
                    <Button variant="ghost" onPress={onProcessModalClose}>
                        {t('cancel')}
                    </Button>
                    <Button color="primary" onPress={handleConfirmProcess}>
                        {t('confirm_process')}
                    </Button>
                </ModalFooter>
            </Modal>
        </div>
    );
}