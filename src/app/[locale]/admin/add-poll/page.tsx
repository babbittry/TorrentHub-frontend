import { getTranslations } from 'next-intl/server';

export default async function AddPollPage() {
    const t = await getTranslations('AdminDashboard');

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                {t('addPoll')}
            </h1>
            <p className="text-gray-700 dark:text-gray-300">{t('addPollDescription')}</p>
        </div>
    );
}
