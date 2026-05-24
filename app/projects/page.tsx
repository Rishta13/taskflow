'use client'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import Link from 'next/link'
import { format } from 'date-fns'

export default function ProjectsPage() {
  const { status } = useSession()
  const router = useRouter()
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ name: '', description: '' })
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
  }, [status, router])

  const loadProjects = () => {
    fetch('/api/projects').then(r => r.json()).then(d => { setProjects(d); setLoading(false) })
  }

  useEffect(() => { loadProjects() }, [])

  async function createProject(e: React.FormEvent) {
    e.preventDefault()
    setCreating(true)
    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      setShowModal(false)
      setForm({ name: '', description: '' })
      loadProjects()
    }
    setCreating(false)
  }

  const colors = ['#3b82f6', '#a855f7', '#10b981', '#f59e0b', '#ef4444', '#06b6d4']

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ marginLeft: 220, flex: 1, padding: '36px 40px' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 36 }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.5px', margin: '0 0 4px' }}>Projects</h1>
            <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: 14 }}>
              {projects.length} workspace{projects.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            + New Project
          </button>
        </div>

        {loading ? (
          <div style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Loading projects...</div>
        ) : projects.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '80px 40px',
            border: '2px dashed var(--border)', borderRadius: 16,
          }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>◉</div>
            <h3 style={{ fontWeight: 600, marginBottom: 8 }}>No projects yet</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24 }}>
              Create your first project and start organizing your team's work.
            </p>
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
              Create your first project
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
            {projects.map((p, i) => (
              <Link key={p.id} href={`/projects/${p.id}`} style={{ textDecoration: 'none' }}>
                <div className="card fade-up" style={{
                  padding: 24, cursor: 'pointer',
                  animationDelay: `${i * 50}ms`,
                }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 10,
                    background: colors[i % colors.length] + '20',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 18, color: colors[i % colors.length],
                    marginBottom: 16,
                  }}>◉</div>
                  <h3 style={{ fontSize: 16, fontWeight: 600, margin: '0 0 6px', letterSpacing: '-0.3px' }}>{p.name}</h3>
                  {p.description && (
                    <p style={{
                      fontSize: 13, color: 'var(--text-secondary)', margin: '0 0 16px',
                      overflow: 'hidden', display: '-webkit-box',
                      WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                    }}>{p.description}</p>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                      {p._count?.tasks ?? 0} tasks
                    </span>
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                      {p.members?.length} member{p.members?.length !== 1 ? 's' : ''}
                    </span>
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                      {format(new Date(p.createdAt), 'MMM d')}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      {/* Create project modal */}
      {showModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
          backdropFilter: 'blur(4px)',
        }} onClick={e => { if (e.target === e.currentTarget) setShowModal(false) }}>
          <div className="card fade-up" style={{ width: 440, padding: 32 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 24px' }}>New Project</h2>
            <form onSubmit={createProject}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6, color: 'var(--text-secondary)' }}>Project name *</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Website Redesign" required />
              </div>
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6, color: 'var(--text-secondary)' }}>Description</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="What's this project about?" rows={3} style={{ resize: 'none' }} />
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={creating}>
                  {creating ? 'Creating...' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
