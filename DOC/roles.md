# Questly — User Roles & Permissions Matrix

> **Completed**: 2026-05-22
> **Author**: Manju (Solo Developer)

---

| Resource / Action | STUDENT | TUTOR | ADMIN |
|---|---|---|---|
| **Auth** | | | |
| Register / Login | ✅ | ✅ | ✅ |
| Refresh token | ✅ | ✅ | ✅ |
| Delete own account | ✅ | ✅ | ✅ |
| **Notebook** | | | |
| Upload documents | ✅ | ✅ | ✅ |
| View own notebooks | ✅ | ✅ | ✅ |
| Delete own documents | ✅ | ✅ | ✅ |
| Query RAG (own notebook) | ✅ | ✅ | ✅ |
| View other students' notebooks | ❌ | ❌ | ✅ |
| **Quiz** | | | |
| Generate quiz from own notebook | ✅ | ✅ | ✅ |
| Attempt quiz | ✅ | ❌ | ❌ |
| View own quiz history | ✅ | ❌ | ✅ |
| View all students' quiz results | ❌ | ✅ | ✅ |
| **Flashcard** | | | |
| Generate flashcards | ✅ | ✅ | ✅ |
| Review flashcards | ✅ | ❌ | ❌ |
| View own review history | ✅ | ❌ | ✅ |
| **Course** | | | |
| Browse courses | ✅ | ✅ | ✅ |
| Enroll in course | ✅ | ❌ | ❌ |
| Create course | ❌ | ✅ | ✅ |
| Edit own course | ❌ | ✅ | ✅ |
| Delete any course | ❌ | ❌ | ✅ |
| View enrolled students | ❌ | ✅ | ✅ |
| **Assignment** | | | |
| Create assignment | ❌ | ✅ | ✅ |
| Submit assignment | ✅ | ❌ | ❌ |
| View own submission + grade | ✅ | ❌ | ✅ |
| View all submissions | ❌ | ✅ | ✅ |
| **Practice** | | | |
| Create practice list | ✅ | ❌ | ❌ |
| Update solve status | ✅ | ❌ | ❌ |
| View own practice lists | ✅ | ❌ | ✅ |
| **Skill Tree** | | | |
| View skill tree | ✅ | ✅ | ✅ |
| Unlock nodes (via activity) | ✅ | ❌ | ❌ |
| Edit skill tree structure | ❌ | ❌ | ✅ |
| **Gamification** | | | |
| Earn XP / badges | ✅ | ❌ | ❌ |
| View own XP / badges | ✅ | ✅ | ✅ |
| View leaderboard | ✅ | ✅ | ✅ |
| Join challenge mode | ✅ | ❌ | ❌ |
| **Analytics** | | | |
| View own dashboard | ✅ | ❌ | ✅ |
| View per-student analytics | ❌ | ✅ | ✅ |
| View platform-wide analytics | ❌ | ❌ | ✅ |
| **User Management** | | | |
| View own profile | ✅ | ✅ | ✅ |
| Edit own profile | ✅ | ✅ | ✅ |
| View all users | ❌ | ❌ | ✅ |
| Change user roles | ❌ | ❌ | ✅ |
| Suspend / delete users | ❌ | ❌ | ✅ |
