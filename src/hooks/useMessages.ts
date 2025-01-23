'use client'

import { useEffect, useState } from 'react'
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
    username: true
  }
}

export function useMessages(chatId: string) {
  const { socket } = useSocketContext()
  const { data, error, isLoading, mutate } = useSWR<{ messages: Message[] }>(
    chatId ? `/api/chats/${chatId}/messages` : null
  )

  // Socket listeners for real-time updates
  useEffect(() => {
    if (!socket || !chatId) return

    const handleNewMessage = (message: Message) => {
      if (message.chatId === chatId) {
        mutate(currentData => {
          if (!currentData) return { messages: [message] }
          return { messages: [...currentData.messages, message] }
        }, false)
      }
    }

    const handleMessageUpdate = (updatedMessage: Message) => {
      if (updatedMessage.chatId === chatId) {
        mutate(currentData => {
          if (!currentData) return { messages: [updatedMessage] }
          return {
            messages: currentData.messages.map(msg =>
              msg.id === updatedMessage.id ? updatedMessage : msg
            ),
          }
        }, false)
      }
    }

    const handleMessageDelete = (messageId: string) => {
      mutate(currentData => {
        if (!currentData) return { messages: [] }
        return {
          messages: currentData.messages.filter(msg => msg.id !== messageId),
        }
      }, false)
    }

    socket.on('new_message', handleNewMessage)
    socket.on('message_update', handleMessageUpdate)
    socket.on('message_delete', handleMessageDelete)

    return () => {
      socket.off('new_message', handleNewMessage)
      socket.off('message_update', handleMessageUpdate)
      socket.off('message_delete', handleMessageDelete)
    }
  }, [socket, chatId, mutate])

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

  return {
    messages: data?.messages || [],
    loading: isLoading,
    error,
    sendMessage,
    refetch: () => mutate(),
  }
}
