'use client';

import { useState, useEffect, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { credential } from '@/lib/api';
import type { CredentialDto, PaginatedResult } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { toast } from 'sonner';
import { Link } from '@/i18n/navigation';

type StatusFilter = 'all' | 'active' | 'revoked';
type SortOption = 'createdAt' | 'lastUsedAt' | 'uploadBytes' | 'downloadBytes';
type ExportFormat = 'csv' | 'json';

export default function CredentialManagement() {
    const t = useTranslations('credentialManagement');
    const [credentials, setCredentials] = useState<CredentialDto[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [revokeTarget, setRevokeTarget] = useState<CredentialDto | null>(null);
    const [isRevokeModalOpen, setIsRevokeModalOpen] = useState(false);
    const [isRevokeAllModalOpen, setIsRevokeAllModalOpen] = useState(false);
    
    // 批量操作状态
    const [selectedCredentials, setSelectedCredentials] = useState<Set<string>>(new Set());
    const [isRevokeBatchModalOpen, setIsRevokeBatchModalOpen] = useState(false);
    
    // 搜索和筛选状态
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
    const [sortBy, setSortBy] = useState<SortOption>('createdAt');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    
    // 分页状态
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);
    const [totalItems, setTotalItems] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    const loadCredentials = async () => {
        setIsLoading(true);
        try {
            // 根据筛选条件构建API参数
            const includeRevoked = statusFilter === 'all' || statusFilter === 'revoked';
            const onlyRevoked = statusFilter === 'revoked';
            
            const result = await credential.getMy({
                searchKeyword: searchQuery.trim() || undefined,
                includeRevoked,
                onlyRevoked,
                sortBy: sortBy === 'uploadBytes' ? 'TotalUploadedBytes' :
                       sortBy === 'downloadBytes' ? 'TotalDownloadedBytes' :
                       sortBy === 'lastUsedAt' ? 'LastUsedAt' : 'CreatedAt',
                sortDirection: sortOrder === 'asc' ? 'Ascending' : 'Descending',
                page: currentPage,
                pageSize: pageSize
            });
            
            setCredentials(result.items);
            setTotalItems(result.totalItems);
            setTotalPages(result.totalPages);
        } catch (error) {
            toast.error(t('load_error'), {
                description: (error as Error).message
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadCredentials();
    }, [currentPage, pageSize, searchQuery, statusFilter, sortBy, sortOrder]);
    
    // 当筛选条件改变时，重置到第一页
    useEffect(() => {
        if (currentPage !== 1) {
            setCurrentPage(1);
        }
    }, [searchQuery, statusFilter, sortBy, sortOrder]);

    const handleRevokeClick = (cred: CredentialDto) => {
        setRevokeTarget(cred);
        setIsRevokeModalOpen(true);
    };

    const handleConfirmRevoke = async () => {
        if (!revokeTarget) return;

        try {
            await credential.revoke(revokeTarget.credential);
            toast.success(t('revoke_success'));
            await loadCredentials();
            setIsRevokeModalOpen(false);
        } catch (error) {
            toast.error(t('revoke_error'), {
                description: (error as Error).message
            });
        }
    };

    const handleRevokeAllClick = () => {
        setIsRevokeAllModalOpen(true);
    };

    const handleConfirmRevokeAll = async () => {
        try {
            // 使用服务器端批量撤销API（原子操作）
            const result = await credential.revokeAll(t('revoke_all_reason'));
            toast.success(t('revoke_all_success_detail', {
                count: result.revokedCount,
                torrentCount: result.affectedTorrentIds.length
            }));
            await loadCredentials();
            setIsRevokeAllModalOpen(false);
        } catch (error) {
            toast.error(t('revoke_all_error'), {
                description: (error as Error).message
            });
        }
    };

    // 批量选择处理
    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            const activeCredentials = credentials
                .filter(c => !c.isRevoked)
                .map(c => c.credential);
            setSelectedCredentials(new Set(activeCredentials));
        } else {
            setSelectedCredentials(new Set());
        }
    };

    const handleSelectCredential = (credentialUuid: string, checked: boolean) => {
        const newSelection = new Set(selectedCredentials);
        if (checked) {
            newSelection.add(credentialUuid);
        } else {
            newSelection.delete(credentialUuid);
        }
        setSelectedCredentials(newSelection);
    };

    // 批量撤销处理
    const handleRevokeBatchClick = () => {
        if (selectedCredentials.size === 0) return;
        setIsRevokeBatchModalOpen(true);
    };

    const handleConfirmRevokeBatch = async () => {
        try {
            const credentialUuids = Array.from(selectedCredentials);
            const result = await credential.revokeBatch(credentialUuids, t('bulk.revoke_reason'));
            toast.success(t('bulk.revoke_success_detail', {
                count: result.revokedCount,
                torrentCount: result.affectedTorrentIds.length
            }));
            setSelectedCredentials(new Set());
            await loadCredentials();
            setIsRevokeBatchModalOpen(false);
        } catch (error) {
            toast.error(t('bulk.revoke_error'), {
                description: (error as Error).message
            });
        }
    };

    // 导出功能 - 导出所有数据（不仅当前页）
    const handleExport = async (format: ExportFormat) => {
        try {
            setIsLoading(true);
            // 获取所有凭证用于导出
            const includeRevoked = statusFilter === 'all' || statusFilter === 'revoked';
            const onlyRevoked = statusFilter === 'revoked';
            
            const result = await credential.getMy({
                searchKeyword: searchQuery.trim() || undefined,
                includeRevoked,
                onlyRevoked,
                sortBy: sortBy === 'uploadBytes' ? 'TotalUploadedBytes' :
                       sortBy === 'downloadBytes' ? 'TotalDownloadedBytes' :
                       sortBy === 'lastUsedAt' ? 'LastUsedAt' : 'CreatedAt',
                sortDirection: sortOrder === 'asc' ? 'Ascending' : 'Descending',
                page: 1,
                pageSize: 10000 // 获取所有数据用于导出
            });
            
            if (format === 'csv') {
                exportToCSV(result.items);
            } else {
                exportToJSON(result.items);
            }
        } catch (error) {
            toast.error(t('export.error'), {
                description: (error as Error).message
            });
        } finally {
            setIsLoading(false);
        }
    };

    const exportToCSV = (data: CredentialDto[]) => {
        const headers = [
            'Torrent ID',
            'Torrent Name',
            'Credential',
            'Status',
            'Total Uploaded (Bytes)',
            'Total Downloaded (Bytes)',
            'Announce Count',
            'Last Used At',
            'Created At',
            'Revoked At'
        ];
        
        const rows = data.map(cred => [
            cred.torrentId,
            `"${cred.torrentName.replace(/"/g, '""')}"`,
            cred.credential,
            cred.isRevoked ? 'Revoked' : 'Active',
            cred.totalUploadedBytes || 0,
            cred.totalDownloadedBytes || 0,
            cred.announceCount || 0,
            cred.lastUsedAt || '',
            cred.createdAt,
            cred.revokedAt || ''
        ]);
        
        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `credentials_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast.success(t('export.csv_success'));
    };

    const exportToJSON = (data: CredentialDto[]) => {
        const exportData = {
            exportDate: new Date().toISOString(),
            totalCount: data.length,
            credentials: data.map(cred => ({
                torrentId: cred.torrentId,
                torrentName: cred.torrentName,
                credential: cred.credential,
                isRevoked: cred.isRevoked,
                totalUploadedBytes: cred.totalUploadedBytes || 0,
                totalDownloadedBytes: cred.totalDownloadedBytes || 0,
                announceCount: cred.announceCount || 0,
                lastUsedAt: cred.lastUsedAt,
                createdAt: cred.createdAt,
                revokedAt: cred.revokedAt
            }))
        };
        
        const jsonContent = JSON.stringify(exportData, null, 2);
        const blob = new Blob([jsonContent], { type: 'application/json' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `credentials_${new Date().toISOString().split('T')[0]}.json`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast.success(t('export.json_success'));
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString();
    };

    // 格式化字节数为可读格式
    const formatBytes = (bytes?: number): string => {
        if (!bytes || bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
    };

    // 判断凭证是否活跃（最近7天内使用过）
    const isCredentialActive = (cred: CredentialDto): boolean => {
        if (cred.isRevoked) return false;
        if (!cred.lastUsedAt) return false;
        const lastUsed = new Date(cred.lastUsedAt);
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        return lastUsed > sevenDaysAgo;
    };

    // 当前页的活跃凭证
    const activeCredentialsInView = credentials.filter(c => !c.isRevoked);
    const allActiveSelected = activeCredentialsInView.length > 0 &&
        activeCredentialsInView.every(c => selectedCredentials.has(c.credential));
    
    // 统计信息（显示服务器端的总数）
    const activeCount = useMemo(() => {
        // 这里只是估算，真实数字由后端提供
        return credentials.filter(c => !c.isRevoked).length;
    }, [credentials]);

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center w-full">
                    <div>
                        <CardTitle>{t('title')}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">{t('description')}</p>
                    </div>
                    <div className="flex gap-2">
                        {/* 导出按钮 */}
                        <Button
                            variant="outline"
                            onClick={() => handleExport('csv')}
                            disabled={totalItems === 0}
                        >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            {t('export.csv_button')}
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => handleExport('json')}
                            disabled={totalItems === 0}
                        >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            {t('export.json_button')}
                        </Button>
                        {/* 批量撤销按钮 */}
                        <Button
                            variant="outline"
                            onClick={handleRevokeBatchClick}
                            disabled={selectedCredentials.size === 0}
                        >
                            {t('bulk.revoke_selected')} ({selectedCredentials.size})
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleRevokeAllClick}
                            disabled={activeCount === 0}
                        >
                            {t('revoke_all_button')}
                        </Button>
                    </div>
                </div>
                
                {/* 搜索和筛选控件 */}
                <div className="w-full flex flex-col md:flex-row gap-3">
                    <div className="md:w-1/3 relative">
                        <svg className="w-4 h-4 text-muted-foreground absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <Input
                            placeholder={t('filters.search_placeholder')}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    
                    <div className="md:w-1/6">
                        <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val as StatusFilter)}>
                            <SelectTrigger>
                                <SelectValue placeholder={t('filters.status_label')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">{t('filters.status_all')}</SelectItem>
                                <SelectItem value="active">{t('filters.status_active')}</SelectItem>
                                <SelectItem value="revoked">{t('filters.status_revoked')}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    
                    <div className="md:w-1/6">
                        <Select value={sortBy} onValueChange={(val) => setSortBy(val as SortOption)}>
                            <SelectTrigger>
                                <SelectValue placeholder={t('filters.sort_by_label')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="createdAt">{t('filters.sort_created_at')}</SelectItem>
                                <SelectItem value="lastUsedAt">{t('filters.sort_last_used')}</SelectItem>
                                <SelectItem value="uploadBytes">{t('filters.sort_upload')}</SelectItem>
                                <SelectItem value="downloadBytes">{t('filters.sort_download')}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                        className="md:mt-0"
                    >
                        {sortOrder === 'asc' ? '↑' : '↓'}
                    </Button>
                </div>
                
                <div className="flex gap-4 text-sm">
                    <span>{t('total_credentials', { count: totalItems })}</span>
                    <span className="text-primary">
                        {t('filters.showing_page', {
                            from: (currentPage - 1) * pageSize + 1,
                            to: Math.min(currentPage * pageSize, totalItems),
                            total: totalItems
                        })}
                    </span>
                </div>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <p className="text-center py-8">{t('loading')}</p>
                ) : totalItems === 0 ? (
                    <p className="text-center py-8 text-default-500">{t('no_credentials')}</p>
                ) : credentials.length === 0 ? (
                    <p className="text-center py-8 text-default-500">{t('filters.no_results')}</p>
                ) : (
                    <>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-12">
                                    <Checkbox
                                        checked={allActiveSelected}
                                        onCheckedChange={handleSelectAll}
                                        disabled={activeCredentialsInView.length === 0}
                                    />
                                </TableHead>
                                <TableHead>{t('table.torrent_name')}</TableHead>
                                <TableHead>{t('table.usage_stats')}</TableHead>
                                <TableHead>{t('table.last_used')}</TableHead>
                                <TableHead>{t('table.created_at')}</TableHead>
                                <TableHead>{t('table.status')}</TableHead>
                                <TableHead>{t('table.actions')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {credentials.map((cred) => (
                                <TableRow key={cred.id}>
                                    <TableCell>
                                        <Checkbox
                                            checked={selectedCredentials.has(cred.credential)}
                                            onCheckedChange={(checked) => handleSelectCredential(cred.credential, checked === true)}
                                            disabled={cred.isRevoked}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Link
                                                href={`/torrents/${cred.torrentId}`}
                                                className="text-primary hover:underline"
                                            >
                                                {cred.torrentName}
                                            </Link>
                                            {isCredentialActive(cred) && (
                                                <Badge variant="outline" className="text-green-600 border-green-600 ml-2">
                                                    {t('active_indicator')}
                                                </Badge>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-sm space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-success">↑ {formatBytes(cred.totalUploadedBytes)}</span>
                                                <span className="text-default-400">|</span>
                                                <span className="text-primary">↓ {formatBytes(cred.totalDownloadedBytes)}</span>
                                            </div>
                                            {cred.announceCount !== undefined && cred.announceCount > 0 && (
                                                <div className="text-xs text-default-500">
                                                    {t('announce_count', { count: cred.announceCount })}
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-sm">
                                            {cred.lastUsedAt ? (
                                                <span>{formatDate(cred.lastUsedAt)}</span>
                                            ) : (
                                                <span className="text-default-400">{t('never_used')}</span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className="text-sm text-default-500">
                                            {formatDate(cred.createdAt)}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        {cred.isRevoked ? (
                                            <Badge variant="destructive">
                                                {t('status.revoked')}
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline" className="text-green-600 border-green-600">
                                                {t('status.active')}
                                            </Badge>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {!cred.isRevoked && (
                                            <Button
                                                size="sm"
                                                variant="destructive"
                                                onClick={() => handleRevokeClick(cred)}
                                            >
                                                {t('revoke_button')}
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    
                    {/* 分页控件 */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 px-2">
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">
                                {t('pagination.rows_per_page')}:
                            </span>
                            <Select value={pageSize.toString()} onValueChange={(val) => {
                                setPageSize(parseInt(val));
                                setCurrentPage(1);
                            }}>
                                <SelectTrigger className="w-20">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="10">10</SelectItem>
                                    <SelectItem value="20">20</SelectItem>
                                    <SelectItem value="50">50</SelectItem>
                                    <SelectItem value="100">100</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        
                        <Pagination>
                            <PaginationContent>
                                <PaginationItem>
                                    <PaginationPrevious
                                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                        className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                                    />
                                </PaginationItem>
                                {[...Array(totalPages)].map((_, i) => (
                                    <PaginationItem key={i + 1}>
                                        <PaginationLink
                                            onClick={() => setCurrentPage(i + 1)}
                                            isActive={currentPage === i + 1}
                                            className="cursor-pointer"
                                        >
                                            {i + 1}
                                        </PaginationLink>
                                    </PaginationItem>
                                ))}
                                <PaginationItem>
                                    <PaginationNext
                                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                        className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                                    />
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    </div>
                    </>
                )}
            </CardContent>

            {/* 单个撤销确认模态框 */}
            <Dialog open={isRevokeModalOpen} onOpenChange={setIsRevokeModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('revoke_modal.title')}</DialogTitle>
                    </DialogHeader>
                    <p>{t('revoke_modal.description')}</p>
                    {revokeTarget && (
                        <p className="mt-2 font-semibold">{revokeTarget.torrentName}</p>
                    )}
                    <p className="mt-2 text-yellow-600 text-sm">{t('revoke_modal.warning')}</p>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsRevokeModalOpen(false)}>
                            {t('revoke_modal.cancel')}
                        </Button>
                        <Button variant="destructive" onClick={handleConfirmRevoke}>
                            {t('revoke_modal.confirm')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* 批量撤销确认模态框 */}
            <Dialog open={isRevokeAllModalOpen} onOpenChange={setIsRevokeAllModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('revoke_all_modal.title')}</DialogTitle>
                    </DialogHeader>
                    <p>{t('revoke_all_modal.description', { count: activeCount })}</p>
                    <p className="mt-2 text-destructive text-sm font-semibold">{t('revoke_all_modal.warning')}</p>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsRevokeAllModalOpen(false)}>
                            {t('revoke_all_modal.cancel')}
                        </Button>
                        <Button variant="destructive" onClick={handleConfirmRevokeAll}>
                            {t('revoke_all_modal.confirm')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* 批量撤销选中凭证的确认模态框 */}
            <Dialog open={isRevokeBatchModalOpen} onOpenChange={setIsRevokeBatchModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('bulk.modal_title')}</DialogTitle>
                    </DialogHeader>
                    <p>{t('bulk.modal_description', { count: selectedCredentials.size })}</p>
                    <p className="mt-2 text-yellow-600 text-sm">{t('bulk.modal_warning')}</p>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsRevokeBatchModalOpen(false)}>
                            {t('bulk.modal_cancel')}
                        </Button>
                        <Button variant="outline" onClick={handleConfirmRevokeBatch}>
                            {t('bulk.modal_confirm')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Card>
    );
}