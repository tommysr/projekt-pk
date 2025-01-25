import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth/auth'
import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ chatId: string }> }
) {
  try {
    const { chatId } = await params

    if (!chatId) {
      return NextResponse.json({ error: 'Chat ID is required' }, { status: 400 })
    }

    const cookieStore = await cookies()
    const sessionId = cookieStore.get('sessionId')?.value
    if (!sessionId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const user = await auth.getUser(sessionId)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const participant = await prisma.chatParticipant.findUnique({
      where: {
        userId_chatId: {
          userId: user.id,
          chatId: chatId,
        },
      },
    })
    if (!participant) {
      return NextResponse.json({ error: 'Not authorized to view this chat' }, { status: 403 })
    }

    // Parse pagination parameters from URL
    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '50')
    const cursor = request.nextUrl.searchParams.get('cursor')

    const messages = await prisma.message.findMany({
      where: {
        chatId: chatId,
        ...(cursor && {
          createdAt: {
            lt: new Date(cursor),
          },
        }),
      },
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            username: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc', // Newest first for pagination
      },
    })

    // Get one extra message to determine if there are more
    const nextMessage =
      messages.length === 0
        ? null
        : await prisma.message.findFirst({
            where: {
              chatId: chatId,
              createdAt: {
                lt: messages[0]?.createdAt, // Use first message since we're in desc order
              },
            },
            orderBy: {
              createdAt: 'desc',
            },
            select: {
              id: true,
            },
          })

    console.log(nextMessage)

    return NextResponse.json({
      messages: messages.reverse(), // Reverse to maintain oldest-first in UI
      nextCursor: messages[0]?.createdAt.toISOString() || null, // Use first message for cursor
      hasMore: !!nextMessage,
    })
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
