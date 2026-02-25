# No Dues Management System

A full-stack MERN application to simplify and digitize the college no-dues clearance process. It supports role-based workflows for **Student**, **Faculty**, and **HOD** users with secure authentication and multi-stage approvals.

## Features

- Role-based authentication and protected routes
- Student registration/login and subject-wise dues tracking
- Faculty registration/login and teaching assignment management
- Faculty approval flow for assignments, lab manuals, and presentations
- HOD dashboard for department-level review and final approval/rejection
- Profile pages for Student, Faculty, and HOD
- Configurable frontend API base URL using Redux Toolkit

## Tech Stack

### Frontend
- React (Vite)
- Tailwind CSS
- Redux Toolkit
- React Router
- Axios
- React Toastify

### Backend
- Node.js
- Express.js
- MongoDB + Mongoose
- JWT Authentication
- bcryptjs

## Project Structure

```text
📦 NoDuesManagementSystem
├── backend/
│   ├── config/
│   ├── controller/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── Server.js
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── app/
│   │   ├── features/
│   │   └── Components/
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── .gitignore
└── README.md
```

## Getting Started

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd NoDuesManagementSystem
```

### 2. Install dependencies

```bash
cd backend
npm install

cd ..\frontend
npm install
```

### 3. Configure environment variables

Create `backend/.env`:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
SECRET_KEY=your_jwt_secret
```

Create `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:5000
```

### 4. Run the app

In terminal 1 (backend):

```bash
cd backend
npm run server
```

In terminal 2 (frontend):

```bash
cd frontend
npm run dev
```

## Main API Modules

- `/Student` - auth, profile, student list, faculty status updates, HOD decision updates
- `/Faculty` - auth, profile CRUD, teaching details CRUD, faculty listing/filtering
- `/Hod` - auth and profile management

## Current Workflow

1. Student registers/logs in and views dues status by subject.
2. Faculty logs in, reviews student submissions, and marks each item approved/rejected.
3. HOD reviews department students and gives final no-dues decision.

## Future Improvements

- Route-level JWT middleware enforcement on all protected APIs
- Better validation and error handling consistency
- Automated email/notification flow
- Test coverage for controllers and routes
- Better dashboard analytics and reports

## Author

Vipin Singh
