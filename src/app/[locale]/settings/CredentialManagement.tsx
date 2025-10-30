'use client';

import { useState, useEffect, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { credential } from '@/lib/api';
import type { CredentialDto, PaginatedResult } from '@/lib/api';
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@heroui/table";
import { Chip } from "@heroui/chip";
import { Checkbox } from "@heroui/checkbox";
import { Modal, ModalHeader, ModalBody, ModalFooter, useDisclosure } from '@heroui/modal';
import { Input } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { addToast } from '@heroui/toast';
import { Link } from '@/i18n/navigation';

type StatusFilter = 'all' | 'active' | 'revoked';
type SortOption = 'createdAt' | 'lastUsedAt' | 'uploadBytes' | 'downloadBytes';
type ExportFormat = 'csv' | 'json';

export default function CredentialManagement() {
    const t = useTranslations('credentialManagement');
    const [credentials, setCredentials] = useState<CredentialDto[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [revokeTarget, setRevokeTarget] = useState<CredentialDto | null>(null);
    const { isOpen: isRevokeModalOpen, onOpen: onRevokeModalOpen, onClose: onRevokeModalClose } = useDisclosure();
    const { isOpen: isRevokeAllModalOpen, onOpen: onRevokeAllModalOpen, onClose: onRevokeAllModalClose } = useDisclosure();
    
    // 批量操作状态
    const [selectedCredentials, setSelectedCredentials] = useState<Set<string>>(new Set());
    const { isOpen: isRevokeBatchModalOpen, onOpen: onRevokeBatchModalOpen, onClose: onRevokeBatchModalClose } = useDisclosure();
    
    // 搜索和筛选状态
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
    const [sortBy, setSortBy] = useState<SortOption>('createdAt');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    const loadCredentials = async () => {
        setIsLoading(true);
        try {
            // 使用新的分页API格式
            const result = await credential.getMy({
                includeRevoked: true,
                pageSize: 1000 // 暂时获取所有凭证
            });
            setCredentials(result.items);
        } catch (error) {
            addToast({
                title: t('load_error'),
                description: (error as Error).message,
                color: 'danger'
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadCredentials();
    }, []);

    const handleRevokeClick = (cred: CredentialDto) => {
        setRevokeTarget(cred);
        onRevokeModalOpen();
    };

    const handleConfirmRevoke = async () => {
        if (!revokeTarget) return;

        try {
            await credential.revoke(revokeTarget.credential);
            addToast({ 
                title: t('revoke_success'),
                color: 'success' 
            });
            await loadCredentials();
            onRevokeModalClose();
        } catch (error) {
            addToast({ 
                title: t('revoke_error'),
                description: (error as Error).message,
                color: 'danger' 
            });
        }
    };

    const handleRevokeAllClick = () => {
        onRevokeAllModalOpen();
    };

    const handleConfirmRevokeAll = async () => {
        try {
            // 使用服务器端批量撤销API（原子操作）
            const result = await credential.revokeAll(t('revoke_all_reason'));
            addToast({
                title: t('revoke_all_success_detail', {
                    count: result.revokedCount,
                    torrentCount: result.affectedTorrentIds.length
                }),
                color: 'success'
            });
            await loadCredentials();
            onRevokeAllModalClose();
        } catch (error) {
            addToast({
                title: t('revoke_all_error'),
                description: (error as Error).message,
                color: 'danger'
            });
        }
    };

    // 批量选择处理
    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            const activeCredentials = filteredAndSortedCredentials
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
        onRevokeBatchModalOpen();
    };

    const handleConfirmRevokeBatch = async () => {
        try {
            const credentialUuids = Array.from(selectedCredentials);
            const result = await credential.revokeBatch(credentialUuids, t('bulk.revoke_reason'));
            addToast({
                title: t('bulk.revoke_success_detail', {
                    count: result.revokedCount,
                    torrentCount: result.affectedTorrentIds.length
                }),
                color: 'success'
            });
            setSelectedCredentials(new Set());
            await loadCredentials();
            onRevokeBatchModalClose();
        } catch (error) {
            addToast({
                title: t('bulk.revoke_error'),
                description: (error as Error).message,
                color: 'danger'
            });
        }
    };

    // 导出功能
    const handleExport = (format: ExportFormat) => {
        const dataToExport = filteredAndSortedCredentials;
        
        if (format === 'csv') {
            exportToCSV(dataToExport);
        } else {
            exportToJSON(dataToExport);
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
        
        addToast({
            title: t('export.csv_success'),
            color: 'success'
        });
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
        
        addToast({
            title: t('export.json_success'),
            color: 'success'
        });
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

    // 过滤和排序逻辑
    const filteredAndSortedCredentials = useMemo(() => {
        let result = [...credentials];
        
        // 1. 搜索过滤
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            result = result.filter(cred =>
                cred.torrentName.toLowerCase().includes(query)
            );
        }
        
        // 2. 状态过滤
        if (statusFilter === 'active') {
            result = result.filter(cred => !cred.isRevoked);
        } else if (statusFilter === 'revoked') {
            result = result.filter(cred => cred.isRevoked);
        }
        
        // 3. 排序
        result.sort((a, b) => {
            let compareValue = 0;
            
            switch (sortBy) {
                case 'createdAt':
                    compareValue = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                    break;
                case 'lastUsedAt':
                    const aTime = a.lastUsedAt ? new Date(a.lastUsedAt).getTime() : 0;
                    const bTime = b.lastUsedAt ? new Date(b.lastUsedAt).getTime() : 0;
                    compareValue = aTime - bTime;
                    break;
                case 'uploadBytes':
                    compareValue = (a.totalUploadedBytes || 0) - (b.totalUploadedBytes || 0);
                    break;
                case 'downloadBytes':
                    compareValue = (a.totalDownloadedBytes || 0) - (b.totalDownloadedBytes || 0);
                    break;
            }
            
            return sortOrder === 'asc' ? compareValue : -compareValue;
        });
        
        return result;
    }, [credentials, searchQuery, statusFilter, sortBy, sortOrder]);

    const activeCount = credentials.filter(c => !c.isRevoked).length;
    const activeCredentialsInView = filteredAndSortedCredentials.filter(c => !c.isRevoked);
    const allActiveSelected = activeCredentialsInView.length > 0 &&
        activeCredentialsInView.every(c => selectedCredentials.has(c.credential));

    return (
        <Card>
            <CardHeader className="flex flex-col items-start gap-4">
                <div className="flex justify-between items-center w-full">
                    <div>
                        <h2 className="text-xl font-semibold">{t('title')}</h2>
                        <p className="text-sm text-default-500 mt-1">{t('description')}</p>
                    </div>
                    <div className="flex gap-2">
                        {/* 导出按钮 */}
                        <Button
                            color="primary"
                            variant="flat"
                            onPress={() => handleExport('csv')}
                            isDisabled={filteredAndSortedCredentials.length === 0}
                            startContent={
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            }
                        >
                            {t('export.csv_button')}
                        </Button>
                        <Button
                            color="primary"
                            variant="flat"
                            onPress={() => handleExport('json')}
                            isDisabled={filteredAndSortedCredentials.length === 0}
                            startContent={
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            }
                        >
                            {t('export.json_button')}
                        </Button>
                        {/* 批量撤销按钮 */}
                        <Button
                            color="warning"
                            variant="flat"
                            onPress={handleRevokeBatchClick}
                            isDisabled={selectedCredentials.size === 0}
                        >
                            {t('bulk.revoke_selected')} ({selectedCredentials.size})
                        </Button>
                        <Button
                            color="danger"
                            variant="flat"
                            onPress={handleRevokeAllClick}
                            isDisabled={activeCount === 0}
                        >
                            {t('revoke_all_button')}
                        </Button>
                    </div>
                </div>
                
                {/* 搜索和筛选控件 */}
                <div className="w-full flex flex-col md:flex-row gap-3">
                    <Input
                        placeholder={t('filters.search_placeholder')}
                        value={searchQuery}
                        onValueChange={setSearchQuery}
                        className="md:w-1/3"
                        isClearable
                        startContent={
                            <svg className="w-4 h-4 text-default-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        }
                    />
                    
                    <Select
                        label={t('filters.status_label')}
                        selectedKeys={[statusFilter]}
                        onSelectionChange={(keys) => {
                            const selected = Array.from(keys)[0] as StatusFilter;
                            setStatusFilter(selected);
                        }}
                        className="md:w-1/6"
                    >
                        <SelectItem key="all">{t('filters.status_all')}</SelectItem>
                        <SelectItem key="active">{t('filters.status_active')}</SelectItem>
                        <SelectItem key="revoked">{t('filters.status_revoked')}</SelectItem>
                    </Select>
                    
                    <Select
                        label={t('filters.sort_by_label')}
                        selectedKeys={[sortBy]}
                        onSelectionChange={(keys) => {
                            const selected = Array.from(keys)[0] as SortOption;
                            setSortBy(selected);
                        }}
                        className="md:w-1/6"
                    >
                        <SelectItem key="createdAt">{t('filters.sort_created_at')}</SelectItem>
                        <SelectItem key="lastUsedAt">{t('filters.sort_last_used')}</SelectItem>
                        <SelectItem key="uploadBytes">{t('filters.sort_upload')}</SelectItem>
                        <SelectItem key="downloadBytes">{t('filters.sort_download')}</SelectItem>
                    </Select>
                    
                    <Button
                        isIconOnly
                        variant="flat"
                        onPress={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                        className="md:mt-6"
                    >
                        {sortOrder === 'asc' ? '↑' : '↓'}
                    </Button>
                </div>
                
                <div className="flex gap-4 text-sm">
                    <span>{t('total_credentials', { count: credentials.length })}</span>
                    <span className="text-success">{t('active_credentials', { count: activeCount })}</span>
                    <span className="text-danger">{t('revoked_credentials', { count: credentials.length - activeCount })}</span>
                    {filteredAndSortedCredentials.length !== credentials.length && (
                        <span className="text-primary">
                            {t('filters.showing', { count: filteredAndSortedCredentials.length })}
                        </span>
                    )}
                </div>
            </CardHeader>
            <CardBody>
                {isLoading ? (
                    <p className="text-center py-8">{t('loading')}</p>
                ) : credentials.length === 0 ? (
                    <p className="text-center py-8 text-default-500">{t('no_credentials')}</p>
                ) : filteredAndSortedCredentials.length === 0 ? (
                    <p className="text-center py-8 text-default-500">{t('filters.no_results')}</p>
                ) : (
                    <Table aria-label="Credentials table">
                        <TableHeader>
                            <TableColumn width={50}>
                                {/* 全选复选框 */}
                                <Checkbox
                                    isSelected={allActiveSelected}
                                    onValueChange={handleSelectAll}
                                    isDisabled={activeCredentialsInView.length === 0}
                                />
                            </TableColumn>
                            <TableColumn>{t('table.torrent_name')}</TableColumn>
                            <TableColumn>{t('table.usage_stats')}</TableColumn>
                            <TableColumn>{t('table.last_used')}</TableColumn>
                            <TableColumn>{t('table.created_at')}</TableColumn>
                            <TableColumn>{t('table.status')}</TableColumn>
                            <TableColumn>{t('table.actions')}</TableColumn>
                        </TableHeader>
                        <TableBody>
                            {filteredAndSortedCredentials.map((cred) => (
                                <TableRow key={cred.id}>
                                    <TableCell>
                                        {/* 单个复选框 */}
                                        <Checkbox
                                            isSelected={selectedCredentials.has(cred.credential)}
                                            onValueChange={(checked) => handleSelectCredential(cred.credential, checked)}
                                            isDisabled={cred.isRevoked}
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
                                                <Chip size="sm" color="success" variant="dot">
                                                    {t('active_indicator')}
                                                </Chip>
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
                                            <Chip color="danger" size="sm">
                                                {t('status.revoked')}
                                            </Chip>
                                        ) : (
                                            <Chip color="success" size="sm">
                                                {t('status.active')}
                                            </Chip>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {!cred.isRevoked && (
                                            <Button
                                                size="sm"
                                                color="danger"
                                                variant="flat"
                                                onPress={() => handleRevokeClick(cred)}
                                            >
                                                {t('revoke_button')}
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </CardBody>

            {/* 单个撤销确认模态框 */}
            <Modal isOpen={isRevokeModalOpen} onClose={onRevokeModalClose}>
                <ModalHeader>{t('revoke_modal.title')}</ModalHeader>
                <ModalBody>
                    <p>{t('revoke_modal.description')}</p>
                    {revokeTarget && (
                        <p className="mt-2 font-semibold">{revokeTarget.torrentName}</p>
                    )}
                    <p className="mt-2 text-warning text-sm">{t('revoke_modal.warning')}</p>
                </ModalBody>
                <ModalFooter>
                    <Button variant="ghost" onPress={onRevokeModalClose}>
                        {t('revoke_modal.cancel')}
                    </Button>
                    <Button color="danger" onPress={handleConfirmRevoke}>
                        {t('revoke_modal.confirm')}
                    </Button>
                </ModalFooter>
            </Modal>

            {/* 批量撤销确认模态框 */}
            <Modal isOpen={isRevokeAllModalOpen} onClose={onRevokeAllModalClose}>
                <ModalHeader>{t('revoke_all_modal.title')}</ModalHeader>
                <ModalBody>
                    <p>{t('revoke_all_modal.description', { count: activeCount })}</p>
                    <p className="mt-2 text-danger text-sm font-semibold">{t('revoke_all_modal.warning')}</p>
                </ModalBody>
                <ModalFooter>
                    <Button variant="ghost" onPress={onRevokeAllModalClose}>
                        {t('revoke_all_modal.cancel')}
                    </Button>
                    <Button color="danger" onPress={handleConfirmRevokeAll}>
                        {t('revoke_all_modal.confirm')}
                    </Button>
                </ModalFooter>
            </Modal>

            {/* 批量撤销选中凭证的确认模态框 */}
            <Modal isOpen={isRevokeBatchModalOpen} onClose={onRevokeBatchModalClose}>
                <ModalHeader>{t('bulk.modal_title')}</ModalHeader>
                <ModalBody>
                    <p>{t('bulk.modal_description', { count: selectedCredentials.size })}</p>
                    <p className="mt-2 text-warning text-sm">{t('bulk.modal_warning')}</p>
                </ModalBody>
                <ModalFooter>
                    <Button variant="ghost" onPress={onRevokeBatchModalClose}>
                        {t('bulk.modal_cancel')}
                    </Button>
                    <Button color="warning" onPress={handleConfirmRevokeBatch}>
                        {t('bulk.modal_confirm')}
                    </Button>
                </ModalFooter>
            </Modal>
        </Card>
    );
}