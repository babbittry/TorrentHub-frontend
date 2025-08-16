"use client";


import { Link } from '@/i18n/navigation';
import type { TorrentDto } from '@/lib/api';

interface TorrentCardProps {
    torrent: TorrentDto;
}

const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

export default function TorrentCard({ torrent }: TorrentCardProps) {
    const posterUrl = torrent.posterPath
        ? `${TMDB_IMAGE_BASE_URL}${torrent.posterPath}`
        : '/logo-black.png'; // A fallback image

    return (
        <Link href={`/torrents/${torrent.id}`} className="block group">
            <div className="bg-[var(--color-card-background)] rounded-lg shadow-lg overflow-hidden transition-transform duration-300 ease-in-out group-hover:scale-105 group-hover:shadow-2xl">
                <div className="relative aspect-[2/3]">
                    <img
                        src={posterUrl}
                        alt={torrent.name}
                        className="object-cover w-full h-full"
                        style={{ objectFit: 'cover' }}
                    />
                    <div className="absolute bottom-0 left-0 right-0 p-2 bg-[rgba(0,0,0,0.5)] text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex justify-around items-center">
                        <div className="flex items-center" title="Seeders">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                            </svg>
                            <span>-</span>
                        </div>
                        <div className="flex items-center" title="Leechers">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1.293-7.293l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 111.414-1.414L9 10.586V7a1 1 0 112 0v3.586l1.293-1.293a1 1 0 111.414 1.414z" clipRule="evenodd" />
                            </svg>
                            <span>-</span>
                        </div>
                    </div>
                </div>
                <div className="p-3">
                    <h3 className="font-bold text-md truncate text-[var(--color-foreground)]" title={torrent.name}>
                        {torrent.name}
                    </h3>
                    <div className="flex justify-between items-center mt-1 text-xs text-[var(--color-foreground-muted)]">
                        <span>{torrent.year || 'N/A'}</span>
                        {torrent.rating !== null && typeof torrent.rating === 'number' && torrent.rating > 0 && (
                            <div className="flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-400 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                                <span className="font-semibold">{torrent.rating.toFixed(1)}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    );
}
