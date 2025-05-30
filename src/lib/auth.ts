// lib/auth.ts
import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "./mongodb";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID || "",
      clientSecret: process.env.GOOGLE_SECRET || "",
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
        };
      },
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email:    { label: "Email",    type: "email"    },
        password: { label: "Password", type: "password" },
      },
      async authorize(creds) {
        if (!creds?.email || !creds?.password) return null;
        const client = await clientPromise;
        const db     = client.db("ecommerce_db");
        const user   = await db.collection("users").findOne({ email: creds.email });
        
        if (!user?.password) return null;
        const valid = await bcrypt.compare(creds.password, user.password);
        if (!valid) return null;

        // If user exists but has no userid, create one
        if (!user.userid) {
          const userid = Math.random().toString(36).slice(2);
          await db
            .collection("users")
            .updateOne({ _id: user._id }, { $set: { userid } });
          return { id: userid, email: user.email, name: user.name };
        }

        return { id: user.userid, email: user.email, name: user.name };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        const client = await clientPromise;
        const db     = client.db("ecommerce_db");
        const existing = await db.collection("users").findOne({ email: user.email });
        
        if (!existing) {
          const userid = Math.random().toString(36).slice(2);
          await db.collection("users").insertOne({
            name:      user.name,
            email:     user.email,
            userid,
            password:  await bcrypt.hash(Math.random().toString(36), 10),
            created_at: new Date(),
          });
        } else if (!existing.userid) {
          const userid = Math.random().toString(36).slice(2);
          await db
            .collection("users")
            .updateOne({ _id: existing._id }, { $set: { userid } });
        }
      }
      return true;
    },
    async session({ session, token }) {
      if (session.user) {
        // Get the user from database to ensure we have the correct userid
        const client = await clientPromise;
        const db = client.db("ecommerce_db");
        const user = await db.collection("users").findOne({ email: session.user.email });
        if (user?.userid) {
          session.user.id = user.userid;
        }
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};
