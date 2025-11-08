import type { NextAuthOptions } from 'next-auth'
import GitHubProvider from 'next-auth/providers/github'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from './prisma'
import { logger } from './logger'
import { AUTH_PAGES } from './constants'
import bcrypt from 'bcrypt'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  session: {
    strategy: 'jwt'
  },
  pages: {
    signIn: AUTH_PAGES.SIGN_IN
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          logger.warn('Login attempt with missing credentials')
          return null
        }

        logger.info('Login attempt', { email: credentials.email })

        const user = await prisma.user.findUnique({ where: { email: credentials.email } })
        if (!user || !user.hashedPassword) {
          logger.warn('Login failed: user not found or no password set', { email: credentials.email })
          return null
        }

        const isValid = await bcrypt.compare(credentials.password, user.hashedPassword)
        if (!isValid) {
          logger.warn('Login failed: invalid password', { email: credentials.email })
          return null
        }

        logger.info('Login successful', { userId: user.id, email: credentials.email })

        return {
          id: user.id,
          name: user.name ?? undefined,
          email: user.email ?? undefined,
          image: user.image ?? undefined
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user && token?.id) {
        ;(session.user as any).id = token.id
      }
      return session
    }
  }
}

if (process.env.GITHUB_ID && process.env.GITHUB_SECRET) {
  ;(authOptions.providers as any).push(
    GitHubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET
    })
  )
}
