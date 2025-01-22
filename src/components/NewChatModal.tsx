'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useChats } from '@/hooks/useChats'
import { useUsers } from '@/hooks/useUsers'
import { Check, X } from 'lucide-react'

interface NewChatModalProps {
  isOpen: boolean
  onClose: () => void
}

export function NewChatModal({ isOpen, onClose }: NewChatModalProps) {
  const router = useRouter()
  const { refetch } = useChats()
  const { users, loading: usersLoading } = useUsers()
  const [name, setName] = useState('')
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
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
          participantIds: selectedUsers,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create chat')
      }

      const data = await response.json()
      await refetch()
      router.push(`/chat/${data.chat.id}`)
      onClose()
    } catch (error) {
      console.error('Error creating chat:', error)
      alert('Failed to create chat')
    } finally {
      setIsLoading(false)
    }
  }

  const toggleUser = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg w-96 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">New chat</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-6 w-6" />
          </button>
        </div>
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
              placeholder="Enter chat name"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Select participants
            </label>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {usersLoading ? (
                <div>Loading users...</div>
              ) : (
                users.map(user => (
                  <div
                    key={user.id}
                    onClick={() => toggleUser(user.id)}
                    className={`p-2 rounded cursor-pointer flex items-center justify-between ${
                      selectedUsers.includes(user.id)
                        ? 'bg-blue-100'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    <span>{user.username}</span>
                    {selectedUsers.includes(user.id) && (
                      <Check className="h-4 w-4 text-blue-500" />
                    )}
                  </div>
                ))
              )}
            </div>
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
              disabled={isLoading || selectedUsers.length === 0}
            >
              {isLoading ? 'Creating...' : 'Create chat'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}