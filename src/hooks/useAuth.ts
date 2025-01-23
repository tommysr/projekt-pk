'use client'

import { User } from '@prisma/client/wasm'
import useSWR, { mutate } from 'swr'
import Cookies from 'js-cookie'

const fetchWithCredentials = async (url: string, options: RequestInit = {}) => {
  const response = await fetch(url, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(options.headers || {}),
    },
  })

  const data = await response.json()
  if (!response.ok) {
    throw new Error(data.error || 'An error occurred')
  }
  return data
}

export const useAuth = () => {
  const { data, isLoading } = useSWR<{ user: User | null }>(
    '/api/auth/user',
    fetchWithCredentials,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateIfStale: false,
      shouldRetryOnError: false,
      dedupingInterval: 60000, // 1 minute
    }
  )

  const login = async (email: string, password: string) => {
    try {
      const data = await fetchWithCredentials('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      })

      // Update the cached user data
      await mutate('/api/auth/user', { user: data.user }, false)
      return data.user
    } catch (error) {
      throw error
    }
  }

  const register = async (username: string, email: string, password: string) => {
    try {
      const data = await fetchWithCredentials('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ username, email, password }),
      })

      // Update the cached user data
      await mutate('/api/auth/user', { user: data.user }, false)
      return data.user
    } catch (error) {
      throw error
    }
  }

  const logout = async () => {
    try {
      await fetchWithCredentials('/api/auth/logout', {
        method: 'POST',
      })

      // Clear the session cookie
      Cookies.remove('sessionId', { path: '/' })

      // Clear the cached user data
      await mutate('/api/auth/user', { user: null }, false)
    } catch (error) {
      throw error
    }
  }

  const getUser = async () => {
    try {
      const data = await fetchWithCredentials('/api/auth/user', {
        method: 'GET',
      })
      await mutate('/api/auth/user', { user: data.user }, false)
      return data.user
    } catch (error) {
      console.error('Error fetching user:', error)
      await mutate('/api/auth/user', { user: null }, false)
      return null
    }
  }

  return {
    user: data?.user ?? null,
    loading: isLoading,
    error: undefined,
    login,
    register,
    logout,
    getUser,
  }
}
