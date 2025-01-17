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

      await client.set(key, userId, {
        EX: 60 * 60 * 24 * 7, // 7 days
      })

      // Only log session creation in development
      if (process.env.NODE_ENV === 'development') {
        console.log('Session created:', sessionId.substring(0, 8) + '...')
      }

      return sessionId
    } catch (error) {
      console.error('Error creating session:', error)
      throw error
    }
  },

  verify: async (sessionId: string): Promise<string | null> => {
    try {
      const client = await getRedisClient()
      const key = `session:${sessionId}`

      // List all sessions for debugging
      const keys = await client.keys('session:*')

      if (keys.length === 0) {
        return null
      }

      const sessions = await Promise.all(
        keys.map(async key => {
          const userId = await client.get(key)
          return { key: key.replace('session:', ''), userId }
        })
      )

      // Only log session verification in development
      if (process.env.NODE_ENV === 'development') {
        console.log('Session verification:', {
          sessionId: sessionId.substring(0, 8) + '...',
          valid: sessions.some(s => s.key === sessionId),
        })
      }

      const userId = await client.get(key)
      return userId
    } catch (error) {
      console.error('Error verifying session:', error)
      return null
    }
  },

  destroy: async (sessionId: string): Promise<void> => {
    const client = await getRedisClient()
    await client.del(`session:${sessionId}`)

    // Only log session destruction in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Session destroyed:', sessionId.substring(0, 8) + '...')
    }
  },
}
