import { sessions } from '../redis'
import { createClient } from 'redis'

// Set test environment variables
process.env.REDIS_URL = 'redis://localhost:6379'

// Mock dependencies
jest.mock('redis', () => ({
  createClient: jest.fn(),
}))

jest.mock('uuid', () => ({
  v4: jest.fn().mockReturnValue('test-session-id'),
}))

// Get mocked instances
const mockRedisClient = {
  connect: jest.fn().mockResolvedValue(undefined),
  set: jest.fn(),
  get: jest.fn(),
  del: jest.fn(),
  on: jest.fn(),
  keys: jest.fn(),
}

describe('Redis Sessions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(createClient as jest.Mock).mockReturnValue(mockRedisClient)
  })

  describe('create', () => {
    it('should create a new session', async () => {
      mockRedisClient.set.mockResolvedValueOnce('OK')

      const sessionId = await sessions.create('user123')

      expect(sessionId).toBe('test-session-id')
      expect(mockRedisClient.set).toHaveBeenCalledWith(
        'session:test-session-id',
        'user123',
        { EX: 60 * 60 * 24 * 7 } // 7 days
      )
    })

    it('should handle Redis errors during session creation', async () => {
      const error = new Error('Redis error')
      mockRedisClient.set.mockRejectedValueOnce(error)

      await expect(sessions.create('user123')).rejects.toThrow('Redis error')
    })
  })

  describe('verify', () => {
    it('should verify a valid session', async () => {
      // Mock both keys and get calls
      mockRedisClient.keys.mockResolvedValueOnce(['session:test-session-id'])
      // Mock get for both the session listing and the specific session check
      mockRedisClient.get
        .mockResolvedValueOnce('user123') // For the session listing
        .mockResolvedValueOnce('user123') // For the specific session check

      const userId = await sessions.verify('test-session-id')

      expect(userId).toBe('user123')
      expect(mockRedisClient.get).toHaveBeenCalledWith('session:test-session-id')
    })

    it('should return null for invalid session', async () => {
      mockRedisClient.keys.mockResolvedValueOnce(['session:other-session'])
      mockRedisClient.get
        .mockResolvedValueOnce('other-user') // For the session listing
        .mockResolvedValueOnce(null) // For the specific session check

      const userId = await sessions.verify('invalid-session-id')

      expect(userId).toBeNull()
    })

    it('should handle Redis errors during verification', async () => {
      mockRedisClient.keys.mockResolvedValueOnce(['session:test-session-id'])
      mockRedisClient.get
        .mockResolvedValueOnce('user123') // For the session listing
        .mockRejectedValueOnce(new Error('Redis error')) // For the specific session check

      const userId = await sessions.verify('test-session-id')
      expect(userId).toBeNull()
    })
  })

  describe('destroy', () => {
    it('should destroy a session', async () => {
      mockRedisClient.del.mockResolvedValueOnce(1)

      await sessions.destroy('test-session-id')

      expect(mockRedisClient.del).toHaveBeenCalledWith('session:test-session-id')
    })

    it('should handle Redis errors during session destruction', async () => {
      mockRedisClient.del.mockRejectedValueOnce(new Error('Redis error'))

      await expect(sessions.destroy('test-session-id')).rejects.toThrow('Redis error')
    })
  })

  describe('Redis client initialization', () => {
    it('should create Redis client with correct configuration', async () => {
      // Reset modules before this specific test
      jest.resetModules()

      // Create a new mock function
      const freshCreateClient = jest.fn().mockReturnValue(mockRedisClient)

      // Re-establish the mocks for the fresh module
      jest.mock('redis', () => ({
        createClient: freshCreateClient,
      }))

      const { sessions: freshSessions } = await import('../redis')

      await freshSessions.create('test-user')

      expect(freshCreateClient).toHaveBeenCalledWith({
        url: process.env.REDIS_URL,
      })
      expect(mockRedisClient.on).toHaveBeenCalledWith('error', expect.any(Function))
    })
  })
})
