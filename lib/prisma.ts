// PrismaClient is generated during build via `npx prisma generate`
// Types will resolve correctly after generation

/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require('@prisma/client')

const globalForPrisma = globalThis as { prisma?: typeof PrismaClient }

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ log: ['error'] })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
