# Quick Start Guide - ACA Nursery Operations Platform

## Get Running in 5 Minutes

### Prerequisites
- Docker & Docker Compose installed
- Git (optional, if cloning)

### Step 1: Navigate to Project
```bash
cd /sessions/eager-elegant-newton/nop
```

### Step 2: Start with Docker Compose
```bash
docker-compose up -d
```

This will:
- Start PostgreSQL database
- Build and start NestJS backend (port 3001)
- Build and start Next.js frontend (port 3000)

### Step 3: Initialize Database
```bash
docker-compose exec backend npm run prisma:migrate
docker-compose exec backend npm run prisma:seed
```

### Step 4: Access Application
- **Frontend**: http://localhost:3000
- **API**: http://localhost:3001

### Step 5: Login
Use default admin credentials:
- **Email**: admin@nop.com
- **Password**: Admin@123

## Development Mode (Local)

### Terminal 1 - Backend
```bash
cd backend
npm install
cp .env.example .env
npm run prisma:migrate
npm run prisma:seed
npm run start:dev
```

### Terminal 2 - Frontend
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

### Terminal 3 - Database (if not using Docker)
Ensure PostgreSQL is running:
```bash
# macOS with Homebrew
brew services start postgresql

# or use Docker
docker run -d -p 5432:5432 \
  -e POSTGRES_DB=nop_db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=password \
  postgres:15
```

## Key Features to Try

### 1. Dashboard
Login and view the main dashboard with KPIs for:
- Total students and branches
- Occupancy rates
- Financial summary
- Maintenance alerts

### 2. Student Management
- Navigate to Students
- Click "Add Student" to create a new student
- Filter by branch, class, or search by name
- Transfer students between classes

### 3. Attendance Tracking
- Go to Attendance
- Select a date and class
- Click "Mark All Present" or "Mark All Absent"
- Individually toggle student status
- Click "Save Attendance"

### 4. Finance Dashboard
- View financial overview
- Navigate to Fees or Expenses
- See branch-by-branch comparison
- Track revenue vs expenses

### 5. Notifications
- Click the bell icon to view notifications
- Automatic daily notifications for:
  - Missing daily logs
  - Unpaid fees
  - Open maintenance requests

## Database Schema Overview

Key tables in PostgreSQL:
- **users**: System users with role-based access
- **branches**: Nursery locations
- **classes**: Class groups within branches
- **students**: Student records
- **attendance**: Daily attendance records
- **daily_logs**: Operational logs for classes
- **fees**: Student fee payments
- **expenses**: Branch expense tracking
- **maintenance_requests**: Maintenance issue tracking
- **notifications**: User notifications

## API Testing

### Login
```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@nop.com","password":"Admin@123"}'
```

### Get User Info
```bash
curl -X GET http://localhost:3001/auth/me \
  -H "Authorization: Bearer <token>"
```

### List Branches
```bash
curl -X GET http://localhost:3001/branches \
  -H "Authorization: Bearer <token>"
```

### List Students
```bash
curl -X GET "http://localhost:3001/students?branchId=<branchId>" \
  -H "Authorization: Bearer <token>"
```

## Troubleshooting

### Port Already in Use
```bash
# Find process using port 3000 or 3001
lsof -i :3000
lsof -i :3001

# Kill process
kill -9 <PID>
```

### Database Connection Error
```bash
# Check PostgreSQL is running
psql -h localhost -U postgres -c "SELECT version();"

# Reset database
docker-compose down -v
docker-compose up -d
docker-compose exec backend npm run prisma:migrate
docker-compose exec backend npm run prisma:seed
```

### Clear Docker Containers
```bash
docker-compose down --remove-orphans
docker system prune -a
docker-compose up -d
```

## File Structure Quick Reference

```
nop/
├── backend/
│   ├── src/
│   │   ├── auth/        ← Authentication logic
│   │   ├── students/    ← Student management
│   │   ├── finance/     ← Fees and expenses
│   │   ├── dashboard/   ← KPI calculations
│   │   └── ...
│   ├── prisma/
│   │   ├── schema.prisma    ← Database schema
│   │   └── seed.ts          ← Initial data
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── app/           ← Pages and routes
│   │   ├── components/    ← React components
│   │   ├── lib/           ← Utilities (API, auth)
│   │   ├── hooks/         ← Custom hooks
│   │   └── types/         ← TypeScript types
│   └── package.json
│
├── docker-compose.yml   ← Docker configuration
├── README.md           ← Full documentation
└── QUICKSTART.md       ← This file
```

## Next Steps

1. **Explore the UI** - Navigate all sections
2. **Add test data** - Create branches, classes, students
3. **Review code** - Check `/src` folders for implementation
4. **API docs** - Check README.md for full API reference
5. **Customize** - Modify Tailwind colors in `frontend/tailwind.config.js`

## System Architecture

```
Frontend (Next.js 14)
    ↓ (Axios + JWT)
API Layer (http://localhost:3001)
    ↓
NestJS Backend
    ↓ (Prisma ORM)
PostgreSQL Database
```

## Credentials

### Admin User
- Email: admin@nop.com
- Password: Admin@123
- Role: SUPER_ADMIN

### Branch Managers (Sample)
- Dubai: manager.dubai@nop.com / Manager@123
- Abu Dhabi: manager.abudhabi@nop.com / Manager@123

## Support

For detailed information, see:
- `README.md` - Complete documentation
- `backend/prisma/schema.prisma` - Database schema
- `frontend/src/types/index.ts` - TypeScript definitions

Happy coding! 🚀
