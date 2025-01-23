'use client'

import useSWR, { mutate } from 'swr'
import { useSocket } from './useSocket'
import { useEffect } from 'react'

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
  const socket = useSocket()
  const { data, error, isLoading, mutate } = useSWR<{ chats: ChatWithParticipants[] }>('/api/chats')

  // Listen for real-time chat updates
  useEffect(() => {
    if (!socket) return

    const handleChatUpdate = (updatedChat: ChatWithParticipants) => {
      mutate(currentData => {
        if (!currentData) return { chats: [updatedChat] }
        const updatedChats = currentData.chats.map(chat =>
          chat.chatId === updatedChat.chatId ? updatedChat : chat
        )
        return { chats: updatedChats }
      }, { revalidate: false })
    }

    const handleNewChat = (newChat: Chat) => {
      mutate(currentData => {
        if (!currentData) return { chats: [newChat] }
        const exists = currentData.chats.some(c => c.id === newChat.id)
        if (exists) return currentData
    
        return {
          chats: [...currentData.chats, newChat],
        }
        
      }, { revalidate: false })
    }

    const handleChatDelete = (chatId: string) => {
      mutate(
        currentData => ({
          chats: currentData ? currentData.chats.filter(chat => chat.chatId !== chatId) : [],
        }),
        { revalidate: false }
      )
    }

    socket.on('chat_update', handleChatUpdate)
    socket.on('new_chat', handleNewChat)
    socket.on('chat_delete', handleChatDelete)

    return () => {
      socket.off('chat_update', handleChatUpdate)
      socket.off('new_chat', handleNewChat)
      socket.off('chat_delete', handleChatDelete)
    }
  }, [socket, mutate])

  return {
    chats: data?.chats ?? [],
    loading: isLoading,
    error,
    refetch: () => mutate(),
  }
}
