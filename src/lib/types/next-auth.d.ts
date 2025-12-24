import { type DefaultUser, Session } from 'next-auth';
import { JWT } from 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user?: DefaultUser & {
      id: string;
      departmentCode: string;
      username: string;
      usernameSetAt: Date | null;
    };
  }
  interface User extends DefaultUser {
    departmentCode: string;
    username: string;
    usernameSetAt: Date | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    departmentCode: string;
    username: string;
    usernameSetAt: Date | null;
  }
}
