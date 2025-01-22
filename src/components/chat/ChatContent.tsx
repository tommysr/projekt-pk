'use client'

import { useSocket } from '@/hooks/useSocket'
import { useMessages } from '@/hooks/useMessages'
import { useAuth } from '@/hooks/useAuth'
import { useState, useEffect } from 'react'

export function ChatContent({ chatId }: { chatId: string }) {
  const socket = useSocket()

  useEffect(() => {
    if (!socket || !chatId) return
    socket.emit('join_room', chatId)
  }, [socket, chatId])


  const { messages, loading: messagesLoading, sendMessage } = useMessages(chatId)
  const { user, loading: userLoading } = useAuth()
  const [newMessage, setNewMessage] = useState('')
  const [isSending, setIsSending] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!socket || !newMessage.trim() || isSending) return

    try {
      setIsSending(true)
      await sendMessage(newMessage.trim())
      setNewMessage('')
    } catch (error) {
      console.error('Failed to send message:', error)
    } finally {
      setIsSending(false)
    }
  }

  if (userLoading || messagesLoading) {
    return <div>Loading...</div>
  }

  if (!socket) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p className="text-gray-500">Connecting to chat...</p>
        <p className="text-sm text-gray-400">Please wait while we establish a secure connection</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
            </div>
          </div>
        ))}
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
