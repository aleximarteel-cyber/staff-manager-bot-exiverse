# Staff Manager Bot — EXIVERSE

Initial foundation for the EXIVERSE Discord server bot, built with Node.js, Discord.js, and PostgreSQL. This version is limited to secure configuration, database connectivity, slash-command registration, and `/ping`.

## Requirements

- Node.js 18 or newer
- PostgreSQL
- A Discord application and bot, invited to your server with the `bot` and `applications.commands` scopes

## Setup

1. Clone the repository and enter its directory.
2. Install dependencies:

   ```bash
   npm install
   ```

3. Copy `.env.example` to `.env` and set your values:

   ```bash
   cp .env.example .env
   ```

   Required Discord variables:
   - `DISCORD_TOKEN`: bot token from the Discord Developer Portal
   - `DISCORD_CLIENT_ID`: application ID
   - `DISCORD_GUILD_ID`: optional; when set, registers `/ping` only in that server (recommended during development)

   PostgreSQL: provide either `DATABASE_URL`, or `POSTGRES_HOST`, `POSTGRES_PORT`, `POSTGRES_DATABASE`, `POSTGRES_USER`, and `POSTGRES_PASSWORD`. Set `POSTGRES_SSL=true` only if your database provider requires verified TLS. Do not put credentials in source files or commit `.env`.

4. Create the database if it does not exist. For example, from `psql`:

   ```sql
   CREATE DATABASE exiverse;
   ```

5. Register `/ping`:

   ```bash
   npm run deploy:commands
   ```

   Set `DISCORD_GUILD_ID` for a test-server command. Without it, the command is registered globally, and Discord may take time to propagate it.

6. Start the bot:

   ```bash
   npm start
   ```

   For development with automatic Node.js restart on file changes:

   ```bash
   npm run dev
   ```

## Validation and tests

```bash
npm run check
npm test
```

`npm run check` runs Node.js syntax checks on the JavaScript files. The test suite checks environment validation; a live Discord and PostgreSQL connection additionally requires valid credentials and services.

## Included behavior

- Validates required environment variables before startup.
- Tests PostgreSQL connectivity with `SELECT 1` and retries startup connection attempts sequentially.
- Lets Discord.js handle gateway reconnections; the application does not issue duplicate concurrent login attempts.
- `/ping` reports interaction response and WebSocket latency.
- Logs startup, command, database, and Discord errors without logging secrets.

No staff-management features are included in this initial version.
