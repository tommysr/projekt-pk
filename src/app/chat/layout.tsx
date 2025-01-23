'use client'

// import { useEffect } from "react";
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Menu, MessageSquare, Settings, LogOut } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAuth } from '@/hooks/useAuth'
import { useChats } from '@/hooks/useChats'
import { NewChatButton } from '@/components/NewChatButton'

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  const { logout } = useAuth()
  const router = useRouter()
  const { chats, loading } = useChats()

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 bg-gray-100 border-r dark:bg-gray-800 dark:border-gray-700 hidden md:flex md:flex-col">
        <div className="p-4 border-b dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-xl font-bold">Chats</h2>
          <NewChatButton />
        </div>
        <ScrollArea className="flex-grow">
          <nav className="p-4 space-y-2">
            {loading ? (
              <div className="flex h-screen items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
              </div>
            ) : (
              chats.map(chat => (
                <Link
                  key={chat.id}
                  href={`/chat/${chat.id}`}
                  className="flex items-center space-x-3 hover:bg-gray-200 dark:hover:bg-gray-700 p-2 rounded-lg"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={`/avatars/${chat.participants[0].user.username}.png`} />
                    <AvatarFallback>
                      {chat.name?.[0] || chat.participants[0].user.username[0]}
                    </AvatarFallback>
                  </Avatar>
                  <span>{chat.name || chat.participants[0].user.username}</span>
                </Link>
              ))
            )}
          </nav>
        </ScrollArea>
        <div className="p-4 border-t dark:border-gray-700 space-y-2">
          <Button variant="outline" className="w-full">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
          <Button variant="outline" className="w-full" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 p-4 flex items-center justify-between">
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-6 w-6" />
            <span className="sr-only">Toggle menu</span>
          </Button>
          <h1 className="text-xl font-bold">Chat</h1>
          <Button variant="ghost" size="icon">
            <MessageSquare className="h-6 w-6" />
            <span className="sr-only">Message options</span>
          </Button>
        </header>

        {/* Chat messages */}
        <main className="flex-1 overflow-hidden">{children}</main>
      </div>
    </div>
  )
}
