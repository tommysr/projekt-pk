'use client'

import React, { createContext, useContext, useEffect, useRef, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import { useAuth } from '@/hooks/useAuth'

interface ISocketContext {
  socket: Socket | null
  isConnected: boolean
}

const SocketContext = createContext<ISocketContext>({
  socket: null,
  isConnected: false,
})

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { user, loading: userLoading } = useAuth()
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const retriesRef = useRef(0)
  const MAX_RETRIES = 5
  const retryTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)

  useEffect(() => {
    // If we don't have a user or are still loading, do nothing
    if (userLoading || !user?.id) return

    // Already have a socket? No need to create a new one
    if (socket) return

    const newSocket = io(process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000', {
      path: '/socket.io/',
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      transports: ['websocket', 'polling'],
    })

    newSocket.on('connect', () => {
      console.log('Socket connected')
      setIsConnected(true)
      retriesRef.current = 0
    })

    newSocket.on('connect_error', error => {
      console.error('Socket connection error:', error)
      setIsConnected(false)
      if (retriesRef.current < MAX_RETRIES && user) {
        retryTimeoutRef.current = setTimeout(() => {
          // Check again that user is still there (and maybe component still mounted)
          if (user) {
            retriesRef.current += 1
            newSocket.connect()
          }
        }, 1000)
      }
    })

    newSocket.on('disconnect', reason => {
      console.log('Socket disconnected:', reason)
      setIsConnected(false)

      // Only attempt reconnection if:
      // 1. We haven't exceeded max retries
      // 2. We have a user
      // 3. We're not in the process of loading user data
      // 4. The disconnect wasn't intentional
      if (
        retriesRef.current < MAX_RETRIES &&
        user &&
        !userLoading &&
        reason !== 'io client disconnect'
      ) {
        retryTimeoutRef.current = setTimeout(() => {
          retriesRef.current += 1
          newSocket.connect()
        }, 1000)
      }
    })

    setSocket(newSocket)

    // Cleanup on unmount (only once, because the provider won't unmount on route changes)
    return () => {
      if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current)
      newSocket.disconnect()
    }
  }, [user])

  return <SocketContext.Provider value={{ socket, isConnected }}>{children}</SocketContext.Provider>
}

export const useSocketContext = () => useContext(SocketContext)
