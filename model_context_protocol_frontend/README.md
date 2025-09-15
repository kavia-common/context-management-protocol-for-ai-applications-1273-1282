# Model Context Protocol Frontend (Angular 19)

A professional dashboard UI to manage AI model contexts: list, details, history visualization, and CRUD operations via REST API.

## Quick start

- Install dependencies and run:
  - npm install
  - npm start
- App runs at http://localhost:3000 by default (configured in angular.json).

## API configuration

The frontend calls a REST API at `API_BASE_URL` (default `/api`). Configure via environment at runtime:

- In deployment, set a global var before the app script:
  ```
  <script>window.__APP_API_BASE_URL__ = '/api';</script>
  ```
- Or proxy `/api` to your backend during dev.

Required endpoints expected by the app:
- GET    /api/contexts?includeStale=true|false
- GET    /api/contexts/:id
- PUT    /api/contexts/:id
- DELETE /api/contexts/:id
- GET    /api/contexts/:id/history?limit=50
- POST   /api/contexts

Each returns `{ ok: boolean, data: ... }`.

## Features

- Context list with status badges, tokens, and last updated time
- Detail pane with edit (name, status, metadata JSON), stats, and history timeline
- Create and delete contexts
- Responsive layout, SSR-ready

## Notes

- Angular version alignment maintained per project constraints.
- To run SSR sample server: `ng build` then `npm run serve:ssr:angular` (ensure Node 18+).
