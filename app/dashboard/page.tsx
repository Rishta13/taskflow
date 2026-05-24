'use client'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import Link from 'next/link'
import { format } from 'date-fns'

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  TODO: { label: 'To Do', color: '#94a3b8', bg: 'rgba(148,163,184,0.1)' },
  IN_PROGRESS: { label: 'In Progress', color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
  DONE: { label: 'Done', color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
}

const priorityConfig: Record<string, { color: string; dot: string }> = {
  LOW: { color: '#64748b', dot: '●' },
  MEDIUM: { color: '#f59e0b', dot: '●' },
  HIGH: { color: '#ef4444', dot: '●' },
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
  }, [status, router])

  useEffect(() => {
    fetch('/api/dashboard').then(r => r.json()).then(d => { setData(d); setLoading(false) })
  }, [])

  const user = session?.user as any

  const statCards = [
    { label: 'Projects', value: data?.totalProjects ?? '-', icon: '◉', color: '#3b82f6' },
    { label: 'My Tasks', value: data?.myTasks?.length ?? '-', icon: '◎', color: '#a855f7' },
    { label: 'Overdue', value: data?.overdueTasks ?? '-', icon: '⚠', color: '#ef4444' },
    {
      label: 'Done',
      value: data?.tasksByStatus?.find((s: any) => s.status === 'DONE')?._count ?? 0,
      icon: '✓', color: '#10b981',
    },
  ]

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ marginLeft: 220, flex: 1, padding: '36px 40px', maxWidth: '100%' }}>

        {/* Header */}
        <div style={{ marginBottom: 36 }}>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)', letterSpacing: '0.1em', marginBottom: 6 }}>
            {format(new Date(), 'EEEE, MMMM d')}
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.5px', margin: 0 }}>
            Hey, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p style={{ color: 'var(--text-secondary)', margin: '4px 0 0', fontSize: 14 }}>
            Here's what's happening in your workspace today.
          </p>
        </div>

        {/* Stat Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 36 }}>
          {statCards.map((card, i) => (
            <div key={i} className="card fade-up" style={{
              padding: '20px 22px',
              animationDelay: `${i * 60}ms`,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div style={{
                  width: 34, height: 34, borderRadius: 8,
                  background: card.color + '20',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 16, color: card.color,
                }}>{card.icon}</div>
              </div>
              <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-1px', marginBottom: 2 }}>
                {loading ? <span style={{ color: 'var(--text-secondary)', fontSize: 18 }}>—</span> : card.value}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500 }}>{card.label}</div>
            </div>
          ))}
        </div>

        {/* Two column layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>

          {/* Recent tasks */}
          <div className="card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>Recent Activity</h2>
              <Link href="/tasks" style={{ fontSize: 12, color: 'var(--accent)', textDecoration: 'none' }}>View all →</Link>
            </div>
            {loading ? (
              <div style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Loading...</div>
            ) : data?.recentTasks?.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-secondary)', fontSize: 13 }}>
                No tasks yet. <Link href="/projects" style={{ color: 'var(--accent)' }}>Create a project</Link> to get started.
              </div>
            ) : data?.recentTasks?.slice(0, 6).map((task: any) => (
              <div key={task.id} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 0', borderBottom: '1px solid var(--border)',
              }}>
                <span style={{ color: priorityConfig[task.priority]?.color, fontSize: 8 }}>
                  {priorityConfig[task.priority]?.dot}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 13, fontWeight: 500,
                    textDecoration: task.status === 'DONE' ? 'line-through' : 'none',
                    color: task.status === 'DONE' ? 'var(--text-secondary)' : 'var(--text-primary)',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>{task.title}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{task.project?.name}</div>
                </div>
                <span className="badge" style={{
                  ...statusConfig[task.status],
                  background: statusConfig[task.status]?.bg,
                }}>
                  {statusConfig[task.status]?.label}
                </span>
              </div>
            ))}
          </div>

          {/* My tasks */}
          <div className="card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>Assigned to Me</h2>
              <Link href="/tasks" style={{ fontSize: 12, color: 'var(--accent)', textDecoration: 'none' }}>View all →</Link>
            </div>
            {loading ? (
              <div style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Loading...</div>
            ) : data?.myTasks?.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-secondary)', fontSize: 13 }}>
                You have no tasks assigned yet. 🎉
              </div>
            ) : data?.myTasks?.map((task: any) => (
              <div key={task.id} style={{
                padding: '12px 0', borderBottom: '1px solid var(--border)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {task.title}
                  </div>
                  <span className="badge" style={{ background: statusConfig[task.status]?.bg, color: statusConfig[task.status]?.color }}>
                    {statusConfig[task.status]?.label}
                  </span>
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 3 }}>
                  {task.project?.name}
                  {task.dueDate && (
                    <span style={{ marginLeft: 8, color: new Date(task.dueDate) < new Date() ? '#ef4444' : 'var(--text-secondary)' }}>
                      · Due {format(new Date(task.dueDate), 'MMM d')}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
