import { type DefaultUser, Session } from 'next-auth';
import { JWT } from 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user?: DefaultUser & { id: string; departmentCode: string };
  }
  interface User extends DefaultUser {
    departmentCode: string;
  }
  //   interface Session {
  //     id: string;
  //     name: string;
  //     email: string;
  //     image: string;
  //     createdAt: Date;
  //     departmentCode: string;
  //   }

  //   interface User {
  //     id: string;
  //     name: string;
  //     email: string;
  //     image: string;
  //     createdAt: Date;
  //     departmentCode: string;
  //   }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    name: string;
    email: string;
    image: string;
    createdAt: Date;
    departmentCode: string;
  }
}
