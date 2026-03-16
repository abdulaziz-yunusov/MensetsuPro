# MensetsuPro - Responsive UI Design Suggestions

## Inspiration & Theme (JDU Style)
JDU (Japan Digital University) utilizes a clean, corporate yet educational academic aesthetic.
- **Colors**: Trustworthy Navy Blue / Academic Indigo as primary, paired with clean White, subtle Light Grays for backgrounds, and a complementary accent color (like a vibrant Orange or subtle Gold) for Call-to-Action buttons. Note: the color scheme needs to look modern and premium.
- **Typography**: `Inter`, `Roboto`, or `Noto Sans JP` (essential for Japanese characters). Clean, highly legible sans-serif fonts.
- **Layout Approach**: Structured card-based layouts. Well-defined sections separated by whitespace rather than harsh borders.

## Breakpoints & Responsiveness

### 1. Mobile (xs/sm: < 768px)
- **Navigation**: Hamburger menu opens a full-screen or slide-out drawer containing links.
- **Hero Section**: Text is center-aligned. The hero graphic/image moves below the text.
- **Grid Layouts**: 1 column for everything (Cards, questions, materials).
- **AI Interviewer**: Chat UI takes up the full screen height (like a messaging app).
- **Coding Practice**: Tabs to switch between the "Problem Description", "Code Editor", and "Console" (since side-by-side isn't possible on mobile).

### 2. Tablet (md: 768px - 1024px)
- **Grid Layouts**: 2 columns for course materials and question lists.
- **Navigation**: Links might still be in a hamburger menu, or simplified on the top bar.
- **Question Search**: Sidebar filters collapse into a filter button that opens a drawer.

### 3. Desktop (lg/xl: > 1024px)
- **Navigation**: Full top-bar with all links visible.
- **Grid Layouts**: 3-4 columns for featured items.
- **Question Page**: Left sidebar for filters/categories, main wide column for questions.
- **Coding Practice**: Split pane layout. Left side for problem description, right side splits vertically into Code Editor (top) and Console (bottom).

## Dark Mode Implementation
- Optional but highly recommended for the Coding Practice and AI Interviewer pages to reduce eye strain.
- **Colors**: Deep slate gray backgrounds (`#0f172a`), lighter gray surfaces (`#1e293b`), and glowing accent colors for buttons.

## Important Micro-interactions
- **Hover Effects**: Slight upward translation (`transform: translateY(-2px)`) and increased shadow on clickable cards.
- **Transitions**: Smooth fading (e.g., 200ms ease-in-out) when switching tabs or submitting answers.
- **Feedback States**: Clear visual cues (green checkmarks, red error texts, loading spinners) on all forms and AI processing steps.
