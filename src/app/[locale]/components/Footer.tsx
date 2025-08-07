"use client";

import { useTranslations } from 'next-intl';

export default function Footer() {
    const t = useTranslations();

    return (
        <footer className="bg-[var(--color-card-background)] text-[var(--color-foreground)] p-4 mt-8 shadow-inner">
            <div className="container mx-auto text-center text-[var(--color-text-muted)]">
                <p>&copy; {new Date().getFullYear()} Sakura.PT. {t('all_rights_reserved')}</p>
                <div className="flex justify-center space-x-4 mt-2">
                    <a href="#" className="hover:text-[var(--color-primary-hover)] transition-colors duration-200">{t('privacy_policy')}</a>
                    <a href="#" className="hover:text-[var(--color-primary-hover)] transition-colors duration-200">{t('terms_of_service')}</a>
                    <a href="#" className="hover:text-[var(--color-primary-hover)] transition-colors duration-200">{t('contact_us')}</a>
                </div>
            </div>
        </footer>
    );
}