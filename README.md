# Smart Library System

## 📚 Project Description

A full-stack web application for managing a library's book collection. Built with the MERN stack (MongoDB, Express.js, React, Node.js), this system allows users to register, login, and perform CRUD operations on books. The application features a modern, responsive UI with gradient designs, user authentication with JWT tokens, and comprehensive error handling.

**Key Features:**
- User authentication (Register/Login with JWT)
- Add, view, and delete books
- Client-side form validation
- Responsive design (mobile and desktop)
- Real-time error and success messages
- ISBN validation
- Secure password hashing with bcrypt

---

## 🛠️ Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas account)
- npm or yarn package manager

### 1. Clone the Repository
```bash
git clone <repository-url>
cd "5th Semester/web dev final Lab"
```

### 2. Backend Setup
```bash
# Navigate to backend folder
cd backend

# Install dependencies
npm install

# Create .env file with the following variables:
# MONGO_URI=your_mongodb_connection_string
# JWT_SECRET=your_secret_key
# PORT=5000

# Example .env file:
MONGO_URI=mongodb://localhost:27017/library-system
JWT_SECRET=your_super_secret_jwt_key_here
PORT=5000
```

### 3. Frontend Setup
```bash
# Navigate to frontend folder (from project root)
cd frontend

# Install dependencies
npm install
```

---

## 🚀 How to Run the Application

### Step 1: Start MongoDB
Make sure MongoDB is running on your system:
```bash
# If using local MongoDB
mongod
```

### Step 2: Start the Backend Server
```bash
# From the backend directory
cd backend
node index.js

# Server will run on http://localhost:5000
```

### Step 3: Start the Frontend
```bash
# Open a new terminal and navigate to frontend directory
cd frontend
npm start

# React app will run on http://localhost:3000
```

### Step 4: Access the Application
1. Open your browser and go to `http://localhost:3000`
2. Create a new account using the **Signup** page
3. Login with your credentials
4. Start managing your book collection!

---

## 📁 Project Structure

```
web dev final Lab/
├── backend/
│   ├── models/          # MongoDB schemas (User, Book)
│   ├── routes/          # API routes (userRoutes, bookRoutes)
│   ├── index.js         # Server entry point
│   ├── package.json
│   └── .env             # Environment variables
│
└── frontend/
    ├── public/          # Static files
    ├── src/
    │   ├── components/  # React components (Login, Signup, Dashboard, BookForm, BookList)
    │   ├── App.js       # Main app component
    │   └── index.js     # React entry point
    └── package.json
```

---

## 🔧 Technologies Used

**Backend:**
- Node.js & Express.js
- MongoDB & Mongoose
- JWT for authentication
- bcryptjs for password hashing
- CORS for cross-origin requests

**Frontend:**
- React.js
- React Router for navigation
- Axios for API requests
- Tailwind CSS for styling

---

## 📝 API Endpoints

### User Routes (`/api/users`)
- `POST /register` - Register new user
- `POST /login` - Authenticate user
- `GET /` - Get all users
- `PUT /:id` - Update user
- `DELETE /:id` - Delete user

### Book Routes (`/api/books`)
- `POST /` - Add new book
- `GET /` - Get all books
- `DELETE /:id` - Delete book by ID

---

## 👥 Author

Web Development Final Lab Project - 5th Semester
