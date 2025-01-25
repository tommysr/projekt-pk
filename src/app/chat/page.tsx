'use client'

import { useEffect } from 'react'
// import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useChats } from '@/hooks/useChats'
import { Loading } from '@/components/ui/loading'

export default function ChatPage() {
  const router = useRouter()
  const { chats, loading } = useChats()

  useEffect(() => {
    if (chats?.length > 0 && window.location.pathname === '/chat') {
      const firstChat = chats[0]
      const chatId = firstChat.chatId || firstChat.id
      console.log('Redirecting to:', `/chat/${chatId}`)
      router.replace(`/chat/${chatId}`)
    }
  }, [chats, router])

  // Show loading state while checking for chats
  if (loading) {
    return <Loading message="Loading your chats..." />
  }

  // If no chats exist, show a message
  if (!chats?.length) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <p className="text-gray-500">No chats yet</p>
        <p className="text-sm text-gray-400">Create a new chat to get started</p>
      </div>
    )
  }

  // Show a placeholder while redirecting
  return <Loading message="Opening your chat..." />
}
