"use client";

import { usePathname, useRouter } from 'next/navigation';
import Header from '@/app/[locale]/components/Header';
import Footer from '@/app/[locale]/components/Footer';
import React, { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function LayoutContent({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const { isAuthenticated, isLoading } = useAuth();

    const noHeaderFooterPaths = ['/login', '/register'];
    const isPublicPath = noHeaderFooterPaths.some(path => pathname.endsWith(path));

    useEffect(() => {
        if (!isLoading) {
            if (!isAuthenticated && !isPublicPath) {
                router.push('/login');
            } else if (isAuthenticated && isPublicPath) {
                router.push('/');
            }
        }
    }, [isLoading, isAuthenticated, isPublicPath, router]);

    if (isLoading) {
        return <div>Loading...</div>; // Or a spinner component
    }

    

    const shouldHideHeaderFooter = noHeaderFooterPaths.some(path => pathname.endsWith(path));

    return (
        <>
            {!shouldHideHeaderFooter && <Header />}
            <main className="flex-grow">
                {children}
            </main>
            {!shouldHideHeaderFooter && <Footer />}
        </>
    );
}