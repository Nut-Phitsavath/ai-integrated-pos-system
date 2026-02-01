import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { prisma } from './prisma';
import bcrypt from 'bcryptjs';

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        Credentials({
            credentials: {
                username: { label: 'Username', type: 'text' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                console.log('🔐 Auth attempt:', credentials?.username);

                if (!credentials?.username || !credentials?.password) {
                    console.log('❌ Missing credentials');
                    return null;
                }

                const user = await prisma.user.findUnique({
                    where: { username: credentials.username as string },
                });

                if (!user) {
                    console.log('❌ User not found:', credentials.username);
                    return null;
                }

                console.log('✅ User found:', user.username);

                const isPasswordValid = await bcrypt.compare(
                    credentials.password as string,
                    user.password
                );

                if (!isPasswordValid) {
                    console.log('❌ Invalid password');
                    return null;
                }

                console.log('✅ Password valid, logging in');

                return {
                    id: user.id,
                    name: user.username,
                    role: user.role,
                };
            },
        }),
    ],
    pages: {
        signIn: '/login',
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.role = user.role;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.sub!;
                session.user.role = token.role as string;
            }
            return session;
        },
    },
});
