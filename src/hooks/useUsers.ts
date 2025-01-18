import useSWR from 'swr'

interface User {
  id: string
  username: string
}

export function useUsers() {
  const { data, error, isLoading } = useSWR<{ users: User[] }>('/api/users')

  return {
    users: data?.users || [],
    loading: isLoading,
    error,
  }
} 