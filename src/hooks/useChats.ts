import { useState, useEffect } from 'react'

type ChatParticipant = {
  id: string
  username: string
}

type Chat = {
  id: string
  name: string | null
  createdAt: string
  updatedAt: string
  participants: {
    id: string
    userId: string
    chatId: string
    joinedAt: string
    user: ChatParticipant
  }[]
}

type ChatWithParticipants = {
  id: string
  userId: string
  chatId: string
  joinedAt: string
  chat: Chat
}
export const useChats = () => {
  const [chats, setChats] = useState<ChatWithParticipants[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchChats = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/chats')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error)
      }

      setChats(data.chats)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch chats')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchChats()
  }, [])

  return { chats, loading, error, refetch: fetchChats }
}
