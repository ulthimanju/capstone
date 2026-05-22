# 📋 Capestone — Agile Progress Tracker

> **Methodology**: Adapted Agile (Solo Developer)
> **Sprint Length**: 1–1.5 weeks (compressed for July 31 deadline)
> **Start Date**: 2026-05-22
> **Developer**: Solo

---

## 🗓️ Project Timeline Overview

| Phase | Status | Target Completion |
|---|---|---|
| 📌 Requirements Gathering | 🔄 In Progress | 2026-05-31 |
| 🏗️ System Design & Architecture | ⏳ Pending | 2026-06-07 |
| 🔧 Core Infrastructure Setup | ⏳ Pending | 2026-06-14 |
| 🚀 Feature Development — Sprint 1 | ⏳ Pending | 2026-06-28 |
| 🚀 Feature Development — Sprint 2 | ⏳ Pending | 2026-07-10 |
| 🚀 Feature Development — Sprint 3 | ⏳ Pending | 2026-07-18 |
| 🚀 Feature Development — Sprint 4 | ⏳ Pending | 2026-07-25 |
| 🧪 Integration Testing | ⏳ Pending | 2026-07-28 |
| 🐛 Bug Fixing & Polish | ⏳ Pending | 2026-07-30 |
| 🎓 Final Submission / Demo | ⏳ Pending | 2026-07-31 |

---

## 📌 Phase 1 — Requirements Gathering

> **Goal**: Fully define what Capestone must do, for whom, and under what constraints before a single line of code is written.

**Status**: 🔄 In Progress
**Started**: 2026-05-22
**Target**: 2026-05-31

---

### ✅ Completed

- [x] Write project abstract
- [x] Define key features (11 core features identified)
- [x] Select and document tech stack (Frontend, Backend, AI/RAG, Data, Auth, DevOps)
- [x] Define high-level architecture (HLD.png)
- [x] Define problem statement
- [x] Define infrastructure design

---

### 🔄 In Progress

- [ ] Define user roles and permissions matrix (STUDENT, TUTOR, ADMIN)
- [ ] Write detailed user stories for each feature

---

### ⏳ To Do

#### 📄 Documentation
- [ ] Write full Software Requirements Specification (SRS)
- [ ] Define non-functional requirements (performance, scalability, security)
- [ ] Define system constraints and assumptions
- [ ] Define out-of-scope items explicitly

#### 👥 User Stories (Per Feature)
- [ ] **Document Upload & RAG Knowledge Base** — user story + acceptance criteria
- [ ] **AI Flashcard Generation** — user story + acceptance criteria
- [ ] **Quiz Me Mode** — user story + acceptance criteria
- [ ] **Weak Spot Detection** — user story + acceptance criteria
- [ ] **Summarize & Simplify** — user story + acceptance criteria
- [ ] **Pre-Built Courses** — user story + acceptance criteria
- [ ] **Coding Practice Tracker** — user story + acceptance criteria
- [ ] **Skill Tree** — user story + acceptance criteria
- [ ] **Gamification (XP, Badges, Streaks)** — user story + acceptance criteria
- [ ] **Analytics Dashboard** — user story + acceptance criteria
- [ ] **Assignment System** — user story + acceptance criteria

#### 🗂️ Data Modeling
- [ ] Draft Entity-Relationship Diagram (ERD)
- [ ] Define PostgreSQL schema for core entities (User, Document, Course, Quiz, etc.)
- [ ] Define ChromaDB collection structure for embeddings

#### 🔌 API Planning
- [ ] Draft API contract outline (REST endpoints per service)
- [ ] Define Kafka topic list and event schemas

#### 📐 Design
- [ ] Create low-fidelity wireframes for key screens
- [ ] Define UI component inventory

---

## 🏗️ Phase 2 — System Design & Architecture

> **Goal**: Translate requirements into a concrete technical blueprint. Define all microservices, their responsibilities, and how they communicate.

**Status**: ⏳ Pending
**Target**: 2026-06-07

### ⏳ To Do

- [ ] Define microservice list and responsibility boundaries
- [ ] Design inter-service communication (REST vs Kafka per use case)
- [ ] Design Spring Cloud Gateway routing rules
- [ ] Design Spring Cloud Eureka service registry setup
- [ ] Define Docker Compose service map (local dev)
- [ ] Design JWT auth flow (issue, validate, refresh)
- [ ] Design Google OAuth2 login flow
- [ ] Design RAG pipeline (upload → parse → embed → store → retrieve → generate)
- [ ] Design spaced repetition (SM-2) scheduling logic
- [ ] Design Kafka event flow diagrams (async operations)
- [ ] Finalize PostgreSQL schema (per microservice)
- [ ] Design Redis caching strategy (sessions, hot data)
- [ ] Create detailed Low-Level Design (LLD) document

---

## 🔧 Phase 3 — Core Infrastructure Setup

> **Goal**: Bootstrap all services, infrastructure, and tooling so development can begin immediately with a working local environment.

**Status**: ⏳ Pending
**Target**: 2026-06-14

### ⏳ To Do

- [ ] Initialize Git monorepo structure
- [ ] Set up React 19 + Vite frontend project
- [ ] Set up Spring Boot parent POM (multi-module Maven project)
- [ ] Configure Docker Compose (PostgreSQL, Redis, Kafka, ChromaDB, MinIO, Ollama, Zipkin)
- [ ] Set up Spring Cloud Config Server
- [ ] Set up Spring Cloud Eureka Server
- [ ] Set up Spring Cloud Gateway
- [ ] Configure RS256 JWT issuer and validator
- [ ] Set up GitHub Actions CI pipeline (build + test)
- [ ] Configure Prometheus + Grafana dashboards
- [ ] Set up Zipkin + Micrometer tracing
- [ ] Pull and verify Ollama models (`llama3.2:3b`, `nomic-embed-text`)
- [ ] Verify full local environment startup (Docker Compose up)

---

## 🚀 Feature Development Sprints

### Sprint 1 — Auth + Document Upload + RAG Core

**Status**: ⏳ Pending | **Target**: 2026-06-28

#### ⏳ Backlog
- [ ] User registration & login (JWT)
- [ ] Google OAuth2 login
- [ ] Role-based access control (STUDENT, TUTOR, ADMIN)
- [ ] Document upload (PDF, Markdown, .txt) via MinIO
- [ ] Google Drive API integration (Docs, Slides)
- [ ] Document parsing with Apache Tika
- [ ] Chunking + embedding with `nomic-embed-text` via Ollama
- [ ] Storing embeddings in ChromaDB
- [ ] Closed-domain RAG query endpoint (LangChain4j)
- [ ] Basic frontend: Login page, Document upload UI

---

### Sprint 2 — Flashcards + Quiz + Weak Spot

**Status**: ⏳ Pending | **Target**: 2026-07-10

#### ⏳ Backlog
- [ ] AI flashcard generation from document content
- [ ] SM-2 spaced repetition scheduling engine
- [ ] Flashcard review UI (flip animation, rating buttons)
- [ ] Quiz generation (MCQ, fill-in-blank, short answer)
- [ ] Quiz attempt tracking and scoring
- [ ] Weak spot detection logic (low-score topic resurface)
- [ ] Weak spot review session UI
- [ ] Summarize & Simplify endpoint + UI

---

### Sprint 3 — Courses + Coding Tracker + Skill Tree

**Status**: ⏳ Pending | **Target**: 2026-07-18

#### ⏳ Backlog
- [ ] Course entity (modules, lessons, drip-unlock logic)
- [ ] Course enrollment and progress tracking
- [ ] Coding practice list CRUD (LeetCode-style)
- [ ] Solve status tracking (Unsolved, Attempted, Solved)
- [ ] Skill Tree data model (nodes, prerequisites, unlock state)
- [ ] Skill Tree visual UI (DAG visualization)
- [ ] Assignment submission endpoint
- [ ] AI auto-grading for assignments

---

### Sprint 4 — Gamification + Analytics + Polish

**Status**: ⏳ Pending | **Target**: 2026-07-25

#### ⏳ Backlog
- [ ] XP points system (events → XP rules engine)
- [ ] Badge award logic and badge gallery UI
- [ ] Streak tracking (daily activity)
- [ ] Timed quiz battle mode
- [ ] Analytics dashboard (time-on-topic, scores, drop-off)
- [ ] Recharts integration for analytics visualizations
- [ ] Notifications (Kafka-driven, in-app)
- [ ] Admin panel (user management, content moderation)
- [ ] Tutor panel (course creation, assignment management)

---

## 🧪 Integration Testing

**Status**: ⏳ Pending | **Target**: 2026-07-28

- [ ] End-to-end test: Upload → RAG → Quiz flow
- [ ] End-to-end test: Enrollment → Module unlock → Completion
- [ ] End-to-end test: XP earn → Badge award → Streak update
- [ ] Load test: Document ingestion pipeline (Apache Tika + ChromaDB)
- [ ] Security test: JWT validation, role enforcement
- [ ] API contract tests (Spring Cloud Contract or REST Assured)

---

## 🐛 Bug Fixing & Polish

**Status**: ⏳ Pending | **Target**: 2026-07-30

- [ ] Fix all P0/P1 bugs from integration testing
- [ ] UI polish: responsiveness, loading states, error handling
- [ ] Performance optimization: slow queries, cache tuning
- [ ] Accessibility review (ARIA labels, keyboard navigation)
- [ ] Finalize Docker Compose for demo environment
- [ ] Write README and setup guide

---

## 🎓 Final Submission / Demo

**Status**: ⏳ Pending | **Target**: 2026-07-31

- [ ] Prepare demo script and walkthrough
- [ ] Record demo video
- [ ] Finalize project report / documentation
- [ ] Submit capstone project

---

## 📊 Sprint Velocity Log

> Track actual vs estimated effort each sprint to improve future estimates.

| Sprint | Planned Tasks | Completed Tasks | Notes |
|---|---|---|---|
| Requirements | — | — | In progress |
| Design | — | — | — |
| Infrastructure | — | — | — |
| Sprint 1 | — | — | — |
| Sprint 2 | — | — | — |
| Sprint 3 | — | — | — |
| Sprint 4 | — | — | — |

---

## 🗒️ Decision Log

> Record key technical and design decisions with rationale to avoid revisiting them.

| Date | Decision | Rationale |
|---|---|---|
| 2026-05-22 | Use Ollama for all AI (fully local) | Zero token cost, no data leaves machine |
| 2026-05-22 | MinIO instead of AWS S3 | Keep storage local during development |
| 2026-05-22 | LangChain4j for RAG | Native Java integration with Spring Boot |
| 2026-05-22 | ChromaDB as vector store | Lightweight, easy local setup |
| 2026-05-22 | SM-2 algorithm for spaced repetition | Industry-standard, well-documented |

---

## ⚠️ Risks & Blockers

| Risk | Severity | Mitigation |
|---|---|---|
| Ollama LLM quality on 3B models | Medium | Test with multiple models; fallback to Mistral |
| RAG hallucination within closed domain | High | Strict prompt constraints + source citation |
| Kafka complexity for solo dev | Medium | Use sync REST for non-critical paths initially |
| Scope creep (11 features is large) | **Critical** | Strict MoSCoW; defer Could Have items aggressively — only 10 weeks total |
| Compressed timeline (July 31 deadline) | **Critical** | No buffer weeks; any blocker must be resolved same day |
| ChromaDB persistence across restarts | Low | Use named volumes in Docker Compose |

---

## 📌 MoSCoW Priority Reference

| Priority | Features |
|---|---|
| **Must Have** | Auth, Document Upload, RAG QA, Flashcards, Quiz, Weak Spot |
| **Should Have** | Summarize, Coding Tracker, Analytics Dashboard, Courses |
| **Could Have** | Skill Tree, Assignments, Gamification |
| **Won't Have (v1)** | Timed Quiz Battles, Multi-user collaboration |

---

*Last Updated: 2026-05-22 | Phase: Requirements Gathering | End Date: 2026-07-31*

