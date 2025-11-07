'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { rssFeed, RssFeedType } from '@/lib/api';
import type { RssFeedTokenDto, CreateRssFeedTokenRequest } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
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
    
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isRevokeModalOpen, setIsRevokeModalOpen] = useState(false);
    const [isRevokeAllModalOpen, setIsRevokeAllModalOpen] = useState(false);
    const [isUrlModalOpen, setIsUrlModalOpen] = useState(false);
    const [generatedUrl, setGeneratedUrl] = useState('');

    const loadTokens = async () => {
        setIsLoading(true);
        try {
            const data = await rssFeed.getTokens();
            setTokens(data);
        } catch (error) {
            toast.error(t('load_error'), {
                description: (error as Error).message
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
            toast.success(t('create_success'));
            
            // 显示生成的RSS URL
            setGeneratedUrl(response.rssUrl);
            setIsCreateModalOpen(false);
            setIsUrlModalOpen(true);
            
            // 重置表单
            setTokenName('');
            setFeedType(RssFeedType.Latest);
            setCategoryFilter([]);
            setMaxResults('50');
            setExpiresAt('');
            
            await loadTokens();
        } catch (error) {
            toast.error(t('create_error'), {
                description: (error as Error).message
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
        setIsEditModalOpen(true);
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
            toast.success(t('edit_success'));
            
            setIsEditModalOpen(false);
            
            // 重置表单
            setTokenName('');
            setFeedType(RssFeedType.Latest);
            setCategoryFilter([]);
            setMaxResults('50');
            setExpiresAt('');
            
            await loadTokens();
        } catch (error) {
            toast.error(t('edit_error'), {
                description: (error as Error).message
            });
        }
    };

    const handleRevokeClick = (token: RssFeedTokenDto) => {
        setRevokeTarget(token);
        setIsRevokeModalOpen(true);
    };

    const handleConfirmRevoke = async () => {
        if (!revokeTarget) return;

        try {
            await rssFeed.revokeToken(revokeTarget.id);
            toast.success(t('revoke_success'));
            await loadTokens();
            setIsRevokeModalOpen(false);
        } catch (error) {
            toast.error(t('revoke_error'), {
                description: (error as Error).message
            });
        }
    };

    const handleConfirmRevokeAll = async () => {
        try {
            await rssFeed.revokeAll();
            toast.success(t('revoke_all_success'));
            await loadTokens();
            setIsRevokeAllModalOpen(false);
        } catch (error) {
            toast.error(t('revoke_all_error'), {
                description: (error as Error).message
            });
        }
    };

    const copyToClipboard = async (text: string, tokenId: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedToken(tokenId);
            toast.success(t('copy_success'));
            setTimeout(() => setCopiedToken(null), 2000);
        } catch (error) {
            toast.error(t('copy_error'));
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
            <CardHeader>
                <div className="flex justify-between items-center w-full">
                    <div>
                        <CardTitle>{t('title')}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">{t('description')}</p>
                    </div>
                    <div className="flex gap-2">
                        <Button onClick={() => setIsCreateModalOpen(true)}>
                            {t('create_button')}
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => setIsRevokeAllModalOpen(true)}
                            disabled={activeCount === 0}
                        >
                            {t('revoke_all_button')}
                        </Button>
                    </div>
                </div>
                <div className="flex gap-4 text-sm mt-2">
                    <span>{t('total_tokens', { count: tokens.length })}</span>
                    <span className="text-green-600">{t('active_tokens', { count: activeCount })}</span>
                </div>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <p className="text-center py-8">{t('loading')}</p>
                ) : tokens.length === 0 ? (
                    <p className="text-center py-8 text-default-500">{t('no_tokens')}</p>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>{t('table.name')}</TableHead>
                                <TableHead>{t('table.feed_type')}</TableHead>
                                <TableHead>{t('table.usage')}</TableHead>
                                <TableHead>{t('table.created_at')}</TableHead>
                                <TableHead>{t('table.status')}</TableHead>
                                <TableHead>{t('table.actions')}</TableHead>
                            </TableRow>
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
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <div className="text-sm cursor-help">
                                                            <div>{t('used_count', { count: token.usageCount })}</div>
                                                            <div className="text-xs text-muted-foreground">
                                                                <div>{token.lastUsedAt ? formatRelativeTime(token.lastUsedAt) : t('never')}</div>
                                                                {token.userAgent && <div>{token.userAgent.split('/')[0]}</div>}
                                                            </div>
                                                        </div>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <div className="px-1 py-2">
                                                            <div className="text-sm font-bold">{t('details.usage_stats')}</div>
                                                            <div className="text-xs mt-1">
                                                                <div>{t('details.usage_count')}: {token.usageCount}</div>
                                                                <div>{t('details.last_used')}: {token.lastUsedAt ? formatDate(token.lastUsedAt) : t('never')}</div>
                                                                {token.userAgent && <div>{t('details.client')}: {token.userAgent}</div>}
                                                                {token.lastIp && <div>{t('details.ip')}: {token.lastIp}</div>}
                                                            </div>
                                                        </div>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        </TableCell>
                                        <TableCell>{formatDate(token.createdAt)}</TableCell>
                                        <TableCell>
                                            {!token.isActive ? (
                                                <Badge variant="destructive">
                                                    {t('status.revoked')}
                                                </Badge>
                                            ) : token.expiresAt && new Date(token.expiresAt) < new Date() ? (
                                                <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                                                    {t('status.expired')}
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline" className="text-green-600 border-green-600">
                                                    {t('status.active')}
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-2">
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                onClick={() => copyToClipboard(rssUrl, token.token)}
                                                            >
                                                                {copiedToken === token.token ? (
                                                                    <CheckIcon className="w-4 h-4" />
                                                                ) : (
                                                                    <ClipboardIcon className="w-4 h-4" />
                                                                )}
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>{t('copy_url')}</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                                {token.isActive && (
                                                    <>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => handleEditClick(token)}
                                                        >
                                                            {t('edit_button')}
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="destructive"
                                                            onClick={() => handleRevokeClick(token)}
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
            </CardContent>

            {/* 创建Token模态框 */}
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{t('create_modal.title')}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>{t('create_modal.name_label')}</Label>
                            <Input
                                placeholder={t('create_modal.name_placeholder')}
                                value={tokenName}
                                onChange={(e) => setTokenName(e.target.value)}
                            />
                        </div>
                        
                        <div className="space-y-2">
                            <Label>{t('create_modal.feed_type_label')}</Label>
                            <Select value={feedType.toString()} onValueChange={(val) => setFeedType(parseInt(val) as RssFeedType)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={RssFeedType.Latest.toString()}>{t('feed_types.latest')}</SelectItem>
                                    <SelectItem value={RssFeedType.Category.toString()}>{t('feed_types.category')}</SelectItem>
                                    <SelectItem value={RssFeedType.Bookmarks.toString()}>{t('feed_types.bookmarks')}</SelectItem>
                                    <SelectItem value={RssFeedType.Custom.toString()}>{t('feed_types.custom')}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        
                        <div className="space-y-2">
                            <Label>{t('create_modal.max_results_label')}</Label>
                            <Input
                                type="number"
                                value={maxResults}
                                onChange={(e) => setMaxResults(e.target.value)}
                                min="10"
                                max="100"
                            />
                        </div>
                        
                        <div className="space-y-2">
                            <Label>{t('create_modal.expires_at_label')}</Label>
                            <Input
                                type="datetime-local"
                                value={expiresAt}
                                onChange={(e) => setExpiresAt(e.target.value)}
                            />
                            <p className="text-sm text-muted-foreground">{t('create_modal.expires_at_description')}</p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsCreateModalOpen(false)}>
                            {t('create_modal.cancel')}
                        </Button>
                        <Button onClick={handleCreateToken}>
                            {t('create_modal.confirm')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* 编辑Token模态框 */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{t('edit_modal.title')}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>{t('edit_modal.name_label')}</Label>
                            <Input
                                placeholder={t('edit_modal.name_placeholder')}
                                value={tokenName}
                                onChange={(e) => setTokenName(e.target.value)}
                            />
                        </div>
                        
                        <div className="space-y-2">
                            <Label>{t('edit_modal.feed_type_label')}</Label>
                            <Select value={feedType.toString()} onValueChange={(val) => setFeedType(parseInt(val) as RssFeedType)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={RssFeedType.Latest.toString()}>{t('feed_types.latest')}</SelectItem>
                                    <SelectItem value={RssFeedType.Category.toString()}>{t('feed_types.category')}</SelectItem>
                                    <SelectItem value={RssFeedType.Bookmarks.toString()}>{t('feed_types.bookmarks')}</SelectItem>
                                    <SelectItem value={RssFeedType.Custom.toString()}>{t('feed_types.custom')}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        
                        <div className="space-y-2">
                            <Label>{t('edit_modal.max_results_label')}</Label>
                            <Input
                                type="number"
                                value={maxResults}
                                onChange={(e) => setMaxResults(e.target.value)}
                                min="10"
                                max="100"
                            />
                        </div>
                        
                        <div className="space-y-2">
                            <Label>{t('edit_modal.expires_at_label')}</Label>
                            <Input
                                type="datetime-local"
                                value={expiresAt}
                                onChange={(e) => setExpiresAt(e.target.value)}
                            />
                            <p className="text-sm text-muted-foreground">{t('edit_modal.expires_at_description')}</p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsEditModalOpen(false)}>
                            {t('edit_modal.cancel')}
                        </Button>
                        <Button onClick={handleConfirmEdit}>
                            {t('edit_modal.confirm')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* 显示RSS URL模态框 */}
            <Dialog open={isUrlModalOpen} onOpenChange={setIsUrlModalOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{t('url_modal.title')}</DialogTitle>
                    </DialogHeader>
                    <p className="mb-4">{t('url_modal.description')}</p>
                    <div className="bg-secondary p-4 rounded-lg break-all font-mono text-sm">
                        {generatedUrl}
                    </div>
                    <Button
                        className="mt-4 w-full"
                        onClick={() => copyToClipboard(generatedUrl, 'generated')}
                    >
                        <ClipboardIcon className="w-4 h-4 mr-2" />
                        {t('url_modal.copy_button')}
                    </Button>
                    <DialogFooter>
                        <Button onClick={() => setIsUrlModalOpen(false)}>
                            {t('url_modal.close')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* 撤销单个Token确认模态框 */}
            <Dialog open={isRevokeModalOpen} onOpenChange={setIsRevokeModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('revoke_modal.title')}</DialogTitle>
                    </DialogHeader>
                    <p>{t('revoke_modal.description')}</p>
                    {revokeTarget && (
                        <p className="mt-2 font-semibold">{revokeTarget.name || t('unnamed_token')}</p>
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

            {/* 撤销所有Tokens确认模态框 */}
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
        </Card>
    );
}