# Prime College SIMS
### Student Information Management System — Prime College Secondary School, Gombe

A production-ready full-stack MERN application with role-based access for Admin, Teacher, and Student.

---

## Project Structure

```
SIMS/
├── client/          # React + Vite frontend
├── server/          # Node.js + Express backend
└── README.md
```

---

## Tech Stack

| Layer      | Technology                              |
|------------|-----------------------------------------|
| Frontend   | React 18, Vite, Tailwind CSS, Recharts  |
| Backend    | Node.js, Express.js                     |
| Database   | MongoDB + Mongoose                      |
| Auth       | JWT + bcrypt (Role-Based Access Control)|
| Security   | Helmet, CORS, Rate Limiting             |

---

## Quick Start

### 1. Install dependencies

```bash
# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

### 2. Configure environment

The `server/.env` file is pre-configured for local development:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/prime_college_sims
JWT_SECRET=PrimeCollegeSimsSecretKey2024!@#SuperSecure
JWT_EXPIRE=7d
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

> For production, update `MONGO_URI` with your MongoDB Atlas URI and set a strong `JWT_SECRET`.

### 3. Seed the database

```bash
cd server
npm run seed
```

### 4. Start the servers

**Terminal 1 — Backend:**
```bash
cd server
npm run dev        # http://localhost:5000
```

**Terminal 2 — Frontend:**
```bash
cd client
npm run dev        # http://localhost:5173
```

Open **http://localhost:5173** — you will see the login page.

---

## Demo Credentials

| Role    | Email                                             | Password      |
|---------|---------------------------------------------------|---------------|
| Admin   | admin@primecollege.edu.ng                         | admin1234     |
| Teacher | aliyu.bello@primecollege.edu.ng                   | teacher1234   |
| Student | amina.yusuf@student.primecollege.edu.ng           | student1234   |

---

## User Roles & Access

| Feature              | Admin | Teacher | Student |
|----------------------|-------|---------|---------|
| Dashboard Analytics  | ✅    | ✅      | ✅      |
| Manage Students      | ✅    | ❌      | ❌      |
| Manage Teachers      | ✅    | ❌      | ❌      |
| Manage Classes       | ✅    | ❌      | ❌      |
| Manage Subjects      | ✅    | ❌      | ❌      |
| Mark Attendance      | ✅    | ✅      | ❌      |
| Upload Results       | ✅    | ✅      | ❌      |
| View Own Results     | ❌    | ❌      | ✅      |
| View Own Attendance  | ❌    | ❌      | ✅      |
| Announcements        | CRUD  | Read    | Read    |
| User Accounts        | ✅    | ❌      | ❌      |

---

## Grading System

| Grade | Score Range | Remark    |
|-------|-------------|-----------|
| A     | 70 – 100    | Excellent |
| B     | 60 – 69     | Very Good |
| C     | 50 – 59     | Good      |
| D     | 45 – 49     | Fair      |
| E     | 40 – 44     | Pass      |
| F     | 0  – 39     | Fail      |

**Score Breakdown:** CA1 (/30) + CA2 (/30) capped at 40, Exam (/100) capped at 60 → Total /100

---

## API Reference

| Method | Endpoint                          | Auth Required      |
|--------|-----------------------------------|--------------------|
| POST   | /api/auth/login                   | Public             |
| GET    | /api/auth/me                      | Any                |
| PUT    | /api/auth/change-password         | Any                |
| GET    | /api/users                        | Admin              |
| POST   | /api/users                        | Admin              |
| PUT    | /api/users/:id/toggle-status      | Admin              |
| PUT    | /api/users/:id/reset-password     | Admin              |
| DELETE | /api/users/:id                    | Admin              |
| GET    | /api/students                     | Any                |
| POST   | /api/students                     | Admin              |
| GET    | /api/students/me                  | Student            |
| PUT    | /api/students/:id                 | Admin              |
| DELETE | /api/students/:id                 | Admin              |
| GET    | /api/teachers                     | Any                |
| POST   | /api/teachers                     | Admin              |
| GET    | /api/teachers/me                  | Teacher            |
| GET    | /api/classes                      | Any                |
| POST   | /api/classes                      | Admin              |
| GET    | /api/subjects                     | Any                |
| POST   | /api/subjects                     | Admin              |
| GET    | /api/results                      | Any                |
| POST   | /api/results                      | Admin, Teacher     |
| POST   | /api/results/bulk                 | Admin, Teacher     |
| GET    | /api/results/my                   | Student            |
| GET    | /api/results/report-card/:id      | Any                |
| POST   | /api/attendance                   | Admin, Teacher     |
| GET    | /api/attendance                   | Any                |
| GET    | /api/attendance/my                | Student            |
| GET    | /api/attendance/summary/:id       | Any                |
| GET    | /api/announcements                | Any                |
| POST   | /api/announcements                | Admin              |
| GET    | /api/dashboard/stats              | Admin              |

---

## Classes

JSS1, JSS2, JSS3, SS1, SS2, SS3

## Subjects

English Language, Mathematics, Basic Science, Biology, Chemistry, Physics, Economics, Government, Civic Education, Computer Studies

---

## Security

- JWT tokens expire in 7 days
- Passwords hashed with bcrypt (12 salt rounds)
- Helmet sets secure HTTP headers
- Rate limiting: 300 requests / 15 min per IP
- CORS restricted to CLIENT_URL
- Role-based middleware on every protected route

---

© 2024 Prime College Secondary School, Gombe. All Rights Reserved.
