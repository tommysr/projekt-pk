import { PrismaClient } from '@prisma/client'
import { mockDeep } from 'jest-mock-extended'

export const prismaMock = mockDeep<PrismaClient>()

export const prisma = prismaMock as unknown as PrismaClient
