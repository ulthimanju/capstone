# Questly — API Planning

> **Completed**: 2026-05-24
> **Author**: Manju (Solo Developer)
> **Scope**: REST API contracts per service + Kafka topic list and event schemas

---

## Status Summary

| # | Task | Status | Notes |
|---|---|---|---|
| 27 | Draft REST endpoint list per service | ✅ Done | 11 services — OpenAPI 3.0 ready |
| 28 | Define Kafka topic list and event schemas | ✅ Done | 12 topics, full event schemas |

---

## 27. REST API Contracts Per Service

---

### Auth Service `:8081`

| Method | Endpoint | Role | Description |
|---|---|---|---|
| POST | `/api/auth/register` | PUBLIC | Register new user |
| POST | `/api/auth/login` | PUBLIC | Login, returns JWT + refresh token |
| POST | `/api/auth/refresh` | PUBLIC | Exchange refresh token for new JWT |
| POST | `/api/auth/logout` | STUDENT/TUTOR/ADMIN | Revoke refresh token |
| GET | `/api/auth/oauth2/google` | PUBLIC | Initiate Google OAuth2 flow |
| GET | `/api/auth/oauth2/callback` | PUBLIC | Google OAuth2 callback |

**Request / Response:**
```json
// POST /api/auth/register
Request:  { "email": "...", "password": "...", "name": "...", "role": "STUDENT" }
Response: { "userId": "uuid", "email": "...", "role": "STUDENT" }

// POST /api/auth/login
Request:  { "email": "...", "password": "..." }
Response: { "accessToken": "...", "refreshToken": "...", "expiresIn": 900 }

// POST /api/auth/refresh
Request:  { "refreshToken": "..." }
Response: { "accessToken": "...", "expiresIn": 900 }
```

---

### User Service `:8082`

| Method | Endpoint | Role | Description |
|---|---|---|---|
| GET | `/api/users/me` | STUDENT/TUTOR | Get own profile |
| PUT | `/api/users/me` | STUDENT/TUTOR | Update own profile |
| GET | `/api/users/me/stats` | STUDENT | Get XP, streak, totals |
| GET | `/api/users/{id}` | ADMIN | Get any user profile |
| GET | `/api/users` | ADMIN | List all users |
| PATCH | `/api/users/{id}/role` | ADMIN | Change user role |
| DELETE | `/api/users/{id}` | ADMIN | Suspend/delete user |

**Request / Response:**
```json
// GET /api/users/me
Response: {
  "id": "uuid", "name": "...", "email": "...",
  "role": "STUDENT", "avatarUrl": "...", "bio": "..."
}

// GET /api/users/me/stats
Response: {
  "xp": 1240, "streak": 7, "totalQuizzes": 34,
  "totalFlashcards": 210, "totalSolved": 45
}
```

---

### Notebook Service `:8083`

| Method | Endpoint | Role | Description |
|---|---|---|---|
| POST | `/api/notebooks` | STUDENT | Create new notebook |
| GET | `/api/notebooks` | STUDENT | List own notebooks |
| GET | `/api/notebooks/{id}` | STUDENT | Get notebook details |
| DELETE | `/api/notebooks/{id}` | STUDENT | Delete notebook |
| POST | `/api/notebooks/{id}/documents` | STUDENT | Upload document (multipart) |
| GET | `/api/notebooks/{id}/documents` | STUDENT | List documents in notebook |
| DELETE | `/api/notebooks/{id}/documents/{docId}` | STUDENT | Delete document |
| POST | `/api/notebooks/{id}/query` | STUDENT | RAG query against notebook |
| POST | `/api/notebooks/{id}/summarize` | STUDENT | Summarize notebook content |

**Request / Response:**
```json
// POST /api/notebooks/{id}/documents
Request:  multipart/form-data { file, format: "PDF" }
Response: { "documentId": "uuid", "name": "...", "status": "PROCESSING" }

// POST /api/notebooks/{id}/query
Request:  { "question": "What is attention mechanism?" }
Response: {
  "answer": "...",
  "sources": [{ "documentId": "uuid", "sourceName": "notes.pdf", "chunk": "..." }]
}

// POST /api/notebooks/{id}/summarize
Request:  { "documentId": "uuid" }
Response: { "summary": "..." }
```

---

### Quiz Service `:8084`

| Method | Endpoint | Role | Description |
|---|---|---|---|
| POST | `/api/quizzes/generate` | STUDENT | Generate quiz from notebook |
| GET | `/api/quizzes` | STUDENT | List own quizzes |
| GET | `/api/quizzes/{id}` | STUDENT | Get quiz with questions |
| POST | `/api/quizzes/{id}/attempt` | STUDENT | Submit quiz attempt |
| GET | `/api/quizzes/{id}/attempts` | STUDENT | Get attempt history for quiz |
| GET | `/api/quizzes/weak-spots` | STUDENT | Get active weak spots |
| GET | `/api/quizzes/weak-spots/session` | STUDENT | Get weak spot review session |

**Request / Response:**
```json
// POST /api/quizzes/generate
Request:  { "notebookId": "uuid", "count": 10, "types": ["MCQ","FILL","SHORT"] }
Response: { "quizId": "uuid", "title": "...", "questions": [...] }

// POST /api/quizzes/{id}/attempt
Request:  { "answers": [{ "questionId": "uuid", "answer": "..." }] }
Response: {
  "score": 80.0, "totalQuestions": 10, "correct": 8,
  "wrongTopics": ["attention mechanism", "transformers"]
}
```

---

### Flashcard Service `:8085`

| Method | Endpoint | Role | Description |
|---|---|---|---|
| POST | `/api/flashcards/generate` | STUDENT | Generate flashcards from notebook |
| GET | `/api/flashcards` | STUDENT | List all own flashcards |
| GET | `/api/flashcards/due` | STUDENT | Get cards due today (`?notebookId=uuid` optional filter) |
| POST | `/api/flashcards/{id}/review` | STUDENT | Submit review rating (SM-2) |
| DELETE | `/api/flashcards/{id}` | STUDENT | Delete a flashcard |

**Request / Response:**
```json
// POST /api/flashcards/generate
Request:  { "notebookId": "uuid", "count": 20 }
Response: { "generated": 20, "flashcards": [{ "id": "uuid", "question": "...", "answer": "..." }] }

// POST /api/flashcards/{id}/review
// SM-2 scale 0–5: Again=0, Hard=2, Good=4, Easy=5 (4-button UI maps to these values)
Request:  { "rating": 4 }
Response: { "nextReview": "2026-05-27", "interval": 3, "easeFactor": 2.50 }
```

---

### Course Service `:8086`

| Method | Endpoint | Role | Description |
|---|---|---|---|
| GET | `/api/courses` | STUDENT/TUTOR | List all published courses |
| GET | `/api/courses/{id}` | STUDENT/TUTOR | Get course details + modules |
| POST | `/api/courses` | TUTOR/ADMIN | Create course |
| PUT | `/api/courses/{id}` | TUTOR/ADMIN | Update course |
| DELETE | `/api/courses/{id}` | ADMIN | Delete course |
| POST | `/api/courses/{id}/enroll` | STUDENT | Enroll in course |
| GET | `/api/courses/{id}/progress` | STUDENT | Get own progress |
| POST | `/api/courses/{id}/modules/{moduleId}/complete` | STUDENT | Mark module complete |
| GET | `/api/courses/{id}/enrollments` | TUTOR/ADMIN | List enrolled students |

**Request / Response:**
```json
// GET /api/courses/{id}
Response: {
  "id": "uuid", "title": "...", "description": "...",
  "modules": [{ "id": "uuid", "title": "...", "orderIndex": 1, "dripUnlock": true }]
}

// GET /api/courses/{id}/progress
Response: { "progress": 45.0, "unlockedModules": ["uuid1", "uuid2"], "completed": false }
```

---

### Assignment Service `:8087`

| Method | Endpoint | Role | Description |
|---|---|---|---|
| GET | `/api/assignments` | STUDENT | List assignments for enrolled courses |
| GET | `/api/assignments/{id}` | STUDENT | Get assignment details + rubric |
| POST | `/api/assignments` | TUTOR/ADMIN | Create assignment |
| PUT | `/api/assignments/{id}` | TUTOR/ADMIN | Update assignment |
| POST | `/api/assignments/{id}/submit` | STUDENT | Submit assignment |
| GET | `/api/assignments/{id}/submission` | STUDENT | Get own submission + grade |
| GET | `/api/assignments/{id}/submissions` | TUTOR/ADMIN | List all submissions |

**Request / Response:**
```json
// POST /api/assignments/{id}/submit
Request:  { "content": "...", "filePath": null }
Response: { "submissionId": "uuid", "status": "PENDING" }

// GET /api/assignments/{id}/submission
Response: {
  "submissionId": "uuid", "content": "...",
  "aiGrade": 87.5, "aiFeedback": "...", "status": "GRADED", "gradedAt": "..."
}
```

---

### Practice Service `:8088`

| Method | Endpoint | Role | Description |
|---|---|---|---|
| POST | `/api/practice/lists` | STUDENT | Create practice list |
| GET | `/api/practice/lists` | STUDENT | Get all own lists |
| GET | `/api/practice/lists/{id}` | STUDENT | Get list with items |
| DELETE | `/api/practice/lists/{id}` | STUDENT | Delete list |
| POST | `/api/practice/lists/{id}/items` | STUDENT | Add problem to list |
| DELETE | `/api/practice/lists/{id}/items/{itemId}` | STUDENT | Remove problem |
| PATCH | `/api/practice/lists/{id}/items/{itemId}/status` | STUDENT | Update solve status |
| GET | `/api/practice/stats` | STUDENT | Get solve counts summary |

**Request / Response:**
```json
// POST /api/practice/lists/{id}/items
Request:  { "title": "Two Sum", "problemUrl": "https://leetcode.com/problems/two-sum", "difficulty": "EASY" }
Response: { "itemId": "uuid", "status": "UNSOLVED" }

// PATCH /api/practice/lists/{id}/items/{itemId}/status
Request:  { "status": "SOLVED" }
Response: { "itemId": "uuid", "status": "SOLVED", "solvedAt": "2026-05-22T10:00:00Z" }

// GET /api/practice/stats
Response: { "totalProblems": 150, "solved": 67, "attempted": 23, "unsolved": 60 }
```

---

### Gamification Service `:8090`

| Method | Endpoint | Role | Description |
|---|---|---|---|
| GET | `/api/gamification/xp` | STUDENT | Get XP balance + ledger |
| GET | `/api/gamification/badges` | STUDENT | Get earned badges |
| GET | `/api/gamification/badges/all` | STUDENT | Get all badges (earned + locked) |
| GET | `/api/gamification/leaderboard` | STUDENT/TUTOR | Get top students by XP |
| GET | `/api/gamification/skill-tree` | STUDENT | Get full skill tree with unlock state |
| POST | `/api/gamification/challenges` | STUDENT | Create a quiz challenge |
| POST | `/api/gamification/challenges/{id}/join` | STUDENT | Join a challenge |
| GET | `/api/gamification/challenges/{id}` | STUDENT | Get challenge status + result |

**Request / Response:**
```json
// GET /api/gamification/xp
Response: {
  "total": 1240,
  "ledger": [{ "amount": 50, "reason": "QUIZ_COMPLETED", "createdAt": "..." }]
}

// GET /api/gamification/leaderboard
Response: [{ "userId": "uuid", "name": "...", "xp": 1240, "rank": 1 }]

// GET /api/gamification/skill-tree
Response: {
  "nodes": [{
    "id": "uuid", "label": "Arrays", "unlocked": true,
    "prerequisites": [], "completedAt": "..."
  }]
}
```

---

### Analytics Service `:8091`

| Method | Endpoint | Role | Description |
|---|---|---|---|
| GET | `/api/analytics/dashboard` | STUDENT | Full dashboard summary |
| GET | `/api/analytics/topics` | STUDENT | Time-on-topic breakdown |
| GET | `/api/analytics/scores` | STUDENT | Score trend over time |
| GET | `/api/analytics/weak-spots` | STUDENT | Weak spot summary |
| GET | `/api/analytics/students/{id}` | TUTOR/ADMIN | Per-student analytics |
| GET | `/api/analytics/platform` | ADMIN | Platform-wide analytics |

**Request / Response:**
```json
// GET /api/analytics/dashboard
Response: {
  "studyTimeSecs": 18400,
  "quizzesTaken": 34, "avgScore": 76.5,
  "flashcardsReviewed": 210, "problemsSolved": 45,
  "weeklyXp": [120, 200, 80, 340, 180, 220, 100]
}

// GET /api/analytics/scores
Query: ?from=2026-05-01&to=2026-05-22
Response: [{ "date": "2026-05-01", "avgScore": 72.0 }, ...]

// GET /api/analytics/topics
Response: [{ "topic": "Arrays", "studyTimeSecs": 3200, "avgScore": 85.0 }]
```

---

### AI Service `:8089` (Internal Only)

> Not exposed via Gateway. Called internally by other services via REST.

| Method | Endpoint | Called By | Description |
|---|---|---|---|
| POST | `/internal/v1/ai/embed` | notebook-service | Embed document chunks |
| POST | `/internal/v1/ai/query` | notebook-service | RAG query against ChromaDB |
| POST | `/internal/v1/ai/generate/quiz` | quiz-service | Generate quiz questions |
| POST | `/internal/v1/ai/generate/flashcards` | flashcard-service | Generate flashcards |
| POST | `/internal/v1/ai/summarize` | notebook-service | Summarize document |
| POST | `/internal/v1/ai/grade` | assignment-service | Grade submission against rubric |

---

### Notification Service `:8092`

> Primarily a Kafka consumer. Exposes one REST endpoint for frontend notification retrieval.

**REST Endpoints:**

| Method | Endpoint | Role | Description |
|---|---|---|---|
| GET | `/api/notifications` | STUDENT/TUTOR/ADMIN | Get own notifications (paginated) |
| PATCH | `/api/notifications/{id}/read` | STUDENT/TUTOR/ADMIN | Mark notification as read |
| PATCH | `/api/notifications/read-all` | STUDENT/TUTOR/ADMIN | Mark all notifications as read |

**Kafka Topics Consumed:**

| Kafka Topic Consumed | Action |
|---|---|
| `user.registered` | Send welcome notification |
| `assignment.graded` | Notify student of grade |
| `badge.earned` | Notify student of new badge |
| `challenge.accepted` | Notify challenger that opponent accepted |
| `challenge.completed` | Notify both participants of result |

---

## 28. Kafka Topic List & Event Schemas

| Topic | Producer | Consumers | Trigger |
|---|---|---|---|
| `user.registered` | auth-service | user-service, notification-service | New user signs up |
| `document.uploaded` | notebook-service | ai-service | Document upload complete |
| `document.embedded` | ai-service | notebook-service | Embedding stored in ChromaDB |
| `document.deleted` | notebook-service | ai-service | Document deleted — purge ChromaDB chunks |
| `quiz.completed` | quiz-service | analytics-service, gamification-service | Student submits quiz |
| `flashcard.reviewed` | flashcard-service | analytics-service, gamification-service | Student rates a flashcard |
| `assignment.submitted` | assignment-service | ai-service | Student submits assignment |
| `assignment.graded` | ai-service | assignment-service, notification-service | AI grading complete |
| `module.completed` | course-service | gamification-service, analytics-service | Student completes module |
| `practice.solved` | practice-service | gamification-service, analytics-service | Student marks problem solved |
| `xp.awarded` | gamification-service | user-service | XP event triggered |
| `badge.earned` | gamification-service | user-service, notification-service | Badge condition met |
| `challenge.accepted` | gamification-service | notification-service | Opponent accepts challenge |
| `challenge.rejected` | gamification-service | notification-service | Opponent rejects challenge |
| `challenge.completed` | gamification-service | gamification-service, analytics-service, notification-service | Challenge ends |

---

**Event Schemas:**

```json
// user.registered
{ "userId": "uuid", "email": "...", "role": "STUDENT", "timestamp": "..." }

// document.uploaded
{ "documentId": "uuid", "notebookId": "uuid", "userId": "uuid", "minioPath": "...", "format": "PDF", "timestamp": "..." }

// document.embedded
{ "documentId": "uuid", "notebookId": "uuid", "chunkCount": 42, "collectionId": "notebook_uuid", "timestamp": "..." }

// document.deleted
{ "documentId": "uuid", "notebookId": "uuid", "userId": "uuid", "collectionId": "notebook_uuid", "timestamp": "..." }

// quiz.completed
{ "userId": "uuid", "quizId": "uuid", "score": 80.0, "totalQuestions": 10, "wrongTopics": ["..."], "timestamp": "..." }

// flashcard.reviewed
{ "userId": "uuid", "flashcardId": "uuid", "rating": 4, "nextReview": "2026-05-27", "timestamp": "..." }

// assignment.submitted
{ "submissionId": "uuid", "assignmentId": "uuid", "userId": "uuid", "content": "...", "rubric": "...", "timestamp": "..." }

// assignment.graded
{ "submissionId": "uuid", "userId": "uuid", "grade": 87.5, "feedback": "...", "timestamp": "..." }

// module.completed
{ "userId": "uuid", "courseId": "uuid", "moduleId": "uuid", "timestamp": "..." }

// practice.solved
{ "userId": "uuid", "itemId": "uuid", "listId": "uuid", "difficulty": "EASY", "timestamp": "..." }

// xp.awarded
{ "userId": "uuid", "amount": 50, "reason": "QUIZ_COMPLETED", "refId": "uuid", "timestamp": "..." }

// badge.earned
{ "userId": "uuid", "badgeId": "uuid", "badgeName": "First Quiz", "timestamp": "..." }

// challenge.accepted
{ "challengeId": "uuid", "challengerId": "uuid", "opponentId": "uuid", "timestamp": "..." }

// challenge.rejected
{ "challengeId": "uuid", "challengerId": "uuid", "opponentId": "uuid", "timestamp": "..." }

// challenge.completed
{ "challengeId": "uuid", "challengerId": "uuid", "opponentId": "uuid", "winnerId": "uuid", "timestamp": "..." }
```
