import LayoutContent from '@/app/[locale]/components/LayoutContent';
import type {Metadata} from "next";
import "./globals.css";
import {NextIntlClientProvider, hasLocale} from 'next-intl';
import {notFound} from 'next/navigation';
import {routing} from '@/i18n/routing';
import {Providers} from "./providers";

export const metadata: Metadata = {
    title: "TorrentHub",
    description: "A private tracker for anime, manga, and more.",
};

export default async function RootLayout({
                                             children,
                                             params,
                                         }: {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}) {
    const {locale} = await params;
    if (!hasLocale(routing.locales, locale)) {
        notFound();
    }

    let messages;
    try {
        messages = (await import(`../../../messages/${locale}.json`)).default;
    } catch {
        notFound();
    }

    return (
        <html lang={locale} suppressHydrationWarning>
        <body
            className={`antialiased flex flex-col min-h-screen`}
        >
        <Providers>
            <NextIntlClientProvider locale={locale} messages={messages}>
                <LayoutContent>{children}</LayoutContent>
            </NextIntlClientProvider>
        </Providers>
        </body>
        </html>
    );
}
