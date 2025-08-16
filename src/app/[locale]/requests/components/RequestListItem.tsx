
import React from 'react';
import { RequestDto, RequestStatus } from '@/lib/api';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';

interface RequestListItemProps {
    request: RequestDto;
    locale: string;
}

const RequestListItem: React.FC<RequestListItemProps> = ({ request, locale }) => {
    const t = useTranslations();

    const statusColor = request.status === RequestStatus.Filled
        ? 'text-green-500'
        : 'text-yellow-500';

    return (
        <Link href={`/requests/${request.id}`}
              className="group block p-4 border bg-[var(--color-card-background)] rounded-lg shadow-sm hover:shadow-lg hover:bg-[var(--color-card-background-hover)]transition-shadow duration-300 border-transparent hover:border-[var(--color-primary)]">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-lg font-semibold text-[var(--color-foreground)] group-hover:text-[var(--color-primary)] transition-colors">{request.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {t('requestsPage.requested_by')}: {request.requestedByUser?.userName || 'N/A'}
                    </p>
                </div>
                <div className="text-right">
                    <p className={`text-md font-bold ${statusColor}`}>
                        {t(`requestsPage.status_${request.status.toLowerCase()}`)}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-300 mt-1">
                        {new Date(request.createdAt).toLocaleDateString()}
                    </p>
                </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center text-sm">
                    <span className="text-yellow-600 dark:text-yellow-400 font-semibold">
                        {t('requestsPage.bounty')}: {request.bountyAmount} Coins
                    </span>
                    {request.status === RequestStatus.Filled && (
                        <span className="text-green-600 dark:text-green-400">
                            {t('requestsPage.filled_by')}: {request.filledByUser?.userName || 'N/A'}
                        </span>
                    )}
                </div>
            </div>
        </Link>
    );
};

export default RequestListItem;
