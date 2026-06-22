
  # Modern Login Screen UI

  This is a code bundle for Modern Login Screen UI. The original project is available at https://www.figma.com/design/TPpCtXK0oIN42Sa4qBAbGz/Modern-Login-Screen-UI.

  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.

## Embedded Signup / Webhook backend

This project includes an embedded signup backend for Meta WhatsApp onboarding.

### Setup

1. Install dependencies:

```bash
pnpm install
```

2. Set environment variables:

- `FACEBOOK_APP_ID`
- `FACEBOOK_APP_SECRET`
- `EMBEDDED_REDIRECT_URI`
- `DATABASE_URL` (optional, for Postgres persistence)
- `VITE_FACEBOOK_APP_ID` (frontend app ID)
- `VITE_ES_CONFIG` (optional ES config JSON)

3. Run the frontend and backend:

```bash
pnpm dev
pnpm run embedded-server
```

4. Open the admin panel and go to `/embedded-signup`.

### API routes

- `POST /api/token` — accepts `{ code, sessionInfo }` and exchanges the Embedded Signup code for a long-lived token.
- `POST /api/register` — manual phone registration call to the Graph API.
- `POST /api/subscribe` — manual webhook subscription call to the Graph API.
- `POST /api/webhooks` — webhook receiver with HMAC SHA256 validation.
- `GET /api/webhooks/events` — returns saved webhook events.
- `GET /api/tokens` — returns stored token entries.

### Testing

Run tests with:

```bash
pnpm test
```

Run in watch mode with:

```bash
pnpm test:watch
```

### Notes

- The server persists tokens and webhook events to Postgres when `DATABASE_URL` is set.
- If no database is configured, the server falls back to in-memory storage.
- For production, use real Meta Graph API credentials and a secure publicly accessible webhook endpoint.

### Server docs

See `server/README.md` for detailed instructions and API route information.
  