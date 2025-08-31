"use client";

import { Link } from '@/i18n/navigation';
import type { TorrentDto } from '@/lib/api';
import { useTranslations } from 'next-intl';
import { Chip } from "@heroui/chip";
import { Image } from "@heroui/image";

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
        <Link href={`/torrents/${torrent.id}`} className="block group">
            <div className="flex items-center bg-content1 p-3 rounded-lg shadow-sm hover:bg-content2 transition-all duration-200 border-2 border-transparent hover:border-primary">
                <div className="flex-shrink-0 w-16 h-24 relative mr-4">
                    <Image
                        src={posterUrl}
                        alt={torrent.name}
                        radius="sm"
                        className="w-full h-full object-cover"
                    />
                </div>
                <div className="flex-grow grid grid-cols-12 gap-4 items-center">
                    <div className="col-span-4">
                        <div className="font-bold text-md text-foreground group-hover:text-primary transition-colors truncate">
                            {torrent.name}
                        </div>
                        <div className="flex flex-wrap gap-2 mt-1.5">
                            <Chip size="sm" variant="flat">{torrent.year}</Chip>
                            {torrent.isFree && <Chip size="sm" color="success" variant="flat">{t_common('free')}</Chip>}
                        </div>
                    </div>
                    <div className="col-span-2 text-center text-sm text-default-500">
                        <span>{new Date(torrent.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="col-span-1 text-center text-sm text-default-500">
                        <span>{formatBytes(torrent.size)}</span>
                    </div>
                    <div className="col-span-1 text-center text-sm text-success font-medium">
                        {torrent.seeders}
                    </div>
                    <div className="col-span-1 text-center text-sm text-danger font-medium">
                        {torrent.leechers}
                    </div>
                    <div className="col-span-1 text-center text-sm text-default-500 font-medium">
                        {torrent.snatched}
                    </div>
                    <div className="col-span-2 text-center text-sm text-default-500">
                        {torrent.uploaderUsername}
                    </div>
                </div>
            </div>
        </Link>
    );
}
