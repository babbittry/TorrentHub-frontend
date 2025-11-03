"use client";

import { ReactNode, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { usePathname } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faGaugeHigh, faPlusCircle, faBan, faCopy, faSlidersH, faUsers, faCog, faBullhorn, faFileAlt, faBars
} from '@fortawesome/free-solid-svg-icons';

interface AdminLayoutProps {
    children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
    const t = useTranslations('Admin.sidebar');
    const pathname = usePathname();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const navItems = [
        {
            name: t('dashboard'),
            href: '/admin/dashboard',
            icon: faGaugeHigh,
        },
        {
            name: t('addPoll'),
            href: '/admin/add-poll',
            icon: faPlusCircle,
        },
        {
            name: t('bannedClients'),
            href: '/admin/banned-clients',
            icon: faBan,
        },
        {
            name: t('duplicateIPs'),
            href: '/admin/duplicate-ips',
            icon: faCopy,
        },
        {
            name: t('bandwidthSettings'),
            href: '/admin/bandwidth-settings',
            icon: faSlidersH,
        },
        {
            name: t('userManagement'),
            href: '/admin/user-management',
            icon: faUsers,
        },
        {
            name: t('siteSettings'),
            href: '/admin/site-settings',
            icon: faCog,
        },
        {
            name: t('announcementManagement'),
            href: '/admin/announcement-management',
            icon: faBullhorn,
        },
        {
            name: t('systemLogs'),
            href: '/admin/log-viewer',
            icon: faFileAlt,
        },
        {
            name: t('cheatLogs'),
            href: '/admin/cheat-logs',
            icon: faFileAlt,
        },
    ];

    return (
        <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
            {/* Sidebar */}
            <aside className={`bg-gray-800 text-white shadow-lg flex-shrink-0 transition-all duration-300 ${isSidebarOpen ? 'w-64 p-4' : 'w-0 p-0 overflow-hidden'}`}>
                <h2 className="text-2xl font-bold mb-6">{t('adminPanel')}</h2>
                <nav>
                    <ul>
                        {navItems.map((item) => (
                            <li key={item.name} className="mb-2">
                                <Link
                                    href={item.href}
                                    className={`flex items-center p-2 rounded-lg transition-colors duration-200
                                        ${pathname.includes(item.href) ? 'bg-indigo-600 text-white' : 'hover:bg-gray-700 text-gray-300'}`}
                                >
                                    <FontAwesomeIcon icon={item.icon} className="w-5 h-5 mr-3" />
                                    <span className={isSidebarOpen ? 'opacity-100' : 'opacity-0'}>{item.name}</span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>
            </aside>

            {/* Main Content */}
            <div className="flex-grow flex flex-col">
                <header className="bg-white dark:bg-gray-800 shadow-md p-4 flex items-center">
                    <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                        <FontAwesomeIcon icon={faBars} />
                    </button>
                    {/* You can add more header content here, like user menu or notifications */}
                </header>
                <main className="flex-grow p-4 sm:p-6 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
