'use client'

import { SWRConfig } from 'swr'

interface FetcherError extends Error {
  status?: number;
}

interface FetcherResponse {
  data: unknown;
  error?: string;
}

// Global fetcher function
const fetcher = async (url: string): Promise<FetcherResponse> => {
  const res = await fetch(url)
  if (!res.ok) {
    const error = new Error('An error occurred while fetching the data.') as FetcherError
    error.status = res.status
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
