export function Loading({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-3">
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-gray-800" />
      <p className="text-sm text-gray-500">{message}</p>
    </div>
  )
}
