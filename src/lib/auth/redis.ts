import { createClient, RedisClientType } from 'redis'
import { v4 as uuidv4 } from 'uuid'

let client: RedisClientType | null = null

const getRedisClient = async (): Promise<RedisClientType> => {
  if (!client) {
    client = createClient({
      url: process.env.REDIS_URL,
    })

    client.on('error', err => console.error('Redis Client Error', err))

    await client.connect()
    console.log('Redis client connected')
  }

  return client
}

export const sessions = {
  create: async (userId: string): Promise<string> => {
    try {
      const client = await getRedisClient()
      const sessionId = uuidv4()
      const key = `session:${sessionId}`

      console.log('Creating new session:', {
        key,
        userId,
        expiresIn: '7 days',
      })

      await client.set(key, userId, {
        EX: 60 * 60 * 24 * 7, // 7 days
      })

      // Verify the session was created
      const storedUserId = await client.get(key)
      console.log('Session created and verified:', {
        key: key,
        sessionId: sessionId.substring(0, 8) + '...',
        userId,
        storedUserId,
        matches: storedUserId === userId,
      })

      return sessionId
    } catch (error) {
      console.error('Error creating session:', error)
      throw error
    }
  },

  verify: async (sessionId: string): Promise<string | null> => {
    try {
      console.log('Verifying session:', sessionId.substring(0, 8) + '...')
      const client = await getRedisClient()
      const key = `session:${sessionId}`

      // List all sessions for debugging
      const keys = await client.keys('session:*')

      if (keys.length === 0) {
        console.log('No sessions found')
        return null
      }

      const sessions = await Promise.all(
        keys.map(async key => {
          const userId = await client.get(key)
          return { key: key.replace('session:', ''), userId }
        })
      )
      console.log('Active sessions:', {
        count: sessions.length,
        sessions: sessions.map(s => ({
          sessionId: s.key.substring(0, 8) + '...',
          userId: s.userId,
          matchesRequest: s.key === sessionId,
        })),
      })

      const userId = await client.get(key)

      if (!userId) {
        console.log('No user found for session:', {
          key,
          sessionId: sessionId.substring(0, 8) + '...',
          availableKeys: keys,
        })
        return null
      }

      console.log('Session verified:', {
        key,
        sessionId: sessionId.substring(0, 8) + '...',
        userId,
      })
      return userId
    } catch (error) {
      console.error('Error verifying session:', error)
      return null
    }
  },

  destroy: async (sessionId: string): Promise<void> => {
    const client = await getRedisClient()
    await client.del(`session:${sessionId}`)
    console.log('Destroyed session:', sessionId.substring(0, 8) + '...')
  },
}
