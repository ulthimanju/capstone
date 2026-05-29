# Questly Bug Report

Last updated: 2026-05-29

Scope: static review of the current repository plus available verification commands. This is a bug backlog for issues found in code, configuration, docs, and local verification. It should replace the overly optimistic "everything complete" view in `DOC/progress.md` until these items are fixed and re-tested.

## Verification Summary

| Check | Result | Notes |
|---|---|---|
| `npm run lint` in `frontend/` | Failed | 32 errors and 3 warnings. Main groups are missing Node globals in ESLint, unused variables/imports, and React hooks/compiler rule violations. |
| `npm run build` in `frontend/` | Failed | Vite/Rolldown cannot resolve `react-is` from Recharts. |
| `mvn test -DskipITs` at repo root | Not run | Maven failed immediately because `JAVA_HOME` is invalid and `java` is not installed in this shell environment. |

## P0 - Release Blockers

### BUG-P0-01 - Gateway blocks valid student course and assignment POST flows

Status: Open

Evidence:
- `services/gateway/src/main/java/com/questly/gateway/config/SecurityConfig.java:40`
- `services/gateway/src/main/java/com/questly/gateway/config/SecurityConfig.java:45`
- `services/course-service/src/main/java/com/questly/course/controller/CourseController.java:92`
- `services/course-service/src/main/java/com/questly/course/controller/CourseController.java:110`
- `services/assignment-service/src/main/java/com/questly/assignment/controller/AssignmentController.java:52`

Problem:
The gateway restricts every `POST /api/courses/**` and every `POST /api/assignments/**` to `TUTOR` or `ADMIN`. That also catches student routes:
- `POST /api/courses/{id}/enroll`
- `POST /api/courses/{id}/modules/{moduleId}/complete`
- `POST /api/assignments/{id}/submit`

Impact:
Students cannot enroll in courses, complete modules, or submit assignments through the gateway.

Suggested fix:
Use specific authorization rules before broad tutor/admin rules. Only course creation/update/delete and tutor submission listing should require tutor/admin. Enrollment, module completion, and assignment submission should allow authenticated students.

### BUG-P0-02 - User administration endpoints are available to any authenticated user

Status: Open

Evidence:
- `services/gateway/src/main/java/com/questly/gateway/config/SecurityConfig.java:52`
- `services/user-service/src/main/java/com/questly/user/controller/UserController.java:75`
- `services/user-service/src/main/java/com/questly/user/controller/UserController.java:81`
- `services/user-service/src/main/java/com/questly/user/controller/UserController.java:92`

Problem:
The gateway does not restrict `/api/users/**` admin routes by role, and `UserController` does not check `X-User-Role` for list, role update, or delete.

Impact:
Any logged-in user can list all profiles, change roles in `user-service`, or delete a user profile.

Suggested fix:
Add gateway role rules for admin-only `/api/users`, `/api/users/{id}/role`, and `/api/users/{id}` delete. Also enforce role checks inside `user-service` as defense in depth.

### BUG-P0-03 - Direct service ports allow identity and role header spoofing

Status: Open

Evidence:
- `services/user-service/src/main/java/com/questly/user/controller/UserController.java:98`
- `services/course-service/src/main/java/com/questly/course/controller/CourseController.java:135`
- `services/assignment-service/src/main/java/com/questly/assignment/controller/AssignmentController.java:83`
- `docker-compose.yml:193`
- `docker-compose.yml:215`
- `docker-compose.yml:237`
- `docker-compose.yml:288`
- `docker-compose.yml:309`
- `docker-compose.yml:333`
- `docker-compose.yml:354`
- `docker-compose.yml:375`
- `docker-compose.yml:396`
- `docker-compose.yml:417`
- `docker-compose.yml:438`

Problem:
Most services trust `X-User-Id` and `X-User-Role` headers, but Docker Compose publishes each backend service directly on the host. A caller can bypass the gateway and send forged identity headers.

Impact:
Authorization and ownership checks can be bypassed in local/demo deployments.

Suggested fix:
Expose only the gateway and frontend to the host. Keep backend service ports internal to the Compose network, or validate JWTs in every service instead of trusting headers.

### BUG-P0-04 - Admin role changes and deletes do not affect real auth state

Status: Open

Evidence:
- `services/user-service/src/main/java/com/questly/user/service/UserService.java:168`
- `services/user-service/src/main/java/com/questly/user/service/UserService.java:174`
- `services/auth-service/src/main/java/com/questly/auth/service/AuthService.java:69`
- `services/auth-service/src/main/java/com/questly/auth/config/JwtConfig.java:110`
- `services/auth-service/src/main/java/com/questly/auth/service/AuthService.java:180`

Problem:
The admin UI calls user-service role/delete endpoints, but login and JWT role claims are sourced from `auth-service.users`. Updating or deleting only `user_profiles` does not update auth roles, revoke tokens, delete auth records, or prevent login.

Impact:
The admin panel can show that a user was promoted, demoted, or deleted while the user can still log in and receive JWTs with the old role.

Suggested fix:
Move role and suspension authority into `auth-service`, or publish a reliable user-admin event consumed by auth-service. Add token revocation or refresh-token deletion for suspensions.

### BUG-P0-05 - JWT private key is committed in config

Status: Open

Evidence:
- `services/config-server/src/main/resources/config/application.yml:40`
- `services/auth-service/src/main/java/com/questly/auth/config/JwtConfig.java:43`

Problem:
The RS256 private key is stored in source-controlled YAML.

Impact:
Anyone with repo access can sign valid tokens for any user and role. Treat the current key as compromised.

Suggested fix:
Generate a new key pair. Store private key material in environment variables or a secret manager. Keep only the public key in non-secret config.

## P1 - High Priority Bugs

### BUG-P1-01 - Docker Kafka configuration is incomplete for event-driven services

Status: Open

Evidence:
- `docker-compose.yml:199`
- `docker-compose.yml:221`
- `services/config-server/src/main/resources/config/user-service.yml:13`
- `services/config-server/src/main/resources/config/analytics-service.yml:13`
- `services/config-server/src/main/resources/config/notification-service.yml:13`
- `services/quiz-service/src/main/java/com/questly/quiz/config/KafkaProducerConfig.java:19`
- `services/flashcard-service/src/main/java/com/questly/flashcard/config/KafkaProducerConfig.java:19`
- `services/course-service/src/main/java/com/questly/course/config/KafkaProducerConfig.java:19`
- `services/assignment-service/src/main/java/com/questly/assignment/config/KafkaProducerConfig.java:19`
- `services/practice-service/src/main/java/com/questly/practice/config/KafkaProducerConfig.java:19`

Problem:
Only auth-service and user-service get `SPRING_KAFKA_BOOTSTRAP_SERVERS=kafka:29092` in Compose. Many producers and consumers either fall back to `localhost:9092` or have no service-specific Kafka config. Inside containers, `localhost:9092` points at the service container, not Kafka.

Impact:
Quiz completion, flashcard review, module completion, practice solved, assignment grading, gamification, analytics, and notifications can silently fail or never fire in Docker.

Suggested fix:
Set `SPRING_KAFKA_BOOTSTRAP_SERVERS=kafka:29092` for every service that produces or consumes Kafka messages, or move the Docker-safe value into config-server profiles.

### BUG-P1-02 - User-service Kafka deserialization is incompatible with mixed listener payload types

Status: Open

Evidence:
- `services/config-server/src/main/resources/config/user-service.yml:20`
- `services/config-server/src/main/resources/config/user-service.yml:21`
- `services/user-service/src/main/java/com/questly/user/kafka/UserRegisteredConsumer.java:22`
- `services/user-service/src/main/java/com/questly/user/kafka/UserEventConsumer.java:25`
- `services/user-service/src/main/java/com/questly/user/kafka/UserEventConsumer.java:64`
- `services/auth-service/src/main/java/com/questly/auth/config/KafkaProducerConfig.java:28`

Problem:
The user-service consumer default value type is `UserRegisteredEvent`, while the same application also has listeners that accept raw `String` for learning and XP events. Producers disable type headers, so non-user-registration topics may be deserialized as the wrong type before they reach the `String` listeners.

Impact:
Streak and XP updates in user-service can fail at the Kafka listener boundary.

Suggested fix:
Use separate listener container factories per payload type, restore type headers, or deserialize all user-service Kafka payloads as strings and map manually by topic.

### BUG-P1-03 - Notification SSE authentication does not work through the frontend/gateway

Status: Open

Evidence:
- `frontend/src/hooks/useNotificationSSE.js:16`
- `frontend/src/hooks/useNotificationSSE.js:18`
- `frontend/vite.config.js:6`
- `services/notification-service/src/main/java/com/questly/notification/controller/NotificationController.java:83`
- `services/notification-service/src/main/java/com/questly/notification/controller/NotificationController.java:84`

Problem:
The frontend uses browser `EventSource` with `/api/notifications/stream?token=...`, but:
- `EventSource` cannot set an `Authorization` header.
- The gateway security expects a Bearer token header, not a `token` query param.
- Vite has no `/api` proxy, so the relative URL targets the frontend origin in dev.
- The notification service expects `X-User-Id`, which is only added by the gateway after JWT validation.

Impact:
Real-time notifications are likely not received by the browser.

Suggested fix:
Use an SSE polyfill/fetch stream that can send `Authorization`, add a dev proxy to `http://localhost:8080`, or implement a secure gateway filter that maps a query token only for the SSE endpoint.

### BUG-P1-04 - Frontend production build fails because `react-is` is missing

Status: Open

Evidence:
- `frontend/package.json:8`
- `frontend/package.json:19`
- `frontend/package-lock.json:3097`

Problem:
`npm run build` fails with: Vite/Rolldown cannot resolve import `react-is` from Recharts. `react-is` appears as a Recharts peer requirement but is not a direct dependency in `frontend/package.json`.

Impact:
The frontend cannot produce a production build.

Suggested fix:
Install a compatible `react-is` version as a direct frontend dependency, then rerun `npm run build`.

### BUG-P1-05 - Frontend lint is failing across multiple files

Status: Open

Evidence:
- `frontend/eslint.config.js:16`
- `frontend/playwright.config.js:6`
- `frontend/src/App.jsx:18`
- `frontend/src/components/ui/Button.jsx:39`
- `frontend/src/pages/AdminPanelPage.jsx:15`
- `frontend/src/pages/CourseViewerPage.jsx:62`
- `frontend/src/pages/QuizzesPage.jsx:94`

Problem:
`npm run lint` reports 32 errors and 3 warnings. The largest groups are:
- Playwright config uses `process`, but ESLint config only declares browser globals.
- Several unused imports and variables exist.
- React hooks/compiler rules flag synchronous state writes in effects and functions accessed before declaration.
- `Button.jsx` declares a component inside render.

Impact:
CI/lint quality gate fails, and some flagged patterns can cause stale closures or cascading renders.

Suggested fix:
Add Node globals for config files, remove unused code, move nested components out of render, and refactor effects/functions to satisfy React 19 lint rules.

### BUG-P1-06 - Course module completion can award duplicate XP

Status: Open

Evidence:
- `services/course-service/src/main/java/com/questly/course/model/Enrollment.java:41`
- `services/course-service/src/main/java/com/questly/course/service/CourseService.java:156`
- `services/course-service/src/main/java/com/questly/course/service/CourseService.java:187`
- `services/course-service/src/main/java/com/questly/course/service/CourseService.java:217`
- `services/gamification-service/src/main/java/com/questly/gamification/service/GamificationService.java:110`
- `services/gamification-service/src/main/java/com/questly/gamification/service/GamificationKafkaConsumer.java:193`

Problem:
Enrollment stores unlocked modules but not completed modules. `completeModule` calculates progress from the completed module's order index and publishes `module.completed` every time the endpoint is called for an unlocked module.

Impact:
A user can call the same module completion endpoint repeatedly and trigger repeated module-completed events and XP awards.

Suggested fix:
Track completed module IDs per enrollment, make completion idempotent, and publish `module.completed` only on the first successful completion of a module.

### BUG-P1-07 - Analytics platform endpoint is marked admin-only in code comments but not enforced

Status: Open

Evidence:
- `services/gateway/src/main/java/com/questly/gateway/config/SecurityConfig.java:50`
- `services/gateway/src/main/java/com/questly/gateway/config/SecurityConfig.java:52`
- `services/analytics-service/src/main/java/com/questly/analytics/controller/AnalyticsController.java:185`
- `services/analytics-service/src/main/java/com/questly/analytics/controller/AnalyticsController.java:186`

Problem:
The gateway restricts `/api/analytics/students/**`, but `/api/analytics/platform` falls through to any authenticated user. The controller comment says it is admin-only, but there is no role check.

Impact:
Any authenticated user can read global platform analytics.

Suggested fix:
Add gateway and service-level role checks for `/api/analytics/platform`.

### BUG-P1-08 - Dev-only Google mock login is exposed as a public auth endpoint

Status: Open

Evidence:
- `services/auth-service/src/main/java/com/questly/auth/controller/AuthController.java:76`
- `services/auth-service/src/main/java/com/questly/auth/controller/AuthController.java:78`
- `services/auth-service/src/main/java/com/questly/auth/service/AuthService.java:123`
- `frontend/src/pages/LoginPage.jsx:235`

Problem:
`POST /api/auth/google/mock` is public and creates/logs in a user from provided name/email. The comment says it is dev-only, but there is no profile guard or config flag.

Impact:
Anyone can create accounts without real OAuth verification if this endpoint is deployed.

Suggested fix:
Guard the endpoint behind a `dev` profile or remove it from production/demo builds. Implement real OAuth before marking Google login complete.

## P2 - Medium Priority Bugs

### BUG-P2-01 - Server-side upload type validation is missing

Status: Open

Evidence:
- `frontend/src/components/ui/DocumentUploadZone.jsx:5`
- `frontend/src/components/ui/DocumentUploadZone.jsx:28`
- `services/notebook-service/src/main/java/com/questly/notebook/controller/DocumentController.java:22`
- `services/notebook-service/src/main/java/com/questly/notebook/service/IngestionService.java:43`
- `services/notebook-service/src/main/java/com/questly/notebook/service/IngestionService.java:176`

Problem:
The frontend restricts uploads to PDF/MD/TXT, but the backend accepts any multipart file and falls back to `TXT` for unknown formats.

Impact:
Clients can bypass frontend validation and upload unsupported files into MinIO and the AI pipeline.

Suggested fix:
Validate file extension, MIME type, non-empty content, and size in `notebook-service` before storing. Return `400` for unsupported files.

### BUG-P2-02 - Login/register password rules disagree

Status: Open

Evidence:
- `frontend/src/pages/LoginPage.jsx:199`
- `frontend/src/pages/LoginPage.jsx:378`
- `services/auth-service/src/main/java/com/questly/auth/dto/RegisterRequest.java:14`

Problem:
The frontend accepts and labels passwords as minimum 6 characters, while the backend requires minimum 8 characters.

Impact:
Users can pass frontend validation and still get backend validation failure.

Suggested fix:
Align the frontend validation and text with the backend's 8-character rule.

### BUG-P2-03 - Auth login, refresh, logout, and Google mock request bodies lack validation

Status: Open

Evidence:
- `services/auth-service/src/main/java/com/questly/auth/controller/AuthController.java:40`
- `services/auth-service/src/main/java/com/questly/auth/controller/AuthController.java:50`
- `services/auth-service/src/main/java/com/questly/auth/controller/AuthController.java:60`
- `services/auth-service/src/main/java/com/questly/auth/controller/AuthController.java:79`
- `services/auth-service/src/main/java/com/questly/auth/dto/LoginRequest.java:5`

Problem:
Only register uses `@Valid`. Login, refresh, logout, and Google mock accept nullable/blank fields. Some invalid requests can fall into service logic and produce generic errors or unexpected null handling.

Impact:
Poor API behavior and harder-to-handle frontend errors for malformed auth requests.

Suggested fix:
Add DTO validation annotations and use `@Valid` on every auth request body. Replace raw `Map<String, String>` bodies for refresh/logout with typed DTOs.

### BUG-P2-04 - Assignment service local development course-service URL defaults to Docker DNS

Status: Open

Evidence:
- `services/assignment-service/src/main/java/com/questly/assignment/config/AiServiceClient.java:14`
- `services/config-server/src/main/resources/config/assignment-service.yml:12`

Problem:
`course-service.base-url` is not configured in `assignment-service.yml`; the Java default is `http://course-service:8086`, which works in Compose DNS but not when running services locally from the host.

Impact:
Assignment listing can fail in local non-Docker development because `course-service` will not resolve.

Suggested fix:
Add `course-service.base-url` to config-server with environment overrides for local vs Docker.

### BUG-P2-05 - Hardcoded frontend API base URL prevents environment-specific deployments

Status: Open

Evidence:
- `frontend/src/api/axiosClient.js:4`

Problem:
The frontend hardcodes `http://localhost:8080`.

Impact:
The app needs source edits or rebuild hacks for Docker, LAN demo, hosted preview, or alternate gateway ports.

Suggested fix:
Read the API base URL from `import.meta.env.VITE_API_BASE_URL`, with a local default.

### BUG-P2-06 - Tokens are persisted in localStorage

Status: Open

Evidence:
- `frontend/src/store/useAuthStore.js:15`
- `frontend/src/store/useAuthStore.js:31`

Problem:
Access and refresh tokens are persisted through Zustand localStorage middleware.

Impact:
Any XSS vulnerability can read long-lived refresh tokens.

Suggested fix:
Prefer httpOnly secure cookies for refresh tokens. If localStorage is kept for capstone simplicity, document the risk and shorten refresh-token lifetime.

### BUG-P2-07 - Progress tracker claims completed work that current checks do not support

Status: Open

Evidence:
- `DOC/progress.md:16`
- `DOC/progress.md:35`
- `DOC/progress.md:157`
- `DOC/progress.md:181`
- `DOC/progress.md:264`

Problem:
`DOC/progress.md` marks integration testing, role-based access control, and Maven install as complete, but current review found failed frontend lint/build, unverified backend tests, and P0 authorization bugs.

Impact:
Project status is misleading for demo readiness and final submission planning.

Suggested fix:
Update `DOC/progress.md` after this bug report is triaged. Mark bug fixing active and integration testing incomplete until P0/P1 bugs are fixed and checks pass.

## P3 - Cleanup / Quality Issues

### BUG-P3-01 - Frontend uses blocking `alert()` in user workflows

Status: Open

Evidence:
- `frontend/src/pages/QuizzesPage.jsx:117`
- `frontend/src/pages/QuizzesPage.jsx:147`
- `frontend/src/pages/FlashcardsPage.jsx:70`
- `frontend/src/pages/PracticePage.jsx:96`
- `frontend/src/pages/CourseViewerPage.jsx:123`
- `frontend/src/pages/CoursesPage.jsx:71`
- `frontend/src/pages/TutorPanelPage.jsx:74`

Problem:
Several production workflows use blocking browser alerts for errors and confirmations.

Impact:
UX is inconsistent with the app's toast/error-state components and can interrupt workflows.

Suggested fix:
Use existing `Toast`, inline error states, or modal confirmation components.

### BUG-P3-02 - Debug logging remains in frontend runtime paths

Status: Open

Evidence:
- `frontend/src/hooks/useNotificationSSE.js:48`
- `frontend/src/pages/DashboardPage.jsx:300`
- `frontend/src/pages/ComponentShowcasePage.jsx:487`

Problem:
Debug `console.log` calls remain in runtime code.

Impact:
Noisy browser console and possible accidental data exposure during demos.

Suggested fix:
Remove debug logs or guard them behind a development-only logger.

### BUG-P3-03 - Service credentials use default local passwords

Status: Open

Evidence:
- `docker-compose.yml:14`
- `docker-compose.yml:87`
- `docker-compose.yml:88`
- `services/config-server/src/main/resources/config/application.yml:26`
- `services/config-server/src/main/resources/config/notebook-service.yml:18`
- `services/config-server/src/main/resources/config/notebook-service.yml:19`

Problem:
Postgres and MinIO credentials are fixed defaults in Compose/config.

Impact:
Acceptable for isolated local-only development, but unsafe for shared demos or any network-exposed environment.

Suggested fix:
Move credentials to `.env` or secret injection and document local defaults separately.

### BUG-P3-04 - Backend verification is blocked by missing Java in the current shell

Status: Open

Evidence:
- `mvn test -DskipITs` failed before running tests with `JAVA_HOME environment variable is not defined correctly`.
- `java -version` failed with `java: command not found`.

Problem:
The current environment cannot run Maven tests.

Impact:
Backend test pass/fail state cannot be trusted from this machine until Java 21 is installed and `JAVA_HOME` is fixed.

Suggested fix:
Install Java 21 in the shell environment used for development, set `JAVA_HOME`, then run `mvn test -DskipITs` and `mvn verify`.

## Recommended Fix Order

1. Fix P0 gateway authorization and admin user endpoint exposure.
2. Stop direct service port/header spoofing in Docker.
3. Move JWT private key out of source control and rotate it.
4. Fix Docker Kafka bootstrap configuration for all event-driven services.
5. Fix frontend production build by adding `react-is`.
6. Fix notification SSE auth/proxy flow.
7. Make course module completion idempotent.
8. Clean frontend lint errors.
9. Re-run backend tests with Java 21 available.
10. Update `DOC/progress.md` to reflect the verified state.
