"use client";

import { useEffect, useState, useCallback } from "react";
import { torrents, comments, TorrentDto, CommentDto } from "@/lib/api";
import { useParams } from "next/navigation";
import { useTranslations } from 'next-intl';

export default function TorrentDetailPage() {
    const { torrentId } = useParams();
    const [torrent, setTorrent] = useState<TorrentDto | null>(null);
    const [_comments, setComments] = useState<CommentDto[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [newComment, setNewComment] = useState<string>("");
    const t = useTranslations();

    const fetchTorrentDetails = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // Assuming /api/Torrent/{torrentId} returns full torrent details
            // The OpenAPI spec doesn't explicitly define a GET for full torrent details by ID.
            // I'm making an assumption here. If this endpoint doesn't exist or returns insufficient data,
            // we'll need to adjust. For now, I'll use a placeholder endpoint.
            // A more appropriate endpoint might be needed from the backend.
            const data: TorrentDto = await torrents.getTorrentById(Number(torrentId));
            setTorrent(data);

            const fetchedComments: CommentDto[] = await comments.getComments(Number(torrentId));
            setComments(fetchedComments);

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

    const handleAddComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        try {
            // The OpenAPI spec for /api/torrents/{torrentId}/Comment expects a Comment object in the body.
            // I'm assuming userId and createdAt are handled by the backend or can be omitted.
            // The Comment schema has torrentId, userId, text, createdAt. I'll provide text.
            await comments.createComment(Number(torrentId), { text: newComment });
            setNewComment("");
            fetchTorrentDetails(); // Refresh comments after adding
        } catch (err: unknown) {
            setError((err as Error).message || t('common.error'));
        }
    };

    const formatBytes = (bytes: number): string => {
        if (bytes === 0) return "0 Bytes";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    };

    if (loading) return <p className="text-[var(--color-foreground)] text-center p-4">{t('common.loading')}</p>;
    if (error) return <p className="text-[var(--color-error)] text-center p-4">{t('common.error')}: {error}</p>;
    if (!torrent) return <p className="text-[var(--color-text-muted)] text-center p-4">{t('torrentsPage.no_torrents_found')}</p>;

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-4xl font-extrabold text-[var(--color-primary)] mb-6 text-center drop-shadow-lg">{torrent.name}</h1>

            <div className="card mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <p className="text-[var(--color-foreground)] text-lg mb-2"><span className="font-semibold text-[var(--color-primary)]">{t('common.size')}:</span> {formatBytes(torrent.size)}</p>
                        <p className="text-[var(--color-foreground)] text-lg mb-2"><span className="font-semibold text-[var(--color-primary)]">{t('common.uploader')}:</span> {torrent.uploaderUsername || "未知"}</p>
                        <p className="text-[var(--color-foreground)] text-lg mb-2"><span className="font-semibold text-[var(--color-primary)]">{t('common.release_time')}:</span> {new Date(torrent.createdAt).toLocaleDateString()}</p>
                        {torrent.isFree && (
                            <span className="inline-block bg-[var(--color-success)] text-white text-sm px-4 py-2 rounded-full mt-4 shadow-md">{t('common.free')}</span>
                        )}
                    </div>
                    <div>
                        {torrent.imdbId && (
                            <div className="bg-[var(--color-input-background)] p-4 rounded-lg shadow-inner border border-[var(--color-input-border)]">
                                <p className="text-[var(--color-foreground)] text-lg mb-2"><span className="font-semibold text-[var(--color-primary)]">IMDb ID:</span> <a href={`https://www.imdb.com/title/${torrent.imdbId}`} target="_blank" rel="noopener noreferrer" className="text-[var(--color-primary)] hover:underline transition-colors duration-200">{torrent.imdbId}</a></p>
                                {/* Potentially add more IMDb details here if fetched */}
                            </div>
                        )}
                    </div>
                </div>

                <h2 className="text-3xl font-bold text-[var(--color-primary)] mt-8 mb-4 border-b border-[var(--color-border)] pb-2">{t('common.description')}</h2>
                <div className="text-[var(--color-foreground)] leading-relaxed text-lg" dangerouslySetInnerHTML={{ __html: torrent.description || t('common.no_description') }} />
            </div>

            <section className="card mb-8">
                <h2 className="text-3xl font-bold text-[var(--color-primary)] mb-6 border-b border-[var(--color-border)] pb-2">{t('common.comments')}</h2>
                <div className="mb-8">
                    <form onSubmit={handleAddComment} className="flex flex-col space-y-4">
                        <textarea
                            className="input-field"
                            rows={5}
                            placeholder={t('torrentDetailsPage.add_comment')}
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                        ></textarea>
                        <button
                            type="submit"
                            className="btn-primary px-8 py-3 font-semibold self-end shadow-md transform hover:scale-105"
                        >
                            {t('torrentDetailsPage.submit_comment')}
                        </button>
                    </form>
                </div>
                <div>
                    {_comments.length > 0 ? (
                        _comments.map((comment) => (
                            <div key={comment.id} className="bg-[var(--color-card-background)] p-6 rounded-lg mb-4 shadow-sm border border-[var(--color-border)]">
                                <p className="text-[var(--color-primary)] font-bold text-lg mb-1">{comment.user?.userName || "未知用户"}</p>
                                <p className="text-[var(--color-text-muted)] text-sm mb-3">{new Date(comment.createdAt).toLocaleString()}</p>
                                <p className="text-[var(--color-foreground)] text-base leading-relaxed">{comment.text}</p>
                            </div>
                        ))
                    ) : (
                        <p className="text-[var(--color-text-muted)] text-lg text-center">{t('torrentDetailsPage.no_comments')}</p>
                    )}
                </div>
            </section>
        </div>
    );
}
