"use client";

import { useEffect, useState, useCallback } from "react";
import { torrentListing, TorrentDto, TorrentCategory } from "@/lib/api";
import { useTranslations } from 'next-intl';
import TorrentCard from "./components/TorrentCard";
import TorrentListItem from "./components/TorrentListItem";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { FormField } from "@/components/ui/form-field";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Grid, List } from "lucide-react";

type ViewMode = 'grid' | 'list';

const getInitialViewMode = (): ViewMode => {
    if (typeof window !== 'undefined') {
        const savedViewMode = localStorage.getItem('torrentViewMode');
        if (savedViewMode === 'grid' || savedViewMode === 'list') {
            return savedViewMode;
        }
    }
    return 'grid';
};

export default function TorrentsPage() {
    const [torrents, setTorrents] = useState<TorrentDto[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState<number>(1);
    const [pageSize] = useState<number>(50);
    const [totalCount, setTotalCount] = useState<number>(0);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [category, setCategory] = useState<string>("");
    const [sortBy, setSortBy] = useState<string>("createdAt");
    const [sortOrder, setSortOrder] = useState<string>("desc");
    const [viewMode, setViewMode] = useState<ViewMode>(getInitialViewMode);
    const t = useTranslations();

    const fetchTorrents = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await torrentListing.getTorrentListing(page, pageSize, category, searchTerm, sortBy, sortOrder);
            setTorrents(response.items || []);
            setTotalCount(response.totalItems || 0);
        } catch (err: unknown) {
            setError((err as Error).message || t('common.error'));
        } finally {
            setLoading(false);
        }
    }, [page, pageSize, category, searchTerm, sortBy, sortOrder, t]);

    useEffect(() => {
        localStorage.setItem('torrentViewMode', viewMode);
    }, [viewMode]);

    useEffect(() => {
        fetchTorrents();
    }, [fetchTorrents]);

    const handleSort = (newSortBy: string) => {
        if (newSortBy === sortBy) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(newSortBy);
            setSortOrder('desc');
        }
    };

    const handleSearch = () => {
        setPage(1);
        fetchTorrents();
    };

    const categoryOptions = Object.values(TorrentCategory).filter(v => isNaN(Number(v))).map(cat => ({ key: cat.toString(), value: cat.toString(), label: t("categories." + (cat as string)) }));

    const totalPages = Math.ceil(totalCount / pageSize);

    return (
        <div className="container mx-auto py-4">
            <h1 className="text-4xl font-extrabold mb-8 text-center">{t('torrentsPage.all_torrents')}</h1>

            <Card className="mb-10">
                <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                        <FormField
                            label={t('common.search')}
                            placeholder={t('header.search_torrents')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        />
                        <div className="space-y-2">
                            <label className="text-sm font-medium">{t('common.category')}</label>
                            <Select value={category || "all"} onValueChange={(val) => setCategory(val === "all" ? "" : val)}>
                                <SelectTrigger>
                                    <SelectValue placeholder={t('torrentsPage.all_torrents')} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">{t('torrentsPage.all_torrents')}</SelectItem>
                                    {categoryOptions.map(item => (
                                        <SelectItem key={item.key} value={item.value}>
                                            {item.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <Button onClick={handleSearch} className="w-full md:w-auto">
                            {t('common.search')}
                        </Button>
                        <div className="flex justify-end items-center lg:col-start-4">
                            <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as ViewMode)}>
                                <TabsList>
                                    <TabsTrigger value="grid" className="gap-2">
                                        <Grid className="h-4 w-4" />
                                        <span className="hidden sm:inline">{t('common.grid_view')}</span>
                                    </TabsTrigger>
                                    <TabsTrigger value="list" className="gap-2">
                                        <List className="h-4 w-4" />
                                        <span className="hidden sm:inline">{t('common.list_view')}</span>
                                    </TabsTrigger>
                                </TabsList>
                            </Tabs>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {loading && <p className="text-center text-lg">{t('common.loading')}</p>}
            {error && <p className="text-center text-destructive text-lg">{t('common.error')}: {error}</p>}

            {!loading && !error && torrents.length === 0 && (
                <p className="text-center text-muted-foreground text-lg">{t('torrentsPage.no_torrents_found')}</p>
            )}

            {!loading && !error && torrents.length > 0 && (
                <>
                    {viewMode === 'grid' ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
                            {torrents.map((torrent) => (
                                <TorrentCard key={torrent.id} torrent={torrent} />
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <Card className="p-3">
                                <div className="flex items-center">
                                    <div className="shrink-0 w-16 mr-4"></div>
                                    <div className="grow grid grid-cols-12 gap-4 items-center font-bold">
                                        <div className="col-span-4 cursor-pointer hover:text-primary" onClick={() => handleSort('name')}>{t('common.name')} {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}</div>
                                        <div className="col-span-2 text-center cursor-pointer hover:text-primary" onClick={() => handleSort('createdAt')}>{t('common.date')} {sortBy === 'createdAt' && (sortOrder === 'asc' ? '↑' : '↓')}</div>
                                        <div className="col-span-1 text-center cursor-pointer hover:text-primary" onClick={() => handleSort('size')}>{t('common.size')} {sortBy === 'size' && (sortOrder === 'asc' ? '↑' : '↓')}</div>
                                        <div className="col-span-1 text-center cursor-pointer hover:text-primary" onClick={() => handleSort('seeders')}>{t('common.seeders')} {sortBy === 'seeders' && (sortOrder === 'asc' ? '↑' : '↓')}</div>
                                        <div className="col-span-1 text-center cursor-pointer hover:text-primary" onClick={() => handleSort('leechers')}>{t('common.leechers')} {sortBy === 'leechers' && (sortOrder === 'asc' ? '↑' : '↓')}</div>
                                        <div className="col-span-1 text-center cursor-pointer hover:text-primary" onClick={() => handleSort('snatched')}>{t('common.snatched')} {sortBy === 'snatched' && (sortOrder === 'asc' ? '↑' : '↓')}</div>
                                        <div className="col-span-2 text-center cursor-pointer hover:text-primary" onClick={() => handleSort('uploaderUsername')}>{t('common.uploader')} {sortBy === 'uploaderUsername' && (sortOrder === 'asc' ? '↑' : '↓')}</div>
                                    </div>
                                </div>
                            </Card>
                            {torrents.map((torrent) => (
                                <TorrentListItem key={torrent.id} torrent={torrent} />
                            ))}
                        </div>
                    )}
                    <Card className="mt-6">
                        <CardFooter className="justify-center pt-6">
                            <Pagination>
                                <PaginationContent>
                                    <PaginationItem>
                                        <PaginationPrevious
                                            href="#"
                                            onClick={(e) => { e.preventDefault(); if (page > 1) setPage(p => p - 1); }}
                                            aria-disabled={page === 1}
                                            className={page === 1 ? "pointer-events-none opacity-50" : ""}
                                        />
                                    </PaginationItem>
                                    {[...Array(Math.min(5, totalPages))].map((_, i) => {
                                        const pageNumber = i + 1;
                                        return (
                                            <PaginationItem key={pageNumber}>
                                                <PaginationLink
                                                    href="#"
                                                    onClick={(e) => { e.preventDefault(); setPage(pageNumber); }}
                                                    isActive={page === pageNumber}
                                                >
                                                    {pageNumber}
                                                </PaginationLink>
                                            </PaginationItem>
                                        );
                                    })}
                                    <PaginationItem>
                                        <PaginationNext
                                            href="#"
                                            onClick={(e) => { e.preventDefault(); if (page < totalPages) setPage(p => p + 1); }}
                                            aria-disabled={page === totalPages}
                                            className={page === totalPages ? "pointer-events-none opacity-50" : ""}
                                        />
                                    </PaginationItem>
                                </PaginationContent>
                            </Pagination>
                        </CardFooter>
                    </Card>
                </>
            )}
        </div>
    );
}