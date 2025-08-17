"use client";


import { Link } from '@/i18n/navigation';
import type { TorrentDto } from '@/lib/api';
import { useTranslations } from 'next-intl';

interface TorrentListItemProps {
    torrent: TorrentDto;
}

const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w200'; // Smaller image for list view

export default function TorrentListItem({ torrent }: TorrentListItemProps) {
    const t_common = useTranslations('common');
    const posterUrl = torrent.posterPath
        ? `${TMDB_IMAGE_BASE_URL}${torrent.posterPath}`
        : '/logo-black.png'; // A fallback image

    const formatBytes = (bytes: number): string => {
        if (bytes === 0) return "0 Bytes";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    };

    return (
        <Link href={`/torrents/${torrent.id}`} className="group flex items-center bg-[var(--color-card-background)] p-3 rounded-lg shadow-sm hover:shadow-lg transition-shadow duration-300 border border-transparent hover:border-[var(--color-primary)]">
            <div className="flex-shrink-0 w-16 h-24 relative mr-4">
                <img
                    src={posterUrl}
                    alt={torrent.name}
                    className="object-cover rounded w-full h-full"
                    style={{ objectFit: 'cover' }}
                />
            </div>
            <div className="flex-grow grid grid-cols-12 gap-4 items-center">
                <div className="col-span-5">
                    <div className="font-bold text-md text-[var(--color-foreground)] group-hover:text-[var(--color-primary)] transition-colors truncate">
                        {torrent.name}
                    </div>
                    {/* TODO: Add tags here when available */}
                    <div className="flex flex-wrap gap-2 mt-1">
                        <span className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300 px-2 py-0.5 rounded-full">{torrent.year}</span>
                        {torrent.isFree && <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">{t_common('free')}</span>}
                    </div>
                </div>
                <div className="col-span-2 text-center text-sm text-[var(--color-foreground-muted)]">
                    <span>{new Date(torrent.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="col-span-1 text-center text-sm text-[var(--color-foreground-muted)]">
                    <span>{formatBytes(torrent.size)}</span>
                </div>
                <div className="col-span-1 text-center text-sm text-[var(--color-foreground-muted)]">
                    {/* S/L/F Placeholders */}
                    <div className="flex flex-col items-center">
                        <span className="text-green-500">S: -</span>
                        <span className="text-red-500">L: -</span>
                        <span>C: -</span>
                    </div>
                </div>
                <div className="col-span-3 text-center text-sm text-[var(--color-foreground-muted)]">
                    {torrent.uploaderUsername}
                </div>
            </div>
        </Link>
    );
}
