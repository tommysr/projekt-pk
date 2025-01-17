'use client'

import { useEffect, useState } from 'react'
import { useSocket } from './useSocket'

type Message = {
  id: string
  content: string
  userId: string
  chatId: string
  createdAt: string
  user: {
    id: string
    username: true
  }
}

// Cache messages per chat
const messagesCache: Record<string, Message[]> = {}

export const useMessages = (chatId: string) => {
  const socket = useSocket()
  const [messages, setMessages] = useState<Message[]>(messagesCache[chatId] || [])
  const [loading, setLoading] = useState(!messagesCache[chatId])
  const [error, setError] = useState<Error | null>(null)

  // Initial fetch from API only if not in cache
  useEffect(() => {
    if (!chatId) return
    if (messagesCache[chatId]) return

    const fetchInitialMessages = async () => {
      try {
        const response = await fetch(`/api/chats/${chatId}/messages`)
        if (!response.ok) {
          throw new Error('Failed to fetch messages')
        }
        const data = await response.json()
        messagesCache[chatId] = data.messages
        setMessages(data.messages)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch messages'))
      } finally {
        setLoading(false)
      }
    }

    fetchInitialMessages()
  }, [chatId])

  // Socket listeners for real-time updates
  useEffect(() => {
    if (!socket || !chatId) return

    const handleNewMessage = (message: Message) => {
      if (message.chatId === chatId) {
        setMessages(prev => {
          const updated = [...prev, message]
          messagesCache[chatId] = updated
          return updated
        })
      }
    }

    const handleMessageUpdate = (updatedMessage: Message) => {
      if (updatedMessage.chatId === chatId) {
        setMessages(prev => {
          const updated = prev.map(msg => (msg.id === updatedMessage.id ? updatedMessage : msg))
          messagesCache[chatId] = updated
          return updated
        })
      }
    }

    const handleMessageDelete = (messageId: string) => {
      setMessages(prev => {
        const updated = prev.filter(msg => msg.id !== messageId)
        messagesCache[chatId] = updated
        return updated
      })
    }

    socket.on('new_message', handleNewMessage)
    socket.on('message_update', handleMessageUpdate)
    socket.on('message_delete', handleMessageDelete)

    return () => {
      socket.off('new_message', handleNewMessage)
      socket.off('message_update', handleMessageUpdate)
      socket.off('message_delete', handleMessageDelete)
    }
  }, [socket, chatId])

  const sendMessage = async (content: string) => {
    if (!socket) throw new Error('Socket not connected')

    return new Promise((resolve, reject) => {
      socket.emit('send_message', { chatId, content }, (response: any) => {
        if (response.error) {
          reject(new Error(response.error))
        } else {
          resolve(response.message)
        }
      })
    })
  }

  const refetch = async () => {
    if (!chatId) return

    setLoading(true)
    try {
      const response = await fetch(`/api/chats/${chatId}/messages`)
      if (!response.ok) {
        throw new Error('Failed to fetch messages')
      }
      const data = await response.json()
      messagesCache[chatId] = data.messages
      setMessages(data.messages)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch messages'))
    } finally {
      setLoading(false)
    }
  }

  return {
    messages,
    loading,
    error,
    sendMessage,
    refetch,
  }
}
