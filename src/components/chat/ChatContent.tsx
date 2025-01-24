'use client'

import { useState, useEffect, useRef } from 'react'
import { useSocketContext } from '@/components/providers/SocketProvider'
import { useMessages } from '@/hooks/useMessages'
import { useAuth } from '@/hooks/useAuth'
import { Loading } from '@/components/ui/loading'

export function ChatContent({ chatId }: { chatId: string }) {
  const { socket } = useSocketContext()
  const { messages, loading, loadingMore, hasMore, loadMore, sendMessage } = useMessages(chatId)
  const { user, loading: userLoading } = useAuth()

  const [newMessage, setNewMessage] = useState('')
  const [isSending, setIsSending] = useState(false)

  const [initialLoadComplete, setInitialLoadComplete] = useState(false)

  const [shouldAutoScroll, setShouldAutoScroll] = useState(true)

  const chatContainerRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const loadTriggerRef = useRef<HTMLDivElement>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    if (!socket || !chatId) return
    socket.emit('join_room', chatId)
  }, [socket, chatId])

  useEffect(() => {
    if (!loading && !initialLoadComplete && messages.length > 0) {
      const container = chatContainerRef.current
      if (container) {
        container.scrollTop = container.scrollHeight
      }
      setInitialLoadComplete(true)
    }
  }, [loading, initialLoadComplete, messages])

  useEffect(() => {
    if (!initialLoadComplete) return // Wait until we've scrolled to bottom
    if (observerRef.current) {
      observerRef.current.disconnect()
    }

    const container = chatContainerRef.current
    if (!container || !hasMore) return

    observerRef.current = new IntersectionObserver(
      async ([entry]) => {
        if (entry.isIntersecting && !loadingMore && hasMore) {
          const oldScrollHeight = container.scrollHeight
          const oldScrollTop = container.scrollTop

          await loadMore() // fetch older messages

          requestAnimationFrame(() => {
            const newScrollHeight = container.scrollHeight
            container.scrollTop = newScrollHeight - oldScrollHeight + oldScrollTop
          })
        }
      },
      { threshold: 0.1 } // or 0.5, etc.
    )

    if (loadTriggerRef.current) {
      observerRef.current.observe(loadTriggerRef.current)
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [initialLoadComplete, hasMore, loadingMore, loadMore])

  useEffect(() => {
    if (shouldAutoScroll && !loadingMore) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'auto' })
    }
  }, [messages, shouldAutoScroll, loadingMore])

  useEffect(() => {
    const container = chatContainerRef.current
    if (!container) return

    const handleScroll = () => {
      const { scrollHeight, scrollTop, clientHeight } = container
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100
      setShouldAutoScroll(isNearBottom)
    }

    container.addEventListener('scroll', handleScroll)
    return () => container.removeEventListener('scroll', handleScroll)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!socket || !newMessage.trim() || isSending) return

    try {
      setIsSending(true)
      await sendMessage(newMessage.trim())
      setNewMessage('')
      // Force scroll to bottom when we send our own message
      setShouldAutoScroll(true)
    } catch (error) {
      console.error('Failed to send message:', error)
    } finally {
      setIsSending(false)
    }
  }

  if (userLoading || loading) {
    return <Loading message="Loading messages..." />
  }

  if (!socket) {
    return <Loading message="Connecting to chat..." />
  }

  return (
    <div className="flex flex-col h-full">
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Top sentinel */}
        {hasMore && (
          <div ref={loadTriggerRef} className="text-center py-2">
            {loadingMore ? (
              <div className="animate-spin">⌛</div>
            ) : (
              <div className="text-gray-500">Scroll up for older messages</div>
            )}
          </div>
        )}

        {messages.map(message => (
          <div
            key={message.id}
            className={`flex ${message.userId === user?.id ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[70%] rounded-lg p-3 ${
                message.userId === user?.id ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-900'
              }`}
            >
              <p className="text-sm font-medium">{message.user.username}</p>
              <p>{message.content}</p>
              <p className="text-xs opacity-75 mt-1">
                {new Date(message.createdAt).toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}

        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="border-t p-4">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 rounded-lg border p-2"
            disabled={!socket || isSending}
          />
          <button
            type="submit"
            disabled={!socket || !newMessage.trim() || isSending}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg disabled:opacity-50"
          >
            {isSending ? 'Sending...' : 'Send'}
          </button>
        </div>
      </form>
    </div>
  )
}
