import React from 'react';
import { RequestDto } from '@/lib/api';
import RequestListItem from './RequestListItem';

interface RequestListProps {
    requests: RequestDto[];
    locale: string;
    isLoading: boolean;
    error: string | null;
    noRequestsMessage: string;
}

const RequestList: React.FC<RequestListProps> = ({ requests, locale, isLoading, error, noRequestsMessage }) => {
    if (isLoading) {
        return (
            <div className="text-center py-10">
                <p>{noRequestsMessage}...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-10 text-red-500">
                <p>{error}</p>
            </div>
        );
    }

    if (requests.length === 0) {
        return (
            <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                <p>{noRequestsMessage}</p>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {requests.map(request => (
                <RequestListItem key={request.id} request={request} locale={locale} />
            ))}
        </div>
    );
};

export default RequestList;
