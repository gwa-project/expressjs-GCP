# Sena Rencar Express API

API Express + PostgreSQL dengan **Google OAuth** dan **PASETO authentication** untuk manajemen armada dan poster.

## ✨ Fitur
- 🔐 **Dual Authentication**:
  - Google OAuth 2.0 (Sign in with Google)
  - Username/password login (backward compatible)
- 🔒 **PASETO tokens** (Platform-Agnostic Security Token) - lebih secure dari JWT
- 👤 **User management** dengan role system (admin/user)
- 🚗 **CRUD armada** (`/api/cars`) - terlindungi authentication
- 📸 **CRUD poster** (`/api/posters`) - manajemen materi branding
- 🗄️ **PostgreSQL** database dengan Sequelize ORM
- 🐳 **Docker-ready** untuk deploy ke Cloud Run
- ⚡ **Auto-seeding** - Default data untuk development

## 🚀 Quick Start Lokal

### 1. Setup Database (PostgreSQL)

**Option A: Docker**
```bash
docker run -d --name postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=sena_rencar \
  -p 5432:5432 \
  postgres:15
```

**Option B: Cloud SQL** - Lihat [`SETUP_POSTGRESQL.md`](./SETUP_POSTGRESQL.md)

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env`:
```bash
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/sena_rencar

# PASETO Key (generate: npm run keygen OR openssl rand -hex 32)
PRKEY=your-32-byte-hex-key

# Google OAuth (optional untuk local)
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxx

# Admin credentials
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin
```

### 3. Install & Run

```bash
npm install
npm run dev
```

Server berjalan di `http://localhost:8080`

**Test:**
```bash
curl http://localhost:8080/health
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin"}'
```

## 🔧 Environment Variables

### Database
- `DATABASE_URL` – PostgreSQL connection string
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` – Alternative individual params

### Authentication
- `PRKEY` – **REQUIRED** - 32-byte hex key untuk PASETO (generate: `openssl rand -hex 32`)
- `PASETO_EXPIRES_IN` – Token expiration (default: `8h`)
- `GOOGLE_CLIENT_ID` – Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` – Google OAuth secret
- `GOOGLE_CREDENTIALS` – Optional service account JSON (for server-to-server)

### Admin
- `ADMIN_USERNAME` – Username untuk traditional login (default: `admin`)
- `ADMIN_PASSWORD` – Password untuk admin user
- `ADMIN_EMAIL` – Email untuk admin user

### Server
- `ALLOWED_ORIGINS` – CORS allowed origins (comma-separated atau `*`)
- `PORT` – Server port (default: `8080`)
- `NODE_ENV` – Environment (`development` / `production`)

📄 Lihat `.env.example` untuk template lengkap.

## 📁 Struktur Direktori

```
expressjs-GCP/
├── src/
│   ├── index.js              # Express app entry point
│   ├── controllers/          # Business logic
│   │   ├── authController.js    # Login, Google OAuth, profile
│   │   ├── carController.js     # CRUD armada
│   │   └── posterController.js  # CRUD poster
│   ├── models/               # Sequelize models (PostgreSQL)
│   │   ├── User.js              # User dengan OAuth support
│   │   ├── Car.js               # Armada rental
│   │   └── Poster.js            # Materi branding
│   ├── routes/               # API routes
│   │   ├── auth.js              # /auth/* endpoints
│   │   ├── cars.js              # /api/cars/* endpoints
│   │   └── posters.js           # /api/posters/* endpoints
│   ├── middleware/           # Express middleware
│   │   ├── auth.js              # PASETO token verification
│   │   └── asyncHandler.js      # Async error handling
│   └── lib/                  # Utilities
│       ├── db.js                # Sequelize connection
│       ├── paseto.js            # PASETO token functions
│       ├── google-auth.js       # Google OAuth helpers
│       └── seed.js              # Database seeding
├── Dockerfile                # Container image definition
├── .dockerignore             # Docker build exclusions
├── .env.example              # Environment template
├── GOOGLE_OAUTH_SETUP.md     # 🔐 Google OAuth setup guide
├── AUTH_MIGRATION_SUMMARY.md # 📝 Auth migration details
└── README.md                 # This file
```

## 🚀 Deploy ke Google Cloud Run

### 📖 Panduan Lengkap Deploy

Lihat **[TUTORIAL.md](./TUTORIAL.md)** untuk panduan lengkap step-by-step dari awal sampai deploy.

Tutorial mencakup:
- ✅ Setup Google Cloud Project
- ✅ Generate Service Account Key
- ✅ Setup PostgreSQL Database
- ✅ Generate PASETO Key
- ✅ Configure GitHub Secrets
- ✅ Deploy dengan GitHub Actions
- ✅ Testing & Troubleshooting

### Quick Deploy

Push ke branch `main` akan trigger auto-deploy via GitHub Actions:
```bash
git add .
git commit -m "Deploy to Cloud Run"
git push origin main
```

Monitor deployment di GitHub Actions tab.

## 📚 Dokumentasi

| File | Deskripsi |
|------|-----------|
| **[TUTORIAL.md](./TUTORIAL.md)** | 🚀 **Panduan lengkap deploy ke GCP dari awal** |
| **[.env.example](./.env.example)** | ⚙️ Environment variables template |
| **[scripts/keygen.js](./scripts/keygen.js)** | 🔑 PASETO key generator |
| **[scripts/test-db.js](./scripts/test-db.js)** | 🗄️ Database connection tester |

**Workflow:** `.github/workflows/deploy-cloudrun.yml`

## 🔐 Authentication

Backend support **2 metode** login:

### 1. Google OAuth (Recommended)

```javascript
// Frontend: Get Google ID token
// Backend endpoint:
POST /auth/google-login
{
  "credential": "google-id-token"
}

// Response:
{
  "success": true,
  "data": {
    "token": "v4.local.xxxxx...",  // PASETO token
    "profile": {
      "id": "uuid",
      "email": "user@gmail.com",
      "name": "User Name",
      "picture": "https://...",
      "role": "user"
    }
  }
}
```

### 2. Username/Password (Traditional)

```bash
POST /auth/login
{
  "username": "admin",
  "password": "admin"
}
```

### Protected Endpoints

```bash
# Include PASETO token in Authorization header
curl http://localhost:8080/api/cars \
  -H "Authorization: Bearer v4.local.xxxxx..."
```

## 🛣️ API Endpoints

### Authentication
- `POST /auth/login` - Username/password login
- `POST /auth/google-login` - Google OAuth login
- `GET /auth/profile` - Get current user (requires auth)
- `POST /auth/refresh` - Refresh token (requires auth)

### Cars (Armada)
- `GET /api/cars` - List all cars (requires auth)
- `POST /api/cars` - Create car (requires auth)
- `PUT /api/cars/:id` - Update car (requires auth)
- `DELETE /api/cars/:id` - Delete car (requires auth)

### Posters (Branding)
- `GET /api/posters` - List all posters (requires auth)
- `POST /api/posters` - Create poster (requires auth)
- `PUT /api/posters/:id` - Update poster (requires auth)
- `DELETE /api/posters/:id` - Delete poster (requires auth)

### Health
- `GET /health` - Health check (public)

Workflow GitHub Actions: `.github/workflows/deploy-cloudrun.yml`
