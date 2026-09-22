# Zone01 GraphQL Profile

A personal profile dashboard for [Zone01 Oujda](https://learn.zone01oujda.ma) students. It authenticates against the Zone01 sign-in API and pulls the student's own data — XP, level, audit ratio, and skill progression — through the platform's GraphQL API, then renders it as SVG graphs in a terminal-themed UI.

## Live Demo

🔗 [https://haitbenal.github.io/GraphQl/](https://haitbenal.github.io/GraphQl/)

## Features

- **Login** — authenticates with a Zone01 username/password via Basic Auth against `/api/auth/signin` and stores the returned JWT.
- **Profile overview** — name, login, email, avatar, current level, total XP, and audit ratio.
- **Skills matrix** — SVG chart of skill levels (Go, front-end, back-end, HTML, JS, TCP, etc.) built from `skill_*` transactions.
- **Audit statistics** — SVG breakdown of audits given vs. received.
- **XP transaction history** — SVG chart of XP earned over time by module.
- **Logout** — clears the stored session token.

All data is fetched live from the Zone01 GraphQL engine using the logged-in user's JWT — no backend of its own is required.

## Tech Stack

- Plain HTML/CSS/JavaScript
- [GraphQL](https://graphql.org/) queries against the Zone01 platform API
- Native SVG for chart rendering

## Project Structure

```
GraphQl/
├── index.html              # Login page
├── profile.html             # Profile / dashboard page
└── assets/
    ├── css/styles.css       # Terminal-themed styling
    ├── img/user.svg         # Default avatar
    └── js/
        ├── auth.js          # Login flow (Basic Auth -> JWT)
        ├── api.js           # Authenticated GraphQL fetch helper
        └── profile.js       # Queries + SVG rendering for the dashboard
```

## Getting Started

This is a static site with no dependencies or build step.

1. Clone the repository:
   ```bash
   git clone git@github.com:haitbenal/GraphQl.git
   cd GraphQl
   ```
2. Serve it locally (opening `index.html` directly also works, but a local server avoids browser module/CORS quirks):
   ```bash
   python3 -m http.server 8080
   ```
3. Open `http://localhost:8080` and log in with your Zone01 Oujda credentials.

## Notes

- Requires a valid Zone01 Oujda account — this app talks directly to `learn.zone01oujda.ma`'s auth and GraphQL endpoints.
- The JWT is stored in `localStorage` and used to authorize all GraphQL requests.
