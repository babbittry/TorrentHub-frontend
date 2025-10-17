'use client';

import { useEffect, useState, useCallback } from "react";
import { torrents, comments, TorrentDto, CommentDto, CreateCommentRequestDto } from "@/lib/api";
import { useParams } from "next/navigation";
import { useTranslations } from 'next-intl';
import { Card, CardBody, CardHeader, CardFooter } from "@heroui/card";
import { Image } from "@heroui/image";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@heroui/table";
import { Link as UILink } from "@heroui/link";
import UserDisplay from "@/app/[locale]/components/UserDisplay";
import TipModal from "@/app/[locale]/components/TipModal";
import TorrentCommentTree from "@/app/[locale]/components/TorrentCommentTree";
import ReplyEditor from "@/app/[locale]/components/ReplyEditor";

const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

interface FileItem {
    name: string;
    size: number;
}

export default function TorrentDetailPage() {
    const { torrentId } = useParams();
    const [torrent, setTorrent] = useState<TorrentDto | null>(null);
    const [torrentComments, setComments] = useState<CommentDto[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [lastFloor, setLastFloor] = useState<number>(0);
    const [hasMore, setHasMore] = useState<boolean>(true);
    const [loadingMore, setLoadingMore] = useState<boolean>(false);
    const [isTipModalOpen, setIsTipModalOpen] = useState(false);
    const [selectedCommentForTip, setSelectedCommentForTip] = useState<CommentDto | null>(null);
    const [replyTarget, setReplyTarget] = useState<{ parentId: number; user: CommentDto['user'] } | null>(null);
    const t = useTranslations();

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

            const response = await comments.getComments(Number(torrentId), 0, 30);
            setComments(response.comments);
            setHasMore(response.hasMore);
            setLastFloor(response.comments[response.comments.length - 1]?.floor || 0);

        } catch (err: unknown) {
            setError((err as Error).message || t('common.error'));
        } finally {
            setLoading(false);
        }
    }, [torrentId, t]);

    useEffect(() => {
        if (torrentId) {
            fetchTorrentDetails();
        }
    }, [torrentId, fetchTorrentDetails]);

    const handleLoadMore = async () => {
        if (loadingMore || !hasMore) return;
        
        setLoadingMore(true);
        try {
            const response = await comments.getComments(Number(torrentId), lastFloor, 30);
            setComments(prev => [...prev, ...response.comments]);
            setHasMore(response.hasMore);
            setLastFloor(response.comments[response.comments.length - 1]?.floor || lastFloor);
        } catch (err: unknown) {
            setError((err as Error).message || t('common.error'));
        } finally {
            setLoadingMore(false);
        }
    };

    const handleSubmitTopLevelComment = async (data: CreateCommentRequestDto) => {
        try {
            const newComment = await comments.createComment(Number(torrentId), data);
            // 乐观更新: 添加新评论并按 Floor 排序
            setComments(prev => [...prev, newComment].sort((a, b) => a.floor - b.floor));
            
            // 滚动到新评论
            setTimeout(() => {
                const element = document.getElementById(`comment-${newComment.id}`);
                element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);
        } catch (err: unknown) {
            throw new Error((err as Error).message || t('common.error'));
        }
    };

    const handleSubmitReply = async (data: CreateCommentRequestDto) => {
        try {
            const newComment = await comments.createComment(Number(torrentId), data);
            // 乐观更新: 添加新评论并按 Floor 排序
            setComments(prev => [...prev, newComment].sort((a, b) => a.floor - b.floor));
            
            // 滚动到新评论
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
        // CommentTree 组件内部处理回复编辑器的显示
        // 这里只需要更新 replyTarget 状态
        setReplyTarget({ parentId, user: replyToUser });
    };

    const formatBytes = (bytes: number): string => {
        if (bytes === 0) return "0 Bytes";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    };

    if (loading) return <p className="text-foreground text-center p-4">{t('common.loading')}</p>;
    if (error) return <p className="text-danger text-center p-4">{t('common.error')}: {error}</p>;
    if (!torrent) return <p className="text-default-500 text-center p-4">{t('torrentsPage.no_torrents_found')}</p>;

    const posterUrl = torrent.posterPath ? `${TMDB_IMAGE_BASE_URL}${torrent.posterPath}` : '/logo-black.png';

    // Placeholder for file list - assuming torrent.files exists and is an array
    const files: FileItem[] = (torrent as { files?: FileItem[] }).files || [{ name: 'File 1.mkv', size: 1234567890 }, { name: 'File 2.nfo', size: 12345 }];

    return (
        <div className="container mx-auto p-4 space-y-8">
            <Card>
                <CardBody>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div className="md:col-span-1">
                            <Image src={posterUrl} alt={torrent.name} width="100%" className="w-full object-cover rounded-lg" />
                        </div>
                        <div className="md:col-span-3 flex flex-col">
                            <h1 className="text-4xl font-bold text-foreground mb-2">{torrent.name}</h1>
                            <div className="flex items-center gap-4 mb-4">
                                <Chip color="primary" variant="flat">{torrent.year}</Chip>
                                {torrent.isFree && <Chip color="success">{t('common.free')}</Chip>}
                            </div>
                            <div className="space-y-2 text-lg text-foreground">
                                <p><span className="font-semibold text-default-600">{t('common.size')}:</span> {formatBytes(torrent.size)}</p>
                                <p><span className="font-semibold text-default-600">{t('common.uploader')}:</span> <UserDisplay user={torrent.uploader} /></p>
                                <p><span className="font-semibold text-default-600">{t('common.release_time')}:</span> {new Date(torrent.createdAt).toLocaleDateString()}</p>
                                {torrent.imdbId && (
                                    <p><span className="font-semibold text-default-600">IMDb:</span> <UILink href={`https://www.imdb.com/title/${torrent.imdbId}`} isExternal showAnchorIcon>{torrent.imdbId}</UILink></p>
                                )}
                            </div>
                            <div className="mt-auto pt-4">
                                <Button color="primary" size="lg">{t('torrentDetailsPage.download_torrent')}</Button>
                            </div>
                        </div>
                    </div>
                </CardBody>
            </Card>

            <Card>
                <CardHeader><h2 className="text-2xl font-bold text-foreground">{t('common.description')}</h2></CardHeader>
                <CardBody>
                    <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: torrent.description || t('common.no_description') }} />
                </CardBody>
            </Card>

            <Card>
                <CardHeader><h2 className="text-2xl font-bold text-foreground">{t('torrentDetailsPage.file_list')}</h2></CardHeader>
                <CardBody>
                    <Table aria-label="File list">
                        <TableHeader>
                            <TableColumn>{t('common.name')}</TableColumn>
                            <TableColumn>{t('common.size')}</TableColumn>
                        </TableHeader>
                        <TableBody items={files}>
                            {(item: FileItem) => (
                                <TableRow key={item.name}>
                                    <TableCell>{item.name}</TableCell>
                                    <TableCell>{formatBytes(item.size)}</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardBody>
            </Card>

            <Card>
                <CardHeader><h2 className="text-2xl font-bold text-foreground">{t('common.comments')}</h2></CardHeader>
                <CardBody>
                    {/* 顶级评论编辑器 */}
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold mb-3">{t('reply.write_comment')}</h3>
                        <ReplyEditor
                            onSubmit={handleSubmitTopLevelComment}
                            placeholder={t('reply.write_comment_placeholder')}
                        />
                    </div>

                    {/* 评论列表 */}
                    <TorrentCommentTree
                        comments={torrentComments}
                        onReply={handleReplyClick}
                        onDelete={handleDeleteComment}
                        canDelete={(comment) => comment.user?.id === comment.user?.id} // 临时权限检查
                        onSubmitReply={handleSubmitReply}
                    />
                    {hasMore && (
                        <div className="mt-6 flex justify-center">
                            <Button
                                onClick={handleLoadMore}
                                disabled={loadingMore}
                                color="primary"
                                variant="flat"
                            >
                                {loadingMore ? t('reply.loading') : t('reply.load_more')}
                            </Button>
                        </div>
                    )}
                </CardBody>
            </Card>

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
        </div>
    );
}