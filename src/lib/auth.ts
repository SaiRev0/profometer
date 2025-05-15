import { PrismaAdapter } from '@next-auth/prisma-adapter';

import { PrismaClient } from '../../prisma/generated/client';
import { NextAuthOptions, getServerSession } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

const prisma = new PrismaClient();

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

// Define auth error types
export type AuthError = {
  type: 'AccessDenied' | 'InvalidDepartment' | 'DepartmentNotFound' | 'Unknown';
  message: string;
};

// Map of error types to user-friendly messages
export const authErrorMessages: Record<AuthError['type'], string> = {
  AccessDenied: 'Only IIT BHU email addresses (@itbhu.ac.in) are allowed to sign in.',
  InvalidDepartment: 'Could not determine your department from your email address.',
  DepartmentNotFound: 'Your department is not registered in our system.',
  Unknown: 'An unexpected error occurred during sign in.'
};

// Create a custom adapter that includes department data
const customPrismaAdapter = {
  ...PrismaAdapter(prisma),
  createUser: async (data: any) => {
    // Extract email and get department code
    const email = data.email;
    const deptCode = getDepartmentCodeFromEmail(email);

    // Create user with department data
    return prisma.user.create({
      data: {
        ...data,
        departmentCode: deptCode
      }
    });
  }
};

export const authOptions: NextAuthOptions = {
  debug: process.env.NODE_ENV === 'development',
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
    async signIn({ profile }) {
      if (!profile?.email?.endsWith('@itbhu.ac.in')) {
        return '/signin?error=AccessDenied';
      }

      // Get department code from email
      const deptCode = getDepartmentCodeFromEmail(profile.email);
      if (!deptCode) {
        return '/signin?error=InvalidDepartment';
      }

      // Find department in database
      const department = await prisma.department.findUnique({
        where: { code: deptCode }
      });

      if (!department) {
        return '/signin?error=DepartmentNotFound';
      }

      return true;
    },

    async session({ token, session }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.image = token.picture as string;
        session.user.departmentCode = token.departmentCode as string;
      }
      return session;
    },

    async jwt({ token, user, account, profile, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.departmentCode = user.departmentCode;
      }
      if (account) {
        token.accessToken = account.access_token;
      }
      if (profile) {
        token.email = profile.email as string;
        token.name = profile.name as string;
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
