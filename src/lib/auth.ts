import { generateUsername } from '@/lib/username-generator';
import { PrismaAdapter } from '@next-auth/prisma-adapter';

import { db } from './db';
import 'dotenv/config';
import { NextAuthOptions, getServerSession } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

// Types are defined in src/lib/types/next-auth.d.ts

// Map of department codes to their IDs
const departmentCodeMap: { [key: string]: string } = {
  apd: 'APD', // Architecture, Planning and Design
  cer: 'CER', // Ceramic Engineering
  che: 'CHE', // Chemical Engineering and Technology
  civ: 'CIV', // Civil Engineering
  cse: 'CSE', // Computer Science and Engineering
  eee: 'EEE', // Electrical Engineering
  ece: 'ECE', // Electronics Engineering
  mec: 'MEC', // Mechanical Engineering
  dse: 'MEC', // Design Science of Mechanical Engineering
  met: 'MET', // Metallurgical Engineering
  min: 'MIN', // Mining Engineering
  phe: 'PHE', // Pharmaceutical Engineering and Technology
  chy: 'CHY', // Chemistry
  mat: 'MAT', // Mathematical Sciences
  phy: 'PHY', // Physics
  bce: 'BCE', // Biochemical Engineering
  bme: 'BME', // Biomedical Engineering
  mst: 'MST', // Materials Science and Technology
  hss: 'HS' // Humanistic Studies
};

// Function to extract department code from email
function getDepartmentCodeFromEmail(email: string): string | null {
  // Get the part before @itbhu.ac.in
  const localPart = email.split('@')[0];

  // Split by dots and get the last part before the year
  // Format is: something.xxxYY@itbhu.ac.in where xxx is department code and YY is year
  const parts = localPart.split('.');
  if (parts.length < 1) return null;

  // Get the last part and extract the department code (xxx) before the year (YY)
  const lastPart = parts[parts.length - 1];
  const deptCode = lastPart.replace(/\d+$/, '').toLowerCase(); // Remove year numbers and convert to lowercase
  // Map the department code to the official code
  const officialCode = departmentCodeMap[deptCode];

  return officialCode || null;
}

// Create a custom adapter that includes department data
const customPrismaAdapter = {
  ...PrismaAdapter(db),
  createUser: async (data: any) => {
    // Extract email and get department code
    const email = data.email;
    const deptCode = getDepartmentCodeFromEmail(email);

    // Generate unique username for new users
    const username = await generateUsername();

    // Create user with department data
    return db.user.create({
      data: {
        ...data,
        username, // NEW: Add generated username
        departmentCode: deptCode
      }
    });
  }
};

export const authOptions: NextAuthOptions = {
  adapter: customPrismaAdapter,
  session: {
    strategy: 'jwt'
  },
  pages: {
    signIn: '/signin'
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
    async signIn({ user, profile }) {
      // Check if email is from IIT BHU domain
      if (!profile?.email?.endsWith('@itbhu.ac.in')) {
        return '/signin?error=AccessDenied';
      }

      // Get department code from email
      const deptCode = getDepartmentCodeFromEmail(profile.email);
      if (!deptCode) {
        return '/signin?error=InvalidDepartment';
      }

      // Find department in database
      const department = await db.department.findUnique({
        where: { code: deptCode }
      });

      if (!department) {
        return '/signin?error=DepartmentNotFound';
      }

      return true;
    },

    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },

    async session({ token, session }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.username = token.username as string;
        session.user.usernameSetAt = token.usernameSetAt as Date | null;
      }
      return session;
    },

    async jwt({ token, user, account, trigger }) {
      // Initial sign in
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.usernameSetAt = user.usernameSetAt;
      }
      if (account) {
        token.accessToken = account.access_token;
      }

      // On every request, fetch fresh usernameSetAt to detect confirmation
      if (token.id) {
        const dbUser = await db.user.findUnique({
          where: { id: token.id as string },
          select: { username: true, usernameSetAt: true }
        });
        if (dbUser) {
          token.username = dbUser.username;
          token.usernameSetAt = dbUser.usernameSetAt;
        }
      }

      return token;
    }
  }
};

export const getAuthSession = () => getServerSession(authOptions);
