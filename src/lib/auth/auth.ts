import { prisma } from './prisma'
import bcrypt from 'bcryptjs'
import { sessions } from './redis'

interface User {
  id: string
  email: string
  username: string
}

interface AuthResponse {
  user: User
}

export const auth = {
  register: async (username: string, email: string, password: string): Promise<AuthResponse> => {
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

  logout: async () => {
    const sessionId = localStorage.getItem('sessionId')
    if (sessionId) {
      await sessions.destroy(sessionId)
      localStorage.removeItem('sessionId')
      localStorage.removeItem('user')
    }
  },

  getUser: async (sessionId: string): Promise<User | null> => {
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

  isAuthenticated: async (): Promise<boolean> => {
    const sessionId = localStorage.getItem('sessionId')
    if (!sessionId) return false

    const userId = await sessions.verify(sessionId)
    return !!userId
  },
}
