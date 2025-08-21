import { useTranslations } from 'next-intl';
import SiteStats from '../components/SiteStats';

export default function Footer() {
    const t = useTranslations();

    return (
        <footer className="bg-[var(--color-card-background)] text-[var(--color-foreground)] p-4 mt-8 shadow-inner">
            <div className="container mx-auto text-[var(--color-text-muted)]">
                <div className="flex justify-between items-center">
                    <div className="text-left">
                        <SiteStats mode="simple" />
                    </div>
                    <div className="text-right">
                        <p>&copy; {new Date().getFullYear()} TorrentHub. {t('footer.all_rights_reserved')}</p>
                        <div className="flex justify-end space-x-4 mt-2">
                            <a href="#" className="hover:text-[var(--color-primary-hover)] transition-colors duration-200">{t('footer.privacy_policy')}</a>
                            <a href="#" className="hover:text-[var(--color-primary-hover)] transition-colors duration-200">{t('footer.terms_of_service')}</a>
                            <a href="#" className="hover:text-[var(--color-primary-hover)] transition-colors duration-200">{t('footer.contact_us')}</a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
