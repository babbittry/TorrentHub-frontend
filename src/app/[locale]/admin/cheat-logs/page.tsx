'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { cheatLogs, CheatDetectionType, CheatSeverity } from '@/lib/api';
import type { CheatLogDto, CheatLogFilters } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableHeader, TableBody, TableRow, TableCell, TableHead } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from "@/components/ui/textarea";
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';

export default function CheatLogsPage() {
    const t = useTranslations('cheatLogsPage');
    const [logs, setLogs] = useState<CheatLogDto[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    const [page, setPage] = useState(1);
    const [pageSize] = useState(20);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [userId, setUserId] = useState('');
    const [detectionType, setDetectionType] = useState<CheatDetectionType | ''>('');

    const [selectedLog, setSelectedLog] = useState<CheatLogDto | null>(null);
    const [selectedLogIds, setSelectedLogIds] = useState<Set<number>>(new Set());
    const [processingNotes, setProcessingNotes] = useState('');
    const [isProcessModalOpen, setIsProcessModalOpen] = useState(false);

    const loadLogs = async () => {
        setIsLoading(true);
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
        setPage(1);
        loadLogs();
    };

    const handleReset = () => {
        setUserId('');
        setDetectionType('');
        setPage(1);
    };

    const handleProcessClick = (log: CheatLogDto) => {
        setSelectedLog(log);
        setProcessingNotes(log.adminNotes || '');
        setIsProcessModalOpen(true);
    };

    const handleConfirmProcess = async () => {
        if (!selectedLog) return;
        try {
            await cheatLogs.processLog(selectedLog.id, { notes: processingNotes });
            toast.success(t('process_success'));
            setIsProcessModalOpen(false);
            loadLogs();
        } catch (error) {
            toast.error(t('process_error'), { description: (error as Error).message });
        }
    };
    
    const handleUnprocessClick = async (logId: number) => {
        try {
            await cheatLogs.unprocessLog(logId);
            toast.success(t('unprocess_success'));
            loadLogs();
        } catch (error) {
            toast.error(t('unprocess_error'), { description: (error as Error).message });
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
                return 'bg-yellow-600';
            case CheatDetectionType.MultiLocation:
                return 'bg-red-600';
            default:
                return '';
        }
    };

    const getSeverityColor = (severity: CheatSeverity) => {
        switch (severity) {
            case CheatSeverity.Low:
                return 'bg-green-600';
            case CheatSeverity.Medium:
                return 'bg-yellow-600';
            case CheatSeverity.High:
                return 'bg-red-600';
            case CheatSeverity.Critical:
                return 'bg-red-700';
            default:
                return '';
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
                    <CardTitle>{t('filters_title')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Input
                            placeholder={t('user_id_placeholder')}
                            value={userId}
                            onChange={(e) => setUserId(e.target.value)}
                            type="number"
                        />
                        
                        <div className="space-y-2">
                            <Label>{t('detection_type_label')}</Label>
                            <Select value={detectionType === '' ? 'all' : detectionType.toString()} onValueChange={(value) => setDetectionType(value === 'all' ? '' : parseInt(value) as CheatDetectionType)}>
                                <SelectTrigger>
                                    <SelectValue placeholder={t('detection_type_placeholder')} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">{t('all_types')}</SelectItem>
                                    <SelectItem value={CheatDetectionType.AnnounceFrequency.toString()}>
                                        {t('types.announce_frequency')}
                                    </SelectItem>
                                    <SelectItem value={CheatDetectionType.MultiLocation.toString()}>
                                        {t('types.multi_location')}
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        
                        <div className="flex gap-2 items-end">
                            <Button onClick={handleSearch}>{t('search_button')}</Button>
                            <Button variant="outline" onClick={handleReset}>{t('reset_button')}</Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row justify-between items-center">
                    <div>
                        <CardTitle>{t('logs_title')}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                            {t('total_logs', { count: totalItems })}
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        disabled={selectedLogIds.size === 0}
                        onClick={() => {
                            setSelectedLog(null);
                            setProcessingNotes('');
                            setIsProcessModalOpen(true);
                        }}
                    >
                        {t('batch_process')} ({selectedLogIds.size})
                    </Button>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <p className="text-center py-8">{t('loading')}</p>
                    ) : logs.length === 0 ? (
                        <p className="text-center py-8 text-muted-foreground">{t('no_logs')}</p>
                    ) : (
                        <>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-12">
                                            <Checkbox
                                                checked={selectedLogIds.size > 0 && selectedLogIds.size === logs.length}
                                                onCheckedChange={handleSelectAll}
                                            />
                                        </TableHead>
                                        <TableHead>{t('table.user')}</TableHead>
                                        <TableHead>{t('table.torrent')}</TableHead>
                                        <TableHead>{t('table.detection_type')}</TableHead>
                                        <TableHead>{t('table.severity')}</TableHead>
                                        <TableHead>{t('table.details')}</TableHead>
                                        <TableHead>{t('table.ip_address')}</TableHead>
                                        <TableHead>{t('table.detected_at')}</TableHead>
                                        <TableHead>{t('table.status')}</TableHead>
                                        <TableHead>{t('table.actions')}</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {logs.map((log) => (
                                        <TableRow key={log.id}>
                                            <TableCell>
                                                <Checkbox
                                                    checked={selectedLogIds.has(log.id)}
                                                    onCheckedChange={(checked) => handleSelectLog(log.id, checked as boolean)}
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
                                                    <span className="text-muted-foreground">N/A</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={getDetectionTypeColor(log.detectionType)}>
                                                    {t(`types.${getDetectionTypeName(log.detectionType)}`)}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={getSeverityColor(log.severity)}>
                                                    {t(`severity.${log.severity}`)}
                                                </Badge>
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
                                                    <Badge className="bg-green-600">{t('status.processed')}</Badge>
                                                ) : (
                                                    <Badge variant="secondary">{t('status.pending')}</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex gap-2">
                                                    <Button size="sm" variant="outline" onClick={() => handleProcessClick(log)}>
                                                        {log.isProcessed ? t('view_details') : t('process')}
                                                    </Button>
                                                    {log.isProcessed && (
                                                         <Button size="sm" variant="destructive" onClick={() => handleUnprocessClick(log.id)}>
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
                                    <Pagination>
                                        <PaginationContent>
                                            <PaginationItem>
                                                <PaginationPrevious
                                                    href="#"
                                                    onClick={(e) => { e.preventDefault(); if (page > 1) setPage(p => p - 1); }}
                                                    aria-disabled={page === 1}
                                                    className={page === 1 ? "pointer-events-none opacity-50" : ""}
                                                />
                                            </PaginationItem>
                                            {[...Array(Math.min(5, totalPages))].map((_, i) => {
                                                const pageNumber = i + 1;
                                                return (
                                                    <PaginationItem key={pageNumber}>
                                                        <PaginationLink
                                                            href="#"
                                                            onClick={(e) => { e.preventDefault(); setPage(pageNumber); }}
                                                            isActive={page === pageNumber}
                                                        >
                                                            {pageNumber}
                                                        </PaginationLink>
                                                    </PaginationItem>
                                                );
                                            })}
                                            <PaginationItem>
                                                <PaginationNext
                                                    href="#"
                                                    onClick={(e) => { e.preventDefault(); if (page < totalPages) setPage(p => p + 1); }}
                                                    aria-disabled={page === totalPages}
                                                    className={page === totalPages ? "pointer-events-none opacity-50" : ""}
                                                />
                                            </PaginationItem>
                                        </PaginationContent>
                                    </Pagination>
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>

            <Dialog open={isProcessModalOpen} onOpenChange={setIsProcessModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{selectedLog ? t('process_log_title') : t('batch_process_title')}</DialogTitle>
                    </DialogHeader>
                    {selectedLog && (
                        <div className="text-sm mb-4">
                            <p><strong>{t('table.user')}:</strong> {selectedLog.userName}</p>
                            <p><strong>{t('table.detection_type')}:</strong> {t(`types.${getDetectionTypeName(selectedLog.detectionType)}`)}</p>
                        </div>
                    )}
                    <div className="space-y-2">
                        <Label>{t('admin_notes_label')}</Label>
                        <Textarea
                            placeholder={t('admin_notes_placeholder')}
                            value={processingNotes}
                            onChange={(e) => setProcessingNotes(e.target.value)}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsProcessModalOpen(false)}>
                            {t('cancel')}
                        </Button>
                        <Button onClick={handleConfirmProcess}>
                            {t('confirm_process')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}