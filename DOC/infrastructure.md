# Questly — Monorepo Structure

```
questly/
├── services/
│   ├── gateway/
│   ├── auth-service/
│   ├── user-service/
│   ├── notebook-service/
│   ├── quiz-service/
│   ├── flashcard-service/
│   ├── course-service/
│   ├── assignment-service/
│   ├── practice-service/
│   ├── ai-service/
│   ├── gamification-service/
│   ├── analytics-service/
│   ├── notification-service/
│   ├── config-server/
│   ├── discovery-server/
│   └── logs/            <-- Contains microservice runtime stdout/stderr logs and process PID files
├── frontend/
├── DOC/
│   ├── LLD.md
│   └── schema/
│       └── *.sql
├── infra/
│   ├── docker-compose.yml
│   ├── kafka/
│   ├── postgres/
│   └── redis/
├── .github/
│   └── workflows/
└── README.md
```

---

Each service has:
- Own `pom.xml`
- Own `application.yml`
- Own `Dockerfile`
- Own database schema

The `services/logs/` directory contains active standard output files and `.pid` tracking files for service orchestrator lifecycle mapping.

Root has a parent `pom.xml` managing all services together.
