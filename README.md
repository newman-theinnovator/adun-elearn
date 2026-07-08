# ADUN E-Learn 🎓

**Software Engineering Department E-Learning System & Performance Analytics**

Final year project — Admiralty University of Nigeria, Department of Software Engineering. A role-aware e-learning portal covering course delivery, assessments and grading, discussion forums, and AI-powered performance analytics, seeded with a full academic session (First Semester graded, Second Semester ongoing) of realistic department data.

---

## 🎯 Features

**Public landing page** at `/` — university branding, feature overview, links to sign-in.

**Student Dashboard**

- Real-time CGPA and GPA trend across semesters
- AI-generated performance insights (Claude) — personalized narrative feedback and a predicted final grade, with a rule-based fallback when no API key is configured
- Course enrollment, content delivery (video/document modules), and content-completion tracking
- Assessment submission (quizzes and assignments) and gradebook
- Discussion forum — post, reply, like, browse by course

**Lecturer Dashboard**

- Class pass rate, pending-grading queue, and per-course average scores
- Grade entry (CA1/CA2/Exam → auto-computed total, letter grade, grade point)
- Pin/unpin important forum threads in courses they teach

**Admin Dashboard**

- Department-wide overview: students, lecturers, courses, enrollments, average GPA
- Performance breakdown by academic level, most popular courses
- **User management**: create accounts (temporary password generated + emailed), reset passwords, activate/deactivate, change roles
- 1-click PDF/CSV export of department reports

---

## 🔐 Authentication & Accounts

Accounts are **admin-provisioned only** — there is no public self-registration. An admin creates an account from the Users page, which generates a temporary password and emails it (or logs it to the console in local dev, if `RESEND_API_KEY` isn't configured). Any logged-in user can change their own password from Settings; admins can reset any account's password at any time.

**Demo credentials** (after seeding — see below), all using password `password123`:

| Role     | Email                                                                                                                                                                                         |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Admin    | `admin@adun.edu.ng`                                                                                                                                                                           |
| Lecturer | `n.eze@adun.edu.ng`, `c.okoro@adun.edu.ng`, `a.bello@adun.edu.ng`, `m.suleiman@adun.edu.ng`, `f.okonkwo@adun.edu.ng`, `e.igwe@adun.edu.ng`, `h.abubakar@adun.edu.ng`, `t.adewale@adun.edu.ng` |
| Student  | `stu0@adun.edu.ng` through `stu99@adun.edu.ng` (25 each at 100L/200L/300L/400L)                                                                                                               |

---

## 🛠 Tech Stack

- **Framework:** Next.js 16 (App Router, React 19, React Compiler)
- **Auth:** NextAuth.js v5 (credentials provider, JWT sessions) + Prisma
- **Database:** PostgreSQL via Supabase, accessed through Prisma ORM
- **Storage:** Supabase Storage (file uploads only — not used for auth)
- **AI:** Anthropic Claude (student insight generation), optional — falls back gracefully without a key
- **Email:** Resend, optional — falls back to console logging in dev
- **Validation:** Zod
- **Data fetching:** TanStack Query
- **UI:** Tailwind CSS 4, shadcn/ui-style components, Recharts, lucide-react
- **Testing:** Vitest (unit) + Playwright (e2e)
- **CI:** GitHub Actions (lint, typecheck, format check, unit tests, build, e2e)

---

## 🚀 Running Locally

1. **Clone and install:**

    ```bash
    git clone https://github.com/newman-theinnovator/adun-elearn.git
    cd adun-elearn
    npm install
    ```

2. **Configure environment variables:** copy `env.example` to `.env` and fill in your Supabase/Postgres connection strings and a `NEXTAUTH_SECRET` (generate one with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`). `RESEND_API_KEY` and `ANTHROPIC_API_KEY` are both optional — the app degrades gracefully without them (see comments in `env.example`).

3. **Seed the database** (wipes and regenerates everything — see below):

    ```bash
    npx prisma db seed
    ```

4. **Start the dev server:**

    ```bash
    npm run dev
    ```

    Open `http://localhost:3000`.

---

## 💾 Seeding Data (Defense Setup)

```bash
npx prisma db seed
```

`prisma/seed.ts` **deletes all existing data and regenerates it from scratch** — 1 admin, 8 lecturers, 16 courses across 100/200/300/400 level, 100 students, and three academic sessions (`2023/2024`, `2024/2025`, `2025/2026`). Each student's grade history matches how long they've been enrolled — a 400L student has records from 200L and 300L, a 300L student from 100L and 200L, a 200L student from 100L, and a 100L student only has the current session. The current session (`2025/2026`) has First Semester fully graded and Second Semester ongoing (a realistic mix of graded/pending/not-yet-submitted work). Grades follow a bell-shaped distribution — each student has a consistent underlying "ability" so most land in the average B/C range with only a few consistent high performers, rather than uniformly random scores. Also seeds quiz questions and answers, content-progress and login-activity history, and forum discussions per course. Re-run it any time you want a fresh, consistent dataset for a demo.

---

## 🧪 Quality Checks

```bash
npm run lint        # ESLint
npm run typecheck    # tsc --noEmit
npm run format:check # Prettier
npm run test          # Vitest unit tests
npm run test:e2e      # Playwright e2e tests
npm run build          # production build
```

All of the above run automatically on every push/PR via GitHub Actions (`.github/workflows/ci.yml`).

---

> _Final Year Project — Department of Software Engineering, Admiralty University of Nigeria._
