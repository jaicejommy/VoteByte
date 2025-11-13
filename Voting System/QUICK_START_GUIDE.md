# 🚀 Quick Start - Frontend-Backend Connection

## ✨ What's Fixed

Your frontend and backend are now fully connected for:
- ✅ User Registration (Signup)
- ✅ User Login
- ✅ NavBar showing host options (Create Election, etc.)
- ✅ Route protection based on user role
- ✅ Persistent authentication

---

## 🎯 Quick Setup (5 minutes)

### Terminal 1: Start Backend
```bash
cd backend
npm install  # if not already done
npm start
```

**Expected output:**
```
Server running on port 3000
Database connected
```

### Terminal 2: Start Frontend
```bash
cd frontend
npm install  # if not already done
npm run dev
```

**Expected output:**
```
VITE v... ready in ... ms

➜ Local:   http://localhost:5173/
➜ press h + enter to show help
```

---

## 📝 Testing Steps (10 minutes)

### Test 1: Signup as HOST

1. Open browser: `http://localhost:5173`
2. Click "Login" → "Sign Up"
3. Fill form:
   - **Full Name:** John Host
   - **Email:** host@example.com
   - **Password:** Password123!
   - **Role:** Select "Host"
4. Click "Sign Up"
5. **Expected:** Redirected to `/verify-email`

### Test 2: Verify Email & Login

1. Go to `/verify-email`
2. Click "Verify Email" (demo mode skips actual email)
3. Should see success message
4. Go to `/login`
5. Enter credentials:
   - **Email:** host@example.com
   - **Password:** Password123!
6. Click "Login"
7. **Expected:** Redirected to `/host/dashboard`

### Test 3: Check NavBar

After login, your NavBar should show:
```
VoteByte [HOST] | Home | Elections | Profile | Host Dashboard | My Elections | Create Election | Logout
```

If you see this, everything works! ✅

### Test 4: Click Create Election

1. Click "Create Election" in NavBar
2. You should see the Create Election form
3. **Expected:** Form displayed without redirect

---

## 🐛 Troubleshooting

### Problem 1: "Cannot connect to backend"
```
Error: Network Error
```

**Solution:**
- Check backend is running: `npm start` in backend folder
- Backend should be on `http://localhost:3000`
- Check for errors in backend terminal

---

### Problem 2: "NavBar doesn't show Create Election"

**Check 1:** Are you logged in?
```javascript
// In DevTools console:
localStorage.getItem('authToken')
// Should show a token, not null
```

**Check 2:** Is user role "HOST"?
```javascript
const user = JSON.parse(localStorage.getItem('user'));
console.log(user.role);
// Should print: HOST (not host, HOST!)
```

**Check 3:** NavBar has been updated?
- Hard refresh: `Ctrl + Shift + R`
- Clear cache and reload

**Solution:**
1. Logout
2. Hard refresh: `Ctrl + Shift + R`
3. Signup again as HOST
4. Login again
5. Check NavBar

---

### Problem 3: "Can't see Create Election page"

**Issue:** Redirected to login

**Cause:** Not authenticated or role is wrong

**Solution:**
```javascript
// Check in DevTools:
const user = JSON.parse(localStorage.getItem('user'));
console.log('Authenticated:', !!localStorage.getItem('authToken'));
console.log('Role:', user?.role);
console.log('Is HOST:', user?.role === 'HOST');

// All three should be true
```

---

### Problem 4: "Form fields don't accept input"

**Issue:** Form appears frozen

**Solution:**
1. Check browser console for errors: `F12 → Console tab`
2. Hard refresh: `Ctrl + Shift + R`
3. Restart frontend: `Ctrl + C` then `npm run dev`

---

## 📊 Architecture Overview

```
┌─────────────────────────────────────────┐
│         FRONTEND (React + Vite)         │
│  - SignUpPage                           │
│  - LoginPage                            │
│  - NavBar (shows Create Election)       │
│  - ProtectRoute (guards pages)          │
│  - authStore (manages user state)       │
└────────────────┬────────────────────────┘
                 │ HTTP (CORS enabled)
                 ↓
        http://localhost:3000
                 ↓
┌────────────────────────────────────────┐
│       BACKEND (Node.js + Express)      │
│  - /api/auth/register                  │
│  - /api/auth/login                     │
│  - /api/auth/logout                    │
│  - /api/auth/me                        │
└────────────────┬───────────────────────┘
                 │
                 ↓
      ┌──────────────────────┐
      │   PostgreSQL DB      │
      │  (Neon Cloud)        │
      └──────────────────────┘
```

---

## 🔐 Data Storage

### Frontend (localStorage)
```javascript
// After login, two items stored:
{
  authToken: "eyJhbGc...",  // JWT token (7 days)
  user: {
    user_id: "...",
    email: "...",
    fullname: "...",
    role: "HOST",           // ← determines which options shown
    status: "ACTIVE",
    // ... other fields
  }
}
```

### Backend (PostgreSQL)
```sql
-- User table stores:
- user_id (UUID)
- email (unique)
- password (hashed with bcrypt)
- fullname
- role (USER or HOST)
- status (ACTIVE or INACTIVE)
- ... profile fields
```

---

## 📱 Feature Checklist

After successful setup, you should be able to:

- [ ] Signup with email/password/role
- [ ] See verification page
- [ ] Login with credentials
- [ ] See NavBar with options
- [ ] See "Create Election" in NavBar (if HOST)
- [ ] Click "Create Election" and see form
- [ ] See "Logout" button
- [ ] Click Logout and return to login
- [ ] Signup again as different role
- [ ] Regular users don't see host options

---

## 🎨 Frontend Components Updated

| Component | What Changed | Why |
|-----------|---|---|
| `authStore.js` | Connected to backend API | Real authentication |
| `NavBar.jsx` | Check `role` instead of `userType` | Match backend field |
| `ProtectRoute.jsx` | Check `status === 'ACTIVE'` | Match backend data |
| `HostProtectRoute.jsx` | Check `role === 'HOST'` | Match backend data |
| `SignUpPage.jsx` | Pass params in correct order | Backend expects specific order |
| `LoginPage.jsx` | Handle role-based redirect | Route users to correct dashboard |
| `apiService.js` | **NEW** - Axios instance | Centralized API calls |

---

## 🔗 Key Files

### Backend (Already working)
- `backend/routes/auth.js` - Route definitions
- `backend/controllers/authController.js` - Request handlers
- `backend/services/authService.js` - Business logic
- `backend/.env` - Configuration

### Frontend (Just connected)
- `frontend/src/store/authStore.js` - State management
- `frontend/src/services/apiService.js` - API calls
- `frontend/src/components/NavBar.jsx` - Navigation
- `frontend/src/routes/ProtectRoute.jsx` - Route guards
- `frontend/.env.local` - Config

---

## 🚀 Next Steps (After Verification)

1. **Test Voting System:**
   - Create an election as HOST
   - Register as voter (USER role)
   - Vote in the election

2. **Connect Election CRUD:**
   - Update `electionStore.js` to call backend API
   - Connect Create/Edit/Delete election pages

3. **Connect Voting Pages:**
   - Connect voting endpoints
   - Display real voting data
   - Update candidate approval system

---

## 📞 Common Questions

**Q: Do I need to verify email every time?**
A: No, only once during signup. After verification, you can login normally.

**Q: Where are tokens stored?**
A: In browser `localStorage` under key `authToken`. Automatically included in API requests.

**Q: Why do I need different roles?**
A: HOST users can create elections. Regular USERS can only vote.

**Q: How long is the login valid?**
A: 7 days. After that, you need to login again.

**Q: Can I change role after signup?**
A: Not in current implementation. Would need to signup again with different role.

---

## ✅ You're All Set!

Your voting system frontend and backend are now connected! 

**Next:** Test the features listed in the checklist above. 🎉

---

## 📞 Still Having Issues?

1. Check both terminals running (backend & frontend)
2. Check console for errors: `F12 → Console`
3. Check localStorage: 
   ```javascript
   localStorage.getItem('authToken')
   localStorage.getItem('user')
   ```
4. Restart both servers:
   - Backend: `Ctrl + C` then `npm start`
   - Frontend: `Ctrl + C` then `npm run dev`

**Created guides:**
- `NAVBAR_FIX_CREATE_ELECTION.md` - NavBar fix details
- `FRONTEND_BACKEND_INTEGRATION.md` - Full integration docs
- `FIX_PAGES_NOT_VISIBLE_AFTER_LOGIN.md` - Page access troubleshooting
