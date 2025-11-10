# Cube Agent

Next.js 16 (App Router) implementation of the Cube Agent ATS workspace described in `development_requirements.md`. The product name is configurable so it can be rebranded later without touching each component.

## ✨ What's included
- **Auth**: NextAuth v5 credentials provider with mock agent accounts (`akira@circus.agency`, `yuna@circus.agency`, password `password123`).
- **Dashboard**: KPI cards, funnel insights, curated categories, announcements, saved projects, and new job highlights.
- **Talent CRM**: Candidate list with Zustand-powered filters, React Hook Form UI, and detail page with notes.
- **Job Search**: Keyword + remote filters backed by API routes and TanStack Query.
- **Pipeline Board**: Columnar selection tracker aligned with the Phase 1 Kanban requirement.
- **Data layer**: Prisma schema for PostgreSQL + mock repositories that emulate the eventual DB layer.

## 🧱 Tech stack
| Layer | Tech |
| --- | --- |
| Framework | Next.js 16 (App Router, React 19) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 |
| State | Zustand (global filters), TanStack Query (server comms), React Hook Form + Zod |
| Auth | NextAuth.js v5 (credentials) |
| ORM | Prisma w/ PostgreSQL target |

## 🚀 Getting started
```bash
cp .env.example .env        # adjust secrets + DATABASE_URL
npm install                 # already ran once, but keep for completeness
npm run prisma:generate     # prepares the Prisma client
npm run dev                 # http://localhost:3000
```

Sign in with the demo credentials above. Once a real identity provider is ready, replace the `Credentials` provider in `src/auth.ts`.

### Product name placeholder
Update `NEXT_PUBLIC_PRODUCT_NAME` in `.env` or edit `src/config/product.ts` to propagate a new brand across navigation, metadata, and content blocks.

## 📁 Key directories
```
src/
 ├─ app/
 │   ├─ (auth)          # /signin layout & page
 │   ├─ (app)           # protected shell (dashboard, candidates, jobs, pipelines)
 │   └─ api/            # REST endpoints backed by repositories
 ├─ components/         # UI building blocks (AppShell, dashboard widgets, etc.)
 ├─ config/             # Product identity + shared metadata
 ├─ lib/
 │   ├─ domain          # Type definitions & enums
 │   ├─ repositories    # Mock data access (drop-in replacement for Prisma)
 │   └─ utils           # helpers such as `cn`
 ├─ mocks/              # Static seed data
 └─ stores/             # Zustand stores
prisma/
 └─ schema.prisma       # Source of truth for the PostgreSQL schema
```

## 🔌 API surface
| Route | Description |
| --- | --- |
| `GET /api/dashboard` | Aggregated snapshot for the home dashboard |
| `GET /api/candidates[?q=&status=]` | Candidate search with keyword + status filters |
| `GET /api/candidates/:id` | Candidate profile + comms log |
| `GET /api/jobs` | Job search (keyword + remote toggle) |
| `GET /api/pipelines` | Selection board columns with candidate/job context |

The API routes currently wrap the mock repositories; wiring Prisma later only requires swapping repository implementations.

## 🗺️ Roadmap pointers
1. **Connect PostgreSQL**: Update `DATABASE_URL`, run `prisma migrate dev`, and replace the mock repositories with Prisma queries.
2. **NextAuth provider**: Connect to the real identity source (Auth.js, SSO, etc.) and add role-based route protection via middleware.
3. **Phase 2 features**: Charting (Recharts already installed), Kanban drag & drop, calendar integrations, Redis cache.
4. **Testing**: Add Vitest/unit coverage for repositories and Playwright for E2E flows.

## 🧪 Commands
| Command | Description |
| --- | --- |
| `npm run dev` | Start Next.js dev server |
| `npm run build && npm start` | Production build + serve |
| `npm run lint` | ESLint (Core Web Vitals rules) |
| `npm run prisma:generate` | Regenerate Prisma client |

---
For a deeper look at the functional scope, read `development_requirements.md` and `memo.md` in the repository root. Those documents map directly to the routes/pages implemented here.
