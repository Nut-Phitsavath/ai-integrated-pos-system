import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from './lib/auth';

export default async function proxy(request: NextRequest) {
    const session = await auth();
    const { pathname } = request.nextUrl;

    // 1. Define Route Categories
    const publicRoutes = ['/login', '/register', '/api/auth'];
    const adminRoutes = ['/settings', '/api/settings']; // Admin ONLY
    const managerRoutes = ['/dashboard', '/api/dashboard', '/inventory', '/api/inventory']; // Admin OR Manager

    // Check if route is public
    const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route) || pathname === '/');

    // 2. Auth Check: If not logged in and trying to access private route
    if (!session && !isPublicRoute) {
        if (pathname.startsWith('/api/')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // 3. RBAC Checks
    if (session) {
        const role = session.user.role;

        // Redirect logged-in user away from login page
        if (pathname === '/login') {
            return NextResponse.redirect(new URL('/checkout', request.url));
        }

        // Admin-only routes
        const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route));
        if (isAdminRoute && role !== 'ADMIN') {
            if (pathname.startsWith('/api/')) {
                return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
            }
            return NextResponse.redirect(new URL('/checkout', request.url));
        }

        // Manager/Admin routes
        const isManagerRoute = managerRoutes.some(route => pathname.startsWith(route));
        if (isManagerRoute && role !== 'ADMIN' && role !== 'MANAGER') {
            if (pathname.startsWith('/api/')) {
                return NextResponse.json({ error: 'Forbidden: Manager access required' }, { status: 403 });
            }
            return NextResponse.redirect(new URL('/checkout', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
