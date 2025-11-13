# 🔗 Frontend-Backend Integration Guide

## ✅ What's Been Connected

### 1. **Authentication System (Complete)**
- ✅ User Registration (Signup)
- ✅ User Login
- ✅ User Logout
- ✅ Auth Token Management
- ✅ Protected Routes
- ✅ Host/User Role Checking

### 2. **API Communication**
- ✅ Axios configured with base URL
- ✅ Request/Response interceptors
- ✅ Automatic token inclusion in headers
- ✅ Cookie support (withCredentials)
- ✅ Error handling and 401 redirect

### 3. **Auth Store (Zustand)**
- ✅ User state management
- ✅ Authentication status
- ✅ Error handling
- ✅ Loading states
- ✅ Token persistence

### 4. **Route Protection**
- ✅ ProtectRoute - For regular users
- ✅ HostProtectRoute - For host/admin users
- ✅ RedirectAuthenticatedUser - Redirects authenticated users away from login/signup

---

## 🚀 Setup Instructions

### Backend Setup

1. **Install Dependencies**
```bash
cd backend
npm install
```

2. **Configure Environment Variables**
Create a `.env` file in backend folder:
```env
EXPRESS_SESSION_SECRET=your_secret_here
DATABASE_URL=your_database_url
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

3. **Setup Database**
```bash
npx prisma migrate dev
```

4. **Start Backend Server**
```bash
npm start
# Server runs on http://localhost:3000
```

---

### Frontend Setup

1. **Install Dependencies**
```bash
cd frontend
npm install
```

2. **Create `.env.local` (Already Created)**
```env
VITE_API_URL=http://localhost:3000/api
```

3. **Start Frontend Development Server**
```bash
npm run dev
# Frontend runs on http://localhost:5173
```

---

## 📝 Files Modified/Created

### Backend (No changes needed, already configured)
- `routes/auth.js` - Auth endpoints
- `controllers/authController.js` - Auth logic
- `services/authService.js` - Auth service
- `app.js` - Route registration

### Frontend (New/Modified)

**Created:**
1. `src/services/apiService.js` - Axios API instance with interceptors
2. `frontend/.env.local` - Environment variables

**Modified:**
1. `src/store/authStore.js` - Complete rewrite to use backend API
2. `src/routes/ProtectRoute.jsx` - Updated field checking
3. `src/routes/HostProtectRoute.jsx` - Updated field checking
4. `src/pages/SignUpPage.jsx` - Fixed signup call
5. `src/pages/LoginPage.jsx` - Fixed login with role-based routing

---

## 🔄 Authentication Flow

### Registration (Signup)
```
1. User fills form (name, email, password, role)
2. Frontend sends to POST /api/auth/register
3. Backend validates and creates user in DB
4. Frontend stores email and redirects to /verify-email
5. User receives verification email
```

### Login
```
1. User enters email and password
2. Frontend sends to POST /api/auth/login
3. Backend validates credentials
4. Backend returns user data + JWT token
5. Frontend stores token and user in localStorage
6. Frontend redirects to /dashboard (user) or /host/dashboard (host)
```

### Protected Routes
```
1. User tries to access protected route
2. ProtectRoute checks if authenticated
3. If not authenticated → redirect to /login
4. If authenticated but not active → redirect to /verify-email
5. If authenticated + active → allow access
```

---

## 🔐 Data Flow

### User Data Stored in Frontend
```javascript
{
  user_id: "uuid",
  email: "user@example.com",
  fullname: "John Doe",
  role: "USER" or "HOST",
  phone_number: "1234567890",
  gender: "M|F|OTHER",
  date_of_birth: "2000-01-01",
  address: "123 Street",
  profile_photo: "url",
  joined_at: "2024-11-12T10:00:00Z",
  status: "ACTIVE|INACTIVE",
  isVerified: true // derived from status === 'ACTIVE'
}
```

### Token Storage
- **Location:** `localStorage.authToken`
- **Sent in:** `Authorization: Bearer <token>` header
- **Duration:** 7 days

---

## 🧪 Testing the Integration

### 1. Test Signup
```bash
# Navigate to http://localhost:5173/signup
# Fill in:
# - Full Name: John Doe
# - Email: john@example.com
# - Password: SecurePassword123
# - Role: USER (or HOST)
# - Submit
# Expected: Redirect to /verify-email
```

### 2. Test Login
```bash
# Navigate to http://localhost:5173/login
# Fill in:
# - Email: john@example.com
# - Password: SecurePassword123
# - Submit
# Expected: Login success → Redirect to /dashboard (user) or /host/dashboard (host)
```

### 3. Test Protected Routes
```bash
# Try to access /dashboard without login
# Expected: Redirect to /login

# Login first, then try /host/dashboard with user role
# Expected: Redirect to / (unauthorized)

# Login as HOST, then try /host/dashboard
# Expected: Access granted
```

---

## 🛠️ Troubleshooting

### Issue: "Cannot GET /api/auth/..."
**Solution:** Backend is not running. Start backend with `npm start`

### Issue: "CORS Error"
**Solution:** CORS is already configured in backend for `http://localhost:5173`

### Issue: "Login works but pages not visible"
**Solution:** 
- Check localStorage has `authToken` and `user`
- Check user role in DevTools: `JSON.parse(localStorage.getItem('user')).role`
- Make sure role matches route protection (USER vs HOST)

### Issue: "Pages show Login page after login"
**Solution:**
- Verify backend returned `user` with `status: 'ACTIVE'`
- Check console for auth errors
- Clear localStorage and login again

---

## 📊 API Endpoints Connected

### Auth Endpoints
| Method | Endpoint | Description | Protected |
|--------|----------|-------------|-----------|
| POST | `/api/auth/register` | Register new user | ❌ |
| POST | `/api/auth/login` | Login user | ❌ |
| POST | `/api/auth/logout` | Logout user | ✅ |
| GET | `/api/auth/me` | Get current user | ✅ |

---

## 🎯 Next Steps

### 1. **Test the Integration**
- Start backend: `npm start`
- Start frontend: `npm run dev`
- Test signup → login → dashboard access

### 2. **Connect Election Features**
When ready, connect:
- Election CRUD endpoints
- Candidate management endpoints
- Voting system endpoints
- Voter registration endpoints

### 3. **Frontend Components**
Update components to:
- Use election store with API calls
- Display real data from backend
- Handle loading/error states

---

## 📚 Additional Resources

### Backend Auth Documentation
See `backend/VOTING_SYSTEM_DOCS.md` for complete voting system documentation

### Frontend Components
- `src/components/Input.jsx` - Reusable input component
- `src/components/NavBar.jsx` - Navigation with auth display
- `src/components/LoadingSpinner.jsx` - Loading state

### Stores (Zustand)
- `src/store/authStore.js` - Authentication state
- `src/store/electionStore.js` - Election state (to be connected)

---

## ✨ Features Included

✅ JWT-based authentication
✅ Email verification workflow
✅ Role-based access control (USER vs HOST)
✅ Persistent login (localStorage)
✅ Automatic token refresh (via interceptor)
✅ Secure logout
✅ Error toast notifications
✅ Loading states
✅ Request/Response interceptors
✅ CORS enabled

---

## 🔗 Quick Links

**Backend:** `http://localhost:3000`
**Frontend:** `http://localhost:5173`
**Backend API:** `http://localhost:3000/api`

---

**Setup Complete! 🎉 Your frontend and backend are now connected!**
