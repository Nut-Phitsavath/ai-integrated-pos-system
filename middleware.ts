import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from './lib/auth';

export async function middleware(request: NextRequest) {
    const session = await auth();

    // Protected routes
    const protectedRoutes = ['/checkout', '/products', '/orders'];
    const isProtectedRoute = protectedRoutes.some((route) =>
        request.nextUrl.pathname.startsWith(route)
    );

    // If accessing protected route without session, redirect to login
    if (isProtectedRoute && !session) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // If logged in and accessing login page, redirect to checkout
    if (request.nextUrl.pathname === '/login' && session) {
        return NextResponse.redirect(new URL('/checkout', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
