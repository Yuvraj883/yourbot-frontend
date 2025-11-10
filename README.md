## YourBot Frontend (React + Vite)

A sleek chat + document upload UI that connects to your backend:

- POST `/ingest` with multipart form (file, organisation, website, namespace)
- POST `/ask` with JSON `{ question, namespace }`

### Quick start

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`. Configure the backend base URL via `.env`:

```
VITE_API_BASE=http://localhost:3000
```

### Structure

- `src/components/UploadPanel.jsx`: Modal uploader for `/ingest`
- `src/components/Chat.jsx`: Chat interface wired to `/ask`
- `src/lib/api.js`: API wrappers
- `src/lib/config.js`: API base config
- `src/styles.css`: Wonderchat-inspired styling (dark, elegant)

### Backend suggestions to enhance UX

1. Streaming answers (Server-Sent Events or chunked fetch) to show tokens as they generate.
2. Source citations: return an array of source snippets with titles/urls and highlight spans.
3. Conversation IDs: accept `conversationId` to keep chat history context server-side.
4. Error payload shape: `{ code, message, details }` for clearer client handling.
5. Rate limiting + API keys: simple auth for public deployments.
6. Namespace management endpoints: list, delete, reindex; document counts and last-ingested time.
7. Upload status webhooks or polling: report progress for large documents.
8. Embedding model/version metadata in responses for transparency and debugging.
9. Moderation/filters: optional flags on unsafe content, and safe-completion strategies.
10. Observability: request IDs, latency metrics, and logs correlation headers.

### Optional response formats

For `/ask`, consider:
```json
{
  "answer": "string",
  "citations": [
    { "title": "Doc title", "url": "https://...", "page": 3, "snippet": "..." }
  ],
  "conversationId": "uuid",
  "usage": { "promptTokens": 123, "completionTokens": 456, "totalTokens": 579 }
}
```

For streaming, use SSE with `Content-Type: text/event-stream` and emit `data:` lines containing partial tokens and a final `done` event with the above JSON.


