'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { requests, RequestDto, RequestStatus, API_BASE_URL } from '@/lib/api';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, SortDescriptor } from "@heroui/table";
import { Button, ButtonGroup } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { User } from "@heroui/user";
import UserDisplay from '@/app/[locale]/components/UserDisplay';
import { Card, CardFooter } from "@heroui/card";
import { Pagination } from "@heroui/pagination";

const RequestsPage = () => {
    const [requestsList, setRequestsList] = useState<RequestDto[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [statusFilter, setStatusFilter] = useState<string>('All'); // Default to All
    const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({ column: 'createdAt', direction: 'descending' });
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
                const sortOrder = sortDescriptor.direction === 'descending' ? 'desc' : 'asc';
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const data: any = await requests.getRequests(page, pageSize, status, sortDescriptor.column as string, sortOrder);
                if (Array.isArray(data)) {
                    setRequestsList(data);
                    // This is a workaround as the API is not returning a PaginatedResult.
                    // Pagination might not work correctly if the array represents a single page.
                    setTotalCount(data.length);
                } else {
                    setRequestsList(data?.items || []);
                    setTotalCount(data?.totalCount || 0);
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
    }, [t, statusFilter, sortDescriptor, page, pageSize]);

    const handleSortChange = (descriptor: SortDescriptor) => {
        setSortDescriptor(descriptor);
    };

    const renderCell = useCallback((request: RequestDto, columnKey: React.Key) => {
        const cellValue = request[columnKey as keyof RequestDto];

        switch (columnKey) {
            case 'title':
                return <Link href={`/requests/${request.id}`} className="text-primary font-semibold hover:underline">{request.title}</Link>;
            case 'bountyAmount':
                return `${request.bountyAmount} Coins`;
            case 'status':
                return (
                    <Chip color={request.status === RequestStatus.Filled ? "success" : "warning"} size="sm" variant="flat">
                        {t(`requestsPage.status_${request.status.toLowerCase()}`)}
                    </Chip>
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

    return (
        <div className="container mx-auto p-4 sm:p-6">
            <h1 className="text-4xl font-extrabold text-primary mb-8 text-center drop-shadow-lg">{t('requestsPage.title')}</h1>

            <div className="flex justify-between items-center mb-4">
                <ButtonGroup>
                    <Button onPress={() => setStatusFilter('All')} variant={statusFilter === 'All' ? 'solid' : 'ghost'}>{t('requestsPage.filter_all')}</Button>
                    <Button onPress={() => setStatusFilter('Pending')} variant={statusFilter === 'Pending' ? 'solid' : 'ghost'}>{t('requestsPage.filter_pending')}</Button>
                    <Button onPress={() => setStatusFilter('Filled')} variant={statusFilter === 'Filled' ? 'solid' : 'ghost'}>{t('requestsPage.filter_filled')}</Button>
                </ButtonGroup>
                <Button as={Link} href={`/requests/new`} color="primary">
                    {t('requestsPage.createNew')}
                </Button>
            </div>

            {error && <div className="text-center p-4 text-danger bg-danger-50 rounded-md mb-4">{error}</div>}

            <Table
                aria-label="Requests list"
                sortDescriptor={sortDescriptor}
                onSortChange={handleSortChange}
                bottomContent={
                    <Card>
                        <CardFooter>
                            <Pagination
                                total={Math.ceil(totalCount / pageSize)}
                                page={page}
                                onChange={setPage}
                            />
                        </CardFooter>
                    </Card>
                }
            >
                <TableHeader>
                    <TableColumn key="title">{t('common.title')}</TableColumn>
                    <TableColumn key="bountyAmount" allowsSorting>{t('requestsPage.bounty')}</TableColumn>
                    <TableColumn key="status" allowsSorting>{t('requestsPage.status')}</TableColumn>
                    <TableColumn key="requestedByUser">{t('requestsPage.requested_by')}</TableColumn>
                    <TableColumn key="createdAt" allowsSorting>{t('common.date')}</TableColumn>
                </TableHeader>
                <TableBody items={requestsList} isLoading={isLoading} emptyContent={t('requestsPage.none_found')}>
                    {(item) => (
                        <TableRow key={item.id}>
                            {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
};

export default RequestsPage;