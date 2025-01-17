import { prisma } from '../prisma'
import bcrypt from 'bcryptjs'
import { sessions } from './redis'

interface AuthenticatedUser {
  id: string
  email: string
  username: string
}

interface AuthResponse {
  user: AuthenticatedUser
  sessionId: string
}

interface RegisterResponse {
  user: AuthenticatedUser
}

export const auth = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      throw new Error('Invalid credentials')
    }

    const isValid = await bcrypt.compare(password, user.password)
    if (!isValid) {
      throw new Error('Invalid credentials')
    }

    const sessionId = await sessions.create(user.id)
    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      },
      sessionId: encodeURIComponent(sessionId),
    }
  },

  register: async (
    username: string,
    email: string,
    password: string
  ): Promise<RegisterResponse> => {
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    })

    if (existingUser) {
      throw new Error('User already exists')
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
      },
    })

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      },
    }
  },

  logout: async (sessionId: string): Promise<void> => {
    if (sessionId) {
      await sessions.destroy(sessionId)
    }
  },

  getUser: async (sessionId: string): Promise<AuthenticatedUser | null> => {
    if (!sessionId) return null

    const userId = await sessions.verify(sessionId)

    if (!userId) return null

    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) return null

    return {
      id: user.id,
      email: user.email,
      username: user.username,
    }
  },

  isAuthenticated: async (sessionId: string): Promise<boolean> => {
    if (!sessionId) return false

    const userId = await sessions.verify(sessionId)
    return !!userId
  },
}
