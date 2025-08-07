import type {Metadata} from "next";
import "./globals.css";
import {AuthProvider} from "@/context/AuthContext";
import {ThemeProvider} from "@/context/ThemeContext";
import {NextIntlClientProvider, hasLocale} from 'next-intl';
import {notFound} from 'next/navigation';
import {routing} from '@/i18n/routing';
import Header from '@/app/[locale]/components/Header';
import Footer from '@/app/[locale]/components/Footer';

export const metadata: Metadata = {
    title: "Sakura.PT",
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
    } catch (error) {
        notFound();
    }

    return (
        <html lang={locale}>
        <body
            className={`antialiased flex flex-col min-h-screen`}
        >
        <AuthProvider>
            <ThemeProvider>
                <NextIntlClientProvider locale={locale} messages={messages}>
                    <Header />
                    <main className="flex-grow">
                        {children}
                    </main>
                    <Footer />
                </NextIntlClientProvider>
            </ThemeProvider>
        </AuthProvider>
        </body>
        </html>
    );
}
