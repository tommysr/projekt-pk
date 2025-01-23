'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSocket } from './useSocket'

type Message = {
  id: string
  content: string
  userId: string
  chatId: string
  createdAt: string
  user: {
    id: string
    username: string
  }
}

// Cache messages per chat
const messagesCache: {
  [key: string]: {
    messages: Message[];
    nextCursor: string | null;
    hasMore: boolean;
  };
} = {}

export const useMessages = (chatId: string) => {
  const socket = useSocket()
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [nextCursor, setNextCursor] = useState<string | null>(null)

  const loadMessages = useCallback(async (cursor?: string) => {
    if (!chatId) return
    
    const isInitialLoad = !cursor
    if (isInitialLoad) setLoading(true)
    else setLoadingMore(true)

    try {
      const params = new URLSearchParams()
      params.append('limit', '50')
      if (cursor) params.append('cursor', cursor)

      const response = await fetch(`/api/chats/${chatId}/messages?${params}`)
      if (!response.ok) throw new Error('Failed to fetch messages')
      
      const data = await response.json()
      
      if (isInitialLoad) {
        messagesCache[chatId] = data
        setMessages(data.messages)
      } else {
        // Merge new messages with existing ones
        const newMessages = [...messages, ...data.messages]
        messagesCache[chatId] = {
          messages: newMessages,
          nextCursor: data.nextCursor,
          hasMore: data.hasMore,
        }
        setMessages(newMessages)
      }
      
      setNextCursor(data.nextCursor)
      setHasMore(data.hasMore)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch messages'))
    } finally {
      if (isInitialLoad) setLoading(false)
      else setLoadingMore(false)
    }
  }, [chatId, messages])

  const loadMore = () => {
    if (loadingMore || !hasMore || !nextCursor) return
    loadMessages(nextCursor)
  }

  // Modified to handle real-time updates with pagination
  useEffect(() => {
    if (!socket) return

    const handleNewMessage = (message: Message) => {
      setMessages(prev => {
        // Only add if not already present
        if (prev.some(m => m.id === message.id)) return prev
        return [message, ...prev]
      })
    }

    socket.on('new_message', handleNewMessage)
    return () => {
      socket.off('new_message', handleNewMessage)
    }
  }, [socket])

  // Initial load
  useEffect(() => {
    loadMessages()
  }, [chatId, loadMessages])

  const sendMessage = async (content: string) => {
    if (!socket) throw new Error('Socket not connected')

    return new Promise((resolve, reject) => {
      socket.emit('send_message', { chatId, content }, (response: { error?: string; message?: Message }) => {
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
      const params = new URLSearchParams()
      params.append('limit', '50')
      
      const response = await fetch(`/api/chats/${chatId}/messages?${params}`)
      if (!response.ok) {
        throw new Error('Failed to fetch messages')
      }
      const data = await response.json()
      
      messagesCache[chatId] = data
      setMessages(data.messages)
      setNextCursor(data.nextCursor)
      setHasMore(data.hasMore)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch messages'))
    } finally {
      setLoading(false)
    }
  }

  return {
    messages,
    loading,
    loadingMore,
    error,
    hasMore,
    loadMore,
    sendMessage,
    refetch,
  }
}
