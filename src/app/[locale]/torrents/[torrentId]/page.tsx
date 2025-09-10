'use client';

import { useEffect, useState, useCallback } from "react";
import { torrents, comments, TorrentDto, CommentDto } from "@/lib/api";
import { useParams } from "next/navigation";
import { useTranslations } from 'next-intl';
import { Card, CardBody, CardHeader, CardFooter } from "@heroui/card";
import { Image } from "@heroui/image";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { Textarea } from "@heroui/input";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@heroui/table";
import { Link as UILink } from "@heroui/link";
import { User } from "@heroui/user";
import { Pagination } from "@heroui/pagination";
import UserDisplay from "@/app/[locale]/components/UserDisplay";

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
    const [newComment, setNewComment] = useState<string>("");
    const [commentsPage, setCommentsPage] = useState<number>(1);
    const [commentsPageSize] = useState<number>(10);
    const [commentsTotalCount, setCommentsTotalCount] = useState<number>(0);
    const t = useTranslations();

    const fetchTorrentDetails = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data: TorrentDto = await torrents.getTorrentById(Number(torrentId));
            setTorrent(data);

            const fetchedComments = await comments.getComments(Number(torrentId), commentsPage, commentsPageSize);
            setComments(fetchedComments.items || []);
            setCommentsTotalCount(fetchedComments.totalCount || 0);

        } catch (err: unknown) {
            setError((err as Error).message || t('common.error'));
        } finally {
            setLoading(false);
        }
    }, [torrentId, t, commentsPage, commentsPageSize]);

    useEffect(() => {
        if (torrentId) {
            fetchTorrentDetails();
        }
    }, [torrentId, fetchTorrentDetails]);

    const handleAddComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        try {
            await comments.createComment(Number(torrentId), { text: newComment });
            setNewComment("");
            fetchTorrentDetails(); // Refresh comments
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
                    <form onSubmit={handleAddComment} className="flex flex-col gap-4 mb-8">
                        <Textarea
                            label={t('torrentDetailsPage.add_comment')}
                            labelPlacement="outside"
                            placeholder={t('torrentDetailsPage.enter_your_comment')}
                            value={newComment}
                            onValueChange={setNewComment}
                            maxLength={500}
                            description={`${newComment.length} / 500`}
                        />
                        <Button type="submit" color="primary" className="self-end">
                            {t('torrentDetailsPage.submit_comment')}
                        </Button>
                    </form>
                    <div className="space-y-6">
                        {torrentComments.length > 0 ? (
                            torrentComments.map((comment) => (
                                <Card key={comment.id} shadow="sm">
                                    <CardHeader className="flex justify-between items-center">
                                        <User
                                            name={<UserDisplay user={comment.user} />}
                                            description={new Date(comment.createdAt).toLocaleString()}
                                            avatarProps={{
                                                // TODO: Use correct avatar from user object
                                            }}
                                        />
                                    </CardHeader>
                                    <CardBody>
                                        <p>{comment.text}</p>
                                    </CardBody>
                                </Card>
                            ))
                        ) : (
                            <p className="text-default-500 text-center">{t('torrentDetailsPage.no_comments')}</p>
                        )}
                    </div>
                </CardBody>
                <CardFooter>
                    <Pagination
                        total={Math.ceil(commentsTotalCount / commentsPageSize)}
                        page={commentsPage}
                        onChange={setCommentsPage}
                    />
                </CardFooter>
            </Card>
        </div>
    );
}