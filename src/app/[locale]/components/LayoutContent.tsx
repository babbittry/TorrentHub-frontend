"use client";

import { usePathname } from 'next/navigation';
import Header from '@/app/[locale]/components/Header';
import Footer from '@/app/[locale]/components/Footer';
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function LayoutContent({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { isLoading } = useAuth();
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    if (isLoading) {
        // You can replace this with a proper global spinner component
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <p>Loading application...</p>
            </div>
        );
    }

    const noHeaderFooterPaths = ['/login', '/register', '/admin'];
    const shouldHideHeaderFooter = noHeaderFooterPaths.some(path => pathname.includes(path));

    return (
        <>
            {isClient && !shouldHideHeaderFooter && <Header />}
            <main className="grow">
                {children}
            </main>
            {isClient && !shouldHideHeaderFooter && <Footer />}
        </>
    );
}