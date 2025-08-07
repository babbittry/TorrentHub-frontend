"use client";

import { useTranslations } from 'next-intl';

export default function Footer() {
    const t = useTranslations();

    return (
        <footer className="bg-gray-800 text-white p-4 mt-8">
            <div className="container mx-auto text-center text-gray-400">
                <p>&copy; {new Date().getFullYear()} Sakura.PT. {t('all_rights_reserved')}</p>
                <div className="flex justify-center space-x-4 mt-2">
                    <a href="#" className="hover:text-pink-400 transition-colors duration-200">{t('privacy_policy')}</a>
                    <a href="#" className="hover:text-pink-400 transition-colors duration-200">{t('terms_of_service')}</a>
                    <a href="#" className="hover:text-pink-400 transition-colors duration-200">{t('contact_us')}</a>
                </div>
            </div>
        </footer>
    );
}