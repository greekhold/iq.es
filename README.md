# IQ.es - Ice Crystal Factory Management System

Sistem manajemen pabrik dan distribusi es kristal.

## Tech Stack

**Backend:**
- Laravel 12
- JWT Authentication
- PostgreSQL/SQLite

**Frontend:**
- React + Vite
- Tailwind CSS v4
- Zustand (state management)

## Quick Start

### Backend
```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan jwt:secret
php artisan migrate --seed
php artisan serve --port=8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Owner | owner@iq.es | password123 |
| Admin | admin@iq.es | password123 |
| Kasir | kasir@iq.es | password123 |
| Supplier | supplier@iq.es | password123 |

## Features

- ✅ Role-based access control
- ✅ Products & Pricing management
- ✅ Movement-based inventory
- ✅ Sales (Factory & Field channels)
- ✅ Production tracking
- ✅ Reports & statistics
- ✅ Audit logging
