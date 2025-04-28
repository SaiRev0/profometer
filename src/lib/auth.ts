import { db } from '@/lib/db';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { PrismaClient } from '@prisma/client';

import { NextAuthOptions, getServerSession } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt'
  },
  pages: {
    signIn: '/sign-in',
    newUser: '/register'
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!
    })
  ],
  callbacks: {
    async signIn({ user }) {
      if (user && user.email && user.email.includes('@itbhu.ac.in')) {
        return true;
      } else {
        return '/signin?error=AccessDenied';
      }
    },

    // async signIn({ account, profile }) {
    //   if (account.provider === 'google') {
    //     return profile.email_verified && profile.email.endsWith('@example.com')
    //   }
    //   return true // Do different verification for other providers that don't have `email_verified`
    // },

    async session({ token, session, trigger, newSession }) {
      if (trigger === 'update' && newSession?.user) {
        session.user = newSession.user;
      }
      return session;
    },

    async jwt({ token, user, trigger, session }) {
      if (trigger === 'update' && session) {
        token = session;
      }

      if (token.email) {
        const dbUser = await db.user.findUnique({
          where: {
            email: token.email
          }
        });

        if (!dbUser) {
          token.id = user!.id;
          return token;
        }

        return {
          dbUser
        };
      } else {
        throw new Error('Token email is not defined');
      }
    }
  }
};

export const getAuthSession = () => getServerSession(authOptions);
