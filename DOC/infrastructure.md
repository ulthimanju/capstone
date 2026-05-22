# Capestone — Repositories

| Repo Name | Responsibility |
|---|---|
| `capestone-gateway` | API Gateway, JWT filter, routing |
| `capestone-auth-service` | Register, login, JWT issue/refresh |
| `capestone-user-service` | Profiles, XP, badges, streaks |
| `capestone-notebook-service` | Document upload, learning path, RAG |
| `capestone-quiz-service` | Quiz generation, weak spot detection |
| `capestone-flashcard-service` | Flashcard generation, spaced repetition |
| `capestone-course-service` | Pre-built courses, drip content, modules |
| `capestone-assignment-service` | Assignment creation, submission, auto-grading |
| `capestone-practice-service` | LeetCode-style lists, progress tracking |
| `capestone-ai-service` | Ollama wrapper, summarization, all AI calls |
| `capestone-gamification-service` | XP engine, badges, challenge mode, leaderboards |
| `capestone-analytics-service` | Per-student dashboards, scores, drop-off |
| `capestone-notification-service` | In-app and email notifications |
| `capestone-frontend` | React 19 + Vite frontend |
| `capestone-config-server` | Spring Cloud Config central config |
| `capestone-discovery-server` | Spring Cloud Eureka service registry |
| `capestone-infra` | Docker Compose, Kafka, PostgreSQL, Redis, ChromaDB setup |

---

**17 repos total** — each service fully independent, own DB, own Docker config.
