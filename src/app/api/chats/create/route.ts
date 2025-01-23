import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth/auth'

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const sessionId = cookieStore.get('sessionId')?.value

    if (!sessionId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await auth.getUser(sessionId)

    if (!user) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
    }

    const { name, participantIds } = await request.json()

    // Ensure the current user is included in participants
    const uniqueParticipantIds = Array.from(new Set([...participantIds, user.id]))

    // Create the chat and its participants in a transaction
    const chat = await prisma.$transaction(async tx => {
      // Create the chat
      const newChat = await tx.chat.create({
        data: {
          name,
          participants: {
            create: uniqueParticipantIds.map(userId => ({
              userId,
            })),
          },
        },
        include: {
          participants: {
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                },
              },
            },
          },
        },
      })

      return newChat
    })

    const io = global._io
    if (io) {
      const allUserIds = chat.participants.map(p => p.userId) 
      console.log('DEBUG: allUserIds =', allUserIds)
      allUserIds.forEach(uid => {
        io.to(uid).emit('new_chat', chat)
      })
    } else {
      console.warn('Socket IO is not available in global._io')
    }

    return NextResponse.json({ chat })
  } catch (error) {
    console.error('Error creating chat:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create chat' },
      { status: 500 }
    )
  }
}