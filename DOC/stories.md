# Questly — User Stories

> **Updated**: 2026-05-24
> **Author**: Manju (Solo Developer)
> **Format**: As a student, I want to [action] so that [benefit].
> Each story includes acceptance criteria, priority, and status.

---

## Status Summary

| # | Feature | Story | Acceptance Criteria | Priority | Status |
|---|---|---|---|---|---|
| 1 | Document Upload & RAG | ✅ | ✅ | 🔴 Must Have | ✅ Done |
| 2 | AI Flashcard Generation | ✅ | ✅ | 🔴 Must Have | ✅ Done |
| 3 | Quiz Me Mode | ✅ | ✅ | 🔴 Must Have | ✅ Done |
| 4 | Weak Spot Detection | ✅ | ✅ | 🔴 Must Have | ✅ Done |
| 5 | Summarize & Simplify | ✅ | ✅ | 🟡 Should Have | ✅ Done |
| 6 | Pre-Built Courses | ✅ | ✅ | 🟡 Should Have | ✅ Done |
| 7 | Coding Practice Tracker | ✅ | ✅ | 🟡 Should Have | ✅ Done |
| 8 | Skill Tree | ✅ | ✅ | 🟢 Could Have | ✅ Done |
| 9 | Gamification (XP, Badges, Streaks) | ✅ | ✅ | 🟢 Could Have | ✅ Done |
| 10 | Analytics Dashboard | ✅ | ✅ | 🟡 Should Have | ✅ Done |
| 11 | Assignment System | ✅ | ✅ | 🟢 Could Have | ✅ Done |

---

### 1. Document Upload & RAG Knowledge Base

**Story:**
As a student, I want to upload my study documents and query them so that I get answers grounded strictly in my own material.

**Acceptance Criteria:**
- Upload PDF, Markdown, .txt supported
- Google Docs and Google Slides linkable via URL
- Max 50 sources per notebook, 500,000 words per source enforced
- Document parsed and embedded automatically after upload
- RAG query returns answer with source chunk reference
- No open internet used — closed knowledge base only

**Priority:** 🔴 Must Have | **Completed:** 2026-05-24

---

### 2. AI Flashcard Generation

**Story:**
As a student, I want flashcards auto-generated from my uploaded documents so that I can review key concepts without creating them manually.

**Acceptance Criteria:**
- Flashcards generated from selected notebook via LLM
- Each card has a clear question and a concise answer
- SM-2 spaced repetition schedules next review date
- Student rates card difficulty (1–5) after each review
- Next review date recalculated based on rating
- Student can view all cards due today in one session

**Priority:** 🔴 Must Have | **Completed:** 2026-05-24

---

### 3. Quiz Me Mode

**Story:**
As a student, I want AI-generated quizzes from my documents so that I can test my understanding before an exam.

**Acceptance Criteria:**
- Student selects a notebook to generate quiz from
- Quiz contains at least one MCQ, one fill-in-the-blank, one short answer
- Student submits quiz and sees score immediately
- Each wrong answer records the associated topic
- Student can retry the same quiz after completion

**Priority:** 🔴 Must Have | **Completed:** 2026-05-24

---

### 4. Weak Spot Detection

**Story:**
As a student, I want the system to track topics I keep getting wrong so that my revision focuses where it matters most.

**Acceptance Criteria:**
- Topic flagged as weak after 2+ consecutive wrong answers
- Weak spot topics resurfaced automatically in next quiz session
- Student can view their full weak spot list on dashboard
- Weak spot clears after 2 consecutive correct answers on same topic

**Priority:** 🔴 Must Have | **Completed:** 2026-05-24

---

### 5. Summarize & Simplify

**Story:**
As a student, I want long documents condensed into short summaries so that I can quickly grasp the key points without reading everything.

**Acceptance Criteria:**
- Student selects a document or full notebook to summarize
- AI returns summary in plain, simpler language (max 500 words)
- Summary displayed inline and copyable
- Student can regenerate summary if unsatisfied

**Priority:** 🟡 Should Have | **Completed:** 2026-05-24

---

### 6. Pre-Built Courses

**Story:**
As a student, I want to enroll in structured courses so that I have a guided learning path beyond my own documents.

**Acceptance Criteria:**
- Student can browse all available courses
- Student enrolls with one click
- Modules unlock sequentially — next module unlocks only after current one is completed
- Progress percentage shown per course
- Student can resume from last completed module

**Priority:** 🟡 Should Have | **Completed:** 2026-05-24

---

### 7. Coding Practice Tracker

**Story:**
As a student, I want to manage a list of coding problems and track which ones I have solved so that I can monitor my placement preparation progress.

**Acceptance Criteria:**
- Student creates named practice lists
- Student adds problems by pasting any URL (LeetCode or any platform)
- Each problem has status: Unsolved / Attempted / Solved
- Student updates status at any time
- Dashboard shows total solved count and completion percentage per list

**Priority:** 🟡 Should Have | **Completed:** 2026-05-24

---

### 8. Skill Tree

**Story:**
As a student, I want a visual skill tree that shows what I have mastered and what I can unlock next so that I always know what to study.

**Acceptance Criteria:**
- Skill tree rendered as interactive DAG
- Nodes show three states: Locked / In Progress / Unlocked
- Node unlocks only when all prerequisite nodes are completed
- Completing a quiz or module on a topic progresses the corresponding node
- Clicking a locked node shows what is required to unlock it

**Priority:** 🟢 Could Have | **Completed:** 2026-05-24

---

### 9. Gamification (XP, Badges, Streaks)

**Story:**
As a student, I want to earn XP, collect badges, and maintain a daily streak so that learning feels rewarding and I stay consistent.

**Acceptance Criteria:**
- XP awarded on: quiz completion, flashcard review, module completion, problem solved
- Badge awarded automatically when its condition is met
- Daily streak increments on any learning activity within a 24-hour window
- Streak resets if no activity for 24 hours
- Student views XP total, badge gallery, and leaderboard from profile

**Priority:** 🟢 Could Have | **Completed:** 2026-05-24

---

### 10. Analytics Dashboard

**Story:**
As a student, I want to see my learning activity in charts so that I understand where I am spending time and where I am underperforming.

**Acceptance Criteria:**
- Dashboard shows: total study time, quizzes taken, avg score, flashcards reviewed, problems solved
- Time-on-topic breakdown shown as a bar chart
- Score trend shown as a line chart over time
- Weak spots highlighted on dashboard
- Data refreshes after every completed activity

**Priority:** 🟡 Should Have | **Completed:** 2026-05-24

---

### 11. Assignment System

**Story:**
As a student, I want to submit assignments and receive AI-generated grades and feedback so that I know where to improve without waiting.

**Acceptance Criteria:**
- Student views assignment title, description, and rubric
- Student submits text or file-based answer
- AI grades submission against rubric — returns score and written feedback
- Result visible within 30 seconds of submission
- Student views all past submissions and grades in history

**Priority:** 🟢 Could Have | **Completed:** 2026-05-24
