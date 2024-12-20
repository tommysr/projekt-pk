import { renderHook, act } from '@testing-library/react'
import { useAuth } from '../useAuth'

// Mock fetch globally
const mockFetch = jest.fn()
global.fetch = mockFetch

describe('useAuth Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('login', () => {
    it('should successfully log in a user', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        username: 'testuser',
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ user: mockUser }),
      })

      const { result } = renderHook(() => useAuth())

      await act(async () => {
        await result.current.login('test@example.com', 'password123')
      })

      expect(result.current.user).toEqual(mockUser)
      expect(mockFetch).toHaveBeenCalledWith('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@example.com', password: 'password123' }),
      })
    })

    it('should handle login errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ error: 'Invalid credentials' }),
      })

      const { result } = renderHook(() => useAuth())

      await expect(
        act(async () => {
          await result.current.login('wrong@example.com', 'wrongpass')
        })
      ).rejects.toThrow('Invalid credentials')

      expect(result.current.user).toBeNull()
    })

    it('should successfully log out a user', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({}),
      })

      const { result } = renderHook(() => useAuth())

      // First log in a user
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            user: {
              id: '1',
              email: 'test@example.com',
              username: 'testuser',
            },
          }),
      })
      await act(async () => {
        await result.current.login('test@example.com', 'password123')
      })

      // Then log out
      await act(async () => {
        await result.current.logout()
      })

      expect(result.current.user).toBeNull()
      expect(mockFetch).toHaveBeenCalledWith('/api/auth/logout', {
        method: 'POST',
      })
    })
  })

  describe('register', () => {
    it('should successfully register a user', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        username: 'testuser',
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ user: mockUser }),
      })

      const { result } = renderHook(() => useAuth())

      await act(async () => {
        await result.current.register('testuser', 'test@example.com', 'password123')
      })

      expect(result.current.user).toEqual(mockUser)
      expect(mockFetch).toHaveBeenCalledWith('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123',
        }),
      })
    })

    it('should handle registration errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ error: 'User already exists' }),
      })

      const { result } = renderHook(() => useAuth())

      await expect(
        act(async () => {
          await result.current.register('existinguser', 'existing@example.com', 'password123')
        })
      ).rejects.toThrow('User already exists')

      expect(result.current.user).toBeNull()
    })
  })

  describe('logout', () => {
    it('should handle logout errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ error: 'Logout failed' }),
      })

      const { result } = renderHook(() => useAuth())

      await expect(
        act(async () => {
          await result.current.logout()
        })
      ).rejects.toThrow('Logout failed')
    })
  })

  describe('getUser', () => {
    it('should successfully fetch user data', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        username: 'testuser',
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ user: mockUser }),
      })

      const { result } = renderHook(() => useAuth())

      await act(async () => {
        await result.current.getUser()
      })

      expect(result.current.user).toEqual(mockUser)
      expect(mockFetch).toHaveBeenCalledWith('/api/auth/user', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      })
    })

    it('should handle case when user is not authenticated', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ user: null }),
      })

      const { result } = renderHook(() => useAuth())

      await act(async () => {
        await result.current.getUser()
      })

      expect(result.current.user).toBeNull()
    })
  })
})
