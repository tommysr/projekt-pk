'use client'

import { useEffect } from 'react'
// import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useChats } from '@/hooks/useChats'

export default function ChatPage() {
  const router = useRouter()
  const { chats } = useChats()

  useEffect(() => {
    if (window.location.pathname === '/chat' && chats?.length > 0) {
      const firstChat = chats[0]
      router.replace(`/chat/${firstChat.chatId}`)
    }
  }, [chats, router])

  return null
}
