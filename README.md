# JobHuntHQ

JobHuntHQ is a job search tracker built with **Next.js**, **Prisma**, and **PostgreSQL**. It helps you organize applications, review job emails from Gmail, track companies, and manage resume versions in one place.

## Features

- **Dashboard** for quick job-search visibility
- **Applications board** with Kanban-style status management
- **Review queue** for Gmail-based job email approvals
- **Companies page** for company-level history
- **Resumes page** with per-resume linked application counts
- **Light and dark mode** support

## Tech stack

- Next.js 16 App Router
- React 19
- Prisma 7
- PostgreSQL
- NextAuth with Google sign-in
- Tailwind CSS 4

## Environment setup

Copy the example environment file and fill in your values:

```bash
cp .env.example .env
```

Required variables:

- `DATABASE_URL`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`

## Install and run

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Useful scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run prisma:generate
npm run db:seed
```

## Production readiness notes

Before deployment, make sure:

- database credentials are set correctly
- Google OAuth redirect URLs match your deployment URL
- `NEXTAUTH_SECRET` is set to a long random value
- `npm run build` passes cleanly

## App routes

- `/` — dashboard
- `/applications` — application tracker
- `/review` — review Gmail job emails
- `/companies` — company activity
- `/resumes` — resume library

