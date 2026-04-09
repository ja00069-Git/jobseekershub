import { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const requiredAuthEnv = [
  "NEXTAUTH_URL",
  "NEXTAUTH_SECRET",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
] as const;

for (const envName of requiredAuthEnv) {
  if (!process.env[envName]) {
    throw new Error(`${envName} is required for authentication.`);
  }
}

if (process.env.NODE_ENV === "production") {
  const nextAuthUrl = process.env.NEXTAUTH_URL;

  try {
    const parsedUrl = new URL(nextAuthUrl!);
    const isLocalHost = ["localhost", "127.0.0.1", "::1"].includes(
      parsedUrl.hostname,
    );

    if (!isLocalHost && parsedUrl.protocol !== "https:") {
      throw new Error("NEXTAUTH_URL must use https in production.");
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes("NEXTAUTH_URL must use https")) {
      throw error;
    }

    throw new Error("NEXTAUTH_URL must be a valid URL.");
  }
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  useSecureCookies: process.env.NODE_ENV === "production",
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 8,
    updateAge: 60 * 30,
  },
  jwt: {
    maxAge: 60 * 60 * 8,
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope:
            "openid email profile https://www.googleapis.com/auth/gmail.readonly",
          access_type: "offline",
          prompt: "consent",
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ user, profile }) {
      const googleProfile = profile as { email_verified?: boolean } | undefined;
      return Boolean(user.email && (googleProfile?.email_verified ?? true));
    },

    async jwt({ token, account }) {
      if (account?.access_token) {
        token.accessToken = account.access_token;
      }

      return token;
    },

    async session({ session, token }) {
      session.accessToken = token.accessToken as string | undefined;
      return session;
    },
  },
};
