import { getTranslations } from 'next-intl/server';
import SiteStats from '@/app/[locale]/components/SiteStats'; // Import SiteStats component

export default async function AdminDashboard() {
    const t = await getTranslations('AdminDashboard');

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                {t('dashboard')}
            </h1>
            {/* Site Statistics Section */}
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                {t('stats.title')}
            </h2>
            <SiteStats mode="full" />
        </div>
    );
}