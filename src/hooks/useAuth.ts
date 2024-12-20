import { User } from '@prisma/client/wasm'
import { useState } from 'react'

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null)

  const login = async (email: string, password: string) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    const data = await response.json()

    if (response.ok) {
      setUser(data.user)
    } else {
      throw new Error(data.error)
    }
  }

  const register = async (username: string, email: string, password: string) => {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password }),
    })

    const data = await response.json()

    if (response.ok) {
      setUser(data.user)
    } else {
      throw new Error(data.error)
    }
  }

  const logout = async () => {
    const response = await fetch('/api/auth/logout', {
      method: 'POST',
    })

    if (response.ok) {
      setUser(null)
    } else {
      throw new Error('Logout failed')
    }
  }

  const getUser = async () => {
    const response = await fetch('/api/auth/user', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })

    const data = await response.json()

    if (response.ok) {
      setUser(data.user)
    } else {
      setUser(null)
    }
  }

  return { user, login, register, logout, getUser }
}
