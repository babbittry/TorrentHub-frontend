'use client';

import { useEffect, useState } from 'react';
import { polls } from '@/lib/api';
import type { PollDto } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Progress } from "@heroui/progress";
import { RadioGroup, Radio } from "@heroui/radio";
import { addToast } from "@heroui/toast";
import { useTranslations } from 'next-intl';

export default function Poll({ poll: initialPoll }: { poll?: PollDto }) {
    const [poll, setPoll] = useState<PollDto | null>(initialPoll || null);
    const [isLoading, setIsLoading] = useState(!initialPoll);
    const [selectedOption, setSelectedOption] = useState<string | undefined>(undefined);
    const { user } = useAuth();
    const t = useTranslations('Polls');

    const fetchLatestPoll = async () => {
        setIsLoading(true);
        try {
            const latestPoll = await polls.getLatest();
            setPoll(latestPoll || null);
        } catch (error) {
            console.error('Failed to fetch latest poll', error);
            setPoll(null);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!initialPoll) {
            fetchLatestPoll();
        }
    }, [initialPoll]);

    const handleVote = async () => {
        if (!poll || !selectedOption) {
            addToast({
                title: t('selectOptionError'),
                color: 'warning',
            });
            return;
        }

        try {
            await polls.vote(poll.id, { option: selectedOption });
            addToast({
                title: t('voteSuccess'),
                color: 'success',
            });
            fetchLatestPoll(); // Refresh poll data to show results
        } catch (error) {
            console.error('Failed to submit vote', error);
            addToast({
                title: t('voteFailed'),
                color: 'danger',
            });
        }
    };

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <h3 className="text-lg font-semibold">{t('loading')}</h3>
                </CardHeader>
                <CardBody>
                    <div className="animate-pulse space-y-4">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                    </div>
                </CardBody>
            </Card>
        );
    }

    if (!poll) {
        return (
            <Card>
                <CardHeader>
                    <h3 className="text-lg font-semibold">{t('title')}</h3>
                </CardHeader>
                <CardBody>
                    <p>{t('noActive')}</p>
                </CardBody>
            </Card>
        );
    }

    const userHasVoted = !!poll.userVotedOption;
    const totalVotes = poll.totalVotes || 0;
    const pollResults = poll.results || {};

    return (
        <Card>
            <CardHeader>
                <h3 className="text-lg font-semibold">{poll.question}</h3>
            </CardHeader>
            <CardBody>
                {userHasVoted ? (
                    <div className="space-y-4">
                        {Object.entries(pollResults).map(([option, votes]) => {
                            const voteCount = typeof votes === 'number' ? votes : 0;
                            const percentage = totalVotes > 0 ? (voteCount / totalVotes) * 100 : 0;
                            const isUserChoice = poll.userVotedOption === option;
                            return (
                                <div key={option}>
                                    <div className="flex justify-between mb-1">
                                        <span className={`font-medium ${isUserChoice ? 'text-primary-500' : ''}`}>{option}</span>
                                        <span className="text-sm text-gray-500">{voteCount} {t('votes')} ({percentage.toFixed(1)}%)</span>
                                    </div>
                                    <Progress value={percentage} />
                                </div>
                            );
                        })}
                       <p className="text-sm text-center text-gray-600 pt-2">{t('totalVotes')}: {totalVotes}</p>
                   </div>
               ) : (
                   <div className="space-y-4">
                       <RadioGroup onValueChange={setSelectedOption} value={selectedOption} label={t('selectAnOption')}>
                           {Object.keys(pollResults).map((option) => (
                               <Radio key={option} value={option}>
                                   {option}
                               </Radio>
                           ))}
                       </RadioGroup>
                       <Button onClick={handleVote} disabled={!user}>
                           {user ? t('submitVote') : t('loginToVote')}
                       </Button>
                    </div>
                )}
            </CardBody>
        </Card>
    );
}