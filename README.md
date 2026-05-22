# 🎓 Questly

### AI-Powered Student Learning Platform

*Upload your documents. Let AI teach you.*

---

## What is Questly?

Questly is an AI-powered learning platform built for students. Upload your study documents and let AI generate quizzes, flashcards, and summaries from them. Track coding practice, follow structured courses, and stay motivated with XP, badges, and streaks — all powered by a fully local AI running on your machine.

---

## Features

- **Document Knowledge Base** — Upload PDF, Markdown, .txt, Google Docs. AI answers questions strictly from your files.
- **AI Flashcards** — Auto-generated with spaced repetition (SM-2)
- **Quiz Mode** — MCQ, fill-in-the-blank, and short answer from your content
- **Weak Spot Detection** — Tracks wrong answers and resurfaces weak topics
- **Summarize & Simplify** — Condenses long documents into concise notes
- **Courses** — Enroll in structured courses with drip-unlocked modules
- **Coding Practice Tracker** — Manage LeetCode-style problem lists with solve status
- **Skill Tree** — Unlock advanced topics by mastering prerequisites
- **Gamification** — XP, badges, streaks, and timed quiz battles
- **Analytics Dashboard** — Track time-on-topic, scores, and progress

---

## Tech Stack

**Frontend** — React 19, Vite, Tailwind CSS v4, Zustand

**Backend** — Java 21, Spring Boot 3.x, Spring Cloud Gateway, Apache Kafka

**AI / RAG** — Ollama (local), llama3.2:3b, nomic-embed-text, LangChain4j, ChromaDB

**Data** — PostgreSQL, Redis, MinIO, Elasticsearch

---

## Getting Started

```bash
# Clone
git clone https://github.com/ulthimanju/questly.git
cd questly

# Start Ollama
ollama serve

# Start infrastructure
cd infra && docker compose up -d

# Start backend
mvn clean install -DskipTests
mvn spring-boot:run

# Start frontend
cd frontend && npm install && npm run dev
```

Open `http://localhost:5173`

---
