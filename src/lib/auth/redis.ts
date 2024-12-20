import { createClient } from 'redis'
import { v4 as uuidv4 } from 'uuid'

// Only create the client on the server side
const getRedisClient = () => {
  if (typeof window !== 'undefined') {
    throw new Error('Redis client cannot be instantiated on the client side')
  }

  const client = createClient({
    url: process.env.REDIS_URL,
  })

  // Connect to redis if not already connected
  if (!client.isOpen) {
    client.connect()
  }

  return client
}

export const sessions = {
  create: async (userId: string) => {
    const client = getRedisClient()
    const sessionId = uuidv4()
    await client.set(`session:${sessionId}`, userId, {
      EX: 24 * 60 * 60, // 24 hours
    })
    return sessionId
  },

  verify: async (sessionId: string) => {
    const client = getRedisClient()
    return await client.get(`session:${sessionId}`)
  },

  destroy: async (sessionId: string) => {
    const client = getRedisClient()
    await client.del(`session:${sessionId}`)
  },
}
