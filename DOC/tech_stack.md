## Questly — Tech Stack (Updated)

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
| LLM Runtime | OpenRouter (Cloud) |
| Model | google/gemini-2.5-flash |
| RAG Framework | LangChain4j |
| Vector Store | ChromaDB |
| Embeddings | HuggingFace Inference API (`BAAI/bge-small-en-v1.5`) |
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
| CI/CD | GitHub Actions |
| Monitoring | Prometheus + Grafana |

## Models Usage

| Purpose | Model | Location | Cost |
|---|---|---|---|
| Main LLM (chat, quiz, summarize) | `google/gemini-2.5-flash` | OpenRouter (Cloud) | Free Tier |
| Embeddings (RAG / ChromaDB) | `BAAI/bge-small-en-v1.5` (384-dim) | HuggingFace (Cloud) | Free Tier |

---

> Everything AI-related runs via cloud-based API endpoints (OpenRouter and HuggingFace) using free-tier models. This removes any high local RAM/GPU requirements. S3 is replaced with MinIO to keep storage local.
