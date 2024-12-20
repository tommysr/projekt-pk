import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Clean up existing data
  await prisma.message.deleteMany()
  await prisma.chatParticipant.deleteMany()
  await prisma.chat.deleteMany()
  await prisma.user.deleteMany()

  // Create users
  const users = await Promise.all([
    prisma.user.create({
      data: {
        username: 'alice',
        email: 'alice@example.com',
        password: await bcrypt.hash('password123', 10),
      },
    }),
    prisma.user.create({
      data: {
        username: 'bob',
        email: 'bob@example.com',
        password: await bcrypt.hash('password123', 10),
      },
    }),
    prisma.user.create({
      data: {
        username: 'charlie',
        email: 'charlie@example.com',
        password: await bcrypt.hash('password123', 10),
      },
    }),
  ])

  // Create chats
  const [aliceBobChat, groupChat] = await Promise.all([
    // Direct chat between Alice and Bob
    prisma.chat.create({
      data: {
        name: null, // Direct chats don't need names
        participants: {
          create: [
            { userId: users[0].id }, // Alice
            { userId: users[1].id }, // Bob
          ],
        },
      },
    }),
    // Group chat with all users
    prisma.chat.create({
      data: {
        name: 'Team Chat',
        participants: {
          create: users.map(user => ({
            userId: user.id,
          })),
        },
      },
    }),
  ])

  // Create some messages
  await prisma.message.createMany({
    data: [
      {
        content: 'Hey Bob, how are you?',
        userId: users[0].id, // Alice
        chatId: aliceBobChat.id,
        createdAt: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
      },
      {
        content: "I'm good, thanks! How about you?",
        userId: users[1].id, // Bob
        chatId: aliceBobChat.id,
        createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      },
      {
        content: 'Welcome everyone to the team chat!',
        userId: users[0].id, // Alice
        chatId: groupChat.id,
        createdAt: new Date(Date.now() - 1000 * 60 * 120), // 2 hours ago
      },
      {
        content: 'Thanks for adding me!',
        userId: users[2].id, // Charlie
        chatId: groupChat.id,
        createdAt: new Date(Date.now() - 1000 * 60 * 110), // 1 hour 50 minutes ago
      },
    ],
  })

  console.log('Seed data created successfully!')
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
