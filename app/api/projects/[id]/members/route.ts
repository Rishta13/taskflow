import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { email } = await req.json()

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const existing = await prisma.projectMember.findUnique({
    where: { userId_projectId: { userId: user.id, projectId: params.id } },
  })
  if (existing) return NextResponse.json({ error: 'Already a member' }, { status: 400 })

  const member = await prisma.projectMember.create({
    data: { userId: user.id, projectId: params.id },
    include: { user: { select: { id: true, name: true, email: true } } },
  })

  return NextResponse.json(member)
}
