
"use client";

import { useEffect, useState, useCallback } from "react";
import { fetchApi } from "@/lib/apiClient";
import { useParams } from "next/navigation";
import { useTranslations } from 'next-intl';

interface Torrent {
    id: number;
    name: string;
    description?: string;
    category: number; // Assuming category is a number, adjust if it's a string or enum
    size: number;
    uploadedByUser: { userName: string };
    createdAt: string;
    isFree: boolean;
    seeders?: number;
    leechers?: number;
    imdbId?: string;
}

interface Comment {
    id: number;
    text: string;
    user: { userName: string };
    createdAt: string;
}

export default function TorrentDetailPage() {
    const { torrentId } = useParams();
    const [torrent, setTorrent] = useState<Torrent | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
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
            const data: Torrent = await fetchApi(`/api/Torrent/${torrentId}`); // Placeholder
            setTorrent(data);

            // Assuming comments are part of the torrent details or a separate endpoint like /api/torrents/{torrentId}/comments
            // The OpenAPI spec only shows POST for comments, not GET. I'll assume a GET for comments exists.
            const fetchedComments: Comment[] = await fetchApi(`/api/torrents/${torrentId}/comments`); // Placeholder
            setComments(fetchedComments);

        } catch (err: unknown) {
            setError((err as Error).message || t('error'));
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
            await fetchApi(`/api/torrents/${torrentId}/Comment`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ text: newComment, torrentId: Number(torrentId) }),
            });
            setNewComment("");
            fetchTorrentDetails(); // Refresh comments after adding
        } catch (err: unknown) {
            setError((err as Error).message || t('error'));
        }
    };

    const formatBytes = (bytes: number): string => {
        if (bytes === 0) return "0 Bytes";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    };

    if (loading) return <p className="text-[var(--color-foreground)] text-center p-4">{t('loading')}</p>;
    if (error) return <p className="text-[var(--color-error)] text-center p-4">{t('error')}: {error}</p>;
    if (!torrent) return <p className="text-[var(--color-text-muted)] text-center p-4">{t('no_torrents_found')}</p>;

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-4xl font-extrabold text-[var(--color-primary)] mb-6 text-center drop-shadow-lg">{torrent.name}</h1>

            <div className="card mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <p className="text-[var(--color-foreground)] text-lg mb-2"><span className="font-semibold text-[var(--color-primary)]">{t('category')}:</span> {torrent.category}</p>
                        <p className="text-[var(--color-foreground)] text-lg mb-2"><span className="font-semibold text-[var(--color-primary)]">{t('size')}:</span> {formatBytes(torrent.size)}</p>
                        <p className="text-[var(--color-foreground)] text-lg mb-2"><span className="font-semibold text-[var(--color-primary)]">{t('uploader')}:</span> {torrent.uploadedByUser?.userName || "未知"}</p>
                        <p className="text-[var(--color-foreground)] text-lg mb-2"><span className="font-semibold text-[var(--color-primary)]">{t('release_time')}:</span> {new Date(torrent.createdAt).toLocaleDateString()}</p>
                        <p className="text-[var(--color-foreground)] text-lg mb-2"><span className="font-semibold text-[var(--color-primary)]">{t('seeders_leechers')}:</span> {torrent.seeders || 0} / {torrent.leechers || 0}</p>
                        {torrent.isFree && (
                            <span className="inline-block bg-[var(--color-success)] text-white text-sm px-4 py-2 rounded-full mt-4 shadow-md">{t('free')}</span>
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

                <h2 className="text-3xl font-bold text-[var(--color-primary)] mt-8 mb-4 border-b border-[var(--color-border)] pb-2">{t('description')}</h2>
                <div className="text-[var(--color-foreground)] leading-relaxed text-lg" dangerouslySetInnerHTML={{ __html: torrent.description || t('no_description') }} />
            </div>

            <section className="card mb-8">
                <h2 className="text-3xl font-bold text-[var(--color-primary)] mb-6 border-b border-[var(--color-border)] pb-2">{t('comments')}</h2>
                <div className="mb-8">
                    <form onSubmit={handleAddComment} className="flex flex-col space-y-4">
                        <textarea
                            className="input-field"
                            rows={5}
                            placeholder={t('add_comment')}
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                        ></textarea>
                        <button
                            type="submit"
                            className="btn-primary px-8 py-3 font-semibold self-end shadow-md transform hover:scale-105"
                        >
                            {t('submit_comment')}
                        </button>
                    </form>
                </div>
                <div>
                    {comments.length > 0 ? (
                        comments.map((comment) => (
                            <div key={comment.id} className="bg-[var(--color-card-background)] p-6 rounded-lg mb-4 shadow-sm border border-[var(--color-border)]">
                                <p className="text-[var(--color-primary)] font-bold text-lg mb-1">{comment.user?.userName || "未知用户"}</p>
                                <p className="text-[var(--color-text-muted)] text-sm mb-3">{new Date(comment.createdAt).toLocaleString()}</p>
                                <p className="text-[var(--color-foreground)] text-base leading-relaxed">{comment.text}</p>
                            </div>
                        ))
                    ) : (
                        <p className="text-[var(--color-text-muted)] text-lg text-center">{t('no_comments')}</p>
                    )}
                </div>
            </section>
        </div>
    );
}
