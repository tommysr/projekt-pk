import { ChatContent } from '@/components/chat/ChatContent'

export default async function ChatPage({ params }: { params: Promise<{ chatId: string }> }) {
  const { chatId } = await params
  return <ChatContent chatId={chatId} />
}
