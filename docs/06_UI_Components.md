# MensetsuPro - UI Component List

## Generic / Core Components
- **`Button`**: Primary, Secondary, Outline, Ghost, Danger variants.
- **`Input`**: Text, Password, Email fields with validation styling.
- **`Textarea`**: For long-form text (e.g., feedback or blog post content).
- **`Modal / Dialog`**: Reusable popup for confirmations or small forms.
- **`Card`**: Used for questions, courses, and blog posts.
- **`Badge / Tag`**: For categories, difficulty levels, and Japanese levels (N1-N5).
- **`Avatar`**: User profile picture display.
- **`DropdownMenu`**: For user settings, profile navigation in the header.
- **`Tabs`**: For switching between different views (e.g., "Saved Questions" vs "Completed Interviews").
- **`Accordion`**: For FAQ and hiding/showing sample answers to avoid spoilers.
- **`Skeleton`**: Loading states for cards and text blocks.

## Feature-Specific Components
- **`QuestionCard`**: Displays question title, tags, and a "Save" icon.
- **`MaterialCard`**: Displays image/thumbnail, title, type (Video/Book), and difficulty link.
- **`AIInterviewerScreen`**: 
  - Chat interface wrapper.
  - Simulated "avatar" giving the interviewer persona.
  - Recording indicator & timer.
- **`ScoreRadarChart`**: (Using Recharts or Chart.js) Visual representation of the user's mock interview feedback (Clarity, Grammar, Confidence, etc.).
- **`MarkdownRenderer`**: Safely renders Markdown content for blog posts and question answers.
- **`CodeEditor`**: Monaco editor integrated for the coding practice page.

## Layout Components
- **`Navbar`**: Logo, Main Links, User Dropdown / Login Button, Dark Mode Toggle.
- **`Footer`**: Links, Socials, Copyright, Newsletter signup.
- **`Sidebar`**: Used primarily in the Admin Dashboard and User profile.
- **`HeroSection`**: Large impactful area on the homepage.
- **`SectionHeading`**: Consistent styling for page and section titles.
