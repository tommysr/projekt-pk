'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useSocketContext } from '@/components/providers/SocketProvider'
import useSWR from 'swr'

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

const messagesCache: {
  [key: string]: {
    messages: Message[]
    nextCursor: string | null
    hasMore: boolean
  }
} = {}
export const useMessages = (chatId: string) => {
  const { socket } = useSocketContext()
  const seenMessageIds = useRef(new Set<string>())
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const loadingRef = useRef(false)

  // Clear all state when chat changes
  useEffect(() => {
    seenMessageIds.current.clear()
    setMessages([])
    setError(null)
    setHasMore(true)
    setNextCursor(null)

    if (loadingRef.current) return

    const loadInitialMessages = async () => {
      if (!chatId) return
      loadingRef.current = true
      setLoading(true)

      try {
        await loadMessages()
      } finally {
        loadingRef.current = false
        setLoading(false)
      }
    }

    loadInitialMessages()
  }, [chatId])

  const loadMessages = useCallback(
    async (cursor?: string) => {
      if (!chatId) return

      const isInitialLoad = !cursor
      if (!isInitialLoad) setLoadingMore(true)

      try {
        const params = new URLSearchParams()
        params.append('limit', '20')
        if (cursor) params.append('cursor', cursor)

        const response = await fetch(`/api/chats/${chatId}/messages?${params}`)
        if (!response.ok) throw new Error('Failed to fetch messages')

        const data = await response.json()

        // Filter out duplicates and add new messages to seen set
        const newMessages = data.messages.filter(msg => !seenMessageIds.current.has(msg.id))
        newMessages.forEach(msg => seenMessageIds.current.add(msg.id))

        // Sort by timestamp ascending (oldest first)
        const sortedMessages = newMessages.sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        )

        setMessages(prev => {
          if (isInitialLoad) {
            return sortedMessages
          } else {
            // Add older messages at the top
            return [...sortedMessages, ...prev]
          }
        })

        messagesCache[chatId] = {
          messages: sortedMessages,
          nextCursor: data.nextCursor,
          hasMore: data.hasMore,
        }

        setNextCursor(data.nextCursor)
        setHasMore(data.hasMore)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch messages'))
      } finally {
        if (!isInitialLoad) setLoadingMore(false)
      }
    },
    [chatId]
  )

  const loadMore = async () => {
    if (loadingMore || !hasMore || !nextCursor) return
    await loadMessages(nextCursor)
  }

  // Handle real-time updates
  useEffect(() => {
    if (!socket) return

    const handleNewMessage = (message: Message) => {
      if (seenMessageIds.current.has(message.id)) return
      seenMessageIds.current.add(message.id)

      setMessages(prev => [...prev, message]) // Add new messages at the end (newest at bottom)
    }

    socket.on('new_message', handleNewMessage)
    return () => {
      socket.off('new_message', handleNewMessage)
    }
  }, [socket])

  const sendMessage = async (content: string) => {
    if (!socket) throw new Error('Socket not connected')

    return new Promise((resolve, reject) => {
      socket.emit(
        'send_message',
        { chatId, content },
        (response: { error?: string; message?: Message }) => {
          if (response.error) {
            reject(new Error(response.error))
          } else {
            resolve(response.message)
          }
        }
      )
    })
  }

  const refetch = async () => {
    seenMessageIds.current.clear()
    setMessages([])
    loadMessages()
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
