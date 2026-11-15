# SafeSteps: Project Plan

**Team 404:** Ayesha Mir, Hafsa Ehsan, Syed Ibad Asim
**Stack:** MERN: MongoDB Atlas + Mongoose, Express, React (Vite), Node.js. JWT + bcrypt for auth. Both frontend and API are hosted on Render.

SafeSteps helps people **Learn** about emergencies, **Prepare** before they happen, and **Respond** quickly when they do.

---

## 1. Final Scope

| # | Feature | Notes |
|---|---------|-------|
| 1 | **4 disaster guides** | Earthquake, Fire, Heavy Rainfall, Heatwave. Format: Before / During / After / Do Not |
| 2 | **4 medical guides** | Severe Bleeding, Burns, Choking, Fainting. Format: Recognize / What to Do / What Not to Do / When to Seek Help |
| 3 | **Learn** | One list (Medical, Disasters) → full guide |
| 4 | **Get ready** (`prepare` in code) | Emergency Plan, Kit Checklist (with preparedness %), Saved Contacts |
| 5 | **Emergency Mode** | Choose emergency → big-button, minimal-text steps, one at a time, with yes/no questions → What now screen |
| 6 | **Call 1122 bar** | One tap dials `tel:1122` on every user screen; other numbers and saved contacts are on the What now screen |
| 7 | **Login / Signup** | Needed for plan, contacts, checklist progress and profile |
| 8 | **Admin** | Add / edit / publish / unpublish guides and checklist items (no delete) |
| 9 | **Responsive web app** | Mobile-first; must work well on a phone |
| 10 | **Offline guides** | Promised in the slides: guides and Emergency Mode must work offline in a normal browser tab (no install) |

**Out of scope** (say no if anyone asks): more emergencies, maps/location, push notifications, chat, multiple languages, native mobile apps.

---

## 2. Roles & App Flow

**User:** reads guides, uses Emergency Mode, and stores personal prep data.
**Admin:** manages all emergency content through the dashboard.

```
HOME
 ├── I need help now ─ picker → step-by-step (yes/no questions) → What now (other numbers, saved contacts)
 ├── Learn ─────────── Medical / Disasters list → read guide (→ Start step-by-step)
 └── Get ready ─────── hub → emergency plan / kit checklist / saved contacts   (login required)

 Call 1122 bar is fixed to the bottom of EVERY user screen (not admin)
```

**Full screen list and per-screen details: [`docs/SCREENS.md`](SCREENS.md).**

- **Public, no login:** Home, Learn, Guide pages, Emergency Mode, What now, Call 1122 bar. In an emergency nobody should be blocked by a login screen.
- **Login required:** Get ready (plan, checklist, contacts) and Profile. Logged out, Get ready shows an intro with Sign in / Create account instead of redirecting.
- **Admin only:** Admin Dashboard.

> **Emergency numbers:** confirm these before launch. Defaults for Pakistan: **1122** (Rescue), **15** (Police), **16** (Fire), **115** (Edhi). Keep them in one config file, `client/src/config/emergencyNumbers.js`, so nobody hardcodes them.

---

## 3. Team Split

Write the names in. Each person owns their feature **end to end**: UI, API routes, model and testing.

### Person 1: Core + Emergency Mode + Prepare (`______`)
- Navigation and shared layout (header, tab bar, Call 1122 bar, shared loading/empty/error/offline states)
- Home screen
- Emergency Mode
- Call 1122 bar + What now screen
- Emergency Plan
- Kit Checklist (+ preparedness %)
- Saved Contacts
- Admin tab for **checklist items** (fits inside the dashboard shell Person 2 builds)
- **Final integration** (merging, end-to-end flow check, deployment)

### Person 2: Learn + Guide Admin (`______`)
- Learn screen (one list, Medical and Disasters sections)
- Guide page (renders both guide formats)
- Content for all 8 guides, written into a seed file
- Guide model + guide APIs
- Category filtering
- Admin Dashboard shell + add / edit / publish / unpublish guides
- Offline caching of guides (service worker, no install)

### Person 3: Auth + User/Admin Access (`______`)
- Signup / login / logout
- JWT + bcrypt
- User / admin roles
- Protected routes (frontend `ProtectedRoute`, `AdminRoute`; backend `requireAuth`, `requireAdmin`)
- Profile / account page
- Admin access control
- Backend User model
- Seed script that creates the first admin account

### Hand-offs between people (agree on these in week 1)

| Provider | What | Consumer |
|----------|------|----------|
| Person 3 | `requireAuth` / `requireAdmin` middleware; puts `req.user = { id, role }` on the request | Person 1, 2 |
| Person 3 | `AuthContext` (`user`, `token`, `login()`, `logout()`) + `ProtectedRoute` / `AdminRoute` | Person 1, 2 |
| Person 3 | `api.js` fetch wrapper that attaches `Authorization: Bearer <token>` | Everyone |
| Person 2 | `GET /api/guides` and `GET /api/guides/:slug` | Person 1 (Emergency Mode reads steps from guides) |
| Person 2 | Admin dashboard layout with tabs | Person 1 (Checklist Items tab) |
| Person 1 | `Layout` component + shared UI (Button, Card, PageHeader) | Person 2, 3 |

**Until a hand-off is ready, mock it.** For example, Person 1 can build Emergency Mode against a local JSON guide before the API exists.

---

## 4. Screens & Wireframes

Only 7 key screens get wireframes. Each person designs their own, then **one person standardizes them** (colors, fonts, spacing, buttons) so the whole thing looks like one app.

| # | Screen | Designer |
|---|--------|----------|
| 1 | Home | Person 1 |
| 2 | Learn | Person 2 |
| 3 | Emergency Guide | Person 2 |
| 4 | Emergency Mode | Person 1 |
| 5 | Prepare | Person 1 |
| 6 | Login / Signup | Person 3 |
| 7 | Admin Dashboard | Person 2 (guide admin) + Person 3 (access) |

Person 3 also does Profile, which gets no formal wireframe. Screens beyond the 7 are designed by their owner from the style sheet, and Person 1 does the final consistency pass (see `docs/SCREENS.md` §3).

### Design rules
- Mobile-first. Design at 375px width first, then desktop.
- Emergency Mode: **one step per screen**, huge Next / Back buttons, text no smaller than 20px, high contrast, red "Call 1122" always visible.
- One accent color for danger/emergency (red) and one for prepare/safe (green or blue).
- Touch targets at least 44px.

---

## 5. Frontend Routes (React Router)

| Path | Page | Access | Owner |
|------|------|--------|-------|
| `/` | Home | Public | P1 |
| `/learn` | All guides, Medical and Disasters sections | Public | P2 |
| `/guides/:slug` | Full guide | Public | P2 |
| `/emergency` | Pick emergency (big tiles) | Public | P1 |
| `/emergency/:slug` | Step-by-step mode | Public | P1 |
| `/emergency/:slug/done` | What now | Public | P1 |
| `/prepare` | Get ready hub (shows preparedness %); intro when logged out | User | P1 |
| `/prepare/plan` | Emergency Plan | User | P1 |
| `/prepare/checklist` | Kit Checklist | User | P1 |
| `/prepare/contacts` | Saved Contacts | User | P1 |
| `/login`, `/signup` | Auth | Public | P3 |
| `/profile` | Account | User | P3 |
| `/admin` | Admin: Guides | Admin | P2 |
| `/admin/checklist` | Admin: Checklist Items | Admin | P1 |
| `/admin/guides/new`, `/admin/guides/:id/edit` | Guide editor | Admin | P2 |

---

## 6. Data Models (Mongoose)

### User (Person 3)
```js
{
  name: String,
  email: { type: String, unique: true, lowercase: true },
  passwordHash: String,        // bcrypt; never sent to the client
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  createdAt, updatedAt
}
```

### Guide (Person 2)
One model handles both formats: `category` decides which `sections` are used.
```js
{
  title: String,               // "Earthquake"
  slug: { type: String, unique: true },   // "earthquake"
  category: { type: String, enum: ['natural', 'medical'] },
  pickerLabel: String,         // everyday words for the Emergency Mode picker: "Bad bleeding"
  summary: String,
  icon: String,
  sections: [{                 // natural: before | during | after | doNot
    key: String,               // medical: recognize | whatToDo | whatNotToDo | whenToSeekHelp
    title: String,
    items: [String]
  }],
  emergencySteps: [{           // short version used by Emergency Mode
    type: { type: String, enum: ['instruction', 'question'] },
    text: String,              // 8 words or fewer
    image: String,             // optional
    yes: Number,               // question only: index of the next step, or null = end (What now)
    no: Number                 // question only: same; may point back for repeats
  }],                          // an instruction's Next goes to the following step
  published: { type: Boolean, default: false },
  createdAt, updatedAt
}
```

### ChecklistItem (Person 1, the admin-managed master list)
```js
{ name: String, category: String /* water, food, medical, documents… */, order: Number, published: Boolean }
```

### UserPrep (Person 1, one document per user)
```js
{
  user: { type: ObjectId, ref: 'User', unique: true },
  plan: {
    meetingPoints: [String],
    notes: String
  },
  checkedItems: [{ type: ObjectId, ref: 'ChecklistItem' }],
  contacts: [{ name: String, phone: String, relation: String, first: Boolean }]   // one list; "first" shows at the top
}
```
**Preparedness %** = `checkedItems` that are still published ÷ total published checklist items × 100.

---

## 7. REST API

Base URL: `/api`. Every response is JSON. Errors use the shape `{ "error": "message" }`.

### Auth (Person 3)
| Method | Route | Access | Body / Notes |
|--------|-------|--------|--------------|
| POST | `/auth/signup` | Public | `{ name, email, password }` → `{ token, user }` |
| POST | `/auth/login` | Public | `{ email, password }` → `{ token, user }` |
| GET | `/auth/me` | User | current user |
| PUT | `/users/me` | User | update name / password |
| DELETE | `/users/me` | User | delete the account and its prep data |

Logout happens on the client: delete the token. Tokens expire after 7 days.

### Guides (Person 2)
| Method | Route | Access | Notes |
|--------|-------|--------|-------|
| GET | `/guides?category=natural` | Public | published only; filtered by category |
| GET | `/guides/:slug` | Public | published only |
| GET | `/admin/guides` | Admin | includes unpublished |
| POST | `/admin/guides` | Admin | create |
| PUT | `/admin/guides/:id` | Admin | edit |
| PATCH | `/admin/guides/:id/publish` | Admin | `{ published: true/false }` (no delete: unpublish instead) |

### Prepare (Person 1)
| Method | Route | Access | Notes |
|--------|-------|--------|-------|
| GET | `/prepare` | User | plan + contacts + checked items + score |
| PUT | `/prepare/plan` | User | |
| GET | `/checklist` | Public | published items |
| PUT | `/prepare/checklist` | User | `{ checkedItems: [ids] }` |
| POST | `/prepare/contacts` | User | |
| PUT | `/prepare/contacts/:id` | User | |
| DELETE | `/prepare/contacts/:id` | User | |
| GET/POST/PUT | `/admin/checklist[/:id]` | Admin | manage the master list (no delete: unpublish instead) |

---

## 8. Folder Structure

```
safesteps-webapp/
├── client/                      # React + Vite
│   ├── public/                  # icons, manifest
│   └── src/
│       ├── api/                 # api.js wrapper + per-feature calls (P3 sets up)
│       ├── components/          # shared: Layout, Button, Card, HelpButton (P1)
│       ├── config/              # emergencyNumbers.js
│       ├── context/             # AuthContext (P3)
│       ├── features/
│       │   ├── auth/            # P3
│       │   ├── learn/           # P2
│       │   ├── emergency/       # P1
│       │   ├── prepare/         # P1
│       │   └── admin/           # P2 (+ P1 checklist tab)
│       ├── App.jsx              # routes
│       └── main.jsx
├── server/                      # Express (already exists)
│   ├── config/db.js             # Mongo connection
│   ├── middleware/auth.js       # requireAuth, requireAdmin (P3)
│   ├── models/                  # User, Guide, ChecklistItem, UserPrep
│   ├── routes/                  # auth, users, guides, prepare, checklist, admin
│   ├── seed/                    # guides.json, checklist.json, seed.js
│   └── server.js
└── docs/PLAN.md                 # this file
```

Because everyone works in their own `features/` folder, merge conflicts should be rare.

---

## 9. Offline

SafeSteps is a mobile **website** used in the browser; there is no install screen. The slides promised offline guides, so this needs to be real. A service worker works in a normal browser tab:

- Use **`vite-plugin-pwa`** to generate the service worker (and a basic manifest; we don't prompt anyone to install).
- **Precache** the app shell so the app opens with no internet.
- **Cache `GET /api/guides*` responses** (stale-while-revalidate), so every guide a user has opened, plus Emergency Mode, works offline.
- After the first load, quietly fetch all 8 published guides once so the whole guide set is cached right away.
- `tel:` links work without internet, so the Help button always works.
- Get ready shows the last loaded data **read-only** offline, with editing switched off. A read-only copy of saved contacts is kept so the What now screen works offline.
- **Storage is not guaranteed:** iPhone Safari deletes saved site data after 7 days without a visit, and clearing browser data wipes it. The offline chip says "Guides saved on this phone" only after checking the cache, with a short "can be cleared" note.
- **Test it:** Chrome DevTools → Network → Offline, then open every guide and Emergency Mode.

---

## 10. Environment & Setup

`server/.env` (never commit this; it's already covered by `.gitignore`):
```
PORT=5000
MONGO_URI=mongodb+srv://...
JWT_SECRET=some-long-random-string
CLIENT_URL=http://localhost:5173
```
`client/.env`:
```
VITE_API_URL=http://localhost:5000/api
```

Commit a `.env.example` for each one with the keys but no values.

**Server packages to add:** `mongoose`, `jsonwebtoken`, `bcrypt`, `nodemon` (dev).
**Client packages:** `react-router-dom`, `vite-plugin-pwa`.

---

## 11. Git Workflow

- `main` must always work. **Nobody pushes directly to `main`.**
- One branch per feature: `feat/auth-login`, `feat/emergency-mode`, `feat/guide-admin`, and so on.
- Open a Pull Request, have **one teammate review it**, then merge.
- Pull `main` into your branch often (`git pull origin main`) to keep conflicts small.
- Commit messages describe the change: `add kit checklist score`, not `update` or `fix stuff`.
- Person 1 does the final integration pass on `main` each week.

---

## 12. Timeline (6 weeks)

| Week | Goal | P1 (Core/Emergency/Prepare) | P2 (Learn/Guides) | P3 (Auth) |
|------|------|------------------------------|-------------------|-----------|
| **1** Planning & design | Everyone agrees on the contracts | Wireframes: Home, Emergency Mode, Prepare. Set up `client/` with Vite + Router + Layout | Wireframes: Learn, Guide, Admin. Write the content for all 8 guides | Wireframes: Login/Signup, Profile. Mongo Atlas setup, DB connection |
| **2** Core build | Guides + auth + Emergency Mode run | Emergency Mode (mock data), Help button, Home | Guide model, seed, guide APIs, Learn + Guide pages | User model, signup/login, JWT, middleware, AuthContext |
| **3** Prepare | Logged-in users can prepare | Plan, Checklist + %, Contacts (API + UI) | Category filtering, wire Emergency Mode to the real API with P1 | Protected routes, Profile page, roles |
| **4** Admin | Admins manage content | Checklist Items admin tab | Admin dashboard + guide editor + publish toggle | AdminRoute, admin seed account, access-control checks |
| **5** Testing | Fix, polish, PWA | Responsive pass on all screens | PWA / offline caching | Security pass (no password hash leaks, 401/403 handled) |
| **6** Launch | Ship it | Final integration + Render deploy | Final guide content review | Bug fixes |

All three of you share the final report and demo prep in week 6.

---

## 13. Testing Checklist (Week 5)

- [ ] Signup, login and logout work; a wrong password shows a friendly error
- [ ] A logged-out user who opens `/prepare` sees the Get ready intro with Sign in / Create account
- [ ] A normal user cannot open `/admin`, and the API returns 403
- [ ] All 8 guides show the correct sections for their category
- [ ] Unpublished guides are hidden from Learn and Emergency Mode
- [ ] Emergency Mode works start to finish for every guide
- [ ] The Call 1122 bar dials on a real phone
- [ ] The preparedness % updates when items are ticked
- [ ] Plan and contacts save and reload correctly
- [ ] Admin can create, edit, publish and unpublish a guide, and the change shows for users
- [ ] Offline: guides and Emergency Mode load with the network turned off
- [ ] Every screen looks right at 375px, 768px and desktop
- [ ] Guides open offline in a normal browser tab after one online visit

---

## 14. Definition of Done (for any feature)

1. Works on mobile and desktop
2. Handles loading, empty and error states
3. Reviewed by one teammate in a PR
4. Merged to `main` without breaking anything else
5. Tested on the deployed Render URL, not only localhost

---

## 15. Demo Script (Week 6)

1. Open the site in the phone's browser
2. **Learn:** Natural → Earthquake → read the guide
3. **Emergency Mode:** Choking → answer "Can they cough or talk?" → step through → What now → tap Call
4. Sign up → **Get ready:** fill in the plan, tick the checklist (show the % rising), add a contact
5. Turn on airplane mode → guides and Emergency Mode still work
6. Log in as admin → edit a guide → unpublish it → show it disappear for users
