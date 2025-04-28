import NextAuth, { NextAuthOptions } from 'next-auth';
import GitHub from 'next-auth/providers/github';
import Google from 'next-auth/providers/google';

// Define the authentication options
const authOptions: NextAuthOptions = {
    providers: [
        GitHub({
            clientId: process.env.GITHUB_CLIENT_ID as string,
            clientSecret: process.env.GITHUB_CLIENT_SECRET as string
        }),
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        })
    ],
    callbacks: {
        async signIn({ profile }) {
            // Check if the email ends with the required domain
            return profile?.email?.endsWith('@itbhu.ac.in') ?? false;
        }
    },
    pages: {
        signIn: '/signin' // Custom sign-in page path
    }
};

// NextAuth default export (handles authentication logic)
const handler = NextAuth(authOptions);

// Export the HTTP methods (GET, POST) for Next.js API route handling
export { handler as GET, handler as POST };
