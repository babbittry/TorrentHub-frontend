"use client";

import { Link } from '@/i18n/navigation';
import type { TorrentDto } from '@/lib/api';
import { useTranslations } from 'next-intl';
import { Badge } from "@/components/ui/badge";
import UserDisplay from '../../components/UserDisplay';

interface TorrentListItemProps {
    torrent: TorrentDto;
}

const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w200';

export default function TorrentListItem({ torrent }: TorrentListItemProps) {
    const t_common = useTranslations('common');
    const posterUrl = torrent.posterPath
        ? `${TMDB_IMAGE_BASE_URL}${torrent.posterPath}`
        : '/logo-black.png';

    const formatBytes = (bytes: number): string => {
        if (bytes === 0) return "0 Bytes";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    };

    return (
        <div className="block group">
            <div className="flex items-center bg-card p-3 rounded-lg shadow-sm hover:bg-secondary transition-all duration-200 border-2 border-transparent hover:border-primary">
                <div className="flex-shrink-0 w-16 h-24 relative mr-4">
                    <img
                        src={posterUrl}
                        alt={torrent.name}
                        className="w-full h-full object-cover rounded-sm"
                    />
                </div>
                <div className="flex-grow grid grid-cols-12 gap-4 items-center">
                    <div className="col-span-4">
                        <Link href={`/torrents/${torrent.id}`} className="font-bold text-md text-foreground group-hover:text-primary transition-colors truncate hover:underline">
                            {torrent.name}
                        </Link>
                        <div className="flex flex-wrap gap-2 mt-1.5">
                            <Badge variant="secondary">{torrent.year}</Badge>
                            {torrent.isFree && <Badge className="bg-green-100 text-green-800 border-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-700">{t_common('free')}</Badge>}
                        </div>
                    </div>
                    <div className="col-span-2 text-center text-sm text-muted-foreground">
                        <span>{new Date(torrent.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="col-span-1 text-center text-sm text-muted-foreground">
                        <span>{formatBytes(torrent.size)}</span>
                    </div>
                    <div className="col-span-1 text-center text-sm text-green-600 font-medium">
                        {torrent.seeders}
                    </div>
                    <div className="col-span-1 text-center text-sm text-destructive font-medium">
                        {torrent.leechers}
                    </div>
                    <div className="col-span-1 text-center text-sm text-muted-foreground font-medium">
                        {torrent.snatched}
                    </div>
                    <div className="col-span-2 text-center text-sm text-muted-foreground">
                        <UserDisplay user={torrent.uploader} />
                    </div>
                </div>
            </div>
        </div>
    );
}
