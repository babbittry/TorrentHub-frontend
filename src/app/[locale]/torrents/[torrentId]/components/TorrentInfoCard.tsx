import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ExternalLink, Download, Plus, Film, Clock, Flag, ChevronDown, ChevronUp } from 'lucide-react';
import ActorAvatar from './ActorAvatar';
import { TorrentDto } from '@/lib/api';
import TorrentTabs from './TorrentTabs';
import React, { useState } from 'react';
import { useTranslations } from 'next-intl';

interface TorrentInfoCardProps {
  torrent: TorrentDto;
  commentsSection: React.ReactNode;
  commentsCount: number;
  onCommentsTabOpen: () => void;
  commentsLoading: boolean;
  onDownload: () => void;
  onTip: () => void;
}

const TorrentInfoCard = ({ torrent, commentsSection, commentsCount, onCommentsTabOpen, commentsLoading, onDownload, onTip }: TorrentInfoCardProps) => {
  const t = useTranslations('torrentDetail');
  const [showAllActors, setShowAllActors] = useState(false);
  const posterUrl = torrent.posterPath
    ? `https://image.tmdb.org/t/p/w500${torrent.posterPath}`
    : '/logo-black.png';

  const formatRuntime = (minutes: number | null | undefined) => {
    if (!minutes) return null;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}h ${m}m`;
  };

  return (
    <div className="relative z-20 -mt-48 w-full">
      <div className="container mx-auto max-w-7xl">
        <div className="bg-card/80 dark:bg-card/80 backdrop-blur-lg shadow-2xl rounded-lg overflow-hidden">
          <div className="p-6 md:p-8">
            {/* Main Info Section */}
            <div className="flex flex-col md:flex-row md:items-start gap-6 md:gap-8">
              {/* Poster */}
              <div className="w-full md:w-1/3 lg:w-1/4 shrink-0">
                <Image
                  src={posterUrl}
                  alt={torrent.name}
                  width={500}
                  height={750}
                  className="w-full h-auto aspect-2/3 object-cover rounded-lg shadow-lg"
                  priority
                />
              </div>

              {/* Details */}
              <div className="w-full md:w-2/3 lg:w-3/4">
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="min-w-0 flex-1 pr-4">
                      <h1 className="text-4xl md:text-5xl font-bold text-foreground wrap-anywhere">{torrent.name}</h1>
                      <p className="text-lg text-muted-foreground mt-2 wrap-anywhere">{torrent.originalTitle} ({torrent.year})</p>
                    </div>
                    {torrent.rating && (
                      <div className="shrink-0 mt-4 sm:mt-0 sm:ml-6">
                        <div className="flex items-center space-x-2 bg-yellow-400/20 dark:bg-yellow-500/20 px-3 py-1.5 rounded-md">
                          <span className="font-bold text-yellow-500 text-lg">IMDb</span>
                          <div className="text-left">
                            <span className="block font-bold text-xl text-foreground">
                              {torrent.rating.toFixed(1)}
                              <span className="text-sm font-normal">/10</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center flex-wrap gap-x-4 gap-y-2 mt-4 text-muted-foreground">
                  {torrent.runtime ? (
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{formatRuntime(torrent.runtime)}</span>
                    </div>
                  ) : null}
                  {torrent.country && (
                    <div className="flex items-center gap-1">
                      <Flag className="h-4 w-4" />
                      <span>{torrent.country}</span>
                    </div>
                  )}
                </div>

                <div className="mt-6 flex flex-wrap gap-2">
                  {Array.isArray(torrent.genres) && torrent.genres.map((genre) => (
                    <span key={genre} className="bg-secondary text-secondary-foreground text-xs font-medium mr-2 px-2.5 py-0.5 rounded">
                      {genre}
                    </span>
                  ))}
                </div>

                <div className="mt-3 flex flex-wrap gap-4">
                  {torrent.imdbId && (
                    <a
                      href={`https://www.imdb.com/title/${torrent.imdbId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-primary hover:underline"
                    >
                      IMDb: {torrent.imdbId}
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}

                  {torrent.tmDbId && (
                    <a
                      href={`https://www.themoviedb.org/movie/${torrent.tmDbId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-primary hover:underline"
                    >
                      TMDb: {torrent.tmDbId}
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </div>

                <p className="mt-3 text-foreground/80 leading-relaxed text-base line-clamp-5 warp-break-word">
                  {torrent.plot}
                </p>

                <div className="mt-8 flex flex-wrap gap-4">
                  <Button size="lg" onClick={onDownload}>
                    <Download className="mr-2 h-5 w-5" />
                    {t('downloadNow')}
                  </Button>
                  <Button size="lg" variant="secondary" onClick={onTip}>
                    <Plus className="mr-2 h-5 w-5" />
                    {t('tip')}
                  </Button>
                </div>
              </div>
            </div>

            {/* Cast Section */}
            {torrent.cast && torrent.cast.length > 0 && (
              <div className="mt-8">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold text-foreground">{t('actors')}</h2>
                  {torrent.cast.length > 6 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowAllActors(!showAllActors)}
                      className="flex items-center gap-1"
                    >
                      {showAllActors ? (
                        <>
                          {t('showLess')}
                          <ChevronUp className="h-4 w-4" />
                        </>
                      ) : (
                        <>
                          {t('showAll')} ({torrent.cast.length})
                          <ChevronDown className="h-4 w-4" />
                        </>
                      )}
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
                  {Array.isArray(torrent.cast) && (showAllActors ? torrent.cast : torrent.cast.slice(0, 6)).map((actor) => (
                    <ActorAvatar
                      key={actor.name}
                      name={actor.name}
                      character={actor.character || ''}
                      profilePath={actor.profilePath || null}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          <TorrentTabs
            torrent={torrent}
            commentsSection={commentsSection}
            commentsCount={commentsCount}
            onCommentsTabOpen={onCommentsTabOpen}
            commentsLoading={commentsLoading}
          />

        </div>
      </div>
    </div>
  );
};

export default TorrentInfoCard;