
import React from 'react';
import { RequestDto, RequestStatus } from '@/lib/api';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';

interface RequestListItemProps {
    request: RequestDto;
}

const RequestListItem: React.FC<RequestListItemProps> = ({ request }) => {
    const t = useTranslations();

    const statusColor = request.status === RequestStatus.Filled
        ? 'text-green-500'
        : request.status === RequestStatus.PendingConfirmation
        ? 'text-blue-500'
        : request.status === RequestStatus.Rejected
        ? 'text-red-500'
        : 'text-yellow-500';

    return (
        <Link href={`/requests/${request.id}`}
              className="group flex items-center bg-[var(--color-card-background)] p-3 rounded-lg shadow-sm hover:shadow-lg transition-shadow duration-300 border border-transparent hover:border-[var(--color-primary)]">
            <div className="flex-grow grid grid-cols-12 gap-x-4 gap-y-2 items-center">
                {/* Title */}
                <div className="col-span-12 md:col-span-5">
                    <p className="font-bold text-md text-[var(--color-foreground)] group-hover:text-[var(--color-primary)] transition-colors truncate">
                        {request.title}
                    </p>
                </div>

                {/* Bounty */}
                <div className="col-span-6 sm:col-span-4 md:col-span-2 text-left md:text-center text-sm text-yellow-600 dark:text-yellow-400 font-semibold">
                    {request.bountyAmount} Coins
                </div>

                {/* Status */}
                <div className={`col-span-6 sm:col-span-4 md:col-span-1 text-left md:text-center text-sm font-semibold ${statusColor}`}>
                    {t(`requestsPage.status_${request.status.toLowerCase().replace(/\s/g, '')}`)}
                </div>

                {/* Requester */}
                <div className="col-span-6 sm:col-span-4 md:col-span-3 text-left md:text-center text-sm text-gray-600 dark:text-gray-400">
                    {request.requestedByUser?.userName || 'N/A'}
                </div>

                {/* Date */}
                <div className="col-span-12 sm:col-span-12 md:col-span-1 text-left md:text-center text-sm text-gray-500 dark:text-gray-300">
                    {new Date(request.createdAt).toLocaleDateString()}
                </div>
            </div>
        </Link>
    );
};

export default RequestListItem;
