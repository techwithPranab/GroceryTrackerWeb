# 🛒 Grocery Inventory Backend API

Production-ready REST API for the Smart Household Grocery Inventory & Shopping List system.

## Tech Stack

- **Runtime**: Node.js 20+
- **Framework**: Express.js
- **Database**: MongoDB + Mongoose
- **Auth**: JWT + bcryptjs
- **Security**: Helmet, CORS, Rate Limiting
- **Testing**: Jest + Supertest
- **Logging**: Winston

## Quick Start

### Prerequisites

- Node.js >= 18
- MongoDB (local or Atlas)

### Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your values
nano .env
```

### Environment Variables

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/grocery_tracker
JWT_SECRET=your_super_secret_key_min_32_chars
JWT_EXPIRES_IN=7d
NODE_ENV=development
BCRYPT_SALT_ROUNDS=12
FRONTEND_URL=http://localhost:3000
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
```

### Run Development Server

```bash
npm run dev
```

### Seed Sample Data

```bash
npm run seed
# Admin:  alice@example.com / Password123
# Member: bob@example.com   / Password123
```

### Run Tests

```bash
npm test
npm run test:coverage
```

## API Endpoints

### Authentication

| Method | Endpoint              | Description          | Auth |
|--------|-----------------------|----------------------|------|
| POST   | `/api/auth/register`  | Register new user    | No   |
| POST   | `/api/auth/login`     | Login user           | No   |
| GET    | `/api/auth/me`        | Get profile          | Yes  |
| PUT    | `/api/auth/me`        | Update profile       | Yes  |

### Inventory

| Method | Endpoint                         | Description            | Auth |
|--------|----------------------------------|------------------------|------|
| GET    | `/api/inventory`                 | List items (paginated) | Yes  |
| GET    | `/api/inventory/expiring`        | Get expiring items     | Yes  |
| GET    | `/api/inventory/:id`             | Get single item        | Yes  |
| POST   | `/api/inventory`                 | Add item               | Yes  |
| PUT    | `/api/inventory/:id`             | Update item            | Yes  |
| PATCH  | `/api/inventory/:id/quantity`    | Update quantity        | Yes  |
| DELETE | `/api/inventory/:id`             | Delete item            | Yes  |

### Shopping List

| Method | Endpoint                            | Description              | Auth |
|--------|-------------------------------------|--------------------------|------|
| GET    | `/api/shopping-list`                | Get all items            | Yes  |
| POST   | `/api/shopping-list`                | Add item manually        | Yes  |
| PUT    | `/api/shopping-list/:id`            | Update / mark purchased  | Yes  |
| DELETE | `/api/shopping-list/:id`            | Remove item              | Yes  |
| DELETE | `/api/shopping-list/clear-purchased`| Clear purchased items    | Yes  |

### Categories

| Method | Endpoint              | Description     | Auth |
|--------|-----------------------|-----------------|------|
| GET    | `/api/categories`     | List categories | Yes  |
| POST   | `/api/categories`     | Create category | Yes  |
| PUT    | `/api/categories/:id` | Update category | Yes  |
| DELETE | `/api/categories/:id` | Delete category | Yes  |

### Locations

| Method | Endpoint             | Description    | Auth |
|--------|----------------------|----------------|------|
| GET    | `/api/locations`     | List locations | Yes  |
| POST   | `/api/locations`     | Create location| Yes  |
| PUT    | `/api/locations/:id` | Update         | Yes  |
| DELETE | `/api/locations/:id` | Delete         | Yes  |

### Dashboard

| Method | Endpoint                              | Description              | Auth |
|--------|---------------------------------------|--------------------------|------|
| GET    | `/api/dashboard/stats`                | Summary statistics       | Yes  |
| GET    | `/api/dashboard/category-distribution`| Items per category       | Yes  |
| GET    | `/api/dashboard/top-items`            | Most active items        | Yes  |

### Household

| Method | Endpoint                          | Description         | Auth  |
|--------|-----------------------------------|---------------------|-------|
| POST   | `/api/household`                  | Create household    | Yes   |
| GET    | `/api/household`                  | Get household info  | Yes   |
| GET    | `/api/household/members`          | List members        | Yes   |
| POST   | `/api/household/invite`           | Invite member       | Yes   |
| GET    | `/api/household/activity`         | Activity log        | Yes   |
| PATCH  | `/api/household/members/:id/role` | Update member role  | Admin |

## Query Parameters (Inventory)

```
GET /api/inventory?page=1&limit=20&search=milk&categoryId=...&lowStock=true&expiring=true&sortBy=itemName&sortOrder=asc
```

## Auto Shopping List Logic

When an inventory item's `quantity <= minimumThreshold`, the system **automatically** creates a pending shopping list entry with:
- `autoAdded: true`
- `priority: high`
- Calculated quantity needed to reach threshold

## Project Structure

```
src/
├── app.js                  # Express app setup
├── server.js               # Entry point + graceful shutdown
├── config/
│   ├── database.js         # MongoDB connection
│   └── env.js              # Environment config
├── controllers/            # Request/response handlers
├── services/               # Business logic
├── models/                 # Mongoose schemas
├── routes/                 # Express routers
├── middleware/             # Auth, error handler, validator
├── validators/             # express-validator rules
└── utils/                  # Logger, AppError, apiResponse
tests/                      # Jest + Supertest tests
scripts/
└── seed.js                 # Database seeder
```

## Docker

```bash
# Build image
docker build -t grocery-backend .

# Run container
docker run -p 5000:5000 \
  -e MONGO_URI=mongodb://host.docker.internal:27017/grocery_tracker \
  -e JWT_SECRET=your_secret \
  grocery-backend
```

## Health Check

```
GET /health
→ { "status": "OK", "timestamp": "...", "environment": "production" }
```
