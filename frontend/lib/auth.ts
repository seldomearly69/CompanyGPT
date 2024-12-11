import { authenticateUser } from "@/service/auth";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        if (!credentials?.email || !credentials?.password) return null;
        console.log(credentials);
        const response = await authenticateUser(
          credentials.email,
          credentials.password
        );

        if (response.ok) {
          const user = await response.json();
          return user;
        }
        return null;
      },
    }),
  ],
  callbacks: {
   
    async session({ session, token }) {
      if (token) {
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.role = token.role;
      }
      return session;
    },

    async jwt({ token, user }) {
      if (user) {
        token.name = user.name;
        token.email = user.email;
        token.role = user.role;
      }
      return token;
    }
  },
};
 