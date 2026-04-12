import NextAuth from "next-auth";
import { AdapterUser } from "next-auth/adapters";
import authConfig from "./auth.config";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import Discord from "next-auth/providers/discord";
import { db } from "@/db/index";
import { users } from "@/db/schema";
import { eq, or } from "drizzle-orm";
import { signInSchema, signUpSchema } from "./lib/zod";
import bcrypt from "bcryptjs";

declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      email?: string;
      image?: string;
      name?: string;
      username?: string;
      discordId?: string;
    };
  }
  interface User {
    username?: string;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: {
    strategy: "jwt",
  },
  ...authConfig,
  pages: {
    signIn: "/sign-in",
  },
  providers: [
    Credentials({
      credentials: {
        username: {},
        email: {},
        password: {},
      },
      authorize: async (credentials) => {
        try {
          const { email, password } = await signInSchema.parseAsync(credentials);

          if (!email || !password) return null;

          const user = await db.query.users.findFirst({
            where: eq(users.email, email),
          });

          if (!user) {
            console.error(`Login failed: User with email "${email}" not found.`);
            throw new Error("Invalid email or password.");
          }

          const isPasswordValid = await bcrypt.compare(password, user.password as string);

          if (!isPasswordValid) {
            console.error(`Login failed: Invalid password for email "${email}".`);
            throw new Error("Invalid email or password.");
          }

          return user;
        } catch (error) {
          console.error(error);
          return null;
        }
      },
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Discord({
      clientId: process.env.DISCORD_CLIENT_ID,
      clientSecret: process.env.DISCORD_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google" || account?.provider === "discord") {
      const { name, email, image } = user;
      if (!email) return false;

      const existingUser = await db.query.users.findFirst({
        where: eq(users.email, email),
      });

      if (!existingUser) {
        const username = email.split("@")[0];
        await db.insert(users).values({
        email,
        username,
        image,
        name,
        provider: account.provider,
        ...(account.provider === "discord" && { discordId: account.providerAccountId }),
        });
      } else {
        // If user exists and signs in with Discord, only update discordId if not present
        if (account.provider === "discord" && !existingUser.discordId) {
        await db
          .update(users)
          .set({
          discordId: account.providerAccountId,
          })
          .where(eq(users.email, email));
        } else if (account.provider !== "discord") {
        // For non-Discord providers, update other fields
        await db
          .update(users)
          .set({
          name,
          image,
          provider: account.provider,
          })
          .where(eq(users.email, email));
        }
      }
      }
      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
      }
      return token;
    },
    session: async ({ session, token }) => {
      const user = await db.query.users.findFirst({
        where: eq(users.email, session.user.email),
      });

      if (user) {
        session.user = {
          email: user.email,
          id: user.id,
          name: user.name,
          image: user.image,
          username: user.username,
          discordId: user.discordId,
        } as AdapterUser & {
          email: string;
          name: string;
          image: string;
          id: string;
          username: string;
          discordId: string;
        };
      }

      return session;
    },
    authorized: async ({ auth }) => {
      return !!auth;
    },
  },
});

export async function signUp(credentials: { username: string; email: string; password: string }) {
  const { username, email, password } = await signUpSchema.parseAsync(credentials);

  const existingUser = await db.query.users.findFirst({
    where: or(eq(users.email, email), eq(users.username, username)),
  });

  if (existingUser) {
    if (existingUser.email === email) {
      throw new Error("User with this email already exists");
    }
    if (existingUser.username === username) {
      throw new Error("User with this username already exists");
    }
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await db.insert(users).values({
    username,
    email,
    password: hashedPassword,
    image: `/avatar.png`,
    provider: "credentials",
  }).returning();

  return newUser[0];
}