import { renderHook, act } from '@testing-library/react'
import { useAuth } from '../useAuth'

// Mock fetch globally
const mockFetch = jest.fn()
global.fetch = mockFetch

// Mock SWR to prevent automatic data fetching
jest.mock('swr', () => ({
  __esModule: true,
  default: () => ({
    data: null,
    error: null,
    isLoading: false,
  }),
  mutate: jest.fn(),
}))

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

      mockFetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ user: mockUser }),
        })
      )

      const { result } = renderHook(() => useAuth())

      await act(async () => {
        await result.current.login('test@example.com', 'password123')
      })

      expect(mockFetch).toHaveBeenCalledWith('/api/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ email: 'test@example.com', password: 'password123' }),
      })
    })

    it('should handle login errors', async () => {
      mockFetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: false,
          json: () => Promise.resolve({ error: 'Invalid credentials' }),
        })
      )

      const { result } = renderHook(() => useAuth())

      await expect(
        act(async () => {
          await result.current.login('wrong@example.com', 'wrongpass')
        })
      ).rejects.toThrow('Invalid credentials')
    })

    it('should successfully log out a user', async () => {
      mockFetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({}),
        })
      )

      const { result } = renderHook(() => useAuth())

      await act(async () => {
        await result.current.logout()
      })

      expect(mockFetch).toHaveBeenCalledWith('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
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

      mockFetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ user: mockUser }),
        })
      )

      const { result } = renderHook(() => useAuth())

      await act(async () => {
        await result.current.register('testuser', 'test@example.com', 'password123')
      })

      expect(mockFetch).toHaveBeenCalledWith('/api/auth/register', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123',
        }),
      })
    })

    it('should handle registration errors', async () => {
      mockFetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: false,
          json: () => Promise.resolve({ error: 'User already exists' }),
        })
      )

      const { result } = renderHook(() => useAuth())

      await expect(
        act(async () => {
          await result.current.register('existinguser', 'existing@example.com', 'password123')
        })
      ).rejects.toThrow('User already exists')
    })
  })

  describe('user data fetching', () => {
    it('should automatically fetch user data', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        username: 'testuser',
      }

      mockFetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ user: mockUser }),
        })
      )

      const { result } = renderHook(() => useAuth())

      await act(async () => {
        await result.current.getUser()
      })

      expect(mockFetch).toHaveBeenCalledWith('/api/auth/user', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      })
    })

    it('should handle case when user is not authenticated', async () => {
      mockFetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: false,
          json: () => Promise.resolve({ user: null }),
        })
      )

      const { result } = renderHook(() => useAuth())

      await act(async () => {
        await result.current.getUser()
      })

      expect(result.current.user).toBeNull()
    })
  })
})
