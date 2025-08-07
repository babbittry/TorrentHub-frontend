import createMiddleware from 'next-intl/middleware';
import { routing } from '@/i18n/routing';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const nextIntlMiddleware = createMiddleware(routing);

export async function middleware(request: NextRequest) {
    const authToken = request.cookies.get('authToken')?.value;
    const { pathname } = request.nextUrl;

    // Define public paths that don't require authentication
    // These paths are relative to the locale, e.g., /login, /register, /rules
    const publicPaths = [
        '/login',
        '/register',
        '/rules',
    ];

    // Determine if the current path is a public path, considering the locale prefix
    // Example: /en/login, /zh/register, /rules
    const isPublicPath = publicPaths.some(path => pathname.endsWith(path) || pathname.endsWith(`${path}/`));

    // If user is NOT authenticated
    if (!authToken) {
        // If trying to access a non-public path, redirect to login
        if (!isPublicPath) {
            // Get the current locale from the request URL to redirect to the correct localized login page
            const langMatch = pathname.match(/^\/([a-z]{2})\//);
            const langPrefix = langMatch ? `/${langMatch[1]}` : ''; // e.g., /en
            return NextResponse.redirect(new URL(`${langPrefix}/login`, request.url));
        }
    } else {
        // If user IS authenticated
        // If trying to access login or register page, redirect to home
        if (pathname.includes('/login') || pathname.includes('/register')) {
            const langMatch = pathname.match(/^\/([a-z]{2})\//);
            const langPrefix = langMatch ? `/${langMatch[1]}` : '';
            return NextResponse.redirect(new URL(`${langPrefix}/`, request.url));
        }
    }

    // If no authentication redirect is needed, proceed with next-intl middleware
    return nextIntlMiddleware(request);
}

export const config = {
    matcher: '/((?!api|trpc|_next|_vercel|.*\..*).*)'
};

