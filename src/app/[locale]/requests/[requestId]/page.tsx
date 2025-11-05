'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { requests, RequestDto, RequestStatus, requestComments, RequestCommentDto, CreateRequestCommentDto, UserDisplayDto, UserRole } from '@/lib/api';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Card, CardBody, CardHeader, CardFooter } from "@heroui/card";
import {Divider} from "@heroui/divider";
import { Button } from "@heroui/button";
import { Input, Textarea } from "@heroui/input";
import { Chip } from "@heroui/chip";
import { useAuth } from '@/context/AuthContext';
import {Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure} from "@heroui/modal";
import UserDisplay from '@/app/[locale]/components/UserDisplay';
import RequestCommentTree from '@/app/[locale]/components/RequestCommentTree';
import ReplyEditor from '@/app/[locale]/components/ReplyEditor';

const RequestDetailPage = () => {
    const params = useParams();
    const requestId = Number(params.requestId);

    const t = useTranslations();
    const [request, setRequest] = useState<RequestDto | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuth();
    const {isOpen, onOpen, onOpenChange} = useDisclosure();
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
        } catch (err) {
            console.error('Error submitting comment:', err);
            alert(t('reply.submit_failed'));
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
        } catch (err) {
            console.error('Error submitting reply:', err);
            alert(t('reply.submit_failed'));
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
        } catch (err) {
            console.error('Error editing comment:', err);
            alert(t('reply.edit_failed'));
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
        } catch (err) {
            console.error('Error deleting comment:', err);
            alert(t('reply.delete_failed'));
        } finally {
            setIsDeletingComment(false);
        }
    };

    // 检查是否可以编辑/删除评论（根据API文档的权限规则）
    const canEditOrDeleteComment = (comment: RequestCommentDto): boolean => {
        if (!user) return false;
        
        // 管理员可以编辑/删除任何评论
        if (user.role === UserRole.Administrator || user.role === UserRole.Moderator) {
            return true;
        }
        
        // 作者只能编辑/删除自己的、无回复的、15分钟内的评论
        if (comment.user?.id === user.id) {
            if (comment.replyCount > 0) return false;
            
            const createdAt = new Date(comment.createdAt);
            const now = new Date();
            const minutesElapsed = (now.getTime() - createdAt.getTime()) / 1000 / 60;
            
            return minutesElapsed <= 15; // 15分钟时间窗口
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
            } catch (err) {
                alert(t('requestsPage.error_adding_bounty'));
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
            } catch (err) {
                alert(t('requestsPage.error_filling'));
                console.error(err);
            }
        }
    };

    const handleConfirm = async () => {
        try {
            await requests.confirm(requestId);
            await fetchRequestDetails();
        } catch (err) {
            alert(t('requestsPage.error_confirming'));
            console.error(err);
        }
    };

    const handleReject = async () => {
        if (!rejectionReason.trim()) {
            alert(t('requestsPage.rejection_reason_required'));
            return;
        }
        try {
            await requests.reject(requestId, { reason: rejectionReason });
            setRejectionReason('');
            onOpenChange(); // Close modal
            await fetchRequestDetails();
        } catch (err) {
            alert(t('requestsPage.error_rejecting'));
            console.error(err);
        }
    };

    const inputClassNames = {
        inputWrapper: "bg-transparent border shadow-sm border-default-300/50 hover:border-default-400",
    };

    if (isLoading) {
        return <div className="text-center py-20">{t('common.loading')}...</div>;
    }

    if (error) {
        return <div className="text-center py-20 text-danger">{error}</div>;
    }

    if (!request) {
        return <div className="text-center py-20">{t('requestsPage.not_found')}</div>;
    }

    return (
        <div className="container mx-auto p-4 sm:p-6 space-y-8">
            <Card>
                <CardHeader className="flex flex-col items-start gap-2">
                    <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{request.title}</h1>
                    <div className="text-sm text-default-500 flex items-center gap-1">
                        <UserDisplay user={request.requestedByUser} />
                        <span>- {new Date(request.createdAt).toLocaleString()}</span>
                    </div>
                </CardHeader>
                <CardBody>
                    <h2 className="text-xl font-semibold mb-3">{t('common.description')}</h2>
                    <p className="text-default-700 whitespace-pre-wrap">{request.description}</p>
                </CardBody>
                <Divider />
                <CardFooter className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                    <div>
                        <h3 className="font-semibold text-default-500">{t('requestsPage.status')}</h3>
                        <Chip
                            color={request.status === RequestStatus.Filled ? "success" : request.status === RequestStatus.PendingConfirmation ? "primary" : request.status === RequestStatus.Rejected ? "danger" : "warning"}
                            size="md"
                            variant="flat"
                        >
                            {t(`requestsPage.status_${request.status.toLowerCase().replace(/\s/g, '')}`)}
                        </Chip>
                    </div>
                    <div>
                        <h3 className="font-semibold text-default-500">{t('requestsPage.current_bounty')}</h3>
                        <p className="font-bold text-lg text-warning">{request.bountyAmount} Coins</p>
                    </div>
                    {(request.status === RequestStatus.Filled || request.status === RequestStatus.Rejected) && request.filledByUser && (
                         <div>
                            <h3 className="font-semibold text-default-500">{t('requestsPage.filled_by')}</h3>
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
                    <CardHeader><h3 className="text-xl font-semibold">{t('requestsPage.rejection_reason')}</h3></CardHeader>
                    <CardBody>
                        <p>{request.rejectionReason}</p>
                    </CardBody>
                </Card>
            )}

            {user?.id === request.requestedByUser?.id && request.status === RequestStatus.PendingConfirmation && (
                <Card>
                    <CardHeader><h3 className="text-xl font-semibold">{t('requestsPage.confirmation_actions')}</h3></CardHeader>
                    <CardBody className="flex flex-row gap-4">
                        <Button color="success" onClick={handleConfirm}>{t('requestsPage.confirm_fulfillment')}</Button>
                        <Button color="danger" onClick={onOpen}>{t('requestsPage.reject_fulfillment')}</Button>
                    </CardBody>
                    <CardFooter>
                        <p className="text-sm text-default-500">{t('requestsPage.confirmation_deadline_notice')}</p>
                    </CardFooter>
                </Card>
            )}

            {request.status !== RequestStatus.Filled && request.status !== RequestStatus.PendingConfirmation && (
                <Card>
                    <CardBody className="space-y-8">
                        <form onSubmit={handleAddBounty} className="space-y-4">
                            <h3 className="text-xl font-semibold">{t('requestsPage.add_bounty')}</h3>
                            <Input
                                type="number"
                                label={t('requestsPage.bounty_amount')}
                                placeholder="e.g., 100"
                                value={bountyAmount}
                                onValueChange={setBountyAmount}
                                labelPlacement="outside"
                                classNames={inputClassNames}
                            />
                            <Button type="submit" color="warning">{t('requestsPage.submit_bounty')}</Button>
                        </form>

                        <Divider />

                        <form onSubmit={handleFillRequest} className="space-y-4">
                            <h3 className="text-xl font-semibold">{t('requestsPage.fill_request')}</h3>
                            <Input
                                type="number"
                                label={t('requestsPage.torrent_id')}
                                placeholder={t('requestsPage.enter_torrent_id')}
                                value={torrentId}
                                onValueChange={setTorrentId}
                                labelPlacement="outside"
                                classNames={inputClassNames}
                            />
                            <Button type="submit" color="success">{t('requestsPage.fill_button')}</Button>
                        </form>
                    </CardBody>
                </Card>
            )}

            <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">{t('requestsPage.reject_fulfillment_reason')}</ModalHeader>
                            <ModalBody>
                                <Textarea
                                    label={t('requestsPage.reason')}
                                    placeholder={t('requestsPage.rejection_reason_placeholder')}
                                    value={rejectionReason}
                                    onValueChange={setRejectionReason}
                                    maxLength={500}
                                />
                            </ModalBody>
                            <ModalFooter>
                                <Button color="danger" variant="light" onClick={onClose}>
                                    {t('common.cancel')}
                                </Button>
                                <Button color="primary" onClick={handleReject}>
                                    {t('requestsPage.submit_rejection')}
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>

            {/* 评论区 */}
            <Card>
                <CardHeader>
                    <h2 className="text-2xl font-semibold">{t('reply.comments')}</h2>
                </CardHeader>
                <Divider />
                <CardBody className="space-y-6">
                    {/* 顶层评论输入框 */}
                    {user && (
                        <div className="pb-4 border-b border-default-200">
                            <h3 className="text-lg font-medium mb-3">{t('reply.add_comment')}</h3>
                            <ReplyEditor
                                onSubmit={handleSubmitTopLevelComment}
                                maxLength={500}
                                isSubmitting={isSubmittingComment}
                            />
                        </div>
                    )}

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
                </CardBody>
            </Card>
        </div>
    );
};

export default RequestDetailPage;
