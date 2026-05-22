# Capestone — Monorepo Structure

```
capestone/
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
│   └── discovery-server/
├── frontend/
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

Root has a parent `pom.xml` managing all services together.
