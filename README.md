# ⚡ TaskFlow — Team Task Manager

A full-stack team task management web app built with **Next.js**, **PostgreSQL**, and **Prisma**. Supports role-based access, project management, task assignment, and real-time progress tracking.

## 🚀 Features

- **Authentication** — Signup/Login with JWT-based sessions (NextAuth)
- **Projects** — Create projects, invite team members by email
- **Tasks** — Create tasks, assign to members, set priority & due dates
- **Status Tracking** — TODO → In Progress → Done (click to advance)
- **Dashboard** — Overview of all tasks, overdue count, recent activity
- **Role-based Access** — Admin (owner) vs Member permissions per project

## 🛠 Tech Stack

- **Frontend**: Next.js 14 (App Router), React, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: NextAuth.js (JWT strategy)
- **Deployment**: Railway

## 📦 Local Development

1. **Clone the repo**
   ```bash
   git clone <your-repo-url>
   cd taskflow
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables** — copy `.env.example` to `.env` and fill in:
   ```
   DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
   NEXTAUTH_SECRET="run: openssl rand -base64 32"
   NEXTAUTH_URL="http://localhost:3000"
   ```

4. **Run database migrations**
   ```bash
   npx prisma migrate dev --name init
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

## 🌐 Deployment on Railway

1. Push your code to GitHub
2. Create a new project on [Railway](https://railway.app)
3. Add a **PostgreSQL** service to your project
4. Deploy from your GitHub repo
5. Set environment variables in Railway dashboard:
   - `DATABASE_URL` — copy from Railway PostgreSQL service
   - `NEXTAUTH_SECRET` — generate with `openssl rand -base64 32`
   - `NEXTAUTH_URL` — your Railway app URL (e.g. `https://taskflow-production.up.railway.app`)
6. Railway auto-runs migrations and starts the app via `railway.json`

## 📁 Project Structure

```
app/
  api/           — REST API routes
  dashboard/     — Dashboard page
  projects/      — Project list + detail pages
  tasks/         — My tasks page
  login/         — Auth pages
  register/
components/
  Sidebar.tsx    — Navigation sidebar
lib/
  prisma.ts      — Prisma client
  auth.ts        — NextAuth config
prisma/
  schema.prisma  — Database schema
```

## 🔐 Default Roles

- **Admin** (project owner) — can add members, delete project
- **Member** — can create/update/delete tasks within projects they belong to

## 📋 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/signin` | Login |
| GET | `/api/projects` | List user's projects |
| POST | `/api/projects` | Create project |
| GET | `/api/projects/:id` | Project detail + tasks |
| DELETE | `/api/projects/:id` | Delete project (owner only) |
| POST | `/api/projects/:id/members` | Add member by email |
| POST | `/api/tasks` | Create task |
| PATCH | `/api/tasks/:id` | Update task (status, assignee, etc.) |
| DELETE | `/api/tasks/:id` | Delete task |
| GET | `/api/dashboard` | Dashboard stats |
