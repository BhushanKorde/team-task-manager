# 🚀 Team Task Manager Pro

A **full-stack web application** for managing projects and tasks with **role-based access control**.
Admins can create projects, assign tasks, and monitor progress, while members can update task status.

---

## 🌐 Live Demo

👉 https://team-task-manager-production-d72e.up.railway.app/login

---

## 📌 Features

### 🔐 Authentication

* Member Signup & Login
* Admin Login (default + created admins)
* JWT-based authentication
* Protected routes

---

### 👑 Admin Features

* Create projects with deadline & description
* Add members (only registered users)
* Create & assign tasks to project members
* View all tasks and progress
* Create additional admins

---

### 👤 Member Features

* View assigned tasks only
* Update task status:

  * Pending → In Progress → Completed
* Cannot create or assign tasks

---

### 📁 Project Management

* Create, update, delete projects
* Add members from database (no duplicates)
* Searchable member selection

---

### ✅ Task Management

* Create, update, delete tasks
* Assign only project members
* Deadline tracking
* Status updates reflected in real-time

---

### 📊 Dashboard

* Total tasks
* Completed tasks
* Pending tasks
* Progress tracking

---

## 🧠 Key Highlights

* Role-based access control (Admin / Member)
* Secure JWT authentication
* Proper database relationships:

  * User ↔ Project ↔ Task
* Real-time updates via shared database
* Clean and modern UI (Tailwind CSS)

---

## 🛠️ Tech Stack

### Frontend

* React (Vite)
* Tailwind CSS

### Backend

* Node.js
* Express.js

### Database

* MongoDB (Mongoose)

### Deployment

* Backend: Railway
* Frontend: Vercel

---

## 📁 Project Structure

```
team-task-manager/
│
├── backend/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   └── server.js
│
├── frontend/
│   ├── src/
│   ├── components/
│   ├── pages/
│   └── layout/
│
└── README.md
```

---

## ⚙️ Setup Instructions

### 1️⃣ Clone Repository

```
git clone https://github.com/your-username/team-task-manager.git
cd team-task-manager
```

---

### 2️⃣ Backend Setup

```
cd backend
npm install
```

Create `.env` file:

```
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret_key
PORT=5000
```

Run backend:

```
npm run dev
```

---

### 3️⃣ Frontend Setup

```
cd frontend
npm install
npm run dev
```

---

## 🔐 Default Admin Login

```
Email: admin@test.com
Password: admin123
```

---

## 🎥 Demo Video

👉 https://your-demo-video-link

---

## 📌 API Endpoints (Sample)

| Method | Endpoint        | Description    |
| ------ | --------------- | -------------- |
| POST   | /api/auth/login | Login          |
| POST   | /api/projects   | Create project |
| GET    | /api/tasks      | Get tasks      |
| PUT    | /api/tasks/:id  | Update task    |

---

## 💡 Future Improvements

* Real-time updates using WebSockets
* Notifications system
* File attachments in tasks
* Role-based analytics dashboard

---

## 👨‍💻 Author

Bhushan Korde

---

## ⭐ Conclusion

This project demonstrates a **complete full-stack solution** with proper architecture, role-based access, and real-world workflow suitable for internship-level development.

---
