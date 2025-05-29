import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "@/lib/mongodb";
import bcrypt from "bcryptjs";

const handler = NextAuth({
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
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const client = await clientPromise;
          const db = client.db('ecommerce_db');
          const user = await db.collection("users").findOne({ email: credentials.email });

          if (!user || !user?.password) {
            return null;
          }

          const isCorrectPassword = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isCorrectPassword) {
            return null;
          }

          return {
            id: user.userid || user._id.toString(),
            email: user.email,
            name: user.name,
          };
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        try {
          const client = await clientPromise;
          const db = client.db('ecommerce_db');
          
          // Check if user exists in our database
          const existingUser = await db.collection('users').findOne({ email: user.email });
          
          if (!existingUser) {
            // Generate a unique userid
            const userid = Math.floor(Math.random() * 1000000).toString();
            
            // Create new user in our database with matching structure
            await db.collection('users').insertOne({
              name: user.name,
              email: user.email,
              userid: userid,
              // Generate a random password for Google users since they don't need it
              password: await bcrypt.hash(Math.random().toString(36), 10),
              created_at: new Date()
            });
          } else if (!existingUser.userid) {
            // If user exists but doesn't have a userid, add one
            const userid = Math.floor(Math.random() * 1000000).toString();
            await db.collection('users').updateOne(
              { _id: existingUser._id },
              { $set: { userid: userid } }
            );
          }
          
          return true;
        } catch (error) {
          console.error('Error during Google sign in:', error);
          return false;
        }
      }
      return true;
    },
    async session({ session, token }) {
      if (session.user && typeof token.sub === 'string') {
        session.user.id = token.sub;
      }
      return session;
    }
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
});

export { handler as GET, handler as POST }; 