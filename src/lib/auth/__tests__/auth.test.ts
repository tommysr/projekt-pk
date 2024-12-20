import { PrismaClient } from '@prisma/client'
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended'
import { auth } from '../auth'
import { sessions } from '../redis'
import bcrypt from 'bcryptjs'

// Mock dependencies
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(),
}))

// Mock the specific prisma instance used in auth
jest.mock('../../prisma', () => ({
  prisma: mockDeep<PrismaClient>(),
}))

// Get the mocked prisma instance
import { prisma } from '../../prisma'
const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>

// Mock the redis module
jest.mock('../redis')
jest.mock('bcryptjs')

const sessionsMock = sessions as jest.Mocked<typeof sessions>
const bcryptMock = bcrypt as jest.Mocked<typeof bcrypt>

describe('Auth Service', () => {
  beforeEach(() => {
    mockReset(prismaMock)
    jest.clearAllMocks()
  })

  describe('register', () => {
    it('should successfully register a new user', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        username: 'testuser',
        password: 'hashedpassword123',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      // Mock user check returns null (no existing user)
      prismaMock.user.findFirst.mockResolvedValueOnce(null)

      // Mock password hashing
      bcryptMock.hash.mockResolvedValueOnce('hashedpassword123' as never)

      // Mock user creation
      prismaMock.user.create.mockResolvedValueOnce(mockUser)

      const result = await auth.register('testuser', 'test@example.com', 'password123')

      expect(result.user).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        username: mockUser.username,
      })
      expect(bcryptMock.hash).toHaveBeenCalledWith('password123', 10)
      expect(prismaMock.user.create).toHaveBeenCalledWith({
        data: {
          email: 'test@example.com',
          username: 'testuser',
          password: 'hashedpassword123',
        },
      })
    })

    it('should throw error if user already exists', async () => {
      prismaMock.user.findFirst.mockResolvedValueOnce({
        id: '1',
        email: 'existing@example.com',
        username: 'existinguser',
        password: 'hashedpassword',
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      await expect(
        auth.register('existinguser', 'existing@example.com', 'password123')
      ).rejects.toThrow('User already exists')
    })
  })

  describe('login', () => {
    it('should successfully log in a user', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        username: 'testuser',
        password: 'hashedpassword123',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      prismaMock.user.findUnique.mockResolvedValueOnce(mockUser)
      bcryptMock.compare.mockResolvedValueOnce(true as never)
      sessionsMock.create.mockResolvedValueOnce('test-session-id')

      const result = await auth.login('test@example.com', 'password123')

      expect(result).toEqual({
        user: {
          id: mockUser.id,
          email: mockUser.email,
          username: mockUser.username,
        },
        sessionId: 'test-session-id',
      })
      expect(bcryptMock.compare).toHaveBeenCalledWith('password123', 'hashedpassword123')
      expect(sessionsMock.create).toHaveBeenCalledWith(mockUser.id)
    })

    it('should throw error for invalid credentials', async () => {
      prismaMock.user.findUnique.mockResolvedValueOnce(null)

      await expect(auth.login('wrong@example.com', 'wrongpass')).rejects.toThrow(
        'Invalid credentials'
      )
    })

    it('should throw error for incorrect password', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        username: 'testuser',
        password: 'hashedpassword123',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      prismaMock.user.findUnique.mockResolvedValueOnce(mockUser)
      bcryptMock.compare.mockResolvedValueOnce(false as never)

      await expect(auth.login('test@example.com', 'wrongpass')).rejects.toThrow(
        'Invalid credentials'
      )
    })
  })

  describe('getUser', () => {
    it('should return user data for valid session', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        username: 'testuser',
        password: 'hashedpassword123',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      sessionsMock.verify.mockResolvedValueOnce(mockUser.id)
      prismaMock.user.findUnique.mockResolvedValueOnce(mockUser)

      const result = await auth.getUser('valid-session-id')

      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        username: mockUser.username,
      })
    })

    it('should return null for invalid session', async () => {
      sessionsMock.verify.mockResolvedValueOnce(null)

      const result = await auth.getUser('invalid-session-id')

      expect(result).toBeNull()
    })
  })

  describe('logout', () => {
    it('should successfully destroy session', async () => {
      await auth.logout('test-session-id')

      expect(sessionsMock.destroy).toHaveBeenCalledWith('test-session-id')
    })
  })

  describe('isAuthenticated', () => {
    it('should return true for valid session', async () => {
      sessionsMock.verify.mockResolvedValueOnce('user-id')

      const result = await auth.isAuthenticated('valid-session-id')

      expect(result).toBe(true)
    })

    it('should return false for invalid session', async () => {
      sessionsMock.verify.mockResolvedValueOnce(null)

      const result = await auth.isAuthenticated('invalid-session-id')

      expect(result).toBe(false)
    })
  })
})
