"use client";

import { useEffect, useState, useCallback } from "react";
import { torrentListing, TorrentDto } from "@/lib/api";
import { useTranslations } from 'next-intl';
import TorrentCard from "./components/TorrentCard";
import TorrentListItem from "./components/TorrentListItem";

type ViewMode = 'grid' | 'list';

export default function TorrentsPage() {
    const [torrents, setTorrents] = useState<TorrentDto[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [pageNumber] = useState<number>(1);
    const [pageSize] = useState<number>(50); // Increased page size for list view
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [category, setCategory] = useState<string>("");
    const [sortBy, setSortBy] = useState<string>("createdAt");
    const [sortOrder, setSortOrder] = useState<string>("desc");
    const [viewMode, setViewMode] = useState<ViewMode>('grid');
    const t = useTranslations();

    useEffect(() => {
        const savedViewMode = localStorage.getItem('torrentViewMode') as ViewMode;
        if (savedViewMode) {
            setViewMode(savedViewMode);
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('torrentViewMode', viewMode);
    }, [viewMode]);

    const fetchTorrents = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await torrentListing.getTorrentListing(pageNumber, pageSize, category, searchTerm, sortBy, sortOrder);
            setTorrents(response || []);
        } catch (err: unknown) {
            setError((err as Error).message || t('error'));
        } finally {
            setLoading(false);
        }
    }, [pageNumber, pageSize, searchTerm, category, sortBy, sortOrder, t]);

    useEffect(() => {
        fetchTorrents();
    }, [fetchTorrents]);

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-4xl font-extrabold text-[var(--color-primary)] mb-8 text-center drop-shadow-lg">{t('all_torrents')}</h1>

            {/* Filters and View Switcher */}
            <div className="card mb-10 p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Search Input */}
                    <div>
                        <label htmlFor="search" className="block text-[var(--color-foreground)] text-sm font-bold mb-2">{t('search')}</label>
                        <input
                            type="text"
                            id="search"
                            placeholder={t('search_torrents')}
                            className="input-field"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    {/* Category Select */}
                    <div>
                        <label htmlFor="category" className="block text-[var(--color-foreground)] text-sm font-bold mb-2">{t('category')}</label>
                        <select id="category" className="input-field" value={category} onChange={(e) => setCategory(e.target.value)}>
                            <option value="">{t('all_torrents')}</option>
                            <option value="Movie">{t('Movie')}</option>
                            <option value="TV">{t('TV')}</option>
                            <option value="Anime">{t('Anime')}</option>
                            <option value="Music">{t('Music')}</option>
                            <option value="Game">{t('Game')}</option>
                            <option value="Software">{t('Software')}</option>
                            <option value="Documentary">{t('Documentary')}</option>
                            <option value="Other">{t('Other')}</option>
                        </select>
                    </div>
                    {/* Sort By Select */}
                    <div>
                        <label htmlFor="sortBy" className="block text-[var(--color-foreground)] text-sm font-bold mb-2">{t('sort_by')}</label>
                        <select id="sortBy" className="input-field" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                            <option value="createdAt">{t('release_time')}</option>
                            <option value="name">{t('name')}</option>
                            <option value="size">{t('size')}</option>
                        </select>
                    </div>
                    {/* Sort Order Select */}
                    <div>
                        <label htmlFor="sortOrder" className="block text-[var(--color-foreground)] text-sm font-bold mb-2">{t('sort_order')}</label>
                        <select id="sortOrder" className="input-field" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                            <option value="desc">{t('descending')}</option>
                            <option value="asc">{t('ascending')}</option>
                        </select>
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

            {loading && <p className="text-center text-[var(--color-foreground)] text-lg">{t('loading')}</p>}
            {error && <p className="text-center text-[var(--color-error)] text-lg">{t('error')}: {error}</p>}

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
                        {torrents.map((torrent) => (
                            <TorrentListItem key={torrent.id} torrent={torrent} />
                        ))}
                    </div>
                )
            )}
        </div>
    );
}