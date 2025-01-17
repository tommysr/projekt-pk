'use client'

import { SWRConfig } from 'swr'

// Global fetcher function
const fetcher = async (url: string) => {
  const res = await fetch(url, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  })

  if (!res.ok) {
    const error = new Error('An error occurred while fetching the data.')
    const data = await res.json()
    ;(error as any).info = data
    ;(error as any).status = res.status
    throw error
  }

  return res.json()
}

export function SWRProvider({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig
      value={{
        fetcher,
        revalidateOnFocus: false,
        revalidateOnReconnect: true,
        dedupingInterval: 5000,
        shouldRetryOnError: false,
        keepPreviousData: true,
        refreshInterval: 0,
        errorRetryCount: 3,
        focusThrottleInterval: 5000,
      }}
    >
      {children}
    </SWRConfig>
  )
}
