import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import pool from "@/lib/db";

async function getUserByEmail(email) {
  const client = await pool.connect();
  const res = await client.query(
    "SELECT id, email, senha FROM usuario_admin WHERE email = $1",
    [email]
  );
  client.release();
  return res.rows[0] || null;
}

const authOptions = {
  session: { strategy: "jwt" },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET
    }),
    CredentialsProvider({
      name: "Credenciais",
      credentials: {
        email: { label: "email", type: "text" },
        senha: { label: "Senha", type: "password" }
      },
      async authorize(credentials) {
        const { email, senha } = credentials;
        const user = await getUserByEmail(email);
        if (!user || !user.senha) return null;
        const ok = await compare(senha, user.senha);
        if (!ok) return null;
        return { id: user.id, email: user.email };
      }
    })
  ],

  callbacks: {
    async jwt({ token, user, account, profile }) {
      if (account?.provider === "google" && profile) {
           const existing = await getUserByEmail(profile.email);
            if (existing) {
            token.id = existing.id;
            } else {
            const client = await pool.connect();
            const res = await client.query(
            "INSERT INTO usuario_admin (email) VALUES ($1) RETURNING id",
            [profile.name ?? "Usuário", profile.email]);
  token.id = res.rows[0].id;
}
      }

      if (user) {
        token.id = user.id;
      }

      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
      }
      return session;
    }
  },

  pages: {
    signIn: "/login"
  }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
export { authOptions };