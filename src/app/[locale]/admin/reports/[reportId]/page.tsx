import ClientPage from './ClientPage';

type ProcessReportPageProps = {
    params: Promise<{
        reportId: string;
        locale: string;
    }>;
    searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
};

const ProcessReportPage = async ({ params }: ProcessReportPageProps) => {
    const resolvedParams = await params;
    return <ClientPage params={resolvedParams} />;
};

export default ProcessReportPage;