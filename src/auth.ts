import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";

import { env } from "~/env";
import { db } from "~/server/db";

const providers = [
  env.AUTH_GOOGLE_ID && env.AUTH_GOOGLE_SECRET
    ? Google({
        clientId: env.AUTH_GOOGLE_ID,
        clientSecret: env.AUTH_GOOGLE_SECRET,
      })
    : null,
  env.AUTH_GITHUB_ID && env.AUTH_GITHUB_SECRET
    ? GitHub({
        clientId: env.AUTH_GITHUB_ID,
        clientSecret: env.AUTH_GITHUB_SECRET,
      })
    : null,
].filter(
  (provider): provider is NonNullable<typeof provider> => provider !== null,
);

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  providers,
  secret: env.AUTH_SECRET,
  pages: {
    signIn: "/auth/signin",
  },
});
