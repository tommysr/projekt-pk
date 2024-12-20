'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { login } = useAuth()

  // Add validation states
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')

  const validateEmail = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email.trim()) {
      setEmailError('Email is required.')
      return false
    } else if (!emailRegex.test(email.trim())) {
      setEmailError('Please enter a valid email address.')
      return false
    }
    setEmailError('')
    return true
  }

  const validatePassword = () => {
    if (!password) {
      setPasswordError('Password is required.')
      return false
    } else if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters long.')
      return false
    }
    setPasswordError('')
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const isEmailValid = validateEmail()
    const isPasswordValid = validatePassword()

    if (!isEmailValid || !isPasswordValid) {
      return
    }

    setLoading(true)

    try {
      await login(email.trim(), password)
      router.push('/chat')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <CardDescription>Welcome back! Please login to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="text-red-500 text-sm">{error}</div>}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onBlur={validateEmail}
                className={emailError ? 'border-red-500' : ''}
                required
              />
              {emailError && <p className="text-red-500 text-sm">{emailError}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onBlur={validatePassword}
                className={passwordError ? 'border-red-500' : ''}
                required
              />
              {passwordError && <p className="text-red-500 text-sm">{passwordError}</p>}
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-blue-600 hover:underline dark:text-blue-400">
              Register here
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
