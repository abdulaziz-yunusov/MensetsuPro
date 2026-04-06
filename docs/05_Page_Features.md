# MensetsuPro - Page-by-Page Feature List

## 1. Home Page
- **Hero Section**: Strong headline ("Prepare for Japanese Interviews with Confidence"), sub-headline, and CTA buttons ("Start Practice", "Try AI Interview").
- **Platform Features**: 3-4 columns explaining features (AI mock interviews, question banks, coding practice).
- **Featured Question Categories**: Clickable cards mapping to categories like "Self-introduction" or "IT Questions".
- **Featured Materials**: Quick preview of top books or videos.
- **Testimonials/Success Stories**: Carousel or grid of positive user reviews.
- **Footer**: Links to internal pages, social media, Newsletter subscription.

## 2. Profile / User Dashboard
- **User Info Card**: Name, photo, target job role, self-assessed Japanese level.
- **Progress Overview**: Charts/stats on questions saved, mock interviews completed, articles read.
- **Quick Links Tabs**:
  - Saved Questions
  - Completed Mock Interviews (with scores)
  - Bookmarked Materials
  - My Blog Posts

## 3. Interview Questions Page
- **Search & Filter Sidebar**: Filter by category, difficulty, job role (IT, HR, etc.).
- **Question List**: Paginated list of questions with language toggle (JP/EN).
- **Question Detail View (Accordion or Modal/Page)**:
  - Question title (JP/EN)
  - Recommended answer structure
  - Good sample answer
  - Bad sample answer / Common Mistakes
  - What interviewers expect
  - "Save/Bookmark" button.

## 4. AI Interviewer Page
Main page structure:
The page should have 3 main states:
1. Interview setup screen
2. Active interview session screen
3. Feedback / result screen

1. Interview Setup Screen
Create a setup card or section at the top/center of the page where the user can configure the interview.

Fields:
- Category dropdown
  Examples:
  - Self Introduction
  - Motivation / Why this company
  - Strengths and Weaknesses
  - Teamwork / Communication
  - Problem Solving
  - Japanese Business Manners
  - IT / Technical Interview
  - HR / General Questions
- Difficulty dropdown
  - Entry-level
  - Mid-level
  - Advanced
- Job role input
  Examples:
  - Frontend Developer
  - Backend Developer
  - QA Engineer
  - IT Support
  - Data Analyst
- Interview mode selector
  - Text mode
- Language selector
  - Japanese
  - English
  - Mixed
- Number of questions selector
  - 3
  - 5
  - 10
- Optional toggle:
  - “Include follow-up questions”
  - “Show live hints”
  - “Strict interviewer mode”

Buttons:
- Start Interview
- Reset

Validation:
- Prevent starting if category, difficulty, or job role is empty
- Show small inline validation messages

2. Active Interview Session Screen
After clicking “Start Interview”, switch to the live interview interface.

Layout:
- Top header with:
  - Page title: “AI Interview Session”
  - Current category
  - Difficulty badge
  - Role badge
  - Question progress like “Question 2 of 5”
  - Session timer
- Main content area split into sections:
  Left side:
  - AI interviewer card with avatar or assistant illustration
  - AI interviewer name like “AI Interview Coach”
  - Current interview question displayed in a large card
  - Optional small note like “Answer naturally and professionally”
  Right side:
  - Answer input area depending on mode

Text mode:
- Large textarea
- Character counter
- Placeholder like:
  “Type your answer here in Japanese or English...”
- Buttons:
  - Submit Answer
  - Clear
  - Skip Question

Extra controls:
- Repeat Question
- End Session
- Next Question (only enabled after feedback is shown)

Behavior:
- Show realistic sample interview questions based on selected category and difficulty
- Example:
  Self Introduction + Entry-level:
  “Please introduce yourself and tell us why you are interested in this position.”
- Support follow-up questions if the toggle is enabled
- Simulate AI interviewer behavior with natural transitions

3. Feedback Overlay / Result Screen
After the user submits an answer, show a polished feedback panel, modal, or side overlay.

Feedback must include scoring categories:
- Clarity
- Confidence
- Relevance
- Grammar
- Politeness

Scoring style:
- Use score bars, circular progress, or rating cards
- Example score range:
  0–100 or 1–10
- Also show overall score

Feedback content:
- Short AI summary of the answer
- Strengths section
- Weak points section
- Suggestions for improvement
- Better sample answer
- Optional “More natural Japanese version” if answer is in Japanese or mixed mode
- Optional “Business polite version” suggestion

Buttons:
- Next Question
- Retry Answer
- End Session

Final Session Summary:
When the interview ends, show a complete summary page/card with:
- Overall performance score
- Best skill area
- Weakest skill area
- Total answered questions
- Session duration
- Personalized tips
- Recommended next step
  Examples:
  - Practice clearer self-introductions
  - Improve polite Japanese expressions
  - Give more structured answers using STAR method
- Buttons:
  - Start New Session
  - Review Answers
  - Back to Dashboard

Functional requirements:
- Use mock data or local state so the page works without backend first
- Structure the code so later it can connect to OpenAI API or another AI backend
- Create sample question data based on category + difficulty
- Create sample feedback data for demonstration
- Use proper loading states
- Use empty states and error states
- Keep state transitions smooth and realistic
- Save current session data in component state
- Make components modular and reusable

Suggested components:
- InterviewSetupForm
- InterviewHeader
- InterviewQuestionCard
- AIAvatarPanel
- TextAnswerBox
- FeedbackPanel
- ScoreBreakdown
- SessionSummaryModal

UX details:
- Use subtle animations for transitions between setup, question, and feedback
- Use badges, icons, and progress indicators
- Make the page visually attractive but not overly colorful
- Use rounded cards, clean spacing, and readable typography
- Make the page feel like a real interview training product
- Include hover and focus states
- Make it accessible with keyboard navigation and screen reader-friendly labels

Optional advanced features:
- Dark mode support
- Save interview history
- Show previous answers in collapsible sections
- Show “AI thinking” loader before feedback appears
- Add realistic interviewer phrases such as:
  - “Thank you. Let’s move to the next question.”
  - “Could you explain that in more detail?”
  - “Please answer in a more formal interview style.”
- Add Japanese-specific interview tone and polite wording

Important:
- Do not create only a static mockup
- Build it as a working interactive page with state handling, mock questions, mock scoring, and full UI flow from setup to final summary
- Write clean, organized, production-style code

## 5. Learning Materials Page
- **Grid Layout**: Displays books, videos, articles, etiquette guides in a clean card layout.
- **Filtering**: By type (video, reading), category (etiquette, resume writing).
- **Detail View**: Description, external link, or embedded YouTube player.

## 6. Coding Practice Page
- **Task List**: List of algorithm/frontend/backend tasks.
- **Workspace**: 
  - Left Panel: Problem description, requirements.
  - Right Panel: Code editor (Monaco Editor / CodeMirror), language selector, "Run Code" button.
  - Bottom Panel: Console output, Test case results (Pass/Fail).

## 7. Community & Blog Pages
- **Community Forum**: Thread list, category tags, creation modal, reply chains.
- **Blog Feed**: Grid of user/guest blog posts.
- **Rich Text Editor**: For creating new blogs (Title, tags, cover image, markdown content).

## 8. Admin Dashboard
- **Sidebar**: Navigation to Users, Questions, Categories, Materials, Moderation.
- **Data Tables**: Paginated, sortable tables for managing records.
- **Modals**: "Add New Question", "Edit User Role", "Add Material".
- **Analytics Charts**: Simple bar/line charts showing daily active users and most accessed questions.
