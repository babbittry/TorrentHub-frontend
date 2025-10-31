"use client";

import { useEffect, useState, useCallback } from "react";
import { torrentListing, TorrentDto, TorrentCategory } from "@/lib/api";
import { useTranslations } from 'next-intl';
import TorrentCard from "./components/TorrentCard";
import TorrentListItem from "./components/TorrentListItem";
import { Input } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { Selection } from "@react-types/shared";
import { Button, ButtonGroup } from "@heroui/button";
import { Card, CardBody, CardFooter } from "@heroui/card";
import { Pagination } from "@heroui/pagination";

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

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-4xl font-extrabold text-primary mb-8 text-center drop-shadow-lg">{t('torrentsPage.all_torrents')}</h1>

            <Card className="mb-10 p-4" shadow="sm">
                <CardBody>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                        <Input
                            label={t('common.search')}
                            placeholder={t('header.search_torrents')}
                            value={searchTerm}
                            onValueChange={setSearchTerm}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            isClearable
                            onClear={() => setSearchTerm('')}
                            variant="bordered"
                            size="md"
                            labelPlacement="outside"
                        />
                        <Select
                            label={t('common.category')}
                            placeholder={t('torrentsPage.all_torrents')}
                            selectedKeys={category ? [category] : []}
                            onSelectionChange={(keys: Selection) => {
                                if (keys instanceof Set && keys.size > 0) {
                                    const selectedKey = Array.from(keys)[0];
                                    setCategory(selectedKey.toString());
                                } else {
                                    setCategory("");
                                }
                            }}
                            variant="bordered"
                            size="md"
                            labelPlacement="outside"
                            items={[{ key: "", label: t('torrentsPage.all_torrents') }, ...categoryOptions]}
                        >
                            {(item) => (
                                <SelectItem key={item.key}>
                                    {item.label}
                                </SelectItem>
                            )}
                        </Select>
                        <Button onPress={handleSearch} color="primary" className="w-full md:w-auto" size="md">
                            {t('common.search')}
                        </Button>
                        <div className="flex justify-end items-center lg:col-start-4">
                            <ButtonGroup>
                                <Button isIconOnly onPress={() => setViewMode('grid')} variant={viewMode === 'grid' ? 'solid' : 'ghost'} color="primary">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                    </svg>
                                </Button>
                                <Button isIconOnly onPress={() => setViewMode('list')} variant={viewMode === 'list' ? 'solid' : 'ghost'} color="primary">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                                    </svg>
                                </Button>
                            </ButtonGroup>
                        </div>
                    </div>
                </CardBody>
            </Card>

            {loading && <p className="text-center text-foreground text-lg">{t('common.loading')}</p>}
            {error && <p className="text-center text-danger text-lg">{t('common.error')}: {error}</p>}

            {!loading && !error && torrents.length === 0 && (
                <p className="text-center text-default-500 text-lg opacity-80">{t('torrentsPage.no_torrents_found')}</p>
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
                            <Card className="p-3 shadow-sm">
                                <div className="flex items-center">
                                    <div className="shrink-0 w-16 mr-4"></div>
                                    <div className="grow grid grid-cols-12 gap-4 items-center font-bold text-foreground">
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
                    <Card>
                        <CardFooter>
                            <Pagination
                                total={Math.ceil(totalCount / pageSize)}
                                page={page}
                                onChange={setPage}
                            />
                        </CardFooter>
                    </Card>
                </>
            )}
        </div>
    );
}