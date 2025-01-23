import { createServer } from 'http'
import { parse } from 'url'
import next from 'next'
import { Server, type Socket } from 'socket.io'
import { prisma } from './src/lib/prisma'
import { sessions } from './src/lib/auth/redis'

// Declare global type at the top level
declare global {
  var _io: Server | undefined
}

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = parseInt(process.env.PORT || '3000', 10)

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url!, true)
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('internal server error')
    }
  })

  const io = new Server(server, {
    path: '/socket.io/',
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
      allowedHeaders: ['cookie', 'Cookie'],
    },
  })

  global._io = io

  io.use(async (socket, next) => {
    try {
      console.log('Socket auth attempt:', socket.id)
      console.log('Received cookies:', socket.handshake.headers.cookie)

      const sessionId = socket.handshake.headers.cookie
        ?.split(';')
        .find(c => c.trim().startsWith('sessionId='))
        ?.split('=')[1]
        ?.trim()

      if (!sessionId) {
        console.log('No session ID found in cookies. All headers:', socket.handshake.headers)
        return next(new Error('Authentication failed - no session ID'))
      }

      console.log('Found socket session cookie:', {
        encoded: sessionId.substring(0, 8) + '...',
        decoded: decodeURIComponent(sessionId).substring(0, 8) + '...',
      })

      const decodedSessionId = decodeURIComponent(sessionId)

      console.log('Verifying socket session:', {
        socketId: socket.id,
        sessionId: decodedSessionId.substring(0, 8) + '...',
      })

      const userId = await sessions.verify(decodedSessionId)
      if (!userId) {
        console.log('Invalid session ID in socket handshake:', {
          socketId: socket.id,
          sessionId: decodedSessionId.substring(0, 8) + '...',
        })
        return next(new Error('Authentication failed - invalid session'))
      }

      console.log('Socket authenticated:', {
        socketId: socket.id,
        userId,
        sessionId: decodedSessionId.substring(0, 8) + '...',
      })

      socket.data.userId = userId
      next()
    } catch (error) {
      console.error('Socket authentication error:', {
        socketId: socket.id,
        error,
      })
      next(new Error('Authentication failed - server error'))
    }
  })

  io.on('connection', async socket => {
    console.log('Client connected', {
      socketId: socket.id,
      userId: socket.data.userId,
    })

    socket.join(socket.data.userId)

    socket.on('join_room', async (chatId: string) => {
      try {
        const participant = await prisma.chatParticipant.findUnique({
          where: {
            userId_chatId: {
              userId: socket.data.userId,
              chatId,
            },
          },
        })

        if (!participant) {
          console.log(
            `User ${socket.data.userId} tried to join chat ${chatId} but is not a participant.`
          )
          return
        }

        // Check if socket is already in the room to avoid double-joining
        const rooms = socket.rooms
        if (!rooms.has(chatId)) {
          socket.join(chatId)
          console.log(`Socket ${socket.id} joined chat ${chatId}`)
        }
      } catch (err) {
        console.error('Error in join_room event:', err)
      }
    })

    socket.on('send_message', async (data: { chatId: string; content: string }, callback) => {
      try {
        const { chatId, content } = data

        if (!chatId || !content) {
          callback?.({ error: 'Invalid message data' })
          return
        }

        // Verify user is in the chat
        const participant = await prisma.chatParticipant.findUnique({
          where: {
            userId_chatId: {
              userId: socket.data.userId,
              chatId,
            },
          },
        })

        if (!participant) {
          callback?.({ error: 'Not a chat participant' })
          return
        }

        // Create the message
        const message = await prisma.message.create({
          data: {
            content,
            userId: socket.data.userId,
            chatId,
          },
          include: {
            user: {
              select: {
                id: true,
                username: true,
              },
            },
          },
        })

        io.to(chatId).emit('new_message', message)

        callback?.({ success: true, message })
      } catch (error) {
        console.error('Error saving message:', {
          socketId: socket.id,
          userId: socket.data.userId,
          error,
        })
        callback?.({ error: 'Failed to send message' })
      }
    })

    socket.on('disconnect', () => {
      console.log('Client disconnected', {
        socketId: socket.id,
        userId: socket.data.userId,
      })
    })
  })

  server.listen(port, hostname, () => {
    console.log(`> Ready on http://${hostname}:${port}`)
  })
})
