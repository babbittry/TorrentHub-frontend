'use client';

import { useEffect, useState, useCallback } from "react";
import { torrents, comments, TorrentDto, CommentDto, CreateCommentDto, COMMENT_TYPE } from "@/lib/api";
import { useParams } from "next/navigation";
import { useTranslations } from 'next-intl';
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import UserDisplay from "@/app/[locale]/components/UserDisplay";
import TipModal from "@/app/[locale]/components/TipModal";
import TorrentCommentTree from "@/app/[locale]/components/TorrentCommentTree";
import ReplyEditor from "@/app/[locale]/components/ReplyEditor";

// Import new components
import TorrentHeader from "./components/TorrentHeader";
import TorrentInfoCard from "./components/TorrentInfoCard";
import TorrentTabs from "./components/TorrentTabs";

export default function TorrentDetailPage() {
    const { torrentId } = useParams();
    const [torrent, setTorrent] = useState<TorrentDto | null>(null);
    const [torrentComments, setComments] = useState<CommentDto[]>([]);
    const [commentsCount, setCommentsCount] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [lastFloor, setLastFloor] = useState<number>(0);
    const [hasMore, setHasMore] = useState<boolean>(true);
    const [loadingMore, setLoadingMore] = useState<boolean>(false);
    const [commentsLoaded, setCommentsLoaded] = useState<boolean>(false);
    const [isTipModalOpen, setIsTipModalOpen] = useState(false);
    const [isTorrentTipModalOpen, setIsTorrentTipModalOpen] = useState(false);
    const [selectedCommentForTip, setSelectedCommentForTip] = useState<CommentDto | null>(null);
    const [replyTarget, setReplyTarget] = useState<{ parentId: number; user: CommentDto['user'] } | null>(null);
    const t = useTranslations();
    const { user: currentUser } = useAuth();

    const handleOpenTipModal = (comment: CommentDto) => {
        setSelectedCommentForTip(comment);
        setIsTipModalOpen(true);
    };

    const fetchTorrentDetails = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data: TorrentDto = await torrents.getTorrentById(Number(torrentId));
            setTorrent(data);
            
            // 只获取评论数量，不加载评论内容
            const commentsResponse = await comments.getComments(COMMENT_TYPE.TORRENT, Number(torrentId), 1, 0);
            setCommentsCount(commentsResponse.totalItems);
        } catch (err: unknown) {
            setError((err as Error).message || t('common.error'));
        } finally {
            setLoading(false);
        }
    }, [torrentId, t]);

    const fetchComments = useCallback(async () => {
        if (commentsLoaded) return;
        
        setLoadingMore(true);
        setError(null);
        try {
            const response = await comments.getComments(COMMENT_TYPE.TORRENT, Number(torrentId), 1, 30);
            setComments(response.items);
            setHasMore(response.hasMore);
            setLastFloor(response.items[response.items.length - 1]?.floor || 0);
            setCommentsLoaded(true);
        } catch (err: unknown) {
            setError((err as Error).message || t('common.error'));
        } finally {
            setLoadingMore(false);
        }
    }, [torrentId, t, commentsLoaded]);

    useEffect(() => {
        if (torrentId) {
            fetchTorrentDetails();
        }
    }, [torrentId, fetchTorrentDetails]);

    const handleLoadMore = async () => {
        if (loadingMore || !hasMore) return;
        
        setLoadingMore(true);
        try {
            // Note: The old logic used `lastFloor`. The new paginated logic will use page number.
            // We'll calculate the next page based on the current number of comments.
            const currentPage = Math.floor(torrentComments.length / 30);
            const response = await comments.getComments(COMMENT_TYPE.TORRENT, Number(torrentId), currentPage + 1, 30);
            setComments(prev => [...prev, ...response.items]);
            setHasMore(response.hasMore);
            setLastFloor(response.items[response.items.length - 1]?.floor || lastFloor);
        } catch (err: unknown) {
            setError((err as Error).message || t('common.error'));
        } finally {
            setLoadingMore(false);
        }
    };

    const handleSubmitTopLevelComment = async (data: CreateCommentDto) => {
        try {
            const newComment = await comments.createComment(COMMENT_TYPE.TORRENT, Number(torrentId), data);
            setComments(prev => [...prev, newComment].sort((a, b) => a.floor - b.floor));
            
            setTimeout(() => {
                const element = document.getElementById(`comment-${newComment.id}`);
                element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);
        } catch (err: unknown) {
            throw new Error((err as Error).message || t('common.error'));
        }
    };

    const handleSubmitReply = async (data: CreateCommentDto) => {
        try {
            const newComment = await comments.createComment(COMMENT_TYPE.TORRENT, Number(torrentId), data);
            setComments(prev => [...prev, newComment].sort((a, b) => a.floor - b.floor));
            
            setTimeout(() => {
                const element = document.getElementById(`comment-${newComment.id}`);
                element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);
        } catch (err: unknown) {
            throw new Error((err as Error).message || t('common.error'));
        }
    };

    const handleDeleteComment = async (commentId: number) => {
        try {
            await comments.deleteComment(commentId);
            setComments(prev => prev.filter(c => c.id !== commentId));
        } catch (err: unknown) {
            setError((err as Error).message || t('common.error'));
        }
    };

    const handleReplyClick = (parentId: number, replyToUser: CommentDto['user']) => {
        setReplyTarget({ parentId, user: replyToUser });
    };

    if (loading) return <div className="h-screen w-full flex items-center justify-center"><p>{t('common.loading')}</p></div>;
    if (error) return <div className="h-screen w-full flex items-center justify-center"><p className="text-destructive">{t('common.error')}: {error}</p></div>;
    if (!torrent) return <div className="h-screen w-full flex items-center justify-center"><p>{t('torrentsPage.no_torrents_found')}</p></div>;

    const commentsSection = (
        <>
            <TorrentCommentTree
                comments={torrentComments}
                onReply={handleReplyClick}
                onDelete={handleDeleteComment}
                canDelete={(comment) => comment.user?.id === currentUser?.id}
                onSubmitReply={handleSubmitReply}
            />
            {hasMore && (
                <div className="mt-6 flex justify-center">
                    <Button
                        onClick={handleLoadMore}
                        disabled={loadingMore}
                        variant="outline"
                    >
                        {loadingMore ? t('reply.loading') : t('reply.load_more')}
                    </Button>
                </div>
            )}
            <div className="mt-8">
                <h2 className="text-xl font-bold mb-4">{t('reply.write_comment')}</h2>
                <ReplyEditor
                    onSubmit={handleSubmitTopLevelComment}
                    placeholder={t('reply.write_comment_placeholder')}
                    maxLength={500}
                />
            </div>
        </>
    );

    return (
        <main className="w-full">
            <TorrentHeader backdropPath={torrent.backdropPath} altText={torrent.name} />
            
            <TorrentInfoCard
                torrent={torrent}
                commentsSection={commentsSection}
                commentsCount={commentsCount}
                onCommentsTabOpen={fetchComments}
                commentsLoading={loadingMore && !commentsLoaded}
            />

            {selectedCommentForTip && selectedCommentForTip.user && (
                <TipModal
                    isOpen={isTipModalOpen}
                    onClose={() => setIsTipModalOpen(false)}
                    recipientId={selectedCommentForTip.user.id}
                    recipientName={selectedCommentForTip.user.username}
                    contextType="Comment"
                    contextId={selectedCommentForTip.id}
                />
            )}

            {torrent && torrent.uploader && (
                <TipModal
                    isOpen={isTorrentTipModalOpen}
                    onClose={() => setIsTorrentTipModalOpen(false)}
                    recipientId={torrent.uploader.id}
                    recipientName={torrent.uploader.username}
                    contextType="Torrent"
                    contextId={torrent.id}
                />
            )}
        </main>
    );
}