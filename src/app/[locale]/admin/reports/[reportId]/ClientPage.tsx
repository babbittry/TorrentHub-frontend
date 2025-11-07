"use client";
import React, { useEffect, useState } from 'react';
import { reports, ReportDto } from '../../../../../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type ClientPageProps = {
    params: {
        reportId: string;
    }
};

const ClientPage = ({ params }: ClientPageProps) => {
    const t = useTranslations('Admin.reports');
    const router = useRouter();
    const [report, setReport] = useState<ReportDto | null>(null);
    const [adminNotes, setAdminNotes] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchReport = async () => {
            try {
                setLoading(true);
                const reportData = await reports.getReportById(parseInt(params.reportId, 10));
                setReport(reportData);
            } catch (err) {
                setError(t('process.fetchError'));
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchReport();
    }, [params.reportId, t]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!adminNotes.trim()) {
            setError(t('process.notesRequired'));
            return;
        }
        setIsSubmitting(true);
        setError(null);
        try {
            await reports.processReport(parseInt(params.reportId, 10), {
                adminNotes,
                markAsProcessed: true,
            });
            // Ideally, show a success toast message here
            router.push('/admin/dashboard');
        } catch (err) {
            setError(t('process.submitError'));
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return <div className="container mx-auto p-4">{t('process.loading')}</div>;
    }

    if (error) {
        return <div className="container mx-auto p-4 text-red-500">{error}</div>;
    }

    if (!report) {
        return <div className="container mx-auto p-4">{t('process.notFound')}</div>;
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6">{t('process.title')} #{report.id}</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>{t('process.reportDetails')}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <p className="font-semibold">{t('process.torrent')}:</p>
                            {report.torrent ? (
                                <Link href={`/torrents/${report.torrent.id}`} className="text-blue-500 hover:underline">
                                    {report.torrent.name}
                                </Link>
                            ) : (
                                'N/A'
                            )}
                        </div>
                        <div>
                            <p className="font-semibold">{t('process.reporter')}:</p>
                            {report.reporterUser ? (
                                <Link href={`/users/${report.reporterUser.id}`} className="text-blue-500 hover:underline">
                                    {report.reporterUser.userName}
                                </Link>
                            ) : (
                                'N/A'
                            )}
                        </div>
                        <div>
                            <p className="font-semibold">{t('process.uploader')}:</p>
                            {report.torrent?.uploader ? (
                                <Link href={`/users/${report.torrent.uploader.id}`} className="text-blue-500 hover:underline">
                                    {report.torrent.uploader.username}
                                </Link>
                            ) : (
                                'N/A'
                            )}
                        </div>
                        <div>
                            <p className="font-semibold">{t('process.reason')}:</p>
                            <p>{report.reason}</p>
                        </div>
                        <div>
                            <p className="font-semibold">{t('process.details')}:</p>
                            <p>{report.details || t('process.noDetails')}</p>
                        </div>
                        <div>
                            <p className="font-semibold">{t('process.reportedAt')}:</p>
                            <p>{new Date(report.reportedAt).toLocaleString()}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>{t('process.processAction')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="adminNotes">
                                    {t('process.adminNotes')}
                                </Label>
                                <Textarea
                                    id="adminNotes"
                                    value={adminNotes}
                                    onChange={(e) => setAdminNotes(e.target.value)}
                                    placeholder={t('process.notesPlaceholder')}
                                    required
                                />
                            </div>
                            {error && <p className="text-destructive text-sm">{error}</p>}
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? t('process.submitting') : t('process.markAsProcessed')}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default ClientPage;