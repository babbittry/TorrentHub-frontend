import createMiddleware from 'next-intl/middleware';
import { routing } from '@/i18n/routing';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const nextIntlMiddleware = createMiddleware(routing);

export async function proxy(request: NextRequest) {
    // First, let next-intl handle the request. This is crucial for locale
    // detection and for handling the root path (`/`) correctly.
    const response = nextIntlMiddleware(request);

    // If next-intl returned a redirect response (e.g., from `/` to `/en`),
    // we return it directly and skip the authentication logic.
    if (response.status === 307 || response.status === 308) {
        return response;
    }

    // Now that we know a locale is present in the path, we can run auth checks.
    const refreshToken = request.cookies.get('refreshToken')?.value;
    const { pathname } = request.nextUrl;

    const publicPaths = ['/login', '/register', '/rules'];

    // Extract the path without the locale prefix (e.g., /en/torrents -> /torrents)
    const pathWithoutLocale = pathname.replace(/^\/[a-zA-Z]{2,5}(-[a-zA-Z]{2,5})?/, '') || '/';
    const isPublicPath = publicPaths.some(p => pathWithoutLocale === p || pathWithoutLocale.startsWith(`${p}/`));

    // If the user is not authenticated and is trying to access a protected page...
    if (!refreshToken && !isPublicPath) {
        console.log(`[Proxy] Redirect to login: ${pathWithoutLocale}`);
        // ...redirect them to the localized login page.
        const locale = pathname.split('/')[1] || 'en'; // Extract locale from path@
        return NextResponse.redirect(new URL(`/${locale}/login`, request.url), { status: 303, headers: { 'Cache-Control': 'no-store' } });
    }

    // If the user is authenticated and tries to visit login or register...
    if (refreshToken && (pathWithoutLocale === '/login' || pathWithoutLocale === '/register')) {
        console.log(`[Proxy] Redirect to home: ${pathWithoutLocale}`);
        // ...redirect them to the localized home page.
        const locale = pathname.split('/')[1] || 'en';
        return NextResponse.redirect(new URL(`/${locale}/`, request.url));
    }

    // If no auth-related redirect is needed, return the response from next-intl.
    return response;
}

export const config = {
    // Matcher entries are linked with an OR operation
    matcher: [
        // Match all pathnames except for
        // - … if they start with `/api`, `/_next` or `/_vercel`
        // - … the ones containing a dot (e.g. `favicon.ico`)
        '/((?!api|_next|_vercel|.*\\..*).*)',
        // Match all pathnames starting with a locale (e.g. `/en`, `/fr`, `/ja`, `/zh`)
        '/(en|fr|ja|zh-CN)/:path*',
    ]
};
