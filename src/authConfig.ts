import type { NextAuthConfig } from "next-auth";

const ONE_DAY = 60 * 60 * 24;
const THIRTY_DAYS = ONE_DAY * 30;

// Extra fields we pass from authorize() to the jwt callback
declare module "next-auth" {
  interface User {
    remember?: boolean;
  }
}
declare module "@auth/core/jwt" {
  interface JWT {
    expiresAt?: number; // seconds since 1970, when this sign-in runs out
  }
}

// The part of the auth setup that middleware can use.
// No database and no bcrypt in here: middleware can't run those.
// src/auth.ts adds the email + password provider on top.
export const authConfig = {
  // Email + password sign-in only works with JWT sessions (a signed cookie),
  // not sessions stored in the database.
  session: { strategy: "jwt", maxAge: THIRTY_DAYS },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/signin",
  },
  providers: [],
  callbacks: {
    // Middleware asks this on every page load
    authorized: ({ auth, request }) => {
      const signedIn = !!auth?.user;
      const onAuthPage = request.nextUrl.pathname.startsWith("/auth");

      if (onAuthPage) {
        // Already signed in? Skip the sign-in and sign-up pages.
        return signedIn ? Response.redirect(new URL("/", request.nextUrl)) : true;
      }
      // false = send them to /auth/signin?callbackUrl=<this page>
      return signedIn;
    },
    jwt: ({ token, user }) => {
      // `user` is only there right after signing in
      if (user) {
        const now = Math.floor(Date.now() / 1000);
        token.expiresAt = now + (user.remember ? THIRTY_DAYS : ONE_DAY);
      }
      // "Keep me signed in" unticked: sign out after a day. Returning null ends the session.
      if (token.expiresAt && Date.now() / 1000 > token.expiresAt) return null;
      return token;
    },
    // token.sub is the user's id. tRPC reads session.user.id.
    session: ({ session, token }) => ({
      ...session,
      user: { ...session.user, id: token.sub ?? "" },
    }),
  },
} satisfies NextAuthConfig;