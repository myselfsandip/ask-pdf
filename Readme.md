# AskPDF — RAG-Powered Document Q&A System

AskPDF is a **Retrieval-Augmented Generation (RAG)** application that allows users to upload PDF documents and interact with them through a conversational AI interface.

Instead of relying on the LLM's general knowledge, AskPDF retrieves relevant content from the uploaded document and uses it as context for generating answers. This helps keep responses **grounded in the document and reduces hallucinations**.

---

## ✨ Features

- 📄 **PDF Upload** — Supports PDF documents up to **20 MB**
- 🔍 **Semantic Search** — Retrieves relevant document chunks using vector embeddings
- 💬 **Conversational Q&A** — Ask natural-language questions about uploaded documents
- ⚡ **Asynchronous Processing** — PDF processing is handled by a separate Redis worker
- 📡 **Real-Time Streaming** — Streams generated answers to the client
- 🛡️ **Hallucination Mitigation** — Uses similarity thresholding before sending context to the LLM
- 📊 **Job Tracking** — Tracks document-processing progress through Redis
- 🧹 **Failure Cleanup** — Automatically cleans up incomplete database records when background processing fails

---

## 🏗️ Architecture

```text
                        ┌──────────────────┐
                        │     Frontend     │
                        └────────┬─────────┘
                                 │
                                 │ Upload PDF
                                 ▼
                        ┌──────────────────┐
                        │    Node.js API   │
                        └────────┬─────────┘
                                 │
                    ┌────────────┴────────────┐
                    │                         │
                    ▼                         ▼
             MongoDB                  Redis Queue
          Document Metadata          Async Job Queue
                                          │
                                          ▼
                                 ┌──────────────────┐
                                 │  Redis Worker    │
                                 └────────┬─────────┘
                                          │
                         ┌────────────────┼────────────────┐
                         ▼                ▼                ▼
                       Parse            Chunk            Embed
                         │                │                │
                         └────────────────┼────────────────┘
                                          ▼
                                   Vector Index
                                          │
                                          ▼
                                   Semantic Search
                                          │
                                          ▼
                                  Relevant Context
                                          │
                                          ▼
                                    Gemini API
                                          │
                                          ▼
                                  Streaming Response
```

---

## 🔄 Document Processing Pipeline

PDF processing is decoupled from the API server and executed asynchronously through a Redis-backed worker.

```text
PDF Upload
    │
    ▼
Parse
    │
    ▼
Chunk
    │
    ▼
Generate Embeddings
    │
    ▼
Index Vectors
    │
    ▼
Ready for Search
```

The processing pipeline consists of **5 stages**:

| Stage      | Description                                         |
| ---------- | --------------------------------------------------- |
| **Parse**  | Extract text and metadata from the uploaded PDF     |
| **Chunk**  | Split extracted text into smaller searchable chunks |
| **Embed**  | Generate 768-dimensional vector embeddings          |
| **Index**  | Store embeddings for semantic retrieval             |
| **Search** | Retrieve the most relevant chunks for a user query  |

---

## ⚙️ Asynchronous Processing

PDF processing can be computationally expensive, so the API does not process the document synchronously.

When a user uploads a PDF:

```text
Client
  │
  │ POST /documents
  ▼
API Server
  │
  ├── Store document metadata
  ├── Create processing job
  └── Push job to Redis
          │
          ▼
      HTTP 202
          │
          │
          ▼
     Redis Worker
          │
          └── Process PDF asynchronously
```

The API immediately responds with **`202 Accepted`**, allowing the client to continue without waiting for the entire document-processing pipeline to finish.

The worker consumes jobs using Redis's **blocking `BRPOP` queue operation**.

---

## 📊 Job Status Tracking

Processing state is maintained in Redis Hashes using `HSET`.

Example lifecycle:

```text
UPLOADED
    ↓
PROCESSING
    ↓
COMPLETED
```

If processing fails:

```text
PROCESSING
    ↓
FAILED
```

This allows the client to monitor long-running document processing without keeping the initial upload request open.

---

## 🧠 RAG Pipeline

When a user asks a question, AskPDF follows a retrieval-first approach:

```text
User Question
      │
      ▼
Generate Query Embedding
      │
      ▼
Vector Similarity Search
      │
      ▼
Retrieve Relevant Chunks
      │
      ▼
Similarity Threshold
      │
      ├── Relevant ──────► Gemini
      │                       │
      │                       ▼
      │                 Streaming Answer
      │
      └── Not Relevant ──► Reject / No Answer
```

Only sufficiently relevant chunks are passed to the LLM.

AskPDF uses a **similarity cutoff of ≥ 0.7** to reduce the possibility of generating answers from weak or unrelated context.

---

## 🛡️ Hallucination Mitigation

The system is designed around the principle:

> **If the document does not provide sufficiently relevant context, don't generate an answer from unrelated knowledge.**

Before generating a response:

1. Convert the user's question into an embedding.
2. Perform semantic vector search.
3. Retrieve the most relevant document chunks.
4. Apply a similarity threshold of **0.7**.
5. Reject low-relevance results.
6. Send only relevant document context to Gemini.
7. Stream the generated response back to the client.

This retrieval layer provides an additional safeguard against unsupported answers.

---

## 🧹 Failure Handling & State Cleanup

Because document processing happens asynchronously, failures can occur after the API request has already returned.

AskPDF handles this by maintaining processing state across the API, Redis, and MongoDB.

If a worker fails during processing, the system performs cleanup to prevent:

- Orphaned MongoDB document records
- Stale processing jobs
- Inconsistent document states
- Documents remaining permanently stuck in `PROCESSING`

This keeps the persistent state synchronized with the actual processing lifecycle.

---

## 🛠️ Tech Stack

| Technology            | Purpose                                 |
| --------------------- | --------------------------------------- |
| **Node.js**           | Backend runtime                         |
| **Express.js**        | REST API                                |
| **MongoDB**           | Document metadata and conversation data |
| **Redis**             | Job queue and processing state          |
| **Gemini API**        | LLM-powered answer generation           |
| **Vector Embeddings** | Semantic document retrieval             |
| **RAG**               | Context-grounded question answering     |

---

## 🚀 Key Backend Concepts Demonstrated

AskPDF focuses heavily on backend and distributed-system concepts:

- REST API design
- Asynchronous job processing
- Redis-based background workers
- Blocking queue operations with `BRPOP`
- Redis Hashes with `HSET`
- HTTP `202 Accepted` workflow
- Vector similarity search
- Embedding generation
- Retrieval-Augmented Generation
- LLM context grounding
- Similarity thresholding
- Streaming responses
- MongoDB state management
- Failure handling and cleanup
- Decoupled API and worker architecture

---

## 📁 High-Level Project Structure

```text
askpdf/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── workers/
│   │   ├── models/
│   │   ├── config/
│   │   └── index.ts
│   │
│   └── package.json
│
└── frontend/
    ├── app/
    ├── components/
    └── package.json
```

---

## 🔌 API Workflow

### Upload Document

```http
POST /api/documents
Content-Type: multipart/form-data
```

The API:

1. Validates the uploaded PDF.
2. Creates the document record.
3. Creates a background processing job.
4. Pushes the job to Redis.
5. Returns immediately with `202 Accepted`.

Example response:

```json
{
  "success": true,
  "documentId": "document_id",
  "jobId": "job_id"
}
```

---

### Document Processing

The Redis worker consumes the queued job and processes the PDF through:

```text
Parse → Chunk → Embed → Index → Complete
```

The processing status is updated throughout the lifecycle.

---

### Ask a Question

```http
POST /api/chat
```

The backend:

```text
Question
   ↓
Embedding
   ↓
Vector Search
   ↓
Similarity Filtering
   ↓
Relevant Context
   ↓
Gemini
   ↓
Streaming Response
```

---

## 📌 Design Decisions

### Why asynchronous PDF processing?

PDF parsing, chunking, embedding generation, and vector indexing can take significantly longer than a normal API request.

Using a background worker allows the API to remain responsive while processing happens independently.

### Why Redis?

Redis provides a lightweight mechanism for:

- Queue management
- Background jobs
- Job state
- Fast temporary data access

### Why RAG?

A standard LLM can answer using information outside the uploaded document.

RAG introduces a retrieval layer so the model receives relevant document content as context before generating the response.

### Why similarity thresholding?

Not every retrieved vector is necessarily relevant to the user's question.

A similarity threshold helps prevent weak matches from being treated as reliable context.

---

## 🔮 Future Improvements

- [ ] Multiple document collections
- [ ] Document deletion and re-indexing
- [ ] Improved chunking strategies
- [ ] Streaming job progress
- [ ] Redis retry and dead-letter queues
- [ ] Worker concurrency controls
- [ ] Rate limiting and usage quotas
- [ ] Persistent vector database
- [ ] Dockerized production deployment
- [ ] Observability and worker metrics

---

## 🎯 Project Goal

AskPDF was built to explore how a production-oriented backend can combine:

**REST APIs + asynchronous workers + Redis + vector search + RAG + LLM streaming**

into a single document-processing system.

The primary focus is on **backend architecture, asynchronous processing, reliability, and AI-powered retrieval**, rather than simply building a chatbot UI.
