# API Reference: Authentication

**Base URL**: `https://xano.atlanticsoft.co`
**API Group Canonical**: `Ks58d17q`

## Endpoints

### POST `/api:Ks58d17q/auth/login`

Authenticates a user and returns a JWT token.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "their-password"
}
```

**Response (200):**
```json
{
  "authToken": "eyJhbGciOiJBMjU2S1ci..."
}
```

**Errors:**
- `401` — Invalid credentials

**Important:** Build the JSON payload with `jq -n --arg` to safely handle special characters in passwords:
```bash
jq -n --arg email "$EMAIL" --arg password "$PASSWORD" \
  '{email: $email, password: $password}'
```

### GET `/api:Ks58d17q/auth/me`

Returns the current authenticated user's profile. Used to validate stored tokens.

**Headers:**
```
Authorization: Bearer {TOKEN}
Content-Type: application/json
```

**Response (200):**
```json
{
  "id": 1,
  "name": "Pablo",
  "email": "pablo@example.com",
  "is_admin": true,
  "is_recruiter": false,
  "user_role_id": -1
}
```

**Errors:**
- `401` — Token expired or invalid (trigger re-login)

## Session File Schema

**Path:** `~/.claude/projects/-home-pablo-projects-bwats-team/memory/ats-session.json`

```json
{
  "token": "eyJhbGciOiJBMjU2S1ci...",
  "user": {
    "id": 1,
    "name": "Pablo",
    "email": "pablo@example.com",
    "is_admin": true,
    "is_recruiter": false
  },
  "lastProjectId": null,
  "lastProjectName": null,
  "savedAt": "2026-02-27T12:00:00Z"
}
```

## Token Handling

1. On `/ats` invocation, check if session file exists and has a `token`
2. Validate token with `GET /auth/me`
3. If valid: greet user by name, show dashboard
4. If invalid (401): delete session file, prompt for browser-based login
5. **Browser-based login**: Open `https://bwats.betterway.dev/` in the browser, user logs in, copies token from `localStorage.getItem('authToken')` in the console, pastes it back
6. After receiving token: validate with `/auth/me`, store token + user info in session file
7. On any subsequent 401: prompt for re-login, retry the failed request once
8. **Never ask for passwords** — always use the browser token flow
