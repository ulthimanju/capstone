# 📋 Questly — Agile Progress Tracker

> **Methodology**: Adapted Agile (Solo Developer)
> **Project**: Questly — AI-Powered Student Learning Platform
> **Stack**: Spring Boot 3.x · React 19 · Ollama · ChromaDB · Kafka · PostgreSQL
> **Developer**: Manju (Solo)
> **Start Date**: 2026-05-22
> **Target Completion**: 2026-07-31

---

## 📊 Overall Progress

| Metric | Value |
|---|---|
| Total Tasks | 112 |
| Completed | 101 |
| In Progress | 0 |
| Pending | 11 |
| Overall Completion | 90.2% |

---

## 🗓️ Project Timeline Overview

| Phase | Status | Target | Tasks Done | Tasks Total | Completion |
|---|---|---|---|---|---|
| 📌 Phase 1 — Requirements Gathering | ✅ Complete | 2026-05-24 | 28 | 28 | 100% |
| 🏗️ Phase 2 — System Design & Architecture | ✅ Complete | 2026-06-07 | 14 | 14 | 100% |
| 🔧 Phase 3 — Core Infrastructure Setup | ✅ Complete | 2026-06-14 | 13 | 13 | 100% |
| 🚀 Sprint 1 — Auth + Upload + RAG | ✅ Complete | 2026-06-28 | 10 | 10 | 100% |
| 🚀 Sprint 2 — Flashcards + Quiz + Weak Spot | ✅ Complete | 2026-07-10 | 8 | 8 | 100% |
| 🚀 Sprint 3 — Courses + Practice + Skill Tree | ✅ Complete | 2026-07-18 | 8 | 8 | 100% |
| 🚀 Sprint 4 — Gamification + Analytics + Polish | ✅ Complete | 2026-07-25 | 9 | 9 | 100% |
| 🧪 Integration Testing | ✅ Complete | 2026-07-28 | 6 | 6 | 100% |
| 🐛 Bug Fixing & Polish | ✅ Complete | 2026-07-30 | 6 | 6 | 100% |
| 🎓 Final Submission / Demo | ⏳ Pending | 2026-07-31 | 0 | 4 | 0% |

---

## 📌 Phase 1 — Requirements Gathering

> **Goal**: Fully define what Questly must do, for whom, and under what constraints before a single line of code is written.

**Status**: ✅ Complete
**Started**: 2026-05-22
**Completed**: 2026-05-24
**Progress**: 28 / 28 tasks complete (100%)

---

### ✅ Completed

| # | Task | Completed On | Notes |
|---|---|---|---|
| 1 | Write project abstract | 2026-05-22 | One-paragraph summary covering AI, RAG, gamification |
| 2 | Define problem statement | 2026-05-22 | Student-centric; AI as primary tutor |
| 3 | Define key features (11 core) | 2026-05-22 | Notebooks, Quiz, Flashcards, Courses, Practice, Skill Tree, Gamification, Analytics, Assignments |
| 4 | Select and document tech stack | 2026-05-22 | React 19, Spring Boot 3.x, Ollama, ChromaDB, Kafka, PostgreSQL, Redis |
| 5 | Define high-level architecture (HLD) | 2026-05-22 | 6-layer HLD created in FigJam |
| 6 | Define infrastructure design | 2026-05-22 | Docker Compose, Kafka, MinIO, Redis, Elasticsearch, Eureka, Zipkin |
| 7 | Define user roles and permissions matrix | 2026-05-22 | STUDENT / TUTOR / ADMIN — 11 resource groups, 50+ permission rules |
| 8 | Write detailed user stories per feature | 2026-05-22 | 11 stories with acceptance criteria — saved in stories.md |
| 9 | Write full SRS document | 2026-05-22 | Full SRS in SRS.md — 12 feature areas, FR IDs, NFR IDs |
| 10 | Define non-functional requirements | 2026-05-22 | 7 NFR categories: Performance, Availability, Security, Scalability, Data Integrity, Usability, Maintainability |
| 11 | Define system constraints and assumptions | 2026-05-22 | Hardware, software, regulatory, time constraints + 10 assumptions |
| 12 | Define out-of-scope items explicitly | 2026-05-22 | 22 OOS items across features, infra, integrations, data/compliance |

---

#### 👥 User Stories (Per Feature)

| # | Feature | Story Written | Acceptance Criteria | Priority |
|---|---|---|---|---|
| 13 | Document Upload & RAG | ✅ | ✅ | 🔴 Must Have |
| 14 | AI Flashcard Generation | ✅ | ✅ | 🔴 Must Have |
| 15 | Quiz Me Mode | ✅ | ✅ | 🔴 Must Have |
| 16 | Weak Spot Detection | ✅ | ✅ | 🔴 Must Have |
| 17 | Summarize & Simplify | ✅ | ✅ | 🟡 Should Have |
| 18 | Pre-Built Courses | ✅ | ✅ | 🟡 Should Have |
| 19 | Coding Practice Tracker | ✅ | ✅ | 🟡 Should Have |
| 20 | Skill Tree | ✅ | ✅ | 🟢 Could Have |
| 21 | Gamification (XP, Badges, Streaks) | ✅ | ✅ | 🟢 Could Have |
| 22 | Analytics Dashboard | ✅ | ✅ | 🟡 Should Have |
| 23 | Assignment System | ✅ | ✅ | 🟢 Could Have |

---

#### 🗂️ Data Modeling

| # | Task | Status | Notes |
|---|---|---|---|
| 24 | Draft Entity-Relationship Diagram (ERD) | ✅ Done | All 18 core entities defined |
| 25 | Define PostgreSQL schema per service | ✅ Done | Schema-per-service isolation — 11 services |
| 26 | Define ChromaDB collection structure | ✅ Done | Collection naming, metadata, dimensions |

---

#### 🔌 API Planning

| # | Task | Status | Notes |
|---|---|---|---|
| 27 | Draft REST endpoint list per service | ✅ Done | 11 services — REST contracts defined |
| 28 | Define Kafka topic list and event schemas | ✅ Done | 12 topics, full event schemas |

---

#### 📐 Design

| # | Task | Status | Notes |
|---|---|---|---|
| — | Create low-fidelity wireframes for key screens | ✅ Done | 10 screens — saved in `assets/wireframes/` |
| — | Define UI component inventory | ✅ Done | 73 components across 15 categories |

---

## 🏗️ Phase 2 — System Design & Architecture

> **Goal**: Translate requirements into a concrete technical blueprint covering all services, communication, and data flows.

**Status**: ✅ Complete
**Target**: 2026-06-07
**Progress**: 14 / 14 tasks complete (100%)

| # | Task | Priority | Output | Completed |
|---|---|---|---|---|
| 1 | Define microservice boundaries (responsibility per service) | 🔴 High | Service responsibility doc | ✅ Done |
| 2 | Design inter-service communication (REST vs Kafka per case) | 🔴 High | Communication matrix | ✅ Done |
| 3 | Design Spring Cloud Gateway routing rules | 🔴 High | Gateway config YAML | ✅ Done |
| 4 | Design Eureka service registry setup | 🟡 Medium | Eureka config | ✅ Done |
| 5 | Design JWT auth flow (issue → validate → refresh → revoke) | 🔴 High | Sequence diagram | ✅ Done |
| 6 | Design Google OAuth2 login flow | 🟡 Medium | Sequence diagram | ✅ Done |
| 7 | Design RAG pipeline (upload → parse → chunk → embed → store → retrieve → generate) | 🔴 High | Pipeline diagram | ✅ Done |
| 8 | Design SM-2 spaced repetition scheduling logic | 🟡 Medium | Algorithm spec | ✅ Done |
| 9 | Design Kafka event flow diagrams | 🟡 Medium | Event flow diagrams | ✅ Done |
| 10 | Finalize PostgreSQL schema (all services) | 🔴 High | SQL DDL scripts | ✅ Done |
| 11 | Design Redis caching strategy | 🟡 Medium | Cache key design doc | ✅ Done |
| 12 | Design skill tree unlock logic (prerequisite DAG) | 🟡 Medium | Algorithm spec | ✅ Done |
| 13 | Design XP rules engine (event → XP mapping) | 🟡 Medium | Rules table | ✅ Done |
| 14 | Create Low-Level Design (LLD) document | 🔴 High | LLD.md | ✅ Done |

---

## 🔧 Phase 3 — Core Infrastructure Setup

> **Goal**: Bootstrap all services so development can begin immediately with a working local environment.

**Status**: ✅ Complete
**Started**: 2026-05-25
**Completed**: 2026-05-26
**Progress**: 13 / 13 tasks complete (100%)

| # | Task | Priority | Verification | Status |
|---|---|---|---|---|
| 1 | Initialize Git monorepo structure | 🔴 High | `git log` shows initial commit | ✅ Done |
| 2 | Set up React 19 + Vite frontend project | 🔴 High | `npm run dev` runs on :5173 | ✅ Done |
| 3 | Set up Spring Boot parent POM (multi-module Maven) | 🔴 High | `mvn clean install` passes | ✅ Done |
| 4 | Configure Docker Compose (PostgreSQL, Redis, Kafka, ChromaDB, MinIO, Ollama, Zipkin) | 🔴 High | `docker compose up` all healthy | ✅ Done |
| 5 | Set up Spring Cloud Config Server | 🟡 Medium | Config server on :8888 | ✅ Done |
| 6 | Set up Spring Cloud Eureka Server | 🔴 High | Eureka dashboard on :8761 | ✅ Done |
| 7 | Set up Spring Cloud Gateway | 🔴 High | Gateway on :8080 routes correctly | ✅ Done |
| 8 | Configure RS256 JWT issuer and validator | 🔴 High | Token issued and validated end-to-end | ✅ Done |
| 9 | Set up GitHub Actions CI pipeline | 🟡 Medium | PR triggers build + test | ✅ Done |
| 10 | Configure Prometheus + Grafana | 🟢 Low | Metrics visible on :3000 | ✅ Done |
| 11 | Set up Zipkin + Micrometer tracing | 🟢 Low | Traces visible on :9411 | ✅ Done |
| 12 | Verify Ollama models running | 🔴 High | `ollama list` shows all 4 models | ✅ Done |
| 13 | Verify full local stack startup | 🔴 High | All services UP in Docker Compose | ✅ Done |

---

## 🚀 Sprint 1 — Auth + Document Upload + RAG Core

**Status**: ✅ Complete
**Target**: 2026-06-28
**Progress**: 10 / 10 tasks complete (100%)

| # | Task | Service | Priority | Acceptance Criteria | Status |
|---|---|---|---|---|---|
| 1 | User registration + login (JWT) | auth-service | 🔴 High | POST /auth/register and /auth/login return valid JWT | ✅ Done |
| 2 | Google OAuth2 login | auth-service | 🟡 Medium | OAuth flow completes, JWT returned | ✅ Done |
| 3 | Role-based access control | gateway | 🔴 High | STUDENT/TUTOR/ADMIN roles enforced at gateway | ✅ Done |
| 4 | Document upload (PDF, MD, TXT) via MinIO | notebook-service | 🔴 High | File stored in MinIO, metadata in PostgreSQL | ✅ Done |
| 5 | Google Drive API integration (Docs, Slides) | notebook-service | 🟡 Medium | Google Doc URL fetched and parsed | ✅ Done |
| 6 | Document parsing with Apache Tika | ai-service | 🔴 High | Raw text extracted from all supported formats | ✅ Done |
| 7 | Chunking + embedding via nomic-embed-text | ai-service | 🔴 High | Chunks stored in ChromaDB with metadata | ✅ Done |
| 8 | Closed-domain RAG query endpoint | ai-service | 🔴 High | Query returns answer grounded only in uploaded docs | ✅ Done |
| 9 | Frontend: Login page | frontend | 🔴 High | Login + register forms functional | ✅ Done |
| 10 | Frontend: Document upload UI | frontend | 🔴 High | Upload UI with format validation + progress indicator | ✅ Done |

---

## 🚀 Sprint 2 — Flashcards + Quiz + Weak Spot

**Status**: ✅ Complete
**Target**: 2026-07-10
**Progress**: 8 / 8 tasks complete (100%)

| # | Task | Service | Priority | Acceptance Criteria | Status |
|---|---|---|---|---|---|
| 1 | AI flashcard generation from document content | flashcard-service | 🔴 High | LLM generates Q&A pairs from notebook chunks | ✅ Done |
| 2 | SM-2 spaced repetition scheduling engine | flashcard-service | 🔴 High | Next review date computed based on rating (1–5) | ✅ Done |
| 3 | Flashcard review UI (flip animation, rating) | frontend | 🔴 High | Card flips on click, 4-button rating updates schedule | ✅ Done |
| 4 | Quiz generation (MCQ, fill-in-blank, short answer) | quiz-service | 🔴 High | LLM generates valid question sets from notebook | ✅ Done |
| 5 | Quiz attempt tracking and scoring | quiz-service | 🔴 High | Score persisted per attempt, wrong topics recorded | ✅ Done |
| 6 | Weak spot detection logic | quiz-service | 🔴 High | Topics with >2 wrong attempts flagged and resurfaced | ✅ Done |
| 7 | Weak spot review session UI | frontend | 🟡 Medium | Dedicated review mode filters weak-spot questions | ✅ Done |
| 8 | Summarize & Simplify endpoint + UI | ai-service + frontend | 🟡 Medium | LLM returns condensed version of selected document | ✅ Done |

---

## 🚀 Sprint 3 — Courses + Coding Tracker + Skill Tree

**Status**: ✅ Complete
**Started**: 2026-05-27
**Completed**: 2026-05-28
**Progress**: 8 / 8 tasks complete (100%)

| # | Task | Service | Priority | Acceptance Criteria | Status |
|---|---|---|---|---|---|
| 1 | Course entity: modules, lessons, drip-unlock logic | course-service | 🟡 Medium | Modules unlock sequentially on completion | ✅ Done |
| 2 | Course enrollment and progress tracking | course-service | 🟡 Medium | Enrollment stored, progress % computed | ✅ Done |
| 3 | Coding practice list CRUD | practice-service | 🟡 Medium | Create / read / update / delete practice lists | ✅ Done |
| 4 | Solve status tracking (Unsolved / Attempted / Solved) | practice-service | 🟡 Medium | Status persists per problem per user | ✅ Done |
| 5 | Skill Tree data model (nodes, prerequisites, unlock) | gamification-service | 🟢 Low | Node unlocks when all prerequisite nodes completed | ✅ Done |
| 6 | Skill Tree visual UI (DAG graph) | frontend | 🟢 Low | Interactive DAG with locked/unlocked node states | ✅ Done |
| 7 | Assignment submission endpoint | assignment-service | 🟢 Low | Submission stored, AI grading triggered via Kafka | ✅ Done |
| 8 | AI auto-grading for assignments | ai-service | 🟢 Low | LLM grades submission against rubric, returns score + feedback | ✅ Done |

---

## 🚀 Sprint 4 — Gamification + Analytics + Polish

**Status**: ✅ Complete
**Started**: 2026-05-28
**Completed**: 2026-05-28
**Progress**: 9 / 9 tasks complete (100%)

| # | Task | Service | Priority | Acceptance Criteria | Status | Completed On | Notes |
|---|---|---|---|---|---|---|---|
| 1 | XP points system (events → XP rules engine) | gamification-service | 🟢 Low | XP awarded on quiz, flashcard, module completion | ✅ | 2026-05-28 | Synced balance writes to global leaderboard |
| 2 | Badge award logic and gallery UI | gamification-service + frontend | 🟢 Low | Badges auto-awarded when conditions met | ✅ | 2026-05-28 | Evaluates XP, cards, quizzes, streaks duplicates |
| 3 | Streak tracking (daily activity) | user-service | 🟢 Low | Streak increments on daily login or activity | ✅ | 2026-05-28 | Timezone-aware streak calendar tracking |
| 4 | Timed quiz battle mode | gamification-service | 🟢 Low | Two users compete on same quiz set with timer | ✅ | 2026-05-28 | Dual score resolution with duration tie-breakers |
| 5 | Analytics dashboard data aggregation | analytics-service | 🟡 Medium | Aggregates scores, time-on-topic, drop-off from Kafka events | ✅ | 2026-05-28 | Chronic backgrounds summarization DDL upserts |
| 6 | Analytics dashboard UI (Recharts) | frontend | 🟡 Medium | Charts: time series, bar charts, topic breakdown | ✅ | 2026-05-28 | AreaChart, BarChart and Cell master breakdown |
| 7 | In-app notifications (Kafka-driven) | notification-service | 🟢 Low | Notifications appear on badge earn, graded assignment | ✅ | 2026-05-28 | Stateless reactive WebFlux Redis SSE stream |
| 8 | Tutor panel (course creation, assignment management) | frontend | 🟢 Low | Tutor can create/edit courses and assignments | ✅ | 2026-05-28 | Modules locking, AI rubric evaluator grading |
| 9 | Admin panel (user management) | frontend | 🟢 Low | Admin can view all users and roles | ✅ | 2026-05-28 | Roles PATCH modifications dropdown & terminations |

---

## 🧪 Integration Testing

**Status**: ✅ Complete
**Target**: 2026-07-28
**Progress**: 6 / 6 tasks complete (100%)

| # | Test Scenario | Services Involved | Pass Criteria | Status | Completed On | Notes |
|---|---|---|---|---|---|---|
| 1 | Upload → parse → embed → RAG query | notebook, ai | Accurate answer from uploaded doc only | ✅ Complete | 2026-05-29 | Validated with DocumentIngestionIT using postgres & MinIO |
| 2 | Login → enroll → complete module → unlock next | auth, course, gamification | Module 2 unlocks after module 1 completed | ✅ Complete | 2026-05-29 | Validated sequential unlocks with CourseProgressionIT |
| 3 | Quiz attempt → weak spot flagged → resurface | quiz | Weak topic reappears in next session | ✅ Complete | 2026-05-29 | Validated weak spots tracking with QuizWeakSpotIT |
| 4 | Activity → XP awarded → badge triggered → notification sent | gamification, user, notification | Full Kafka event chain verified | ✅ Complete | 2026-05-29 | Verified via integration Kafka event triggers |
| 5 | JWT validation, role enforcement at gateway | auth, gateway | STUDENT cannot access TUTOR-only endpoints | ✅ Complete | 2026-05-29 | Validated edge routing with GatewaySecurityIT |
| 6 | Load test: document ingestion pipeline | notebook, ai, chromadb | 10 concurrent uploads complete without failure | ✅ Complete | 2026-05-29 | Simulated parallel uploads in DocumentLoadTestIT |

---

## 🐛 Bug Fixing & Polish

**Status**: ✅ Complete
**Target**: 2026-07-30
**Progress**: 6 / 6 tasks complete (100%)

| # | Task | Priority | Completed On | Notes |
|---|---|---|---|---|
| 1 | Fix all P0/P1/P2/P3 bugs from integration testing | 🔴 High | 2026-05-29 | Secure perimeter, rotating keys, SSE param auth, eslint compiler and build fixed, strict typed validations, AI ingestion uploads secured |
| 2 | UI polish: responsiveness, loading states, error handling | 🟡 Medium | 2026-05-29 | Clean React state updates, dynamic base URLs, error fallbacks |
| 3 | Performance optimization: slow queries, cache tuning | 🟡 Medium | 2026-05-29 | Idempotency filters prevent redundant DB write workloads |
| 4 | Accessibility review (ARIA labels, keyboard nav) | 🟢 Low | 2026-05-29 | Standard components ARIA and form validations aligned |
| 5 | Finalize Docker Compose for demo environment | 🔴 High | 2026-05-29 | All services isolated behind Gateway on internal bridge DNS networks |
| 6 | Write README and setup guide | 🟡 Medium | 2026-05-29 | Full project setup instructions and detailed walkthrough documented |

---

## 🎓 Final Submission / Demo

**Status**: ⏳ Pending
**Target**: 2026-07-31
**Progress**: 0 / 4 tasks

| # | Task | Priority |
|---|---|---|
| 1 | Prepare demo script and walkthrough | 🔴 High |
| 2 | Record demo video | 🔴 High |
| 3 | Finalize project report / documentation | 🔴 High |
| 4 | Submit capstone project | 🔴 High |

---

## 📊 Sprint Velocity Log

| Sprint | Planned Tasks | Completed | Carry Over | Notes |
|---|---|---|---|---|
| Phase 1 — Requirements | 28 | 28 | 0 | ✅ Complete |
| Phase 2 — Design | 14 | 14 | 0 | ✅ Complete |
| Phase 3 — Infrastructure | 13 | 13 | 0 | ✅ Complete |
| Sprint 1 | 10 | 10 | 0 | ✅ Complete |
| Sprint 2 | 8 | 8 | 0 | ✅ Complete |
| Sprint 3 | 8 | 8 | 0 | ✅ Complete |
| Sprint 4 | 9 | 9 | 0 | ✅ Complete |
| Testing | 6 | 6 | 0 | ✅ Complete |
| Polish | 6 | 0 | — | Not started |
| Demo | 4 | 0 | — | Not started |

---

## 🗒️ Decision Log

| Date | Decision | Rationale |
|---|---|---|
| 2026-05-22 | Ollama for all AI (fully local) | Zero token cost, no data leaves machine |
| 2026-05-22 | MinIO instead of AWS S3 | Keep storage local during development |
| 2026-05-22 | LangChain4j for RAG | Native Java, no Python dependency |
| 2026-05-22 | ChromaDB as vector store | Lightweight, easy local Docker setup |
| 2026-05-22 | SM-2 algorithm for spaced repetition | Industry standard, well-documented, proven |
| 2026-05-22 | Monorepo (single Git repo, all services) | Easier for solo dev — one clone, shared Compose |
| 2026-05-22 | Schema-per-service PostgreSQL isolation | Microservice principle — no cross-service DB joins |
| 2026-05-22 | llama3.2:3b as primary LLM | Fits 16GB RAM; mistral:7b as fallback |
| 2026-05-22 | nomic-embed-text for embeddings | Local, fast, good quality for RAG |
| 2026-05-22 | RS256 JWT (asymmetric) | Gateway validates without calling auth service |

---

## ⚠️ Risks & Blockers

| Risk | Severity | Status | Mitigation |
|---|---|---|---|
| llama3.2:3b quality on complex tasks | 🟡 Medium | Monitoring | Test with mistral:7b fallback |
| RAG hallucination within closed domain | 🔴 High | Active | Strict system prompts + source citation in response |
| Kafka complexity for solo dev | 🟡 Medium | Planned | Use sync REST for non-critical paths initially; add Kafka later |
| Scope creep (11 features) | 🔴 High | Active | MoSCoW prioritization enforced per sprint |
| ChromaDB data loss on restart | 🟢 Low | Planned | Named Docker volumes in Compose |
| Intel Arc GPU not supported by Ollama | 🟡 Medium | Active | CPU mode confirmed working; slower but functional |
| 16GB RAM under pressure with all services | 🟡 Medium | Active | Close non-essential apps; start services selectively |

---

## 📌 MoSCoW Priority Reference

| Priority | Features |
|---|---|
| 🔴 **Must Have** | Auth, Document Upload, RAG Q&A, Flashcards (SM-2), Quiz (MCQ/fill/short), Weak Spot Detection |
| 🟡 **Should Have** | Summarize & Simplify, Coding Practice Tracker, Analytics Dashboard, Pre-Built Courses |
| 🟢 **Could Have** | Skill Tree, Assignment System, Gamification (XP/Badges/Streaks), Timed Quiz Battles |
| ⚫ **Won't Have (v1)** | Multi-user collaboration, Mobile app, External LMS integrations |

---

## 🔌 Kafka Topics Reference

| Topic | Producer | Consumers | Payload |
|---|---|---|---|
| `user.registered` | auth-service | user-service, notification-service | userId, email, role |
| `document.uploaded` | notebook-service | ai-service | documentId, minioPath, notebookId |
| `document.embedded` | ai-service | notebook-service | documentId, chunkCount, collectionId |
| `document.deleted` | notebook-service | ai-service | documentId, notebookId, collectionId |
| `quiz.completed` | quiz-service | analytics-service, gamification-service | userId, quizId, score, wrongTopics, challengeId |
| `flashcard.reviewed` | flashcard-service | analytics-service, gamification-service | userId, cardId, rating, nextReview |
| `assignment.submitted` | assignment-service | assignment-service | submissionId, assignmentId, userId, content, rubric |
| `assignment.graded` | ai-service | assignment-service, notification-service | submissionId, userId, grade, feedback |
| `module.completed` | course-service | gamification-service, analytics-service | userId, courseId, moduleId |
| `challenge.accepted` | gamification-service | notification-service | challengeId, challengerId, opponentId |
| `challenge.rejected` | gamification-service | notification-service | challengeId, challengerId, opponentId |
| `challenge.completed` | gamification-service | gamification-service, analytics-service, notification-service | challengeId, challengerId, opponentId, winnerId |
| `practice.solved` | practice-service | gamification-service, analytics-service | userId, itemId, listId, difficulty |
| `xp.awarded` | gamification-service | user-service | userId, amount, reason |
| `badge.earned` | gamification-service | user-service, notification-service | userId, badgeId |
| `notification.dispatch` | notebook-service, gamification-service | notification-service | userId, title, body, type, refId |

---

## 🏷️ Service Port Registry

| Service | Port | URL |
|---|---|---|
| API Gateway | 8080 | http://localhost:8080 |
| Eureka Discovery | 8761 | http://localhost:8761 |
| Config Server | 8888 | http://localhost:8888 |
| Auth Service | 8081 | http://localhost:8081 |
| User Service | 8082 | http://localhost:8082 |
| Notebook Service | 8083 | http://localhost:8083 |
| Quiz Service | 8084 | http://localhost:8084 |
| Flashcard Service | 8085 | http://localhost:8085 |
| Course Service | 8086 | http://localhost:8086 |
| Assignment Service | 8087 | http://localhost:8087 |
| Practice Service | 8088 | http://localhost:8088 |
| AI Service | 8089 | http://localhost:8089 |
| Gamification Service | 8090 | http://localhost:8090 |
| Analytics Service | 8091 | http://localhost:8091 |
| Notification Service | 8092 | http://localhost:8092 |
| Frontend (Vite) | 5173 | http://localhost:5173 |
| PostgreSQL | 5432 | localhost:5432 |
| Redis | 6379 | localhost:6379 |
| Kafka | 9092 | localhost:9092 |
| ChromaDB | 8000 | http://localhost:8000 |
| MinIO | 9000 / 9001 | http://localhost:9001 (console) |
| Ollama | 11434 | http://localhost:11434 |
| Zipkin | 9411 | http://localhost:9411 |
| Prometheus | 9090 | http://localhost:9090 |
| Grafana | 3000 | http://localhost:3000 |

---

*Last Updated: 2026-05-29 | Integration Testing: ✅ Complete | Next: Move to Bug Fixing & Polish*