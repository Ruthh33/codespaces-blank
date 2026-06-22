# Embedded Signup Backend

Backend support for the CRM Embedded Signup flow and webhook handling.
This server is intended for local development and PoC use.

## Overview

The backend implements:
- `POST /api/token` for exchanging an Embedded Signup code for a long-lived Meta access token
- `POST /api/register` for manual WhatsApp Business number registration
- `POST /api/subscribe` for manual Graph webhook subscription
- `POST /api/webhooks` for receiving Meta webhook events with HMAC signature verification
- `GET /api/webhooks/events` for listing stored webhook events
- `GET /api/tokens` for listing stored token entries

## Setup

1. Install dependencies from the app root:

```bash
pnpm install
```

2. Create a `.env` file or set environment variables:

- `FACEBOOK_APP_ID` — Meta App ID
- `FACEBOOK_APP_SECRET` — Meta App secret
- `EMBEDDED_REDIRECT_URI` — Redirect URI used by the embedded signup flow
- `DATABASE_URL` — optional Postgres connection string
- `PORT` — optional Express server port (default: `4001`)

3. Start the server:

```bash
pnpm run embedded-server
```

The server will start on `http://localhost:4001` by default.

## Database

If `DATABASE_URL` is provided, the server will attempt to connect to Postgres and persist:
- token entries
- webhook events

When no database is configured, the server keeps data in memory during runtime.

## API Routes

- `POST /api/token`
  - Body: `{ code, sessionInfo }`
  - Exchanges the embedded signup code and stores the token entry.

- `POST /api/register`
  - Body: `{ wabaId, sessionInfo, token }`
  - Triggers a manual `registerNumber` call for the WhatsApp Business account.

- `POST /api/subscribe`
  - Body: `{ wabaId, token }`
  - Triggers a manual webhook subscription call.

- `POST /api/webhooks`
  - Receives webhook events from Meta.
  - Validates `x-hub-signature-256` using `FACEBOOK_APP_SECRET`.

- `GET /api/webhooks/events`
  - Returns stored webhook events.

- `GET /api/tokens`
  - Returns stored long-lived token entries.

## Testing

Run unit and integration tests with:

```bash
pnpm test
```

Run tests once in CI mode:

```bash
pnpm test:ci
```

### Docker and migrations

You can run a local Postgres with `docker-compose` from the project root:

```bash
docker-compose up -d
```

Set `DATABASE_URL` to `postgres://postgres:postgres@localhost:5432/embedded_signup` and run migrations:

```bash
export DATABASE_URL="postgres://postgres:postgres@localhost:5432/embedded_signup"
pnpm run migrate
```

Run e2e tests against that DB:

```bash
export DATABASE_URL="postgres://postgres:postgres@localhost:5432/embedded_signup"
pnpm run test:e2e
```

## CI / Local automation

We provide a GitHub Actions workflow at `.github/workflows/e2e.yml` that starts Postgres, runs migrations and executes the e2e tests on push / PR.

For local runs you can use the helper script `scripts/ci-e2e.sh` which starts Postgres via `docker-compose`, waits for it to accept connections, runs migrations and executes the e2e tests. Postgres is left running after completion.

Run locally:

```bash
pnpm run ci:e2e
```

### Real end-to-end validation (manual steps)

Full end-to-end validation against Meta requires real Meta App credentials and usually a public webhook URL (Graph may require reachable endpoints to subscribe).

Steps to run a real e2e validation locally:

1. Obtain a short-lived token from Meta Embedded Signup flow (or a `code` from the frontend redirect).
2. Create a JSON string describing the `sessionInfo` your frontend receives and set it as `TEST_SESSION_INFO` environment variable. Example:

```bash
export TEST_SESSION_INFO='{ "phone_number": "+1234567890", "waba_id": "<WABA_ID>", "companyName": "Test Co" }'
```

3. Run the helper script (either provide `EMBEDDED_SIGNUP_CODE` or `SHORT_LIVED_TOKEN`):

```bash
export FACEBOOK_APP_ID="..."
export FACEBOOK_APP_SECRET="..."
export EMBEDDED_SIGNUP_CODE="..." # or SHORT_LIVED_TOKEN
export DATABASE_URL="postgres://postgres:postgres@localhost:5432/embedded_signup" # optional
node server/e2e/embedded_signup_e2e.cjs
```

Notes:
- If you need a public webhook endpoint for `subscribeWebhook`, consider using `ngrok` or a similar tunnel so Graph can reach your `/api/webhooks`.
- The script performs token exchange, saves the token to DB (if `DATABASE_URL` set), and attempts `registerNumber` and `subscribeWebhook` (best-effort).

### Example: using ngrok and the frontend to get a `code`

1. Start the backend and expose it with ngrok (in a separate terminal):

```bash
pnpm run embedded-server &
ngrok http 4001
```

2. Note the public URL from ngrok (e.g. `https://abcd1234.ngrok.io`) and set it as your webhook callback in Meta or use it as `EMBEDDED_REDIRECT_URI`.

3. Start the frontend (`pnpm run dev`), open the Embedded Signup UI and follow the flow; when Meta redirects back you'll capture a `code` parameter in the redirect URL.

4. Use that `code` with the helper script as described above to exchange for tokens and run registration.

### How to add secrets in GitHub Actions

1. Go to your repository on GitHub → Settings → Secrets and variables → Actions → New repository secret.
2. Add the following secrets:
  - `FACEBOOK_APP_ID`
  - `FACEBOOK_APP_SECRET`
  - `DATABASE_URL` (if you want CI to run migrations and e2e against a managed DB)
3. The workflow will read these as `secrets.*` and you should avoid printing them in logs.

If you want me to open a PR with these docs and a checklist for adding secrets, dímelo y lo hago.


## Notes

- This server is intended for development only. For production use, deploy behind TLS and expose a stable public webhook endpoint.
- The webhook route uses a raw body parser to verify HMAC signatures correctly.
- The backend can still function without Postgres; data will be stored in memory.
