'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useChats } from '@/hooks/useChats' 

interface NewChatModalProps {
  isOpen: boolean
  onClose: () => void
}

export function NewChatModal({ isOpen, onClose }: NewChatModalProps) {
  const router = useRouter()
  const { refetch } = useChats() 
  const [name, setName] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/chats/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          participantIds: [], // Na razie tylko dla bieżącego użytkownika
        }),
      })

      if (!response.ok) {
        throw new Error('Nie udało się utworzyć czatu')
      }

      const data = await response.json()
      await refetch() // Dodaj to - odświeży listę chatów
      router.push(`/chat/${data.chat.id}`) // Zmień to - przekieruje do nowego chatu
      onClose()
    } catch (error) {
      console.error('Błąd podczas tworzenia czatu:', error)
      alert('Nie udało się utworzyć czatu')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg w-96">
        <h2 className="text-xl font-bold mb-4">New chat</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">
              Chat name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Input chat name"
              required
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? 'Creating...' : 'Create chat'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 