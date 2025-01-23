// Remove the NextResponse import since it's not directly used
// import { NextResponse } from 'next/server'

// Add proper type for the response data
interface ChatResponse {
  chats: Array<{
    id: string;
    name: string;
    participants: Array<{
      user: {
        id: string;
        username: string;
      };
    }>;
  }>;
}

// Import the route handlers directly
import { GET as getChats } from '@/app/api/chats/route'
import { GET as getChatMessages } from '@/app/api/chats/[chatId]/messages/route'

// Mock NextResponse
jest.mock('next/server', () => ({
  NextResponse: {
    json: (data: ChatResponse, init?: ResponseInit) => {
      const response = new Response(JSON.stringify(data), init)
      Object.defineProperty(response, 'json', {
        value: async () => data,
      })
      return response
    },
  },
}))

// Mock next/headers
jest.mock('next/headers', () => ({
  cookies: () => ({
    get: () => ({ value: 'test-session-id' }),
  }),
}))

// Mock auth
jest.mock('@/lib/auth/auth', () => ({
  auth: {
    getUser: jest.fn(),
  },
}))

// Mock prisma with jest.fn() for each method
jest.mock('@/lib/prisma', () => ({
  prisma: {
    chatParticipant: {
      findMany: jest.fn(() => Promise.resolve([])),
      findUnique: jest.fn(() => Promise.resolve(null)),
    },
    message: {
      findMany: jest.fn(() => Promise.resolve([])),
    },
  },
}))

// Grab the real references to your mocks
import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/prisma'

const mockedAuth = auth as jest.Mocked<typeof auth>
const mockedPrisma = prisma as jest.Mocked<typeof prisma>

// Some sample data

const mockUser = { id: 'user1', email: 'test@example.com', username: 'testuser' }
const mockChats = [
  {
    userId: 'user1',
    chatId: 'chat1',
    chat: {
      id: 'chat1',
      name: 'Test Chat',
      participants: [
        {
          user: {
            id: 'user1',
            username: 'testuser',
          },
        },
      ],
    },
  },
]
const mockMessages = [
  {
    id: 'msg1',
    content: 'Hello world',
    chatId: 'chat1',
    userId: 'user1',
    createdAt: new Date().toISOString(),
    user: {
      id: 'user1',
      username: 'testuser',
    },
  },
]

describe('GET /api/chats', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return chats for authenticated user', async () => {
    // Mock the user + data
    mockedAuth.getUser.mockResolvedValue(mockUser)
    ;(mockedPrisma.chatParticipant.findMany as jest.Mock).mockImplementation(() =>
      Promise.resolve(mockChats)
    )

    const response = await getChats()
    expect(response.status).toBe(200)

    // NextResponse doesn't have .json(), so we need to parse it
    const data = JSON.parse(await response.text())
    expect(data.chats).toEqual(mockChats)
    expect(prisma.chatParticipant.findMany).toHaveBeenCalledWith({
      where: { userId: mockUser.id },
      include: {
        chat: {
          include: {
            participants: {
              include: {
                user: {
                  select: { id: true, username: true },
                },
              },
            },
          },
        },
      },
    })
  })

  it('should return 401 if session is invalid (no user)', async () => {
    mockedAuth.getUser.mockResolvedValue(null)

    const response = await getChats()
    expect(response.status).toBe(401)
    const data = JSON.parse(await response.text())
    expect(data.error).toBe('Invalid session')
  })

  it('should return 500 if prisma throws an error', async () => {
    mockedAuth.getUser.mockResolvedValue(mockUser)
    ;(mockedPrisma.chatParticipant.findMany as jest.Mock).mockImplementation(() =>
      Promise.reject(new Error('DB error'))
    )

    const response = await getChats()
    expect(response.status).toBe(500)
    const data = JSON.parse(await response.text())
    expect(data.error).toBe('DB error')
  })
})

describe('GET /api/chats/[chatId]/messages', () => {
  const mockRequest = new Request('http://localhost:3000')
  const mockContext = {
    params: Promise.resolve({ chatId: 'chat1' }),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return messages for authorized participant', async () => {
    mockedAuth.getUser.mockResolvedValue(mockUser)
    ;(mockedPrisma.chatParticipant.findUnique as jest.Mock).mockImplementation(() =>
      Promise.resolve({
        userId: 'user1',
        chatId: 'chat1',
      })
    )
    ;(mockedPrisma.message.findMany as jest.Mock).mockImplementation(() =>
      Promise.resolve(mockMessages)
    )

    const response = await getChatMessages(mockRequest, mockContext)
    expect(response.status).toBe(200)
    const data = JSON.parse(await response.text())
    expect(data.messages).toEqual(mockMessages)
  })

  it('should return 403 if user not in chat', async () => {
    mockedAuth.getUser.mockResolvedValue(mockUser)
    ;(mockedPrisma.chatParticipant.findUnique as jest.Mock).mockImplementation(() =>
      Promise.resolve(null)
    )

    const response = await getChatMessages(mockRequest, mockContext)
    expect(response.status).toBe(403)
    const data = JSON.parse(await response.text())
    expect(data.error).toBe('Not authorized to view this chat')
  })

  it('should return 401 if user is unauthenticated', async () => {
    mockedAuth.getUser.mockResolvedValue(null)

    const response = await getChatMessages(mockRequest, mockContext)
    expect(response.status).toBe(401)
    const data = JSON.parse(await response.text())
    expect(data.error).toBe('Unauthorized')
  })
})
