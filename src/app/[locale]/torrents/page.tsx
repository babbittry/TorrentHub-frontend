"use client";

import { useEffect, useState, useCallback } from "react";
import { torrentListing, TorrentDto, TorrentCategory } from "@/lib/api";
import { useTranslations } from 'next-intl';
import TorrentCard from "./components/TorrentCard";
import TorrentListItem from "./components/TorrentListItem";

type ViewMode = 'grid' | 'list';

const getInitialViewMode = (): ViewMode => {
    if (typeof window !== 'undefined') {
        const savedViewMode = localStorage.getItem('torrentViewMode');
        if (savedViewMode === 'grid' || savedViewMode === 'list') {
            return savedViewMode;
        }
    }
    return 'grid'; // Default value
};

export default function TorrentsPage() {
    const [torrents, setTorrents] = useState<TorrentDto[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [pageNumber] = useState<number>(1);
    const [pageSize] = useState<number>(50);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [category, setCategory] = useState<string>("");
    const [sortBy, setSortBy] = useState<string>("createdAt");
    const [sortOrder, setSortOrder] = useState<string>("desc");
    const [viewMode, setViewMode] = useState<ViewMode>(getInitialViewMode);
    const t = useTranslations('torrentsPage');
    const t_common = useTranslations('common');
    const t_header = useTranslations('header');
    const t_cats = useTranslations('categories');

    const fetchTorrents = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await torrentListing.getTorrentListing(pageNumber, pageSize, category, searchTerm, sortBy, sortOrder);
            setTorrents(response || []);
        } catch (err: unknown) {
            setError((err as Error).message || t_common('error'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        localStorage.setItem('torrentViewMode', viewMode);
    }, [viewMode]);

    useEffect(() => {
        fetchTorrents();
    }, [sortBy, sortOrder, category]);

    const handleSort = (newSortBy: string) => {
        if (newSortBy === sortBy) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(newSortBy);
            setSortOrder('desc');
        }
    };

    const handleSearch = () => {
        fetchTorrents();
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-4xl font-extrabold text-[var(--color-primary)] mb-8 text-center drop-shadow-lg">{t('all_torrents')}</h1>

            {/* Filters and View Switcher */}
            <div className="card mb-10 p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Search Input */}
                    <div>
                        <label htmlFor="search" className="block text-[var(--color-foreground)] text-sm font-bold mb-2">{t_common('search')}</label>
                        <input
                            type="text"
                            id="search"
                            placeholder={t_header('search_torrents')}
                            className="input-field"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        />
                    </div>
                    {/* Category Select */}
                    <div>
                        <label htmlFor="category" className="block text-[var(--color-foreground)] text-sm font-bold mb-2">{t_common('category')}</label>
                        <select id="category" className="input-field" value={category} onChange={(e) => setCategory(e.target.value)}>
                            <option value="">{t('all_torrents')}</option>
                            <option value={TorrentCategory.Movie}>{t_cats('Movie')}</option>
                            <option value={TorrentCategory.Documentary}>{t_cats('Documentary')}</option>
                            <option value={TorrentCategory.Series}>{t_cats('Series')}</option>
                            <option value={TorrentCategory.Animation}>{t_cats('Animation')}</option>
                            <option value={TorrentCategory.Game}>{t_cats('Game')}</option>
                            <option value={TorrentCategory.Music}>{t_cats('Music')}</option>
                            <option value={TorrentCategory.Variety}>{t_cats('Variety')}</option>
                            <option value={TorrentCategory.Sports}>{t_cats('Sports')}</option>
                            <option value={TorrentCategory.Concert}>{t_cats('Concert')}</option>
                            <option value={TorrentCategory.Other}>{t_cats('Other')}</option>
                        </select>
                    </div>
                    {/* Search Button */}
                    <div className="flex items-end">
                        <button onClick={handleSearch} className="btn-primary w-full h-[var(--input-height)]">
                            {t_common('search')}
                        </button>
                    </div>
                </div>
                <div className="flex justify-end items-center mt-4">
                    <button onClick={() => setViewMode('grid')} className={`p-2 rounded-l-md ${viewMode === 'grid' ? 'bg-[var(--color-primary)] text-white' : 'bg-[var(--color-input-background)]'}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                        </svg>
                    </button>
                    <button onClick={() => setViewMode('list')} className={`p-2 rounded-r-md ${viewMode === 'list' ? 'bg-[var(--color-primary)] text-white' : 'bg-[var(--color-input-background)]'}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>
            </div>

            {loading && <p className="text-center text-[var(--color-foreground)] text-lg">{t_common('loading')}</p>}
            {error && <p className="text-center text-[var(--color-error)] text-lg">{t_common('error')}: {error}</p>}

            {!loading && !error && torrents.length === 0 && (
                <p className="text-center text-[var(--color-text-muted)] text-lg opacity-80">{t('no_torrents_found')}</p>
            )}

            {/* Conditional Rendering based on viewMode */}
            {!loading && !error && torrents.length > 0 && (
                viewMode === 'grid' ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
                        {torrents.map((torrent) => (
                            <TorrentCard key={torrent.id} torrent={torrent} />
                        ))}
                    </div>
                ) : (
                    <div className="space-y-3">
                        {/* List Header */}
                        <div className="flex items-center bg-[var(--color-card-background)] p-3 rounded-lg shadow-sm font-bold text-[var(--color-foreground)] border-b-2 border-[var(--color-primary)]">
                            <div className="flex-shrink-0 w-16 mr-4"></div> {/* Corresponds to image space */}
                            <div className="flex-grow grid grid-cols-12 gap-4 items-center">
                                <div className="col-span-6">{t_common('name')}</div>
                                <div className="col-span-2 text-center cursor-pointer" onClick={() => handleSort('createdAt')}>
                                    {t_common('date')} {sortBy === 'createdAt' && (sortOrder === 'asc' ? '↑' : '↓')}
                                </div>
                                <div className="col-span-2 text-center cursor-pointer" onClick={() => handleSort('size')}>
                                    {t_common('size')} {sortBy === 'size' && (sortOrder === 'asc' ? '↑' : '↓')}
                                </div>
                                <div className="col-span-1 text-center">
                                    <div className="flex flex-col items-center">
                                        <span className="cursor-pointer" onClick={() => handleSort('seeders')}>
                                            S {sortBy === 'seeders' && (sortOrder === 'asc' ? '↑' : '↓')}
                                        </span>
                                        <span className="cursor-pointer" onClick={() => handleSort('leechers')}>
                                            L {sortBy === 'leechers' && (sortOrder === 'asc' ? '↑' : '↓')}
                                        </span>
                                    </div>
                                </div>
                                <div className="col-span-1 text-center">{t_common('uploader')}</div>
                            </div>
                        </div>
                        {torrents.map((torrent) => (
                            <TorrentListItem key={torrent.id} torrent={torrent} />
                        ))}
                    </div>
                )
            )}
        </div>
    );
}