import { createClient, RedisClientType } from 'redis'
import { v4 as uuidv4 } from 'uuid'

let client: RedisClientType | null = null

const getRedisClient = (): RedisClientType => {
  if (!client) {
    client = createClient({
      url: process.env.REDIS_URL,
    })

    client.on('error', err => console.error('Redis Client Error', err))

    client.connect()
  }

  return client
}

export const sessions = {
  create: async (userId: string): Promise<string> => {
    const client = getRedisClient()
    const sessionId = uuidv4()
    await client.set(`session:${sessionId}`, userId, {
      EX: 24 * 60 * 60, // 24 hours
    })
    return sessionId
  },

  verify: async (sessionId: string): Promise<string | null> => {
    const client = getRedisClient()
    return await client.get(`session:${sessionId}`)
  },

  destroy: async (sessionId: string): Promise<void> => {
    const client = getRedisClient()
    await client.del(`session:${sessionId}`)
  },
}
