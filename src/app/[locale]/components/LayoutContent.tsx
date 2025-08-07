"use client";

import { usePathname } from 'next/navigation';
import Header from '@/app/[locale]/components/Header';
import Footer from '@/app/[locale]/components/Footer';
import React from 'react';

export default function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Paths where Header and Footer should be hidden
  // Note: pathname from usePathname will include the locale, e.g., /en/login
  const noHeaderFooterPaths = [
    '/login',
    '/register',
  ];

  // Check if the current path (after locale) is in the noHeaderFooterPaths list
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
