# Questly — User Stories

> **Completed**: 2026-05-22
> **Author**: Manju (Solo Developer)
> **Format**: As a student, I want to [action] so that [benefit].
> Each story includes acceptance criteria.

---

### 1. Document Upload & RAG Knowledge Base

**Story:**
As a student, I want to upload my study documents and ask questions from them so that I get accurate answers based only on my own material.

**Acceptance Criteria:**
- Student can upload PDF, Markdown, .txt files
- Student can link Google Docs / Google Slides via URL
- Upload limit enforced: max 50 sources per notebook, 500,000 words per source
- After upload, document is parsed and embedded automatically
- RAG query returns answer with source reference
- Answer is grounded strictly in uploaded content — no open internet

---

### 2. AI Flashcard Generation

**Story:**
As a student, I want flashcards automatically generated from my uploaded documents so that I can review key concepts without manually creating them.

**Acceptance Criteria:**
- Flashcards generated from selected notebook
- Each card has a clear question and answer
- Cards scheduled using SM-2 spaced repetition
- Student can rate card difficulty (1–5) after review
- Next review date updates based on rating
- Student can see cards due today

---

### 3. Quiz Me Mode

**Story:**
As a student, I want AI-generated quizzes from my documents so that I can test my understanding before an exam.

**Acceptance Criteria:**
- Student selects a notebook to generate quiz from
- Quiz contains MCQ, fill-in-the-blank, and short answer questions
- Student completes quiz and submits
- Score displayed immediately after submission
- Wrong answers recorded per topic

---

### 4. Weak Spot Detection

**Story:**
As a student, I want the system to track topics I keep getting wrong so that I can focus my revision where it matters most.

**Acceptance Criteria:**
- Topics with 2+ consecutive wrong answers flagged as weak spots
- Weak spots resurfaced automatically in next quiz session
- Student can view their weak spot list on dashboard
- Weak spots clear automatically after 2 consecutive correct answers

---

### 5. Summarize & Simplify

**Story:**
As a student, I want long documents condensed into short summaries so that I can quickly grasp the key points.

**Acceptance Criteria:**
- Student selects a document or notebook
- AI returns a concise summary (max 500 words)
- Summary uses simpler language than the original
- Student can copy or save the summary as a note

---

### 6. Pre-Built Courses

**Story:**
As a student, I want to enroll in structured courses created by tutors so that I have a guided learning path beyond my own documents.

**Acceptance Criteria:**
- Student can browse available courses
- Student can enroll in a course with one click
- Modules unlock sequentially after completing the previous one (drip content)
- Progress percentage shown per course
- Student can resume from last completed module

---

### 7. Coding Practice Tracker

**Story:**
As a student, I want to manage a list of coding problems and track which ones I've solved so that I can monitor my placement preparation progress.

**Acceptance Criteria:**
- Student can create named practice lists
- Student can add problems by pasting a URL (LeetCode or any platform)
- Each problem has a status: Unsolved / Attempted / Solved
- Student can update status at any time
- Dashboard shows total solved count and percentage per list

---

### 8. Skill Tree

**Story:**
As a student, I want a visual skill tree that shows which topics I've mastered and what I can unlock next so that I have a clear sense of progress.

**Acceptance Criteria:**
- Skill tree displayed as an interactive DAG
- Nodes show locked / in-progress / unlocked states
- A node unlocks only when all prerequisite nodes are completed
- Completing a quiz or module on a topic marks the corresponding node as progressed
- Student can click a node to see what's needed to unlock it

---

### 9. Gamification (XP, Badges, Streaks)

**Story:**
As a student, I want to earn XP, badges, and maintain a streak so that learning feels rewarding and I stay consistent.

**Acceptance Criteria:**
- XP awarded on: quiz completion, flashcard review, module completion, problem solved
- Badges awarded automatically when conditions are met (e.g. 7-day streak, first quiz, 100 XP)
- Daily streak increments on any learning activity per day
- Streak resets if no activity for 24 hours
- Student can view XP total, badge gallery, and leaderboard

---

### 10. Analytics Dashboard

**Story:**
As a student, I want to see my learning progress in charts so that I understand where I'm spending time and where I'm underperforming.

**Acceptance Criteria:**
- Dashboard shows: total study time, quizzes taken, avg score, flashcards reviewed, problems solved
- Time-on-topic breakdown shown as a bar chart
- Score trend shown as a line chart over time
- Weak spots highlighted on dashboard
- Data updates in near real-time after each activity

---

### 11. Assignment System

**Story:**
As a student, I want to submit assignments and receive AI-generated grades and feedback so that I know where to improve without waiting for a tutor.

**Acceptance Criteria:**
- Student views assignment with title, description, and rubric
- Student submits text or file-based answer
- AI grades submission against rubric (score + written feedback)
- Result visible within 30 seconds of submission
- Student can view past submissions and grades
