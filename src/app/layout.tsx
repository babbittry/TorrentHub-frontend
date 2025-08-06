import type {Metadata} from "next";
import {Geist, Geist_Mono} from "next/font/google";
import "./globals.css";
import Header from "../components/Header";
import Footer from "../components/Footer";
import {AuthProvider} from "../context/AuthContext";
import {ThemeProvider} from "../context/ThemeContext";
import {I18nProvider} from "./i18n-provider";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Sakura.PT",
    description: "A private tracker for anime, manga, and more.",
};

export default function RootLayout({
                                       children,
                                       params: {lang},
                                   }: Readonly<{
    children: React.ReactNode;
    params: { lang: string };
}>) {
    return (
        <html>
        <body
            className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}
        >
        <I18nProvider locale={lang}>
            <AuthProvider>
                <ThemeProvider>
                    <Header/>
                    <main className="flex-grow">
                        {children}
                    </main>
                    <Footer/>
                </ThemeProvider>
            </AuthProvider>
        </I18nProvider>
        </body>
        </html>
    );
}
