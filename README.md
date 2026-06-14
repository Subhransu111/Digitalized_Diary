# Cyber Diary

<div align="center">

**Digital investigation management, AI-assisted case intake, evidence tracking, and analytics for cybercrime workflows.**

[Live Demo](https://digitalized-diary.vercel.app)

`React` `Vite` `Express` `MongoDB` `Auth0` `Google Gemini` `Recharts`

</div>

---

## Overview

Cyber Diary is a full-stack case diary platform for managing cyber investigation records from first intake to case review. It combines structured case creation, witness and seizure records, evidence uploads, QR-backed evidence logs, Auth0-secured API access, AI-assisted extraction, semantic search, and supervisor analytics.

The project is split into:

| Area | Location | Purpose |
| --- | --- | --- |
| Backend API | `/` | Express API, MongoDB models, Auth0 JWT protection, uploads, analytics, Gemini services |
| Frontend app | `/Frontend` | React/Vite interface for officers, dashboards, case archives, dossiers, and case intake |
| Serverless entry | `/api/index.js` | Vercel-compatible API entry point |

## Key Features

### Secure Case Workflow

- Create complete case profiles with case number, title, description, officer identity, witnesses, seizures, key facts, evidence logs, and supporting evidence files.
- View each investigation as a dossier with core details, status, witness statements, seized items, case attachments, and evidence locker entries.
- Update investigation status between open, closed, and pending court states.
- Protect application routes and API calls with Auth0 authentication and bearer tokens.

### AI-Assisted Intake

- Use the AI Case Assistant to paste or dictate a free-form case narration.
- Extract structured case details, witnesses, seizures, and facts using Google Gemini.
- Review AI-filled fields before creating a case, keeping the officer in control of submitted records.

### Semantic Case Search

- Generate embeddings for case number, title, and description when cases are created.
- Search the case archive by meaning, not only exact keywords.
- Rank matches with cosine similarity and display match confidence in the archive view.
- Backfill embeddings for older cases with the included script.

### Evidence Handling

- Upload up to five case evidence files per case.
- Validate case attachments by extension, MIME type, file size, and binary signature.
- Support common images, PDFs, audio, and video formats for case-level attachments.
- Validate evidence-log uploads in memory for serverless compatibility.
- Generate QR codes for evidence log metadata, including case details, evidence type, officer, and timestamp.

### Analytics And Reminders

- Dashboard cards for total cases, active investigations, closed cases, and pendency rate.
- Case status distribution with Recharts pie visualization.
- FIR-to-closure timeline chart for closed cases.
- Login-time reminders for cases open longer than 10 days.
- Backend cron utility for longer-running pendency checks.

### Deployment-Aware Backend

- Loads local `.env` values during development without overriding deployment environment variables in production.
- Validates MongoDB connection strings and reports common Atlas URI mistakes clearly.
- Defers database connection until protected API requests need it, which fits serverless deployments.
- Serves local uploads from `/uploads` during local backend runs.

## Tech Stack

| Layer | Tools |
| --- | --- |
| Frontend | React 19, Vite 7, React Router, Auth0 React SDK, Framer Motion, Lenis, Recharts, Axios |
| Backend | Node.js, Express 5, Mongoose 9, Auth0 JWT middleware, Multer, QRCode |
| AI | Google Gemini text extraction and embedding APIs |
| Database | MongoDB |
| Deployment | Vercel frontend plus serverless API entry |

## Project Structure

```text
.
|-- api/
|   `-- index.js
|-- controllers/
|   |-- analyticsController.js
|   |-- caseController.js
|   |-- evidenceLogController.js
|   |-- CaseFactController.js
|   |-- SeizureController.js
|   `-- witnessController.js
|-- middlware/
|   |-- auth.js
|   |-- fileUpload.js
|   `-- uploadMiddleware.js
|-- models/
|   |-- Case.js
|   |-- Case_fact.js
|   |-- Evidence_log.js
|   |-- Seizure.js
|   `-- Witness_Statement.js
|-- routes/
|-- scripts/
|   `-- backfillCaseEmbeddings.js
|-- services/
|   `-- geminiService.js
|-- utils/
|-- Frontend/
|   |-- src/
|   |   |-- components/
|   |   |-- hooks/
|   |   |-- pages/
|   |   `-- styles/
|   `-- package.json
|-- connect.js
|-- index.js
`-- package.json
```

## Prerequisites

- Node.js 20 or newer
- npm
- MongoDB Atlas or local MongoDB connection string
- Auth0 application and API configuration
- Google Gemini API key for AI extraction and semantic search

## Environment Variables

Create a root `.env` file for the backend:

```env
PORT=8000
MONGO_URI=mongodb+srv://user:password@cluster.example.mongodb.net/?retryWrites=true&w=majority
GEMINI_API_KEY=your_gemini_api_key
GEMINI_TEXT_MODEL=gemini-2.5-flash
GEMINI_EMBEDDING_MODEL=gemini-embedding-001
GEMINI_EMBEDDING_DIMENSIONALITY=768
```

Create `Frontend/.env` when the frontend should point at a non-default API URL:

```env
VITE_API_URL=http://localhost:8000/api/v1
```

Current Auth0 values are configured in `Frontend/src/main.jsx`, `Frontend/src/hooks/useAxios.js`, and `middlware/auth.js`. Keep the Auth0 audience, issuer, client ID, allowed callback URL, and allowed logout URL aligned across Auth0, frontend, and backend configuration.

## Local Development

Install backend dependencies from the repository root:

```bash
npm install
```

Install frontend dependencies:

```bash
cd Frontend
npm install
```

Start the backend API:

```bash
npm run dev
```

Start the frontend in a second terminal:

```bash
cd Frontend
npm run dev
```

Default local URLs:

| Service | URL |
| --- | --- |
| Frontend | `http://localhost:5173` |
| Backend API | `http://localhost:8000/api/v1` |
| Health check | `http://localhost:8000/health` |

## Common Commands

Backend:

```bash
npm start
npm run dev
node scripts/backfillCaseEmbeddings.js
```

Frontend:

```bash
cd Frontend
npm run dev
npm run build
npm run lint
npm run preview
```

## API Surface

All `/api/v1/*` routes are protected by Auth0 JWT middleware.

| Method | Route | Description |
| --- | --- | --- |
| `POST` | `/api/v1/cases/extract` | Extract structured fields from case narration with Gemini |
| `POST` | `/api/v1/cases/semantic-search` | Search cases by embedding similarity |
| `POST` | `/api/v1/cases` | Create a case with optional evidence attachments |
| `GET` | `/api/v1/cases` | List cases |
| `GET` | `/api/v1/cases/:id` | Get one case |
| `PATCH` | `/api/v1/cases/:id` | Update case status |
| `POST` | `/api/v1/witnesses` | Add a witness statement |
| `GET` | `/api/v1/witnesses/:caseId` | List witness statements for a case |
| `POST` | `/api/v1/seizures` | Add a seized item |
| `GET` | `/api/v1/seizures/:caseId` | List seized items for a case |
| `POST` | `/api/v1/casefacts` | Add a key fact |
| `GET` | `/api/v1/casefacts/:caseId` | List key facts for a case |
| `POST` | `/api/v1/evidencelogs/validate` | Validate an evidence-log upload before submission |
| `POST` | `/api/v1/evidencelogs` | Create a QR-backed evidence log |
| `GET` | `/api/v1/evidencelogs/:caseId` | List evidence logs for a case |
| `GET` | `/api/v1/analytics/stats` | Get total, pending, closed, and pendency metrics |
| `GET` | `/api/v1/analytics/timeline` | Get days-to-close analytics for closed cases |
| `GET` | `/api/v1/analytics/reminders` | Get open cases older than 10 days |

## Upload Rules

Case evidence attachments:

- Maximum 5 files per case.
- Maximum 10 MB per file.
- Allowed formats: JPG, JPEG, PNG, WEBP, PDF, MP3, WAV, MP4, AVI, MOV.
- Files are checked against MIME type, extension, and file signature.

Evidence-log uploads:

- Maximum 5 MB per file.
- Allowed formats: JPG, JPEG, PNG, PDF.
- Files are validated from memory for serverless compatibility.
- Evidence log records currently store metadata and QR data, not durable binary file storage.

## AI And Embeddings

Gemini powers two separate flows:

| Flow | Model default | Purpose |
| --- | --- | --- |
| Case extraction | `gemini-2.5-flash` | Convert officer narration into structured case, witness, seizure, and fact fields |
| Case embeddings | `gemini-embedding-001` | Store retrieval vectors for semantic archive search |

When enabling semantic search on existing data, run:

```bash
node scripts/backfillCaseEmbeddings.js
```

The script loads the root `.env`, connects to MongoDB, finds cases with missing or outdated embeddings, and updates their stored vector metadata.

## Deployment Notes

- The live frontend is configured for `https://digitalized-diary.vercel.app`.
- Vercel environment variables should include `MONGO_URI` and `GEMINI_API_KEY`.
- The backend only loads local `.env` values outside production/serverless runtime.
- Local case attachments are stored under `uploads/evidence`.
- Durable production storage for uploaded binary evidence should be added with a storage service such as S3, Cloudinary, or equivalent.

## Security Notes

- API routes require Auth0 bearer tokens.
- Uploads are constrained by size, extension, MIME type, and binary signature.
- Invalid uploads are rejected before records are created.
- MongoDB URI validation catches common unsafe or malformed connection strings.
- AI output is treated as a draft and must be reviewed before submission.

## Status

The application includes the core investigation workflow, AI intake, semantic search, protected routes, analytics, and evidence tracking. The next production hardening step is durable object storage for evidence files in serverless deployments.
