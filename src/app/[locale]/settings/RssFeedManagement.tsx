'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { rssFeed, RssFeedType } from '@/lib/api';
import type { RssFeedTokenDto, CreateRssFeedTokenRequest } from '@/lib/api';
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@heroui/table";
import { Chip } from "@heroui/chip";
import { Modal, ModalHeader, ModalBody, ModalFooter, useDisclosure } from '@heroui/modal';
import { addToast } from '@heroui/toast';
import { Tooltip } from "@heroui/tooltip";
// 使用简单的SVG图标替代heroicons
const CheckIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
);

const ClipboardIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
    </svg>
);

export default function RssFeedManagement() {
    const t = useTranslations('rssFeedManagement');
    const [tokens, setTokens] = useState<RssFeedTokenDto[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [revokeTarget, setRevokeTarget] = useState<RssFeedTokenDto | null>(null);
    const [editTarget, setEditTarget] = useState<RssFeedTokenDto | null>(null);
    
    // 创建Token表单状态
    const [tokenName, setTokenName] = useState('');
    const [feedType, setFeedType] = useState<RssFeedType>(RssFeedType.Latest);
    const [categoryFilter, setCategoryFilter] = useState<string[]>([]);
    const [maxResults, setMaxResults] = useState('50');
    const [expiresAt, setExpiresAt] = useState('');
    
    const [copiedToken, setCopiedToken] = useState<string | null>(null);
    
    const { isOpen: isCreateModalOpen, onOpen: onCreateModalOpen, onClose: onCreateModalClose } = useDisclosure();
    const { isOpen: isEditModalOpen, onOpen: onEditModalOpen, onClose: onEditModalClose } = useDisclosure();
    const { isOpen: isRevokeModalOpen, onOpen: onRevokeModalOpen, onClose: onRevokeModalClose } = useDisclosure();
    const { isOpen: isRevokeAllModalOpen, onOpen: onRevokeAllModalOpen, onClose: onRevokeAllModalClose } = useDisclosure();
    const { isOpen: isUrlModalOpen, onOpen: onUrlModalOpen, onClose: onUrlModalClose } = useDisclosure();
    const [generatedUrl, setGeneratedUrl] = useState('');

    const loadTokens = async () => {
        setIsLoading(true);
        try {
            const data = await rssFeed.getTokens();
            setTokens(data);
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
        loadTokens();
    }, []);

    const handleCreateToken = async () => {
        try {
            const request: CreateRssFeedTokenRequest = {
                feedType,
                name: tokenName || null,
                categoryFilter: categoryFilter.length > 0 ? categoryFilter : null,
                maxResults: parseInt(maxResults) || 50,
                expiresAt: expiresAt || null,
            };
            
            const response = await rssFeed.createToken(request);
            addToast({ 
                title: t('create_success'),
                color: 'success' 
            });
            
            // 显示生成的RSS URL
            setGeneratedUrl(response.rssUrl);
            onCreateModalClose();
            onUrlModalOpen();
            
            // 重置表单
            setTokenName('');
            setFeedType(RssFeedType.Latest);
            setCategoryFilter([]);
            setMaxResults('50');
            setExpiresAt('');
            
            await loadTokens();
        } catch (error) {
            addToast({ 
                title: t('create_error'),
                description: (error as Error).message,
                color: 'danger' 
            });
        }
    };

    const handleEditClick = (token: RssFeedTokenDto) => {
        setEditTarget(token);
        setTokenName(token.name || '');
        setFeedType(token.feedType);
        // categoryFilter 现在直接是数组，不需要 JSON.parse
        setCategoryFilter(token.categoryFilter || []);
        setMaxResults(token.maxResults.toString());
        setExpiresAt(token.expiresAt ? new Date(token.expiresAt).toISOString().slice(0, 16) : '');
        onEditModalOpen();
    };

    const handleConfirmEdit = async () => {
        if (!editTarget) return;

        try {
            const request: CreateRssFeedTokenRequest = {
                feedType,
                name: tokenName || null,
                categoryFilter: categoryFilter.length > 0 ? categoryFilter : null,
                maxResults: parseInt(maxResults) || 50,
                expiresAt: expiresAt || null,
            };
            
            await rssFeed.updateToken(editTarget.id, request);
            addToast({
                title: t('edit_success'),
                color: 'success'
            });
            
            onEditModalClose();
            
            // 重置表单
            setTokenName('');
            setFeedType(RssFeedType.Latest);
            setCategoryFilter([]);
            setMaxResults('50');
            setExpiresAt('');
            
            await loadTokens();
        } catch (error) {
            addToast({
                title: t('edit_error'),
                description: (error as Error).message,
                color: 'danger'
            });
        }
    };

    const handleRevokeClick = (token: RssFeedTokenDto) => {
        setRevokeTarget(token);
        onRevokeModalOpen();
    };

    const handleConfirmRevoke = async () => {
        if (!revokeTarget) return;

        try {
            await rssFeed.revokeToken(revokeTarget.id);
            addToast({ 
                title: t('revoke_success'),
                color: 'success' 
            });
            await loadTokens();
            onRevokeModalClose();
        } catch (error) {
            addToast({ 
                title: t('revoke_error'),
                description: (error as Error).message,
                color: 'danger' 
            });
        }
    };

    const handleConfirmRevokeAll = async () => {
        try {
            await rssFeed.revokeAll();
            addToast({ 
                title: t('revoke_all_success'),
                color: 'success' 
            });
            await loadTokens();
            onRevokeAllModalClose();
        } catch (error) {
            addToast({ 
                title: t('revoke_all_error'),
                description: (error as Error).message,
                color: 'danger' 
            });
        }
    };

    const copyToClipboard = async (text: string, tokenId: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedToken(tokenId);
            addToast({ 
                title: t('copy_success'),
                color: 'success' 
            });
            setTimeout(() => setCopiedToken(null), 2000);
        } catch (error) {
            addToast({ 
                title: t('copy_error'),
                color: 'danger' 
            });
        }
    };

    const formatDate = (dateString: string | null) => {
        return dateString ? new Date(dateString).toLocaleString() : t('never');
    };

    // 格式化相对时间
    const formatRelativeTime = (dateString: string | null): string => {
        if (!dateString) return t('never');
        
        const now = new Date();
        const date = new Date(dateString);
        const diffMs = now.getTime() - date.getTime();
        const diffMinutes = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);
        
        if (diffMinutes < 1) return t('time.just_now');
        if (diffMinutes < 60) return t('time.minutes_ago', { count: diffMinutes });
        if (diffHours < 24) return t('time.hours_ago', { count: diffHours });
        return t('time.days_ago', { count: diffDays });
    };

    // 将数字枚举转换为翻译键
    const getFeedTypeTranslation = (type: RssFeedType): string => {
        return t(`feed_types.${RssFeedType[type].toLowerCase()}`);
    };

    const activeCount = tokens.filter(t => t.isActive).length;

    return (
        <Card>
            <CardHeader className="flex flex-col items-start gap-2">
                <div className="flex justify-between items-center w-full">
                    <div>
                        <h2 className="text-xl font-semibold">{t('title')}</h2>
                        <p className="text-sm text-default-500 mt-1">{t('description')}</p>
                    </div>
                    <div className="flex gap-2">
                        <Button 
                            color="primary" 
                            onPress={onCreateModalOpen}
                        >
                            {t('create_button')}
                        </Button>
                        <Button 
                            color="danger" 
                            variant="flat"
                            onPress={onRevokeAllModalOpen}
                            isDisabled={activeCount === 0}
                        >
                            {t('revoke_all_button')}
                        </Button>
                    </div>
                </div>
                <div className="flex gap-4 text-sm">
                    <span>{t('total_tokens', { count: tokens.length })}</span>
                    <span className="text-success">{t('active_tokens', { count: activeCount })}</span>
                </div>
            </CardHeader>
            <CardBody>
                {isLoading ? (
                    <p className="text-center py-8">{t('loading')}</p>
                ) : tokens.length === 0 ? (
                    <p className="text-center py-8 text-default-500">{t('no_tokens')}</p>
                ) : (
                    <Table aria-label="RSS Tokens table">
                        <TableHeader>
                            <TableColumn>{t('table.name')}</TableColumn>
                            <TableColumn>{t('table.feed_type')}</TableColumn>
                            <TableColumn>{t('table.usage')}</TableColumn>
                            <TableColumn>{t('table.created_at')}</TableColumn>
                            <TableColumn>{t('table.status')}</TableColumn>
                            <TableColumn>{t('table.actions')}</TableColumn>
                        </TableHeader>
                        <TableBody>
                            {tokens.map((token) => {
                                const rssUrl = rssFeed.getFeedUrl(token.token);
                                return (
                                    <TableRow key={token.id}>
                                        <TableCell>
                                            <div>
                                                <div className="font-semibold">{token.name || t('unnamed_token')}</div>
                                                {token.categoryFilter && token.categoryFilter.length > 0 && (
                                                    <div className="text-xs text-default-500">
                                                        {t('categories')}: {token.categoryFilter.join(', ')}
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>{getFeedTypeTranslation(token.feedType)}</TableCell>
                                        <TableCell>
                                            <Tooltip content={
                                                <div className="px-1 py-2">
                                                    <div className="text-small font-bold">{t('details.usage_stats')}</div>
                                                    <div className="text-tiny mt-1">
                                                        <div>{t('details.usage_count')}: {token.usageCount}</div>
                                                        <div>{t('details.last_used')}: {token.lastUsedAt ? formatDate(token.lastUsedAt) : t('never')}</div>
                                                        {token.userAgent && <div>{t('details.client')}: {token.userAgent}</div>}
                                                        {token.lastIp && <div>{t('details.ip')}: {token.lastIp}</div>}
                                                    </div>
                                                </div>
                                            }>
                                                <div className="text-sm cursor-help">
                                                    <div>{t('used_count', { count: token.usageCount })}</div>
                                                    <div className="text-xs text-default-500">
                                                        <div>{token.lastUsedAt ? formatRelativeTime(token.lastUsedAt) : t('never')}</div>
                                                        {token.userAgent && <div>{token.userAgent.split('/')[0]}</div>}
                                                    </div>
                                                </div>
                                            </Tooltip>
                                        </TableCell>
                                        <TableCell>{formatDate(token.createdAt)}</TableCell>
                                        <TableCell>
                                            {!token.isActive ? (
                                                <Chip color="danger" size="sm">
                                                    {t('status.revoked')}
                                                </Chip>
                                            ) : token.expiresAt && new Date(token.expiresAt) < new Date() ? (
                                                <Chip color="warning" size="sm">
                                                    {t('status.expired')}
                                                </Chip>
                                            ) : (
                                                <Chip color="success" size="sm">
                                                    {t('status.active')}
                                                </Chip>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-2">
                                                <Tooltip content={t('copy_url')}>
                                                    <Button
                                                        size="sm"
                                                        variant="flat"
                                                        isIconOnly
                                                        onPress={() => copyToClipboard(rssUrl, token.token)}
                                                    >
                                                        {copiedToken === token.token ? (
                                                            <CheckIcon className="w-4 h-4" />
                                                        ) : (
                                                            <ClipboardIcon className="w-4 h-4" />
                                                        )}
                                                    </Button>
                                                </Tooltip>
                                                {token.isActive && (
                                                    <>
                                                        <Button
                                                            size="sm"
                                                            color="primary"
                                                            variant="flat"
                                                            onPress={() => handleEditClick(token)}
                                                        >
                                                            {t('edit_button')}
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            color="danger"
                                                            variant="flat"
                                                            onPress={() => handleRevokeClick(token)}
                                                        >
                                                            {t('revoke_button')}
                                                        </Button>
                                                    </>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                )}
            </CardBody>

            {/* 创建Token模态框 */}
            <Modal
                isOpen={isCreateModalOpen}
                onClose={onCreateModalClose}
                size="2xl"
                scrollBehavior="inside"
                placement="center"
            >
                <ModalHeader>{t('create_modal.title')}</ModalHeader>
                <ModalBody>
                    <div className="space-y-4">
                        <Input
                            label={t('create_modal.name_label')}
                            placeholder={t('create_modal.name_placeholder')}
                            value={tokenName}
                            onValueChange={setTokenName}
                        />
                        
                        <Select
                            label={t('create_modal.feed_type_label')}
                            selectedKeys={[feedType.toString()]}
                            onChange={(e) => setFeedType(parseInt(e.target.value) as RssFeedType)}
                        >
                            <SelectItem key={RssFeedType.Latest.toString()}>{t('feed_types.latest')}</SelectItem>
                            <SelectItem key={RssFeedType.Category.toString()}>{t('feed_types.category')}</SelectItem>
                            <SelectItem key={RssFeedType.Bookmarks.toString()}>{t('feed_types.bookmarks')}</SelectItem>
                            <SelectItem key={RssFeedType.Custom.toString()}>{t('feed_types.custom')}</SelectItem>
                        </Select>
                        
                        <Input
                            label={t('create_modal.max_results_label')}
                            type="number"
                            value={maxResults}
                            onValueChange={setMaxResults}
                            min="10"
                            max="100"
                        />
                        
                        <Input
                            label={t('create_modal.expires_at_label')}
                            type="datetime-local"
                            value={expiresAt}
                            onValueChange={setExpiresAt}
                            description={t('create_modal.expires_at_description')}
                        />
                    </div>
                </ModalBody>
                <ModalFooter>
                    <Button variant="ghost" onPress={onCreateModalClose}>
                        {t('create_modal.cancel')}
                    </Button>
                    <Button color="primary" onPress={handleCreateToken}>
                        {t('create_modal.confirm')}
                    </Button>
                </ModalFooter>
            </Modal>

            {/* 编辑Token模态框 */}
            <Modal
                isOpen={isEditModalOpen}
                onClose={onEditModalClose}
                size="2xl"
                scrollBehavior="inside"
                placement="center"
            >
                <ModalHeader>{t('edit_modal.title')}</ModalHeader>
                <ModalBody>
                    <div className="space-y-4">
                        <Input
                            label={t('edit_modal.name_label')}
                            placeholder={t('edit_modal.name_placeholder')}
                            value={tokenName}
                            onValueChange={setTokenName}
                        />
                        
                        <Select
                            label={t('edit_modal.feed_type_label')}
                            selectedKeys={[feedType.toString()]}
                            onChange={(e) => setFeedType(parseInt(e.target.value) as RssFeedType)}
                        >
                            <SelectItem key={RssFeedType.Latest.toString()}>{t('feed_types.latest')}</SelectItem>
                            <SelectItem key={RssFeedType.Category.toString()}>{t('feed_types.category')}</SelectItem>
                            <SelectItem key={RssFeedType.Bookmarks.toString()}>{t('feed_types.bookmarks')}</SelectItem>
                            <SelectItem key={RssFeedType.Custom.toString()}>{t('feed_types.custom')}</SelectItem>
                        </Select>
                        
                        <Input
                            label={t('edit_modal.max_results_label')}
                            type="number"
                            value={maxResults}
                            onValueChange={setMaxResults}
                            min="10"
                            max="100"
                        />
                        
                        <Input
                            label={t('edit_modal.expires_at_label')}
                            type="datetime-local"
                            value={expiresAt}
                            onValueChange={setExpiresAt}
                            description={t('edit_modal.expires_at_description')}
                        />
                    </div>
                </ModalBody>
                <ModalFooter>
                    <Button variant="ghost" onPress={onEditModalClose}>
                        {t('edit_modal.cancel')}
                    </Button>
                    <Button color="primary" onPress={handleConfirmEdit}>
                        {t('edit_modal.confirm')}
                    </Button>
                </ModalFooter>
            </Modal>

            {/* 显示RSS URL模态框 */}
            <Modal
                isOpen={isUrlModalOpen}
                onClose={onUrlModalClose}
                size="2xl"
                scrollBehavior="inside"
                placement="center"
            >
                <ModalHeader>{t('url_modal.title')}</ModalHeader>
                <ModalBody>
                    <p className="mb-4">{t('url_modal.description')}</p>
                    <div className="bg-default-100 p-4 rounded-lg break-all font-mono text-sm">
                        {generatedUrl}
                    </div>
                    <Button 
                        className="mt-4" 
                        color="primary" 
                        onPress={() => copyToClipboard(generatedUrl, 'generated')}
                        startContent={<ClipboardIcon className="w-4 h-4" />}
                    >
                        {t('url_modal.copy_button')}
                    </Button>
                </ModalBody>
                <ModalFooter>
                    <Button onPress={onUrlModalClose}>
                        {t('url_modal.close')}
                    </Button>
                </ModalFooter>
            </Modal>

            {/* 撤销单个Token确认模态框 */}
            <Modal
                isOpen={isRevokeModalOpen}
                onClose={onRevokeModalClose}
                scrollBehavior="inside"
                placement="center"
            >
                <ModalHeader>{t('revoke_modal.title')}</ModalHeader>
                <ModalBody>
                    <p>{t('revoke_modal.description')}</p>
                    {revokeTarget && (
                        <p className="mt-2 font-semibold">{revokeTarget.name || t('unnamed_token')}</p>
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

            {/* 撤销所有Tokens确认模态框 */}
            <Modal
                isOpen={isRevokeAllModalOpen}
                onClose={onRevokeAllModalClose}
                scrollBehavior="inside"
                placement="center"
            >
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
        </Card>
    );
}