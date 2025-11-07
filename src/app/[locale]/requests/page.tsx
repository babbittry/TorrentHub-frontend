'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { requests, RequestDto, RequestStatus, API_BASE_URL } from '@/lib/api';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { Table, TableHeader, TableBody, TableRow, TableCell, TableHead } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import UserDisplay from '@/app/[locale]/components/UserDisplay';
import { Card, CardFooter } from "@/components/ui/card";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { ArrowUpDown } from "lucide-react";

const RequestsPage = () => {
    const [requestsList, setRequestsList] = useState<RequestDto[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [statusFilter, setStatusFilter] = useState<string>('All');
    const [sortColumn, setSortColumn] = useState<string>('createdAt');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
    const [page, setPage] = useState(1);
    const [pageSize] = useState(20);
    const [totalCount, setTotalCount] = useState(0);
    const t = useTranslations();
    const params = useParams();
    const locale = params.locale as string;

    useEffect(() => {
        const fetchRequests = async () => {
            try {
                setIsLoading(true);
                const status = statusFilter === 'All' ? undefined : statusFilter;
                const data: any = await requests.getRequests(page, pageSize, status, sortColumn, sortDirection);
                if (Array.isArray(data)) {
                    setRequestsList(data);
                    setTotalCount(data.length);
                } else {
                    setRequestsList(data?.items || []);
                    setTotalCount(data?.totalItems || 0);
                }
                setError(null);
            } catch (err) {
                setError(t('requestsPage.error_fetching'));
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchRequests();
    }, [t, statusFilter, sortColumn, sortDirection, page, pageSize]);

    const handleSort = (column: string) => {
        if (sortColumn === column) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortColumn(column);
            setSortDirection('desc');
        }
    };

    const renderCell = useCallback((request: RequestDto, columnKey: string) => {
        const cellValue = request[columnKey as keyof RequestDto];

        switch (columnKey) {
            case 'title':
                return <Link href={`/requests/${request.id}`} className="text-primary font-semibold hover:underline">{request.title}</Link>;
            case 'bountyAmount':
                return `${request.bountyAmount} Coins`;
            case 'status':
                return (
                    <Badge className={request.status === RequestStatus.Filled ? "bg-green-600" : "bg-yellow-600"}>
                        {t(`requestsPage.status_${request.status.toLowerCase()}`)}
                    </Badge>
                );
            case 'requestedByUser':
                return request.requestedByUser ? (
                    <UserDisplay user={request.requestedByUser} />
                ) : 'N/A';
            case 'createdAt':
                return new Date(request.createdAt).toLocaleDateString();
            default:
                return String(cellValue);
        }
    }, [t]);

    const totalPages = Math.ceil(totalCount / pageSize);

    return (
        <div className="container mx-auto p-4 sm:p-6">
            <h1 className="text-4xl font-extrabold mb-8 text-center">{t('requestsPage.title')}</h1>

            <div className="flex justify-between items-center mb-4 gap-2 flex-wrap">
                <div className="flex gap-2">
                    <Button 
                        onClick={() => setStatusFilter('All')} 
                        variant={statusFilter === 'All' ? 'default' : 'ghost'}
                    >
                        {t('requestsPage.filter_all')}
                    </Button>
                    <Button 
                        onClick={() => setStatusFilter('Pending')} 
                        variant={statusFilter === 'Pending' ? 'default' : 'ghost'}
                    >
                        {t('requestsPage.filter_pending')}
                    </Button>
                    <Button 
                        onClick={() => setStatusFilter('Filled')} 
                        variant={statusFilter === 'Filled' ? 'default' : 'ghost'}
                    >
                        {t('requestsPage.filter_filled')}
                    </Button>
                </div>
                <Button asChild>
                    <Link href={`/requests/new`}>
                        {t('requestsPage.createNew')}
                    </Link>
                </Button>
            </div>

            {error && <div className="text-center p-4 text-destructive bg-destructive/10 rounded-md mb-4">{error}</div>}

            <Card>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>{t('common.title')}</TableHead>
                            <TableHead>
                                <Button 
                                    variant="ghost" 
                                    onClick={() => handleSort('bountyAmount')}
                                    className="flex items-center gap-1"
                                >
                                    {t('requestsPage.bounty')}
                                    <ArrowUpDown className="h-4 w-4" />
                                </Button>
                            </TableHead>
                            <TableHead>
                                <Button 
                                    variant="ghost" 
                                    onClick={() => handleSort('status')}
                                    className="flex items-center gap-1"
                                >
                                    {t('requestsPage.status')}
                                    <ArrowUpDown className="h-4 w-4" />
                                </Button>
                            </TableHead>
                            <TableHead>{t('requestsPage.requested_by')}</TableHead>
                            <TableHead>
                                <Button 
                                    variant="ghost" 
                                    onClick={() => handleSort('createdAt')}
                                    className="flex items-center gap-1"
                                >
                                    {t('common.date')}
                                    <ArrowUpDown className="h-4 w-4" />
                                </Button>
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center">{t('common.loading')}</TableCell>
                            </TableRow>
                        ) : requestsList.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center">{t('requestsPage.none_found')}</TableCell>
                            </TableRow>
                        ) : (
                            requestsList.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell>{renderCell(item, 'title')}</TableCell>
                                    <TableCell>{renderCell(item, 'bountyAmount')}</TableCell>
                                    <TableCell>{renderCell(item, 'status')}</TableCell>
                                    <TableCell>{renderCell(item, 'requestedByUser')}</TableCell>
                                    <TableCell>{renderCell(item, 'createdAt')}</TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
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
        </div>
    );
};

export default RequestsPage;