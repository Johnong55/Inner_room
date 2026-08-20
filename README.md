# InnerRoom

InnerRoom is a private, local-first mobile space for journaling and reflective self-conversation. It is intentionally not a productivity tracker: there are no streaks, mood scores, guilt reminders, ads, or forced positivity.

The mobile client is built with Expo SDK 57, React Native, TypeScript, Expo Router, NativeWind, Zustand, Reanimated, SQLite, and SecureStore. The optional API uses Express, PostgreSQL, and the OpenAI Responses API.

## What is implemented

- Cinematic Vietnamese onboarding with an optional mood check-in
- Five-tab app shell: Today, Journal, Room, Journey, You
- SQLite journal with 650 ms autosave, prompts, mood history, original-entry search results, and day detail views
- Month-by-month emotional calendar that opens journal, conversation, thought, and letter evidence from the original day
- Four conversation modes plus a per-message response intent
- Client and server safety routing that stops ordinary reflection when immediate-risk language is detected
- Explicit, default-off journal memory and AI history controls
- Thought untangling, one-small-step flow, evidence-only monthly reflection, and letters to a future date
- Quiet Room scenes: rain, forest, night, and ocean; breathing guide; timer off by default
- PIN and biometric app lock, silent opt-in notifications, trusted contacts, local export, and confirmed deletion
- Optional anonymous cloud identity, sync queue, PostgreSQL storage encrypted with AES-256-GCM, cloud export, and cloud deletion
- Semantic journal search only when journal memory is enabled; local lexical fallback otherwise

## Run the mobile app

Requirements: Node 22.13 or newer, an Expo development build or Expo Go compatible with SDK 57.

```bash
npm install
npm start
```

Useful checks:

```bash
npm run typecheck
npm run lint
npx expo export --platform web
```

Set `EXPO_PUBLIC_API_URL=http://<your-lan-ip>:4040` in a local `.env` only when you want cloud sync, semantic search, or remote reflection. Without it, journaling is fully local and conversation uses a small on-device reflection fallback.

## Run the optional API

```bash
cp server/.env.example server/.env
docker compose up -d postgres
npm --prefix server install
npm --prefix server run migrate
npm run server:dev
```

Generate independent random values of at least 32 characters for `JWT_SECRET` and `ENCRYPTION_MASTER_KEY`. Never commit `server/.env`.

Server checks:

```bash
npm --prefix server run build
npm --prefix server test
npm --prefix server audit --omit=dev
```

## Branch workflow and CI/CD

Development happens on `feature/*`, `fix/*`, `chore/*`, or `release/*` branches. Changes reach `main` through a Pull Request after CI passes; see [CONTRIBUTING.md](./CONTRIBUTING.md).

GitHub Actions runs mobile TypeScript, lint, Android bundle verification, API compilation, and API tests for every working branch and Pull Request. Pushing a `release/*` branch, or manually starting **Android Preview APK**, builds an installable arm64 APK and retains it as a workflow artifact for 14 days. Preview artifacts are for internal testing and are not Google Play releases.

## Privacy model

Local-only and anonymous modes are on by default. Journal memory, AI history, cloud sync, notifications, biometrics, and PIN are opt-in. The OpenAI key stays on the server. Reflection requests use `store: false`; only the most recent conversation turns and, when explicitly allowed, up to five bounded journal excerpts are sent. Semantic search sends bounded excerpts only after the same memory permission is enabled.

SQLite protects offline availability, not a compromised unlocked device by itself. PIN/biometrics gate app access; sensitive settings and cloud tokens are stored with SecureStore. Cloud payloads are additionally encrypted at the application layer before entering PostgreSQL. Production deployment must also use TLS, secret rotation, encrypted backups, database least privilege, observability that never logs request bodies, and a tested restore/deletion process.

The safety layer is a routing aid, not a clinical assessment. It never diagnoses, never automatically contacts another person, and keeps emergency actions under the user’s explicit control.

## Project map

```text
src/app/                  Expo Router screens
src/components/           UI, mood, journal, ambient, privacy
src/database/             SQLite schema and repositories
src/services/ai/          Reflection, safety, semantic search client
src/services/storage/     Secure preferences, PIN, export
src/services/sync/        Optional cloud session and sync queue
src/stores/               Zustand state
server/src/routes/        REST endpoints
server/src/services/      Encryption, tokens, AI, safety, search
server/src/db/            PostgreSQL schema and migration
```

## AI behavior contract

The system prompt follows: listen, reflect, ask one useful question, distinguish fact from assumption, and suggest only when requested. It avoids generic apologies, diagnoses, labels, “you always…”, fabricated memories, and claims to literally be the user’s future self. Journal-derived observations must name their evidence; search and Journey always lead back to original writing.
