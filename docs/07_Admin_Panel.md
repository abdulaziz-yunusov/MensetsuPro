# MensetsuPro - Admin Panel Structure

## Overview
The Admin dashboard is built for platform managers to manage content, users, and moderate the community. It uses a sidebar navigation layout with a top-bar for quick actions.

## 1. Dashboard (Overview)
- **Top KPIs**: 
  - Total Active Users
  - Total Mock Interviews Completed
  - New Questions Added this week
  - Outstanding Reports / Moderation queue
- **Charts**:
  - User growth over the last 30 days (Line Chart).
  - Most active categories (Pie Chart).

## 2. User Management (`/admin/users`)
- **List View**: Table showing Name, Email, Role, Joined Date.
- **Filters**: Search by email, filter by Role.
- **Actions**:
  - Edit Role (promote to Admin, demote to User).
  - Ban / Suspend account.
  - View user's detailed activity logs.

## 3. Question Bank Management (`/admin/questions`)
- **List View**: Table of all questions.
- **Filters**: By Category, missing translations, highly saved questions.
- **Actions**:
  - **Add New Question Modal/Page**: Form with title, Japanese translation, rich-text recommended answer, common mistakes, and hints.
  - **Edit/Delete**: Quickly modify existing questions.

## 4. Categories Management (`/admin/categories`)
- **List View**: Categories and number of associated questions/materials.
- **Actions**: Add new Category, Edit Category Name/Description, Delete Category (if empty).

## 5. Learning Materials Management (`/admin/materials`)
- **List View**: Books, videos, and articles.
- **Actions**: Add a new link (with thumbnail, title, URL, type), edit existing, or remove.

## 6. Moderation Queue (`/admin/moderation`)
- **Flagged Content View**: List of community threads, blog posts, or comments reported by users.
- **Actions**:
  - View content in context.
  - Delete content.
  - Issue warning to Author.
  - Dismiss report.
