'use client'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import { format } from 'date-fns'

const statusConfig: Record<string, { label: string; color: string; bg: string; next: string }> = {
  TODO: { label: 'To Do', color: '#94a3b8', bg: 'rgba(148,163,184,0.1)', next: 'IN_PROGRESS' },
  IN_PROGRESS: { label: 'In Progress', color: '#3b82f6', bg: 'rgba(59,130,246,0.1)', next: 'DONE' },
  DONE: { label: 'Done', color: '#10b981', bg: 'rgba(16,185,129,0.1)', next: 'TODO' },
}
const priorityConfig: Record<string, { label: string; color: string }> = {
  LOW: { label: 'Low', color: '#64748b' },
  MEDIUM: { label: 'Medium', color: '#f59e0b' },
  HIGH: { label: 'High', color: '#ef4444' },
}

export default function ProjectDetailPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const [project, setProject] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [showMemberModal, setShowMemberModal] = useState(false)
  const [taskForm, setTaskForm] = useState({ title: '', description: '', assigneeId: '', priority: 'MEDIUM', dueDate: '' })
  const [memberEmail, setMemberEmail] = useState('')
  const [saving, setSaving] = useState(false)
  const [filter, setFilter] = useState('ALL')
  const user = session?.user as any

  useEffect(() => { if (status === 'unauthenticated') router.push('/login') }, [status, router])

  const loadProject = () => {
    fetch(`/api/projects/${id}`).then(r => r.json()).then(d => { setProject(d); setLoading(false) })
  }
  useEffect(() => { loadProject() }, [id])

  async function createTask(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...taskForm, projectId: id }),
    })
    setShowTaskModal(false)
    setTaskForm({ title: '', description: '', assigneeId: '', priority: 'MEDIUM', dueDate: '' })
    loadProject()
    setSaving(false)
  }

  async function updateTaskStatus(taskId: string, currentStatus: string) {
    const next = statusConfig[currentStatus]?.next
    await fetch(`/api/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: next }),
    })
    loadProject()
  }

  async function deleteTask(taskId: string) {
    if (!confirm('Delete this task?')) return
    await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' })
    loadProject()
  }

  async function addMember(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const res = await fetch(`/api/projects/${id}/members`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: memberEmail }),
    })
    if (res.ok) {
      setShowMemberModal(false)
      setMemberEmail('')
      loadProject()
    } else {
      const d = await res.json()
      alert(d.error)
    }
    setSaving(false)
  }

  const filteredTasks = project?.tasks?.filter((t: any) => filter === 'ALL' || t.status === filter) ?? []
  const isOwner = project?.ownerId === user?.id

  if (loading) return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ marginLeft: 220, flex: 1, padding: '36px 40px', color: 'var(--text-secondary)', fontSize: 14 }}>Loading...</main>
    </div>
  )

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ marginLeft: 220, flex: 1, padding: '36px 40px' }}>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8, cursor: 'pointer' }} onClick={() => router.push('/projects')}>
            ← Projects
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.5px', margin: '0 0 6px' }}>{project?.name}</h1>
              {project?.description && <p style={{ color: 'var(--text-secondary)', fontSize: 14, margin: 0 }}>{project.description}</p>}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              {isOwner && (
                <button className="btn btn-ghost" onClick={() => setShowMemberModal(true)} style={{ fontSize: 13 }}>
                  + Add Member
                </button>
              )}
              <button className="btn btn-primary" onClick={() => setShowTaskModal(true)}>
                + New Task
              </button>
            </div>
          </div>

          {/* Members */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 16 }}>
            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Team:</span>
            {project?.members?.map((m: any) => (
              <div key={m.id} title={m.user.name} style={{
                width: 28, height: 28, borderRadius: '50%',
                background: 'var(--accent)', color: 'var(--navy)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 700,
              }}>
                {m.user.name.charAt(0).toUpperCase()}
              </div>
            ))}
          </div>
        </div>

        {/* Status filter */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          {['ALL', 'TODO', 'IN_PROGRESS', 'DONE'].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className="btn"
              style={{
                padding: '6px 16px', fontSize: 12,
                background: filter === s ? 'var(--accent)' : 'transparent',
                color: filter === s ? 'var(--navy)' : 'var(--text-secondary)',
                border: `1px solid ${filter === s ? 'var(--accent)' : 'var(--border)'}`,
              }}>
              {s === 'ALL' ? 'All' : s === 'IN_PROGRESS' ? 'In Progress' : s.charAt(0) + s.slice(1).toLowerCase()}
              {' '}
              <span style={{ opacity: 0.7 }}>
                {s === 'ALL' ? project?.tasks?.length : project?.tasks?.filter((t: any) => t.status === s).length}
              </span>
            </button>
          ))}
        </div>

        {/* Tasks */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filteredTasks.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px', border: '2px dashed var(--border)', borderRadius: 12, color: 'var(--text-secondary)', fontSize: 14 }}>
              No tasks here. Create one to get started!
            </div>
          ) : filteredTasks.map((task: any, i: number) => (
            <div key={task.id} className="card fade-up" style={{ padding: '16px 20px', animationDelay: `${i * 40}ms` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                {/* Status toggle */}
                <button
                  onClick={() => updateTaskStatus(task.id, task.status)}
                  title={`Move to: ${statusConfig[statusConfig[task.status]?.next]?.label}`}
                  style={{
                    width: 22, height: 22, borderRadius: 6, border: `2px solid ${statusConfig[task.status]?.color}`,
                    background: task.status === 'DONE' ? statusConfig[task.status]?.color : 'transparent',
                    cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontSize: 11,
                  }}>
                  {task.status === 'DONE' ? '✓' : ''}
                </button>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 14, fontWeight: 500,
                    textDecoration: task.status === 'DONE' ? 'line-through' : 'none',
                    color: task.status === 'DONE' ? 'var(--text-secondary)' : 'var(--text-primary)',
                  }}>{task.title}</div>
                  {task.description && (
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{task.description}</div>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                  {/* Priority */}
                  <span style={{ fontSize: 11, color: priorityConfig[task.priority]?.color, fontWeight: 600 }}>
                    {priorityConfig[task.priority]?.label}
                  </span>

                  {/* Assignee */}
                  {task.assignee && (
                    <div title={task.assignee.name} style={{
                      width: 24, height: 24, borderRadius: '50%',
                      background: '#a855f720', color: '#a855f7',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 10, fontWeight: 700,
                    }}>
                      {task.assignee.name.charAt(0).toUpperCase()}
                    </div>
                  )}

                  {/* Due date */}
                  {task.dueDate && (
                    <span style={{
                      fontSize: 11,
                      color: new Date(task.dueDate) < new Date() && task.status !== 'DONE' ? '#ef4444' : 'var(--text-secondary)',
                    }}>
                      {format(new Date(task.dueDate), 'MMM d')}
                    </span>
                  )}

                  {/* Status badge */}
                  <span className="badge" style={{ background: statusConfig[task.status]?.bg, color: statusConfig[task.status]?.color }}>
                    {statusConfig[task.status]?.label}
                  </span>

                  {/* Delete */}
                  <button onClick={() => deleteTask(task.id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: 14, padding: '2px 4px', opacity: 0.5 }}
                    onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                    onMouseLeave={e => (e.currentTarget.style.opacity = '0.5')}>
                    ✕
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Create Task Modal */}
      {showTaskModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}
          onClick={e => { if (e.target === e.currentTarget) setShowTaskModal(false) }}>
          <div className="card fade-up" style={{ width: 480, padding: 32 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 24px' }}>New Task</h2>
            <form onSubmit={createTask}>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6, color: 'var(--text-secondary)' }}>Title *</label>
                <input value={taskForm.title} onChange={e => setTaskForm(f => ({ ...f, title: e.target.value }))} placeholder="What needs to be done?" required />
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6, color: 'var(--text-secondary)' }}>Description</label>
                <textarea value={taskForm.description} onChange={e => setTaskForm(f => ({ ...f, description: e.target.value }))} placeholder="Details..." rows={2} style={{ resize: 'none' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6, color: 'var(--text-secondary)' }}>Assign to</label>
                  <select value={taskForm.assigneeId} onChange={e => setTaskForm(f => ({ ...f, assigneeId: e.target.value }))}>
                    <option value="">Unassigned</option>
                    {project?.members?.map((m: any) => (
                      <option key={m.user.id} value={m.user.id}>{m.user.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6, color: 'var(--text-secondary)' }}>Priority</label>
                  <select value={taskForm.priority} onChange={e => setTaskForm(f => ({ ...f, priority: e.target.value }))}>
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>
              </div>
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6, color: 'var(--text-secondary)' }}>Due date</label>
                <input type="date" value={taskForm.dueDate} onChange={e => setTaskForm(f => ({ ...f, dueDate: e.target.value }))} />
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowTaskModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Creating...' : 'Create Task'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {showMemberModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}
          onClick={e => { if (e.target === e.currentTarget) setShowMemberModal(false) }}>
          <div className="card fade-up" style={{ width: 400, padding: 32 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 24px' }}>Add Team Member</h2>
            <form onSubmit={addMember}>
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6, color: 'var(--text-secondary)' }}>Member email</label>
                <input type="email" value={memberEmail} onChange={e => setMemberEmail(e.target.value)} placeholder="teammate@company.com" required />
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowMemberModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Adding...' : 'Add Member'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
