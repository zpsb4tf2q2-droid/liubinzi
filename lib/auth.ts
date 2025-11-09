import type { NextAuthOptions } from 'next-auth'
import GitHubProvider from 'next-auth/providers/github'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from './prisma'
import bcrypt from 'bcrypt'
import { env } from './env'
import { logInfo, logError } from './logger'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  session: {
    strategy: 'jwt'
  },
  pages: {
    signIn: '/login'
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
          logError("Authorization failed: Missing credentials")
          return null
        }

        try {
          const user = await prisma.user.findUnique({ where: { email: credentials.email } })
          if (!user || !user.hashedPassword) {
            logError("Authorization failed: User not found or no password", undefined, { email: credentials.email })
            return null
          }

          const isValid = await bcrypt.compare(credentials.password, user.hashedPassword)
          if (!isValid) {
            logError("Authorization failed: Invalid password", undefined, { email: credentials.email })
            return null
          }

          logInfo("User authorized successfully", { userId: user.id, email: user.email })

          return {
            id: user.id,
            name: user.name ?? undefined,
            email: user.email ?? undefined,
            image: user.image ?? undefined
          }
        } catch (error) {
          logError("Authorization error", error)
          return null
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

if (env.GITHUB_ID && env.GITHUB_SECRET) {
  logInfo("GitHub OAuth provider enabled")
  ;(authOptions.providers as any).push(
    GitHubProvider({
      clientId: env.GITHUB_ID,
      clientSecret: env.GITHUB_SECRET
    })
  )
}
