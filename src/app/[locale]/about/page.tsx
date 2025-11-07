import { NextPage } from 'next';
import { useTranslations } from 'next-intl';
import SiteStats from '../components/SiteStats';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const AboutPage: NextPage = () => {
    const t = useTranslations();

    return (
        <div className="container mx-auto px-4 py-8">
            <Card>
                <CardHeader>
                    <CardTitle className="text-3xl">{t('about.title')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p>{t('about.description')}</p>
                    <SiteStats mode="full" />
                </CardContent>
            </Card>
        </div>
    );
};

export default AboutPage;
