'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { requests, RequestDto, RequestStatus, requestComments, RequestCommentDto, CreateRequestCommentDto, UserDisplayDto, UserRole } from '@/lib/api';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Card, CardContent, CardHeader, CardFooter, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from '@/context/AuthContext';
import UserDisplay from '@/app/[locale]/components/UserDisplay';
import RequestCommentTree from '@/app/[locale]/components/RequestCommentTree';
import ReplyEditor from '@/app/[locale]/components/ReplyEditor';
import { toast } from 'sonner';

const RequestDetailPage = () => {
    const params = useParams();
    const requestId = Number(params.requestId);

    const t = useTranslations();
    const [request, setRequest] = useState<RequestDto | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuth();
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');

    const [bountyAmount, setBountyAmount] = useState('');
    const [torrentId, setTorrentId] = useState('');

    // 评论相关状态
    const [comments, setComments] = useState<RequestCommentDto[]>([]);
    const [commentsLoading, setCommentsLoading] = useState(false);
    const [hasMoreComments, setHasMoreComments] = useState(false);
    const [isSubmittingComment, setIsSubmittingComment] = useState(false);
    const [isDeletingComment, setIsDeletingComment] = useState(false);
    const [isEditingComment, setIsEditingComment] = useState(false);
    const [replyTarget, setReplyTarget] = useState<{ parentId: number; user: UserDisplayDto } | null>(null);

    const fetchRequestDetails = useCallback(async () => {
        if (!requestId) return;
        try {
            setIsLoading(true);
            const data = await requests.getRequestById(requestId);
            setRequest(data);
            setError(null);
        } catch (err) {
            setError(t('requestsPage.error_fetching_details'));
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [requestId, t]);

    // 获取评论列表
    const fetchComments = useCallback(async (afterFloor: number = 0) => {
        if (!requestId) return;
        try {
            setCommentsLoading(true);
            const data = await requestComments.getComments(requestId, afterFloor, 30);
            
            if (afterFloor === 0) {
                setComments(data.items);
            } else {
                setComments(prev => [...prev, ...data.items]);
            }
            setHasMoreComments(data.hasMore);
        } catch (err) {
            console.error('Error fetching comments:', err);
        } finally {
            setCommentsLoading(false);
        }
    }, [requestId]);

    useEffect(() => {
        fetchRequestDetails();
        fetchComments();
    }, [fetchRequestDetails, fetchComments]);

    // 加载更多评论
    const handleLoadMoreComments = () => {
        if (comments.length > 0) {
            const lastFloor = Math.max(...comments.map(c => c.floor));
            fetchComments(lastFloor);
        }
    };

    // 提交新评论（顶层）
    const handleSubmitTopLevelComment = async (data: CreateRequestCommentDto) => {
        try {
            setIsSubmittingComment(true);
            await requestComments.createComment(requestId, data);
            await fetchComments(0); // 重新加载评论列表
            toast.success(t('reply.submit_success'));
        } catch (err) {
            console.error('Error submitting comment:', err);
            toast.error(t('reply.submit_failed'));
        } finally {
            setIsSubmittingComment(false);
        }
    };

    // 提交回复评论
    const handleSubmitReply = async (data: CreateRequestCommentDto) => {
        try {
            setIsSubmittingComment(true);
            await requestComments.createComment(requestId, data);
            await fetchComments(0); // 重新加载评论列表
            toast.success(t('reply.submit_success'));
        } catch (err) {
            console.error('Error submitting reply:', err);
            toast.error(t('reply.submit_failed'));
        } finally {
            setIsSubmittingComment(false);
        }
    };

    // 编辑评论
    const handleEditComment = async (commentId: number, newContent: string) => {
        try {
            setIsEditingComment(true);
            await requestComments.updateComment(commentId, { content: newContent });
            await fetchComments(0); // 重新加载评论列表
            toast.success(t('reply.edit_success'));
        } catch (err) {
            console.error('Error editing comment:', err);
            toast.error(t('reply.edit_failed'));
            throw err; // 重新抛出错误以便组件处理
        } finally {
            setIsEditingComment(false);
        }
    };

    // 删除评论
    const handleDeleteComment = async (commentId: number) => {
        if (!confirm(t('reply.confirm_delete'))) return;
        
        try {
            setIsDeletingComment(true);
            await requestComments.deleteComment(commentId);
            await fetchComments(0); // 重新加载评论列表
            toast.success(t('reply.delete_success'));
        } catch (err) {
            console.error('Error deleting comment:', err);
            toast.error(t('reply.delete_failed'));
        } finally {
            setIsDeletingComment(false);
        }
    };

    // 检查是否可以编辑/删除评论
    const canEditOrDeleteComment = (comment: RequestCommentDto): boolean => {
        if (!user) return false;
        if (user.role === UserRole.Administrator || user.role === UserRole.Moderator) {
            return true;
        }
        if (comment.user?.id === user.id) {
            if (comment.replyCount > 0) return false;
            const createdAt = new Date(comment.createdAt);
            const now = new Date();
            const minutesElapsed = (now.getTime() - createdAt.getTime()) / 1000 / 60;
            return minutesElapsed <= 15;
        }
        return false;
    };

    // 处理回复按钮点击
    const handleReply = (parentId: number, replyToUser: UserDisplayDto) => {
        setReplyTarget({ parentId, user: replyToUser });
    };

    const handleAddBounty = async (e: React.FormEvent) => {
        e.preventDefault();
        const amount = Number(bountyAmount);
        if (amount > 0) {
            try {
                await requests.addBounty(requestId, { amount });
                setBountyAmount('');
                await fetchRequestDetails();
                toast.success(t('requestsPage.bounty_added_success'));
            } catch (err) {
                toast.error(t('requestsPage.error_adding_bounty'));
                console.error(err);
            }
        }
    };

    const handleFillRequest = async (e: React.FormEvent) => {
        e.preventDefault();
        const id = Number(torrentId);
        if (id > 0) {
            try {
                await requests.fillRequest(requestId, { torrentId: id });
                setTorrentId('');
                await fetchRequestDetails();
                toast.success(t('requestsPage.fill_success'));
            } catch (err) {
                toast.error(t('requestsPage.error_filling'));
                console.error(err);
            }
        }
    };

    const handleConfirm = async () => {
        try {
            await requests.confirm(requestId);
            await fetchRequestDetails();
            toast.success(t('requestsPage.confirm_success'));
        } catch (err) {
            toast.error(t('requestsPage.error_confirming'));
            console.error(err);
        }
    };

    const handleReject = async () => {
        if (!rejectionReason.trim()) {
            toast.warning(t('requestsPage.rejection_reason_required'));
            return;
        }
        try {
            await requests.reject(requestId, { reason: rejectionReason });
            setRejectionReason('');
            setIsRejectModalOpen(false);
            await fetchRequestDetails();
            toast.success(t('requestsPage.reject_success'));
        } catch (err) {
            toast.error(t('requestsPage.error_rejecting'));
            console.error(err);
        }
    };

    const getStatusBadgeVariant = (status: RequestStatus): "default" | "secondary" | "destructive" | "outline" | null | undefined => {
        switch (status) {
            case RequestStatus.Filled:
                return 'default'; // Mapped to default
            case RequestStatus.PendingConfirmation:
                return 'default';
            case RequestStatus.Rejected:
                return 'destructive';
            case RequestStatus.Pending:
                return 'secondary'; // Mapped to secondary
            default:
                return 'secondary';
        }
    };

    if (isLoading) {
        return <div className="text-center py-20">{t('common.loading')}...</div>;
    }

    if (error) {
        return <div className="text-center py-20 text-destructive">{error}</div>;
    }

    if (!request) {
        return <div className="text-center py-20">{t('requestsPage.not_found')}</div>;
    }

    return (
        <div className="container mx-auto p-4 sm:p-6 space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl sm:text-3xl">{request.title}</CardTitle>
                    <div className="text-sm text-muted-foreground flex items-center gap-1 pt-2">
                        <UserDisplay user={request.requestedByUser} />
                        <span>- {new Date(request.createdAt).toLocaleString()}</span>
                    </div>
                </CardHeader>
                <CardContent>
                    <h2 className="text-xl font-semibold mb-3">{t('common.description')}</h2>
                    <p className="text-foreground whitespace-pre-wrap">{request.description}</p>
                </CardContent>
                <div className="border-t" />
                <CardFooter className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center pt-6">
                    <div>
                        <h3 className="font-semibold text-muted-foreground">{t('requestsPage.status')}</h3>
                        <Badge variant={getStatusBadgeVariant(request.status)}>
                            {t(`requestsPage.status_${request.status.toLowerCase().replace(/\s/g, '')}`)}
                        </Badge>
                    </div>
                    <div>
                        <h3 className="font-semibold text-muted-foreground">{t('requestsPage.current_bounty')}</h3>
                        <p className="font-bold text-lg text-yellow-500">{request.bountyAmount} Coins</p>
                    </div>
                    {(request.status === RequestStatus.Filled || request.status === RequestStatus.Rejected) && request.filledByUser && (
                         <div>
                            <h3 className="font-semibold text-muted-foreground">{t('requestsPage.filled_by')}</h3>
                            <div className="flex items-center gap-1">
                                <UserDisplay user={request.filledByUser} />
                                {t('requestsPage.with_torrent')} <Link href={`/torrents/${request.filledWithTorrentId}`} className="text-primary hover:underline">#{request.filledWithTorrentId}</Link>
                            </div>
                        </div>
                    )}
                </CardFooter>
            </Card>

            {request.status === RequestStatus.Rejected && request.rejectionReason && (
                <Card>
                    <CardHeader><CardTitle className="text-xl">{t('requestsPage.rejection_reason')}</CardTitle></CardHeader>
                    <CardContent>
                        <p>{request.rejectionReason}</p>
                    </CardContent>
                </Card>
            )}

            {user?.id === request.requestedByUser?.id && request.status === RequestStatus.PendingConfirmation && (
                <Card>
                    <CardHeader><CardTitle className="text-xl">{t('requestsPage.confirmation_actions')}</CardTitle></CardHeader>
                    <CardContent className="flex flex-row gap-4">
                        <Button onClick={handleConfirm}>{t('requestsPage.confirm_fulfillment')}</Button>
                        <Button variant="destructive" onClick={() => setIsRejectModalOpen(true)}>{t('requestsPage.reject_fulfillment')}</Button>
                    </CardContent>
                    <CardFooter>
                        <p className="text-sm text-muted-foreground">{t('requestsPage.confirmation_deadline_notice')}</p>
                    </CardFooter>
                </Card>
            )}

            {request.status !== RequestStatus.Filled && request.status !== RequestStatus.PendingConfirmation && (
                <Card>
                    <CardContent className="space-y-8 pt-6">
                        <form onSubmit={handleAddBounty} className="space-y-4">
                            <h3 className="text-xl font-semibold">{t('requestsPage.add_bounty')}</h3>
                            <FormField
                                type="number"
                                label={t('requestsPage.bounty_amount')}
                                placeholder="e.g., 100"
                                value={bountyAmount}
                                onChange={(e) => setBountyAmount(e.target.value)}
                            />
                            <Button type="submit" variant="secondary">{t('requestsPage.submit_bounty')}</Button>
                        </form>

                        <div className="border-t" />

                        <form onSubmit={handleFillRequest} className="space-y-4">
                            <h3 className="text-xl font-semibold">{t('requestsPage.fill_request')}</h3>
                            <FormField
                                type="number"
                                label={t('requestsPage.torrent_id')}
                                placeholder={t('requestsPage.enter_torrent_id')}
                                value={torrentId}
                                onChange={(e) => setTorrentId(e.target.value)}
                            />
                            <Button type="submit">{t('requestsPage.fill_button')}</Button>
                        </form>
                    </CardContent>
                </Card>
            )}

            <Dialog open={isRejectModalOpen} onOpenChange={setIsRejectModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('requestsPage.reject_fulfillment_reason')}</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <Textarea
                            placeholder={t('requestsPage.rejection_reason_placeholder')}
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            maxLength={500}
                            className="min-h-[100px]"
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsRejectModalOpen(false)}>
                            {t('common.cancel')}
                        </Button>
                        <Button variant="destructive" onClick={handleReject}>
                            {t('requestsPage.submit_rejection')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* 评论区 */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">{t('reply.comments')}</CardTitle>
                </CardHeader>
                <div className="border-t" />
                <CardContent className="space-y-6 pt-6">
                    {/* 评论树 */}
                    <RequestCommentTree
                        comments={comments}
                        onReply={handleReply}
                        onLoadMore={handleLoadMoreComments}
                        hasMore={hasMoreComments}
                        isLoading={commentsLoading}
                        canEdit={canEditOrDeleteComment}
                        canDelete={canEditOrDeleteComment}
                        onEdit={handleEditComment}
                        onDelete={handleDeleteComment}
                        isEditing={isEditingComment}
                        isDeleting={isDeletingComment}
                        onSubmitReply={handleSubmitReply}
                    />

                    {/* 顶层评论输入框 */}
                    {user && (
                        <div className="pt-4 border-t">
                            <h3 className="text-lg font-medium mb-3">{t('reply.add_comment')}</h3>
                            <ReplyEditor
                                onSubmit={handleSubmitTopLevelComment}
                                maxLength={500}
                                isSubmitting={isSubmittingComment}
                            />
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default RequestDetailPage;
