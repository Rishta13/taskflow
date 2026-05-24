'use client'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import { format } from 'date-fns'

const statusConfig: Record<string, { label: string; color: string; bg: string; next: string }> = {
  TODO: { label: 'To Do', color: '#94a3b8', bg: 'rgba(148,163,184,0.1)', next: 'IN_PROGRESS' },
  IN_PROGRESS: { label: 'In Progress', color: '#3b82f6', bg: 'rgba(59,130,246,0.1)', next: 'DONE' },
  DONE: { label: 'Done', color: '#10b981', bg: 'rgba(16,185,129,0.1)', next: 'TODO' },
}

export default function MyTasksPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [data, setData] = useState<any>(null)
  const [filter, setFilter] = useState('ALL')
  const user = session?.user as any

  useEffect(() => { if (status === 'unauthenticated') router.push('/login') }, [status, router])

  const load = () => {
    fetch('/api/dashboard').then(r => r.json()).then(setData)
  }
  useEffect(() => { load() }, [])

  async function updateStatus(taskId: string, current: string) {
    await fetch(`/api/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: statusConfig[current]?.next }),
    })
    load()
  }

  const tasks = data?.myTasks ?? []
  const filtered = filter === 'ALL' ? tasks : tasks.filter((t: any) => t.status === filter)

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ marginLeft: 220, flex: 1, padding: '36px 40px' }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.5px', margin: '0 0 4px' }}>My Tasks</h1>
          <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: 14 }}>Tasks assigned to you across all projects</p>
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          {['ALL', 'TODO', 'IN_PROGRESS', 'DONE'].map(s => (
            <button key={s} onClick={() => setFilter(s)} className="btn" style={{
              padding: '6px 16px', fontSize: 12,
              background: filter === s ? 'var(--accent)' : 'transparent',
              color: filter === s ? 'var(--navy)' : 'var(--text-secondary)',
              border: `1px solid ${filter === s ? 'var(--accent)' : 'var(--border)'}`,
            }}>
              {s === 'ALL' ? 'All' : s === 'IN_PROGRESS' ? 'In Progress' : s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {!data ? (
            <div style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Loading...</div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px', border: '2px dashed var(--border)', borderRadius: 12, color: 'var(--text-secondary)', fontSize: 14 }}>
              {filter === 'ALL' ? "You have no tasks assigned. Nice! 🎉" : `No ${filter.toLowerCase().replace('_', ' ')} tasks.`}
            </div>
          ) : filtered.map((task: any, i: number) => (
            <div key={task.id} className="card fade-up" style={{ padding: '16px 20px', animationDelay: `${i * 40}ms` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <button onClick={() => updateStatus(task.id, task.status)} style={{
                  width: 22, height: 22, borderRadius: 6,
                  border: `2px solid ${statusConfig[task.status]?.color}`,
                  background: task.status === 'DONE' ? statusConfig[task.status]?.color : 'transparent',
                  cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontSize: 11,
                }}>
                  {task.status === 'DONE' ? '✓' : ''}
                </button>

                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: 14, fontWeight: 500,
                    textDecoration: task.status === 'DONE' ? 'line-through' : 'none',
                    color: task.status === 'DONE' ? 'var(--text-secondary)' : 'var(--text-primary)',
                  }}>{task.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                    {task.project?.name}
                    {task.dueDate && (
                      <span style={{ marginLeft: 8, color: new Date(task.dueDate) < new Date() && task.status !== 'DONE' ? '#ef4444' : 'var(--text-secondary)' }}>
                        · Due {format(new Date(task.dueDate), 'MMM d')}
                      </span>
                    )}
                  </div>
                </div>

                <span className="badge" style={{ background: statusConfig[task.status]?.bg, color: statusConfig[task.status]?.color }}>
                  {statusConfig[task.status]?.label}
                </span>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
