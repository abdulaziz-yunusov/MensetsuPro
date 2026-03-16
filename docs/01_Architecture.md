# MensetsuPro - Project Architecture

## Tech Stack Overview
- **Frontend Framework**: Next.js 14 (App Router)
- **UI Library**: React 18, Tailwind CSS, shadcn/ui (for accessible, customizable components)
- **Backend Framework**: Next.js API Routes (Serverless) / Node.js
- **Database**: PostgreSQL (hosted on Supabase or AWS RDS)
- **ORM**: Prisma
- **Authentication**: NextAuth.js (Session-based auth with OAuth support)
- **State Management**: Zustand (for global state), React Query / SWR (for data fetching and caching)
- **AI Integration**: OpenAI API (GPT-4 / Whisper API for voice processing)
- **Storage**: AWS S3 or Supabase Storage (for user avatars, interview recordings, or blog images)
- **Hosting**: Vercel (Frontend & API)

## System Architecture

### 1. Client Layer (Frontend)
- Represents the user interface built with Next.js and Tailwind CSS.
- Handles routing, client-side validation, and UI states.
- Connects to the server layer via RESTful API calls and React Server Components.

### 2. Application Layer (Backend / API)
- Next.js API Routes serve as the backend.
- Controllers to handle authentication, user profile management, fetching/submitting questions, saving progress, and blog publishing.
- Integration services to communicate with the OpenAI API for the AI Interviewer feature.

### 3. Data Layer
- **PostgreSQL**: Stores relational data such as Users, Questions, Categories, Mock Interviews, Discuss Threads, and Blog Posts.
- **Prisma**: Handles schema migrations and database interactions.
- **Cloud Storage**: Handles media uploads (images, avatars, PDF materials, audio/video).

### 4. AI Processing Layer
- Submits text or transcribed audio (from Whisper) to OpenAI.
- Uses strict prompt engineering to evaluate the user's interview answer.
- Returns structured JSON data for feedback (clarity, relevance, grammar, politeness, scores).

## Folders Structure (Next.js App Router)
```text
/
├── app/
│   ├── (auth)/         # Login, Register, Forgot Password
│   ├── (dashboard)/    # User profile, progress, saved items
│   ├── (interview)/    # AI interviewer, question bank, categories
│   ├── (learning)/     # Materials, coding practice, blog
│   ├── (admin)/        # Admin dashboard
│   ├── api/            # Backend API routes
│   └── page.tsx        # Home Page
├── components/
│   ├── ui/             # Reusable UI components (buttons, inputs)
│   ├── layout/         # Header, Footer, Sidebar
│   └── features/       # Feature-specific components (e.g., AI chat box)
├── lib/
│   ├── prisma.ts       # Database client
│   ├── openai.ts       # OpenAI client wrapper
│   └── utils.ts        # Helper functions
├── prisma/
│   └── schema.prisma   # Database schema
└── public/             # Static assets (images, icons)
```
