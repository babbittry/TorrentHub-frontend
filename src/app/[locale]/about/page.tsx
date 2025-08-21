import { NextPage } from 'next';
import { useTranslations } from 'next-intl';
import SiteStats from '../components/SiteStats';

const AboutPage: NextPage = () => {
    const t = useTranslations();

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-4xl font-bold mb-4">{t('about.title')}</h1>
            <p className="mb-8">{t('about.description')}</p>
            <SiteStats mode="full" />
        </div>
    );
};

export default AboutPage;