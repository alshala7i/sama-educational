# ACA Nursery Operations Platform (NOP)

A complete full-stack web application for managing nursery operations including students, classes, attendance, finances, and maintenance.

## Features

- **Student Management**: Register, manage, and track student information
- **Class Management**: Organize students into classes by level (Nursery, KG1, KG2)
- **Branch Management**: Multi-branch support for nursery chains
- **Attendance Tracking**: Mark and track daily student attendance
- **Daily Logs**: Submit operational status and notes for each class
- **Finance Module**: Manage student fees, track expenses by category
- **Maintenance Requests**: Report and track maintenance issues
- **Comprehensive Reports**: Generate reports on attendance, finances, and performance
- **Notifications**: Automated daily notifications for missing logs, unpaid fees, and open maintenance
- **Role-based Access**: Super Admin, Branch Manager, Staff, and Maintenance roles

## Tech Stack

### Backend
- **Framework**: NestJS with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT (JSON Web Tokens)
- **API**: RESTful API

### Frontend
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **State Management**: Zustand
- **Data Fetching**: Axios + React Query
- **Form Handling**: React Hook Form
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Icons**: Lucide React

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL 13+
- Docker and Docker Compose (optional)

## Quick Start

### Using Docker Compose (Recommended)

1. **Clone and navigate to project**:
   ```bash
   cd nop
   ```

2. **Create environment file**:
   ```bash
   cp .env.example .env
   ```

3. **Start all services**:
   ```bash
   docker-compose up -d
   ```

4. **Wait for containers to start**, then run migrations:
   ```bash
   docker-compose exec backend npx prisma migrate dev
   docker-compose exec backend npx prisma db seed
   ```

5. **Access the application**:
   - Frontend: http://localhost:3000
   - API: http://localhost:3001

### Local Setup (Development)

#### Backend Setup

1. **Install dependencies**:
   ```bash
   cd backend
   npm install
   ```

2. **Create environment file**:
   ```bash
   cp .env.example .env
   ```

3. **Update DATABASE_URL in .env**:
   ```
   DATABASE_URL="postgresql://postgres:password@localhost:5432/nop_db"
   ```

4. **Run Prisma migrations**:
   ```bash
   npm run prisma:migrate
   npm run prisma:seed
   ```

5. **Start development server**:
   ```bash
   npm run start:dev
   ```

   Backend will be available at http://localhost:3001

#### Frontend Setup

1. **Install dependencies**:
   ```bash
   cd frontend
   npm install
   ```

2. **Create environment file**:
   ```bash
   cp .env.example .env
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

   Frontend will be available at http://localhost:3000

## Default Credentials

After seeding the database, use these credentials to login:

- **Email**: admin@nop.com
- **Password**: Admin@123
- **Role**: Super Admin

### Branch Managers (also created during seeding)

- **Dubai**: manager.dubai@nop.com / Manager@123
- **Abu Dhabi**: manager.abudhabi@nop.com / Manager@123

## Project Structure

```
nop/
├── backend/
│   ├── src/
│   │   ├── auth/           # Authentication & JWT
│   │   ├── users/          # User management
│   │   ├── branches/       # Branch operations
│   │   ├── classes/        # Class management
│   │   ├── students/       # Student records
│   │   ├── attendance/     # Attendance tracking
│   │   ├── daily-logs/     # Daily class logs
│   │   ├── maintenance/    # Maintenance requests
│   │   ├── finance/        # Fees and expenses
│   │   ├── dashboard/      # KPI dashboards
│   │   ├── notifications/  # Alerts and notifications
│   │   ├── reports/        # Report generation
│   │   ├── prisma/         # Database service
│   │   └── main.ts         # Application bootstrap
│   ├── prisma/
│   │   ├── schema.prisma   # Database schema
│   │   └── seed.ts         # Seed script
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── (dashboard)/    # Protected routes
│   │   │   ├── login/          # Login page
│   │   │   └── layout.tsx      # Root layout
│   │   ├── components/
│   │   │   ├── ui/             # Reusable UI components
│   │   │   └── layout/         # Layout components
│   │   ├── hooks/              # Custom React hooks
│   │   ├── lib/                # Utility functions
│   │   └── types/              # TypeScript types
│   └── package.json
│
├── docker-compose.yml
├── .env.example
└── README.md
```

## API Endpoints

### Authentication
- `POST /auth/login` - User login
- `GET /auth/me` - Get current user

### Users (Super Admin only)
- `GET /users` - List all users
- `POST /users` - Create user
- `PATCH /users/:id` - Update user
- `DELETE /users/:id` - Delete user

### Branches
- `GET /branches` - List branches
- `POST /branches` - Create branch
- `PATCH /branches/:id` - Update branch
- `GET /branches/:id/performance` - Branch KPIs

### Classes
- `GET /classes` - List classes
- `POST /classes` - Create class
- `PATCH /classes/:id` - Update class

### Students
- `GET /students` - List students (with filters, pagination)
- `POST /students` - Create student
- `PATCH /students/:id` - Update student
- `POST /students/:id/transfer` - Transfer to different class

### Attendance
- `GET /attendance` - Get attendance for class and date
- `POST /attendance` - Record single attendance
- `POST /attendance/bulk` - Record multiple attendance records
- `GET /attendance/report` - Attendance report by branch and date range

### Daily Logs
- `POST /daily-logs` - Submit daily log
- `GET /daily-logs` - Get logs by branch and date
- `GET /daily-logs/missing` - Get missing daily logs

### Maintenance
- `GET /maintenance` - List requests (with filters)
- `POST /maintenance` - Create request
- `PATCH /maintenance/:id/status` - Update status

### Finance
- `POST /finance/fees` - Create fee for student
- `GET /finance/fees` - List fees (with filters)
- `PATCH /finance/fees/:id` - Update payment status
- `POST /finance/expenses` - Record expense
- `GET /finance/expenses` - List expenses (with filters)
- `GET /finance/summary` - Financial summary
- `GET /finance/expense-summary` - Expenses by category
- `GET /finance/branches/comparison` - Branch comparison

### Dashboard
- `GET /dashboard/super-admin` - Super admin KPIs
- `GET /dashboard/branch/:id` - Branch KPIs
- `GET /dashboard/trend` - Revenue vs expenses trend

### Reports
- `GET /reports/attendance` - Attendance report
- `GET /reports/financial` - Financial report
- `GET /reports/maintenance` - Maintenance report
- `GET /reports/branch-performance` - Branch performance report

### Notifications
- `GET /notifications` - Get user notifications
- `GET /notifications/unread-count` - Get unread count
- `PATCH /notifications/:id/read` - Mark as read
- `POST /notifications/read-all` - Mark all as read

## Database Schema

The application uses the following main entities:
- **User**: System users with roles
- **Branch**: Nursery branch locations
- **Class**: Class groups within branches
- **Student**: Student records linked to classes
- **Attendance**: Daily attendance records
- **DailyLog**: Daily operational logs
- **MaintenanceRequest**: Maintenance tracking
- **Fee**: Student fee records
- **Expense**: Branch expenses by category
- **Notification**: User notifications

## Development Workflow

1. **Backend Development**:
   ```bash
   cd backend
   npm run start:dev  # Watch mode with hot reload
   ```

2. **Frontend Development**:
   ```bash
   cd frontend
   npm run dev  # Dev server with hot reload
   ```

3. **Database Changes**:
   ```bash
   cd backend
   npx prisma migrate dev  # Create and apply migration
   npx prisma studio      # Open Prisma Studio GUI
   ```

## Deployment

### Using Docker

1. **Build images**:
   ```bash
   docker-compose build
   ```

2. **Deploy**:
   ```bash
   docker-compose up -d
   ```

### Manual Deployment

1. **Build backend**:
   ```bash
   cd backend
   npm run build
   npm start
   ```

2. **Build and deploy frontend**:
   ```bash
   cd frontend
   npm run build
   npm start
   ```

## Environment Variables

### Backend (.env)
```
DATABASE_URL=postgresql://user:password@host:5432/nop_db
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
PORT=3001
NODE_ENV=production
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

## Features Coming Soon

- SMS notifications
- Excel export for reports
- Advanced analytics dashboard
- Mobile app
- Audit logs
- Parent portal
- Email notifications

## Troubleshooting

### Database Connection Error
- Ensure PostgreSQL is running
- Verify DATABASE_URL is correct
- Check database credentials

### Port Already in Use
- Change port in `.env` file
- Or kill process using the port

### Build Issues
- Clear node_modules: `rm -rf node_modules && npm install`
- Clear cache: `npm cache clean --force`

## Support

For issues and questions, please create an issue in the repository or contact the development team.

## License

This project is proprietary and maintained by ACA Nursery Operations.
