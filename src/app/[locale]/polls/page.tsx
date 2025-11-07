'use client';

import { useEffect, useState } from 'react';
import { polls } from '@/lib/api';
import type { PollDto } from '@/lib/api';
import Poll from '../components/Poll';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useTranslations } from 'next-intl';

export default function PollsPage() {
    const [activePolls, setActivePolls] = useState<PollDto[]>([]);
    const [historyPolls, setHistoryPolls] = useState<PollDto[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const t = useTranslations('Polls');

    useEffect(() => {
        const fetchPolls = async () => {
            setIsLoading(true);
            try {
                const allPolls = await polls.getPolls();
                const active = allPolls.filter(p => p.isActive);
                const history = allPolls.filter(p => !p.isActive);
                setActivePolls(active || []);
                setHistoryPolls(history || []);
            } catch (error) {
                console.error('Failed to fetch polls', error);
                setActivePolls([]);
                setHistoryPolls([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPolls();
    }, []);

    return (
        <div className="container mx-auto p-4 space-y-8">
            <section>
                <h2 className="text-2xl font-bold mb-4">{t('currentPoll')}</h2>
                {isLoading ? (
                    <p>{t('loading')}</p>
                ) : activePolls.length > 0 ? (
                    <div className="space-y-6">
                        {activePolls.map(poll => <Poll key={poll.id} poll={poll} />)}
                    </div>
                ) : (
                    <p>{t('noActive')}</p>
                )}
            </section>

            <section>
                <h2 className="text-2xl font-bold mb-4">{t('pastPolls')}</h2>
                {isLoading ? (
                    <p>{t('loadingHistory')}</p>
                ) : historyPolls.length > 0 ? (
                    <div className="space-y-6">
                        {historyPolls.map((poll) => (
                            <Card key={poll.id}>
                                <CardHeader>
                                    <CardTitle>{poll.question}</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {Array.isArray(poll.options) ? poll.options.map((option) => {
                                        const percentage = poll.totalVotes > 0 ? (option.voteCount / poll.totalVotes) * 100 : 0;
                                        return (
                                            <div key={option.id}>
                                                <div className="flex justify-between mb-1">
                                                    <span className="font-medium">{option.text}</span>
                                                    <span className="text-sm text-muted-foreground">
                                                        {option.voteCount} {t('votes')} ({percentage.toFixed(1)}%)
                                                    </span>
                                                </div>
                                                <Progress value={percentage} />
                                            </div>
                                        );
                                    }) : <p>{t('noOptions')}</p>}
                                    <p className="text-sm text-center text-muted-foreground pt-2">
                                        {t('totalVotes')}: {poll.totalVotes}
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <p>{t('noHistory')}</p>
                )}
            </section>
        </div>
    );
}