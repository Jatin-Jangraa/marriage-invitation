import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import User from '@/models/User';
import { connectDB } from '@/lib/db';

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Google],
  pages: { signIn: '/login' },
  session: { strategy: 'jwt', maxAge: 7 * 24 * 60 * 60 },
  callbacks: {
    async signIn({ account, profile }) {
      if (
        account?.provider !== 'google' ||
        !profile?.sub ||
        !profile.email ||
        profile.email_verified !== true
      ) {
        return false;
      }

      await connectDB();
      const email = profile.email.trim().toLowerCase();
      const name = typeof profile.name === 'string' && profile.name.trim() ? profile.name.trim() : email;
      const image = typeof profile.picture === 'string' && profile.picture.trim() ? profile.picture : undefined;
      let user = await User.findOne({ googleId: profile.sub });
      const emailOwner = await User.findOne({
        email,
        ...(user ? { _id: { $ne: user._id } } : {}),
      }).select('_id');
      if (emailOwner) return false;

      if (!user) {
        try {
          user = await User.create({ googleId: profile.sub, email, name, image, role: 'user' });
        } catch (error: any) {
          // Another callback can create the same Google account concurrently.
          if (error?.code !== 11000) throw error;
          user = await User.findOne({ googleId: profile.sub });
          if (!user) throw error;
        }
      }

      user.email = email;
      user.name = name;
      if (image) user.image = image;
      // Keep admin assignments, while bringing any legacy role value into the supported roles.
      if (user.role !== 'admin' && user.role !== 'user') user.role = 'user';
      await user.save();
      return true;
    },
    async jwt({ token, account, profile }) {
      if (account?.provider === 'google' && profile?.sub) {
        await connectDB();
        const user = await User.findOne({ googleId: profile.sub }).select('_id role');
        if (!user) return {};
        token.userId = String(user._id);
        token.role = user.role === 'admin' ? 'admin' : 'user';
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = typeof token.userId === 'string' ? token.userId : '';
        session.user.role = token.role === 'admin' ? 'admin' : 'user';
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      if (url.startsWith(baseUrl)) return url;
      return baseUrl;
    },
  },
});
