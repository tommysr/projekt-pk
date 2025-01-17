'use client'

import { useEffect, useRef, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import { useAuth } from './useAuth'

// Global socket instance
let globalSocket: Socket | null = null
let globalConnectAttempts = 0
const MAX_RETRIES = 5

export function useSocket() {
  const { user, loading: userLoading } = useAuth()
  const [isInitialized, setIsInitialized] = useState(false)
  const retryTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)

  useEffect(() => {
    let mounted = true

    const setupSocket = async () => {
      if (userLoading || !user?.id || globalConnectAttempts >= MAX_RETRIES) {
        return
      }

      if (!globalSocket || !globalSocket.connected) {
        if (globalSocket) {
          globalSocket.disconnect()
          globalSocket = null
        }

        const socket = io(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000', {
          path: '/socket.io/',
          withCredentials: true,
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
          transports: ['websocket'],
        })

        socket.on('connect', () => {
          if (process.env.NODE_ENV === 'development') {
            console.log('Socket connected')
          }
          if (mounted) {
            setIsInitialized(true)
            globalConnectAttempts = 0
          }
        })

        socket.on('connect_error', error => {
          console.error('Socket connection error:', error)
          if (mounted) {
            setIsInitialized(false)
            if (globalConnectAttempts < MAX_RETRIES) {
              globalConnectAttempts++
              retryTimeoutRef.current = setTimeout(setupSocket, 1000)
            }
          }
        })

        socket.on('disconnect', reason => {
          if (process.env.NODE_ENV === 'development') {
            console.log('Socket disconnected:', reason)
          }
          if (mounted) {
            setIsInitialized(false)
            if (globalConnectAttempts < MAX_RETRIES) {
              globalConnectAttempts++
              retryTimeoutRef.current = setTimeout(setupSocket, 1000)
            }
          }
        })

        globalSocket = socket
      } else if (mounted) {
        setIsInitialized(true)
      }
    }

    setupSocket()

    return () => {
      mounted = false
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current)
      }
    }
  }, [user?.id, userLoading])

  return isInitialized && globalSocket ? globalSocket : null
}
