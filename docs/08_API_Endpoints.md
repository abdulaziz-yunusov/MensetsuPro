# MensetsuPro - API Endpoints (Next.js App Router)

All endpoints reside under `/api/`. They are protected by NextAuth session checks where applicable.

## Authentication (Handled mostly by NextAuth)
- `POST /api/auth/register` - Create a new user account (credentials).
- `POST /api/auth/[...nextauth]` - Handles login, logout, OAuth (Google/GitHub).

## Users
- `GET /api/users/me` - Get current authenticated user details.
- `PUT /api/users/me` - Update profile (name, target job, Japanese level).
- `GET /api/users/:id/progress` - Get stats and progress for dashboard.

## Questions & Categories
- `GET /api/categories` - Fetch all categories.
- `GET /api/questions` - Fetch questions (with pagination and filters like `?categoryId=123`).
- `GET /api/questions/:id` - Fetch single question with full details.
- `POST /api/questions` - (Admin only) Create a new question.
- `PUT /api/questions/:id` - (Admin only) Update a question.
- `DELETE /api/questions/:id` - (Admin only) Delete a question.

## User Actions (Saves & Bookmarks)
- `POST /api/user/saved-questions` - Save/bookmark a question.
- `DELETE /api/user/saved-questions/:id` - Remove from saved list.
- `GET /api/user/saved-questions` - List user's saved questions.

## Mock AI Interview
- `POST /api/interview/start` - Initialize a new mock interview session and get the first question based on criteria.
- `POST /api/interview/evaluate` - Appends user's answer (text or Whisper transcription), queries OpenAI for evaluation, and returns feedback + Next Question.
- `GET /api/interview/history` - Get user's past mock interviews.

## Community & Blogs
- `GET /api/threads` - Fetch discussion threads.
- `POST /api/threads` - Create a new thread.
- `POST /api/threads/:id/reply` - Add a comment to a thread.
- `GET /api/blogs` - Fetch published blog posts.
- `POST /api/blogs` - Create a new blog post.

## Materials
- `GET /api/materials` - Fetch learning materials.
- `POST /api/materials` - (Admin only) Add a new material.
