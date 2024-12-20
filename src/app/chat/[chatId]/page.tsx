'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useParams } from 'next/navigation'

interface Message {
  id: string
  content: string
  sender: 'user' | 'other'
  timestamp: string
  userId: string
}

interface ApiMessage {
  id: string
  content: string
  userId: string
  createdAt: string
  user: {
    id: string
    username: string
  }
}

export default function ChatPage() {
  const { user, getUser } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const params = useParams()

  useEffect(() => {
    if (user === null) {
      getUser()
    }
  }, [user, getUser])

  useEffect(() => {
    const fetchMessages = async () => {
      if (!params.chatId || !user) return

      try {
        setIsLoading(true)
        const response = await fetch(`/api/chats/${params.chatId}/messages`)
        const data = await response.json()
        if (response.ok) {
          setMessages(
            data.messages.map((msg: ApiMessage) => ({
              id: msg.id,
              content: msg.content,
              sender: msg.userId === user?.id ? 'user' : 'other',
              timestamp: new Date(msg.createdAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              }),
              userId: msg.userId,
            }))
          )
        }
      } catch (error) {
        console.error('Failed to fetch messages:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (user && params.chatId) {
      fetchMessages()
    }
  }, [user, params.chatId])

  if (isLoading || !user) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {messages.map(message => (
        <div
          key={message.id}
          className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={`flex ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'} items-end`}
          >
            <Avatar className="w-8 h-8">
              <AvatarImage
                src={
                  message.sender === 'user' ? `/avatars/${user.username}.png` : '/other-avatar.png'
                }
              />
              <AvatarFallback>
                {message.sender === 'user' ? user.username[0].toUpperCase() : 'O'}
              </AvatarFallback>
            </Avatar>
            <div
              className={`flex flex-col ${message.sender === 'user' ? 'items-end mr-2' : 'items-start ml-2'}`}
            >
              <div
                className={`rounded-lg p-3 ${
                  message.sender === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                }`}
              >
                <p className="text-sm">{message.content}</p>
              </div>
              <span className="text-xs text-muted-foreground mt-1">{message.timestamp}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
