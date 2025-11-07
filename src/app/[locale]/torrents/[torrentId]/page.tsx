'use client';

import { useEffect, useState, useCallback } from "react";
import { torrents, comments, TorrentDto, CommentDto, CreateCommentRequestDto } from "@/lib/api";
import { useParams } from "next/navigation";
import { useTranslations } from 'next-intl';
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableCell, TableHead } from "@/components/ui/table";
import UserDisplay from "@/app/[locale]/components/UserDisplay";
import TipModal from "@/app/[locale]/components/TipModal";
import TorrentCommentTree from "@/app/[locale]/components/TorrentCommentTree";
import ReplyEditor from "@/app/[locale]/components/ReplyEditor";
import { ExternalLink } from "lucide-react";
import Image from "next/image";

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

            const response = await comments.getComments(Number(torrentId), 0, 30);
            setComments(response.items);
            setHasMore(response.hasMore);
            setLastFloor(response.items[response.items.length - 1]?.floor || 0);

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
            setComments(prev => [...prev, ...response.items]);
            setHasMore(response.hasMore);
            setLastFloor(response.items[response.items.length - 1]?.floor || lastFloor);
        } catch (err: unknown) {
            setError((err as Error).message || t('common.error'));
        } finally {
            setLoadingMore(false);
        }
    };

    const handleSubmitTopLevelComment = async (data: CreateCommentRequestDto) => {
        try {
            const newComment = await comments.createComment(Number(torrentId), data);
            setComments(prev => [...prev, newComment].sort((a, b) => a.floor - b.floor));
            
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

    const formatBytes = (bytes: number): string => {
        if (bytes === 0) return "0 Bytes";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    };

    if (loading) return <p className="text-center p-4">{t('common.loading')}</p>;
    if (error) return <p className="text-destructive text-center p-4">{t('common.error')}: {error}</p>;
    if (!torrent) return <p className="text-muted-foreground text-center p-4">{t('torrentsPage.no_torrents_found')}</p>;

    const posterUrl = torrent.posterPath ? `${TMDB_IMAGE_BASE_URL}${torrent.posterPath}` : '/logo-black.png';
    const files: FileItem[] = (torrent as { files?: FileItem[] }).files || [{ name: 'File 1.mkv', size: 1234567890 }, { name: 'File 2.nfo', size: 12345 }];

    return (
        <div className="container mx-auto p-4 space-y-8">
            <Card>
                <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div className="md:col-span-1">
                            <Image 
                                src={posterUrl} 
                                alt={torrent.name} 
                                width={500} 
                                height={750} 
                                className="w-full object-cover rounded-lg" 
                            />
                        </div>
                        <div className="md:col-span-3 flex flex-col">
                            <h1 className="text-4xl font-bold mb-2">{torrent.name}</h1>
                            <div className="flex items-center gap-4 mb-4">
                                <Badge variant="secondary">{torrent.year}</Badge>
                                {torrent.isFree && <Badge className="bg-green-600 hover:bg-green-700">{t('common.free')}</Badge>}
                            </div>
                            <div className="space-y-2 text-lg">
                                <p><span className="font-semibold text-muted-foreground">{t('common.size')}:</span> {formatBytes(torrent.size)}</p>
                                <p><span className="font-semibold text-muted-foreground">{t('common.uploader')}:</span> <UserDisplay user={torrent.uploader} /></p>
                                <p><span className="font-semibold text-muted-foreground">{t('common.release_time')}:</span> {new Date(torrent.createdAt).toLocaleDateString()}</p>
                                {torrent.imdbId && (
                                    <p>
                                        <span className="font-semibold text-muted-foreground">IMDb:</span>{' '}
                                        <a 
                                            href={`https://www.imdb.com/title/${torrent.imdbId}`} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1 text-primary hover:underline"
                                        >
                                            {torrent.imdbId}
                                            <ExternalLink className="h-4 w-4" />
                                        </a>
                                    </p>
                                )}
                            </div>
                            <div className="mt-auto pt-4 flex gap-3">
                                <Button size="lg">{t('torrentDetailsPage.download_torrent')}</Button>
                                {currentUser && torrent.uploader && currentUser.id !== torrent.uploader.id && (
                                    <Button
                                        variant="secondary"
                                        size="lg"
                                        onClick={() => setIsTorrentTipModalOpen(true)}
                                    >
                                        {t('torrentDetailsPage.tip_user')}
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>{t('common.description')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: torrent.description || t('common.no_description') }} />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>{t('torrentDetailsPage.file_list')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>{t('common.name')}</TableHead>
                                <TableHead>{t('common.size')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {files.map((item: FileItem) => (
                                <TableRow key={item.name}>
                                    <TableCell>{item.name}</TableCell>
                                    <TableCell>{formatBytes(item.size)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>{t('common.comments')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <TorrentCommentTree
                        comments={torrentComments}
                        onReply={handleReplyClick}
                        onDelete={handleDeleteComment}
                        canDelete={(comment) => comment.user?.id === comment.user?.id}
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
                </CardContent>
            </Card>

            <div className="mt-8">
                <h2 className="text-xl font-bold mb-4">{t('reply.write_comment')}</h2>
                <ReplyEditor
                    onSubmit={handleSubmitTopLevelComment}
                    placeholder={t('reply.write_comment_placeholder')}
                    maxLength={500}
                />
            </div>

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
        </div>
    );
}