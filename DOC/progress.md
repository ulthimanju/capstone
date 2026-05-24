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
| Completed | 28 |
| In Progress | 0 |
| Pending | 84 |
| Overall Completion | 25.0% |

---

## 🗓️ Project Timeline Overview

| Phase | Status | Target | Tasks Done | Tasks Total | Completion |
|---|---|---|---|---|---|
| 📌 Phase 1 — Requirements Gathering | ✅ Complete | 2026-05-24 | 28 | 28 | 100% |
| 🏗️ Phase 2 — System Design & Architecture | ⏳ Pending | 2026-06-07 | 0 | 14 | 0% |
| 🔧 Phase 3 — Core Infrastructure Setup | ⏳ Pending | 2026-06-14 | 0 | 13 | 0% |
| 🚀 Sprint 1 — Auth + Upload + RAG | ⏳ Pending | 2026-06-28 | 0 | 10 | 0% |
| 🚀 Sprint 2 — Flashcards + Quiz + Weak Spot | ⏳ Pending | 2026-07-10 | 0 | 8 | 0% |
| 🚀 Sprint 3 — Courses + Practice + Skill Tree | ⏳ Pending | 2026-07-18 | 0 | 8 | 0% |
| 🚀 Sprint 4 — Gamification + Analytics + Polish | ⏳ Pending | 2026-07-25 | 0 | 9 | 0% |
| 🧪 Integration Testing | ⏳ Pending | 2026-07-28 | 0 | 6 | 0% |
| 🐛 Bug Fixing & Polish | ⏳ Pending | 2026-07-30 | 0 | 6 | 0% |
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

### 🔄 In Progress

*No tasks currently in progress.*

---

### ⏳ To Do

#### 📄 Core Documentation

*All tasks completed — see SRS.md.*

---

#### 👥 User Stories (Per Feature)

> Format: *As a [student], I want to [action] so that [benefit].*
> Each story needs: Story + Acceptance Criteria + Priority + Estimation

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

> 📖 Full story details → see [stories.md](./stories.md)

#### 🗂️ Data Modeling

| # | Task | Status | Notes |
|---|---|---|---|
| 24 | Draft Entity-Relationship Diagram (ERD) | ✅ Done | All 18 core entities defined |
| 25 | Define PostgreSQL schema per service | ✅ Done | Schema-per-service isolation — 11 services |
| 26 | Define ChromaDB collection structure | ✅ Done | Collection naming, metadata, dimensions |

> 🗂️ Full schema details → see [data_modeling.md](./data_modeling.md)

---

#### 🔌 API Planning

| # | Task | Status | Notes |
|---|---|---|---|
| 27 | Draft REST endpoint list per service | ✅ Done | 11 services — REST contracts defined |
| 28 | Define Kafka topic list and event schemas | ✅ Done | 12 topics, full event schemas |

> 🔌 Full API contracts + Kafka schemas → see [api_planning.md](./api_planning.md)

---

#### 📐 Design

| # | Task | Status | Notes |
|---|---|---|---|
| — | Create low-fidelity wireframes for key screens | ⏳ Pending | 10 screens — AI prompts written, images to be generated externally |
| — | Define UI component inventory | ✅ Done | 73 components across 15 categories |

> 📐 Full component inventory → see [UI_component_inventory.md](./UI_component_inventory.md)

---

## 🏗️ Phase 2 — System Design & Architecture

> **Goal**: Translate requirements into a concrete technical blueprint covering all services, communication, and data flows.

**Status**: ⏳ Pending
**Target**: 2026-06-07
**Progress**: 0 / 14 tasks complete

| # | Task | Priority | Output |
|---|---|---|---|
| 1 | Define microservice boundaries (responsibility per service) | 🔴 High | Service responsibility doc |
| 2 | Design inter-service communication (REST vs Kafka per case) | 🔴 High | Communication matrix |
| 3 | Design Spring Cloud Gateway routing rules | 🔴 High | Gateway config YAML |
| 4 | Design Eureka service registry setup | 🟡 Medium | Eureka config |
| 5 | Design JWT auth flow (issue → validate → refresh → revoke) | 🔴 High | Sequence diagram |
| 6 | Design Google OAuth2 login flow | 🟡 Medium | Sequence diagram |
| 7 | Design RAG pipeline (upload → parse → chunk → embed → store → retrieve → generate) | 🔴 High | Pipeline diagram |
| 8 | Design SM-2 spaced repetition scheduling logic | 🟡 Medium | Algorithm spec |
| 9 | Design Kafka event flow diagrams | 🟡 Medium | Event flow diagrams |
| 10 | Finalize PostgreSQL schema (all services) | 🔴 High | SQL DDL scripts |
| 11 | Design Redis caching strategy | 🟡 Medium | Cache key design doc |
| 12 | Design skill tree unlock logic (prerequisite DAG) | 🟡 Medium | Algorithm spec |
| 13 | Design XP rules engine (event → XP mapping) | 🟡 Medium | Rules table |
| 14 | Create Low-Level Design (LLD) document | 🔴 High | LLD.md |

---

## 🔧 Phase 3 — Core Infrastructure Setup

> **Goal**: Bootstrap all services so development can begin immediately with a working local environment.

**Status**: ⏳ Pending
**Target**: 2026-06-14
**Progress**: 0 / 13 tasks complete

| # | Task | Priority | Verification |
|---|---|---|---|
| 1 | Initialize Git monorepo structure | 🔴 High | `git log` shows initial commit |
| 2 | Set up React 19 + Vite frontend project | 🔴 High | `npm run dev` runs on :5173 |
| 3 | Set up Spring Boot parent POM (multi-module Maven) | 🔴 High | `mvn clean install` passes |
| 4 | Configure Docker Compose (PostgreSQL, Redis, Kafka, ChromaDB, MinIO, Ollama, Zipkin) | 🔴 High | `docker compose up` all healthy |
| 5 | Set up Spring Cloud Config Server | 🟡 Medium | Config server on :8888 |
| 6 | Set up Spring Cloud Eureka Server | 🔴 High | Eureka dashboard on :8761 |
| 7 | Set up Spring Cloud Gateway | 🔴 High | Gateway on :8080 routes correctly |
| 8 | Configure RS256 JWT issuer and validator | 🔴 High | Token issued and validated end-to-end |
| 9 | Set up GitHub Actions CI pipeline | 🟡 Medium | PR triggers build + test |
| 10 | Configure Prometheus + Grafana | 🟢 Low | Metrics visible on :3000 |
| 11 | Set up Zipkin + Micrometer tracing | 🟢 Low | Traces visible on :9411 |
| 12 | Verify Ollama models running | 🔴 High | `ollama list` shows all 4 models |
| 13 | Verify full local stack startup | 🔴 High | All services UP in Docker Compose |

---

## 🚀 Sprint 1 — Auth + Document Upload + RAG Core

**Status**: ⏳ Pending
**Target**: 2026-06-28
**Progress**: 0 / 10 tasks

| # | Task | Service | Priority | Acceptance Criteria |
|---|---|---|---|---|
| 1 | User registration + login (JWT) | auth-service | 🔴 High | POST /auth/register and /auth/login return valid JWT |
| 2 | Google OAuth2 login | auth-service | 🟡 Medium | OAuth flow completes, JWT returned |
| 3 | Role-based access control | gateway | 🔴 High | STUDENT/TUTOR/ADMIN roles enforced at gateway |
| 4 | Document upload (PDF, MD, TXT) via MinIO | notebook-service | 🔴 High | File stored in MinIO, metadata in PostgreSQL |
| 5 | Google Drive API integration (Docs, Slides) | notebook-service | 🟡 Medium | Google Doc URL fetched and parsed |
| 6 | Document parsing with Apache Tika | ai-service | 🔴 High | Raw text extracted from all supported formats |
| 7 | Chunking + embedding via nomic-embed-text | ai-service | 🔴 High | Chunks stored in ChromaDB with metadata |
| 8 | Closed-domain RAG query endpoint | ai-service | 🔴 High | Query returns answer grounded only in uploaded docs |
| 9 | Frontend: Login page | frontend | 🔴 High | Login + register forms functional |
| 10 | Frontend: Document upload UI | frontend | 🔴 High | Upload UI with format validation + progress indicator |

---

## 🚀 Sprint 2 — Flashcards + Quiz + Weak Spot

**Status**: ⏳ Pending
**Target**: 2026-07-10
**Progress**: 0 / 8 tasks

| # | Task | Service | Priority | Acceptance Criteria |
|---|---|---|---|---|
| 1 | AI flashcard generation from document content | flashcard-service | 🔴 High | LLM generates Q&A pairs from notebook chunks |
| 2 | SM-2 spaced repetition scheduling engine | flashcard-service | 🔴 High | Next review date computed based on rating (1–5) |
| 3 | Flashcard review UI (flip animation, rating) | frontend | 🔴 High | Card flips on click, 4-button rating updates schedule |
| 4 | Quiz generation (MCQ, fill-in-blank, short answer) | quiz-service | 🔴 High | LLM generates valid question sets from notebook |
| 5 | Quiz attempt tracking and scoring | quiz-service | 🔴 High | Score persisted per attempt, wrong topics recorded |
| 6 | Weak spot detection logic | quiz-service | 🔴 High | Topics with >2 wrong attempts flagged and resurfaced |
| 7 | Weak spot review session UI | frontend | 🟡 Medium | Dedicated review mode filters weak-spot questions |
| 8 | Summarize & Simplify endpoint + UI | ai-service + frontend | 🟡 Medium | LLM returns condensed version of selected document |

---

## 🚀 Sprint 3 — Courses + Coding Tracker + Skill Tree

**Status**: ⏳ Pending
**Target**: 2026-07-18
**Progress**: 0 / 8 tasks

| # | Task | Service | Priority | Acceptance Criteria |
|---|---|---|---|---|
| 1 | Course entity: modules, lessons, drip-unlock logic | course-service | 🟡 Medium | Modules unlock sequentially on completion |
| 2 | Course enrollment and progress tracking | course-service | 🟡 Medium | Enrollment stored, progress % computed |
| 3 | Coding practice list CRUD | practice-service | 🟡 Medium | Create / read / update / delete practice lists |
| 4 | Solve status tracking (Unsolved / Attempted / Solved) | practice-service | 🟡 Medium | Status persists per problem per user |
| 5 | Skill Tree data model (nodes, prerequisites, unlock) | gamification-service | 🟢 Low | Node unlocks when all prerequisite nodes completed |
| 6 | Skill Tree visual UI (DAG graph) | frontend | 🟢 Low | Interactive DAG with locked/unlocked node states |
| 7 | Assignment submission endpoint | assignment-service | 🟢 Low | Submission stored, AI grading triggered via Kafka |
| 8 | AI auto-grading for assignments | ai-service | 🟢 Low | LLM grades submission against rubric, returns score + feedback |

---

## 🚀 Sprint 4 — Gamification + Analytics + Polish

**Status**: ⏳ Pending
**Target**: 2026-07-25
**Progress**: 0 / 9 tasks

| # | Task | Service | Priority | Acceptance Criteria |
|---|---|---|---|---|
| 1 | XP points system (events → XP rules engine) | gamification-service | 🟢 Low | XP awarded on quiz, flashcard, module completion |
| 2 | Badge award logic and gallery UI | gamification-service + frontend | 🟢 Low | Badges auto-awarded when conditions met |
| 3 | Streak tracking (daily activity) | user-service | 🟢 Low | Streak increments on daily login or activity |
| 4 | Timed quiz battle mode | gamification-service | 🟢 Low | Two users compete on same quiz set with timer |
| 5 | Analytics dashboard data aggregation | analytics-service | 🟡 Medium | Aggregates scores, time-on-topic, drop-off from Kafka events |
| 6 | Analytics dashboard UI (Recharts) | frontend | 🟡 Medium | Charts: time series, bar charts, topic breakdown |
| 7 | In-app notifications (Kafka-driven) | notification-service | 🟢 Low | Notifications appear on badge earn, graded assignment |
| 8 | Tutor panel (course creation, assignment management) | frontend | 🟢 Low | Tutor can create/edit courses and assignments |
| 9 | Admin panel (user management) | frontend | 🟢 Low | Admin can view all users and roles |

---

## 🧪 Integration Testing

**Status**: ⏳ Pending
**Target**: 2026-07-28
**Progress**: 0 / 6 tasks

| # | Test Scenario | Services Involved | Pass Criteria |
|---|---|---|---|
| 1 | Upload → parse → embed → RAG query | notebook, ai | Accurate answer from uploaded doc only |
| 2 | Login → enroll → complete module → unlock next | auth, course, gamification | Module 2 unlocks after module 1 completed |
| 3 | Quiz attempt → weak spot flagged → resurface | quiz | Weak topic reappears in next session |
| 4 | Activity → XP awarded → badge triggered → notification sent | gamification, user, notification | Full Kafka event chain verified |
| 5 | JWT validation, role enforcement at gateway | auth, gateway | STUDENT cannot access TUTOR-only endpoints |
| 6 | Load test: document ingestion pipeline | notebook, ai, chromadb | 10 concurrent uploads complete without failure |

---

## 🐛 Bug Fixing & Polish

**Status**: ⏳ Pending
**Target**: 2026-07-30
**Progress**: 0 / 6 tasks

| # | Task | Priority |
|---|---|---|
| 1 | Fix all P0/P1 bugs from integration testing | 🔴 High |
| 2 | UI polish: responsiveness, loading states, error handling | 🟡 Medium |
| 3 | Performance optimization: slow queries, cache tuning | 🟡 Medium |
| 4 | Accessibility review (ARIA labels, keyboard nav) | 🟢 Low |
| 5 | Finalize Docker Compose for demo environment | 🔴 High |
| 6 | Write README and setup guide | 🟡 Medium |

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
| Phase 2 — Design | 14 | 0 | — | Not started |
| Phase 3 — Infrastructure | 13 | 0 | — | Not started |
| Sprint 1 | 10 | 0 | — | Not started |
| Sprint 2 | 8 | 0 | — | Not started |
| Sprint 3 | 8 | 0 | — | Not started |
| Sprint 4 | 9 | 0 | — | Not started |
| Testing | 6 | 0 | — | Not started |
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
| `quiz.completed` | quiz-service | analytics-service, gamification-service | userId, quizId, score, wrongTopics |
| `flashcard.reviewed` | flashcard-service | analytics-service, gamification-service | userId, cardId, rating, nextReview |
| `assignment.submitted` | assignment-service | ai-service | submissionId, content, rubric |
| `assignment.graded` | ai-service | assignment-service, notification-service | submissionId, grade, feedback |
| `module.completed` | course-service | gamification-service, analytics-service | userId, courseId, moduleId |
| `challenge.completed` | gamification-service | user-service, notification-service | userId, challengeId, result |
| `practice.solved` | practice-service | gamification-service, analytics-service | userId, problemId, status |
| `xp.awarded` | gamification-service | user-service | userId, amount, reason |
| `badge.earned` | gamification-service | user-service, notification-service | userId, badgeId |

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

*Last Updated: 2026-05-24 | Phase 1: ✅ Complete | Next: Phase 2 — System Design & Architecture*