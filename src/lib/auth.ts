import { db } from '@/lib/db';
import { PrismaAdapter } from '@next-auth/prisma-adapter';

import { PrismaClient } from '../../prisma/generated/client';
import { NextAuthOptions, getServerSession } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

const prisma = new PrismaClient();

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt'
  },
  pages: {
    signIn: '/signin'
    // error: '/signin?error=AccessDenied'
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
          scope: 'openid email profile'
        }
      }
    })
  ],
  callbacks: {
    async signIn({ profile }) {
      if (profile && profile.email && profile.email.endsWith('@itbhu.ac.in')) {
        return true;
      } else {
        return '/signin?error=AccessDenied';
      }
    },

    async session({ token, session }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.image = token.picture as string;
      }
      return session;
    },

    async jwt({ token, user, account, profile }) {
      if (user) {
        token.id = user.id;
      }
      if (account) {
        token.accessToken = account.access_token;
      }
      if (profile) {
        token.email = profile.email;
        token.name = profile.name;
        token.picture = (profile as any).picture;
      }
      return token;
    }
  },
  events: {
    async signIn({ user, account, profile }) {
      if (profile && profile.email && !profile.email.endsWith('@itbhu.ac.in')) {
        throw new Error('AccessDenied');
      }
    }
  }
};

export const getAuthSession = () => getServerSession(authOptions);
