# safesteps-webapp


- `client/` — Frontend of the project. Contains the React app and everything the user sees and interacts with.
- `server/` — Backend of the project. Handles APIs, application logic, authentication, and communication with the database.

## Running it locally

```sh
# once per clone: strips AI attribution from commit messages (see AGENTS.md)
git config core.hooksPath .githooks

# API on :5000
cd server
cp .env.example .env        # fill in MONGO_URI, JWT_SECRET, ADMIN_*
npm install
npm run seed:admin          # first admin account from ADMIN_* in .env
npm run seed:checklist      # kit checklist master list
npm run dev

# React app on :5173 (second terminal)
cd client
cp .env.example .env
npm install
npm run dev
```

Plan and screens: [`docs/PLAN.md`](docs/PLAN.md), [`docs/SCREENS.md`](docs/SCREENS.md). Using an AI assistant? Read [`AGENTS.md`](AGENTS.md) first.
