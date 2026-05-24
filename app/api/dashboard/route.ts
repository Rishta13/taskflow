import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = (session.user as any).id
  const now = new Date()

  const [totalProjects, myTasks, overdueTasks, recentTasks] = await Promise.all([
    prisma.project.count({
      where: {
        OR: [{ ownerId: userId }, { members: { some: { userId } } }],
      },
    }),
    prisma.task.findMany({
      where: { assigneeId: userId },
      include: {
        project: { select: { id: true, name: true } },
        assignee: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
    prisma.task.count({
      where: {
        assigneeId: userId,
        dueDate: { lt: now },
        status: { not: 'DONE' },
      },
    }),
    prisma.task.findMany({
      where: {
        project: {
          OR: [{ ownerId: userId }, { members: { some: { userId } } }],
        },
      },
      include: {
        project: { select: { id: true, name: true } },
        assignee: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),
  ])

  const tasksByStatus = await prisma.task.groupBy({
    by: ['status'],
    where: { assigneeId: userId },
    _count: true,
  })

  return NextResponse.json({ totalProjects, myTasks, overdueTasks, recentTasks, tasksByStatus })
}
