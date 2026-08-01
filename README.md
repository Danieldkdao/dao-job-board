# [Dao Jobs](https://jobs.danieldkdao.com)

## Overview

Dao Jobs is a full-stack, AI-powered job board built for both job seekers and employers.

Job seekers can browse listings, filter opportunities, upload a resume, submit applications, and use natural-language AI search to find relevant positions. Employers can create organizations, publish listings, manage applicants, and use AI-generated ratings to identify strong candidates.

## Features

### For Job Seekers

- Browse published job listings
- Filter by title, location, job type, experience level, and work arrangement
- Search for jobs using a natural-language AI prompt
- View detailed job descriptions with Markdown support
- Upload a resume as a PDF
- Generate an AI summary of an uploaded resume
- Apply with a resume and optional cover letter
- Receive daily job-listing emails
- Customize job notifications with an AI matching prompt

### For Employers

- Create and manage employer organizations
- Create, edit, publish, delist, and delete job listings
- Feature selected listings
- Manage organization roles and permissions
- Review applicant resumes and cover letters
- Automatically rate applicants using AI
- Sort and filter applicants by rating and hiring stage
- Move applicants through applied, interested, interviewed, hired, or denied stages
- Receive daily application-summary emails
- Configure minimum applicant ratings for notifications
- Choose employer plans with different listing limits

## Why I Built It

I built this project by following a YouTube video I found online. The project looked really cool and I also wanted to learn about Next.js caching, permissions systems, and payment models. This project turned out to be a really great way to do so.

## Tech Stack

- Next.js 16, React 19, and TypeScript
- Tailwind CSS and shadcn/ui
- Neon Serverless Postgres
- Drizzle ORM
- Clerk authentication, organizations, permissions, and billing
- Inngest for background jobs and scheduled workflows
- Inngest Agent Kit and Google Gemini for AI workflows
- UploadThing for resume uploads
- Resend and React Email for notifications
- React Hook Form and Zod
- MDX Editor and Markdown rendering
- NPM

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/Danieldkdao/dao-job-board.git
cd dao-job-board
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the project root:

```text
# Neon Postgres
DATABASE_URL=

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
CLERK_WEBHOOK_SECRET=

NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/

# Inngest local development
INNGEST_DEV=1

# UploadThing
UPLOADTHING_TOKEN=

# Google Gemini
GEMINI_API_KEY=

# Resend
RESEND_API_KEY=

# Application
SERVER_URL=http://localhost:3000
```

For a production Inngest deployment, also configure the credentials supplied by Inngest Cloud:

```text
INNGEST_EVENT_KEY=
INNGEST_SIGNING_KEY=
```

### 3. Configure Clerk

Create a Clerk application and enable organizations.

The employer experience uses Clerk organization permissions and plan features. Configure the following features in the Clerk dashboard to match the application’s employer plans:

```text
post_1_job_listing
post_3_job_listings
post_15_job_listings
1_featured_job_listing
unlimited_featured_job_listings
```

The application also expects organization permissions for creating, updating, deleting, and publishing listings, as well as managing applicant ratings and stages.

Configure Clerk webhooks so user, organization, and membership events are sent to the application’s Inngest workflow.

### 4. Set Up the Database

Push the Drizzle schema to your database:

```bash
npm run db:push
```

Other available database commands include:

```bash
npm run db:generate
npm run db:migrate
npm run db:studio
```

## Running the Project

Start the Next.js development server:

```bash
npm run dev
```

In a second terminal, start the local Inngest server:

```bash
npm run inngest
```

Visit:

[http://localhost:3000](http://localhost:3000)

The local Inngest dashboard is normally available at:

[http://localhost:8288](http://localhost:8288)

Both processes should be running for resume summaries, applicant ratings, Clerk synchronization, and scheduled emails to work locally.

## Available Scripts

```bash
npm run dev
```

Starts the Next.js development server.

```bash
npm run inngest
```

Starts the local Inngest server and connects it to `/api/inngest`.

```bash
npm run email
```

Opens the React Email preview server on port `3001`.

```bash
npm run build
```

Creates a production build.

```bash
npm run start
```

Runs the production build.

```bash
npm run lint
```

Runs ESLint.

```bash
npm run db:studio
```

Opens Drizzle Studio.

## How the AI Workflows Work

When a job seeker uploads a resume, Inngest starts a background workflow that sends the PDF to Gemini and stores a Markdown summary of the candidate’s experience and qualifications.

When the user applies to a job, another workflow compares the resume summary and cover letter against the listing. An AI agent assigns the applicant a rating from one to five for the employer to review.

AI search uses a job seeker’s natural-language description of their skills and preferences to rank the most relevant published listings.

## License

This project is licensed under the MIT License.
