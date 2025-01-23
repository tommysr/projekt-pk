import { NextRequest } from 'next/server'
import { POST as registerHandler } from '../register/route'
import { POST as loginHandler } from '../login/route'
import { auth } from '@/lib/auth/auth'

// Mock Prisma
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    // Add any Prisma methods you need to mock
  })),
}))

// Mock the auth module
jest.mock('@/lib/auth/auth')
const mockedAuth = jest.mocked(auth)

// Mock next/headers
jest.mock('next/headers', () => ({
  cookies: jest.fn().mockReturnValue({
    get: jest.fn().mockReturnValue(null),
    set: jest.fn(),
  }),
}))

// Replace the any types with proper types
interface ResponseInit {
  status?: number;
  headers?: HeadersInit;
}

// Update the mock implementations
jest.mock('next/server', () => ({
  NextRequest: jest.requireActual('next/server').NextRequest,
  NextResponse: {
    json: (data: unknown, init?: ResponseInit) => {
      const response = new Response(JSON.stringify(data), init)
      Object.defineProperty(response, 'json', {
        value: async () => data,
      })
      return response
    },
  },
}))

describe('Auth API Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Register Endpoint', () => {
    it('should successfully register a new user', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        username: 'testuser',
      }

      mockedAuth.register.mockResolvedValueOnce({
        user: mockUser,
      })

      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123',
        }),
      })

      const response = await registerHandler(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.user).toEqual(mockUser)
      expect(data.message).toBe('Registration successful. You can now log in.')
      expect(mockedAuth.register).toHaveBeenCalledWith(
        'testuser',
        'test@example.com',
        'password123'
      )
    })

    it('should handle registration errors', async () => {
      mockedAuth.register.mockRejectedValueOnce(new Error('User already exists'))

      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          username: 'existinguser',
          email: 'existing@example.com',
          password: 'password123',
        }),
      })

      const response = await registerHandler(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('User already exists')
    })
  })

  describe('Login Endpoint', () => {
    it('should successfully log in a user', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        username: 'testuser',
      }

      mockedAuth.login.mockResolvedValueOnce({
        user: mockUser,
        sessionId: 'test-session-id',
      })

      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123',
        }),
      })

      const response = await loginHandler(request)
      const data = await response.json()

      console.log(data)

      expect(response.status).toBe(200)
      expect(data.user).toEqual(mockUser)

      // Check if session cookie is set
      const cookies = response.headers.get('set-cookie')
      expect(cookies).toContain('sessionId=test-session-id')
      expect(cookies).toContain('HttpOnly')
      expect(cookies).toContain('Path=/')
    })

    it('should handle login errors', async () => {
      mockedAuth.login.mockRejectedValueOnce(new Error('Invalid credentials'))

      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'wrong@example.com',
          password: 'wrongpassword',
        }),
      })

      const response = await loginHandler(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Invalid credentials')
    })
  })
})
