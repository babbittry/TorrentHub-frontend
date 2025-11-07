'use client';

import { useEffect, useState } from 'react';
import { polls } from '@/lib/api';
import type { PollDto } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
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
            toast.warning(t('selectOptionError'));
            return;
        }

        try {
            await polls.vote(poll.id, { option: selectedOption });
            toast.success(t('voteSuccess'));
            fetchLatestPoll();
        } catch (error) {
            console.error('Failed to submit vote', error);
            toast.error(t('voteFailed'));
        }
    };

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>{t('loading')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="animate-pulse space-y-4">
                        <div className="h-4 bg-secondary rounded w-3/4"></div>
                        <div className="h-4 bg-secondary rounded w-1/2"></div>
                        <div className="h-4 bg-secondary rounded w-5/6"></div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (!poll) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>{t('title')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>{t('noActive')}</p>
                </CardContent>
            </Card>
        );
    }

    const userHasVoted = !!poll.userVotedOption;
    const totalVotes = poll.totalVotes || 0;
    const pollResults = poll.results || {};

    return (
        <Card>
            <CardHeader>
                <CardTitle>{poll.question}</CardTitle>
            </CardHeader>
            <CardContent>
                {userHasVoted ? (
                    <div className="space-y-4">
                        {Object.entries(pollResults).map(([option, votes]) => {
                            const voteCount = typeof votes === 'number' ? votes : 0;
                            const percentage = totalVotes > 0 ? (voteCount / totalVotes) * 100 : 0;
                            const isUserChoice = poll.userVotedOption === option;
                            return (
                                <div key={option}>
                                    <div className="flex justify-between mb-1">
                                        <span className={`font-medium ${isUserChoice ? 'text-primary' : ''}`}>{option}</span>
                                        <span className="text-sm text-muted-foreground">{voteCount} {t('votes')} ({percentage.toFixed(1)}%)</span>
                                    </div>
                                    <Progress value={percentage} />
                                </div>
                            );
                        })}
                       <p className="text-sm text-center text-muted-foreground pt-2">{t('totalVotes')}: {totalVotes}</p>
                   </div>
               ) : (
                   <div className="space-y-4">
                       <RadioGroup onValueChange={setSelectedOption} value={selectedOption}>
                           <Label className="mb-2 block">{t('selectAnOption')}</Label>
                           {Object.keys(pollResults).map((option) => (
                               <div key={option} className="flex items-center space-x-2">
                                   <RadioGroupItem value={option} id={option} />
                                   <Label htmlFor={option}>{option}</Label>
                               </div>
                           ))}
                       </RadioGroup>
                       <Button onClick={handleVote} disabled={!user}>
                           {user ? t('submitVote') : t('loginToVote')}
                       </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}