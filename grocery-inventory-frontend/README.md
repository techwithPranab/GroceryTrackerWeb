# GroceryTracker — Frontend

Next.js 14 (App Router) frontend for the Smart Household Grocery Inventory & Shopping List web application.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript (strict) |
| Styling | CSS Modules + CSS custom properties |
| State | Redux Toolkit + react-redux |
| HTTP | Axios with JWT interceptors |
| Charts | Chart.js + react-chartjs-2 |
| Notifications | react-hot-toast |

---

## Project Structure

```
grocery-inventory-frontend/
├── app/
│   ├── (auth)/               # Auth route group (no sidebar)
│   │   ├── layout.tsx        # Split branding + form layout
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (dashboard)/          # Protected route group
│   │   ├── layout.tsx        # Auth guard + Sidebar + Header shell
│   │   ├── dashboard/        # Overview stats + charts
│   │   ├── inventory/        # Full CRUD inventory management
│   │   ├── shopping-list/    # Pending + purchased shopping items
│   │   ├── expiry-tracker/   # Items expiring grouped by severity
│   │   ├── categories/       # Manage item categories
│   │   ├── locations/        # Manage storage locations
│   │   ├── household/        # Members + invite management
│   │   ├── activity/         # Household activity feed
│   │   └── profile/          # User profile settings
│   ├── layout.tsx            # Root layout (Inter font + Providers)
│   └── page.tsx              # Redirects → /dashboard
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx       # Navigation sidebar with badges
│   │   └── Header.tsx        # Page header + user menu
│   └── ui/
│       └── index.tsx         # Badge, Button, Input, Select, Modal,
│                             # StatCard, Card, EmptyState, LoadingSpinner, Skeleton
├── services/                 # Axios API wrappers
│   ├── apiClient.ts          # Axios instance + JWT interceptors
│   ├── authService.ts
│   ├── inventoryService.ts
│   ├── shoppingListService.ts
│   ├── dashboardService.ts
│   └── householdService.ts   # Also exports categoryService, locationService
├── store/
│   ├── slices/               # Redux Toolkit slices
│   │   ├── authSlice.ts
│   │   ├── inventorySlice.ts
│   │   ├── shoppingListSlice.ts
│   │   └── dashboardSlice.ts
│   └── index.ts              # configureStore
├── hooks/
│   └── useAppStore.ts        # Typed useAppDispatch + useAppSelector
├── types/
│   └── index.ts              # All TypeScript interfaces
├── utils/
│   └── formatters.ts         # Date, expiry, string utilities
└── styles/
    └── globals.css           # CSS custom properties design tokens
```

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api
```

### 3. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 4. Build for production

```bash
npm run build
npm start
```

---

## Authentication Flow

- On login/register, JWT token is stored in `localStorage` as `grocery_token`
- The Axios request interceptor automatically injects `Authorization: Bearer <token>`
- The response interceptor clears auth state and redirects to `/login` on `401`
- The `(dashboard)/layout.tsx` checks `isAuthenticated` from Redux auth slice and redirects to `/login` if not authenticated

---

## Key Features

### Dashboard
- 4 stat cards: total items, low stock, expiring soon, shopping list
- Category distribution doughnut chart (Chart.js, lazy-loaded)
- Most active items bar chart (Chart.js, lazy-loaded)
- Recent activity feed (last 8 events)
- Expiring this week panel with severity badges

### Inventory
- Full-text search with debounce
- Filter by category, location, low stock, expiring
- Inline quantity ±1 controls
- Add/edit item modal with 9 fields including expiry date
- Expiry status badges: Expired · Critical · Warning · OK
- Pagination

### Shopping List
- Quick-add form (name, quantity, unit, priority)
- Side-by-side Pending / Purchased columns
- One-click checkbox toggle between pending ↔ purchased
- Auto-added items marked with a purple "Auto" badge
- Clear purchased button

### Expiry Tracker
- Filter by 7 / 14 / 30 / 60 day windows
- Grouped sections: Expired · Critical (≤3d) · Warning (≤7d) · Upcoming

### Categories & Locations
- CRUD with modals
- Color picker (10 presets) + emoji icon for categories
- Smart icon detection for locations (fridge, freezer, pantry…)

### Household
- View all household members with roles
- Admin can change member roles
- Invite by email

---

## Docker

```bash
# From the repo root (alongside docker-compose.yml)
docker compose up --build
```

Containers:
- `grocery_frontend` — http://localhost:3000
- `grocery_backend`  — http://localhost:5000
- `grocery_mongo`    — mongodb://localhost:27017

---

## Environment Variables

| Variable | Description | Example |
|---|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | Backend API base URL | `http://localhost:5000/api` |
