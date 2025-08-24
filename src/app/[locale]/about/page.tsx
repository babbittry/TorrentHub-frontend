import { NextPage } from 'next';
import { useTranslations } from 'next-intl';
import SiteStats from '../components/SiteStats';
import { Card, CardBody, CardHeader } from "@heroui/card";

const AboutPage: NextPage = () => {
    const t = useTranslations();

    return (
        <div className="container mx-auto px-4 py-8">
            <Card>
                <CardHeader>
                    <h1 className="text-3xl font-bold">{t('about.title')}</h1>
                </CardHeader>
                <CardBody className="space-y-4">
                    <p>{t('about.description')}</p>
                    <SiteStats mode="full" />
                </CardBody>
            </Card>
        </div>
    );
};

export default AboutPage;
