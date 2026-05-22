## Capestone — Tech Stack (Updated)

---

### Frontend
| Layer | Technology |
|---|---|
| Framework | React 19 + Vite |
| Styling | Tailwind CSS v4 |
| State Management | Zustand |
| Server State | TanStack Query |
| Routing | React Router v7 |
| PDF Viewer | react-pdf |
| Charts | Recharts |
| Rich Text | TipTap |

---

### Backend
| Layer | Technology |
|---|---|
| Framework | Spring Boot 3.x |
| Language | Java 21 |
| API Gateway | Spring Cloud Gateway |
| Service Discovery | Spring Cloud Eureka |
| Config Management | Spring Cloud Config |
| Messaging | Apache Kafka |
| Tracing | Zipkin + Micrometer |

---

### AI / RAG
| Layer | Technology |
|---|---|
| LLM Runtime | Ollama (local) |
| Model | Llama 3.2 / Mistral / Gemma 3 |
| RAG Framework | LangChain4j |
| Vector Store | ChromaDB |
| Embeddings | Ollama `nomic-embed-text` (local) |
| Document Parsing | Apache Tika |
| Google Docs/Slides | Google Drive API |

---

### Data
| Layer | Technology |
|---|---|
| Primary Database | PostgreSQL |
| Cache | Redis |
| Vector Database | ChromaDB |
| Object Storage | MinIO (local) |
| Search | Elasticsearch |

---

### Auth & Security
| Layer | Technology |
|---|---|
| Authentication | RS256 JWT |
| Social Login | Google OAuth2 |
| Roles | STUDENT, TUTOR, ADMIN |

---

### DevOps
| Layer | Technology |
|---|---|
| Containerization | Docker + Docker Compose |
| Orchestration | Kubernetes |
| CI/CD | GitHub Actions |
| Monitoring | Prometheus + Grafana |

## Models Usage

| Purpose | Model | Size | RAM Needed |
|---|---|---|---|
| Main LLM (chat, quiz, summarize) | `llama3.2:3b` | ~2 GB | ~4–5 GB |
| Embeddings (RAG / ChromaDB) | `nomic-embed-text` | ~274 MB | ~1 GB |
| Code understanding (optional) | `qwen2.5-coder:3b` | ~2 GB | ~4 GB |

---

> Everything AI-related runs fully local via Ollama — no external API calls, no cost per token, no data leaving the machine. S3 replaced with MinIO to keep storage local as well.
