# MensetsuPro - Database Schema (PostgreSQL & Prisma)

```prisma
// This is your Prisma schema file

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Role {
  USER
  ADMIN
}

enum JapaneseLevel {
  N5
  N4
  N3
  N2
  N1
  NATIVE
}

model User {
  id            String    @id @default(uuid())
  name          String
  email         String    @unique
  passwordHash  String
  image         String?
  role          Role      @default(USER)
  targetRole    String?   // e.g., "Frontend Engineer"
  japaneseLevel JapaneseLevel?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // Relations
  savedQuestions   SavedQuestion[]
  mockInterviews   MockInterview[]
  blogPosts        BlogPost[]
  discussions      Discussion[]
  comments         Comment[]
  progress         ProgressTracker?
}

model Category {
  id          String     @id @default(uuid())
  name        String     @unique // e.g., "Self-introduction", "IT / software engineering"
  description String?
  
  // Relations
  questions   Question[]
  materials   Material[]
  threads     Discussion[]
}

model Question {
  id                 String   @id @default(uuid())
  title              String   // e.g., "Tell me about yourself"
  titleEn            String?  // English translation
  recommendedAnswer  String?  @db.Text
  sampleAnswer       String?  @db.Text
  tips               String?  @db.Text
  commonMistakes     String?  @db.Text
  categoryId         String
  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt

  // Relations
  category           Category @relation(fields: [categoryId], references: [id])
  savedBy            SavedQuestion[]
}

model SavedQuestion {
  id         String   @id @default(uuid())
  userId     String
  questionId String
  createdAt  DateTime @default(now())

  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  question   Question @relation(fields: [questionId], references: [id], onDelete: Cascade)

  @@unique([userId, questionId])
}

model MockInterview {
  id             String   @id @default(uuid())
  userId         String
  jobRole        String
  difficulty     String
  score          Int?
  feedbackJson   Json?    // AI feedback (clarity, grammar, etc.)
  completedAt    DateTime @default(now())

  user           User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  logs           InterviewLog[]
}

model InterviewLog {
  id               String   @id @default(uuid())
  mockInterviewId  String
  questionText     String   @db.Text
  userAudioUrl     String?
  userAnswerText   String   @db.Text
  aiFeedback       String   @db.Text
  createdAt        DateTime @default(now())

  mockInterview    MockInterview @relation(fields: [mockInterviewId], references: [id], onDelete: Cascade)
}

model Material {
  id          String   @id @default(uuid())
  title       String
  description String?  @db.Text
  type        String   // e.g., "video", "book", "article"
  url         String
  difficulty  String?
  categoryId  String
  createdAt   DateTime @default(now())

  category    Category @relation(fields: [categoryId], references: [id])
}

model BlogPost {
  id          String   @id @default(uuid())
  title       String
  slug        String   @unique
  content     String   @db.Text // HTML or Markdown
  published   Boolean  @default(false)
  authorId    String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  author      User     @relation(fields: [authorId], references: [id])
}

model Discussion {
  id          String   @id @default(uuid())
  title       String
  content     String   @db.Text
  authorId    String
  categoryId  String
  createdAt   DateTime @default(now())

  author      User     @relation(fields: [authorId], references: [id])
  category    Category @relation(fields: [categoryId], references: [id])
  comments    Comment[]
}

model Comment {
  id           String   @id @default(uuid())
  content      String   @db.Text
  authorId     String
  discussionId String
  createdAt    DateTime @default(now())

  author       User       @relation(fields: [authorId], references: [id])
  discussion   Discussion @relation(fields: [discussionId], references: [id], onDelete: Cascade)
}

model ProgressTracker {
  id                String   @id @default(uuid())
  userId            String   @unique
  questionsPracticed Int     @default(0)
  interviewsDone     Int     @default(0)
  codingTasksDone    Int     @default(0)
  
  user              User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```
