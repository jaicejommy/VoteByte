# 🐛 Fix: Cannot View Pages After Login

## 🔍 Problem

After logging in successfully, you can't access:
- Host Dashboard (`/host/dashboard`)
- Create Election (`/host/election/new`)
- Other protected pages

You might see:
- Redirect back to login
- Blank page
- "Unauthorized" message

---

## ✅ Solution (Step by Step)

### Step 1: Verify Login Success

Open **DevTools** (F12) → **Console** and run:
```javascript
const user = JSON.parse(localStorage.getItem('user'));
const token = localStorage.getItem('authToken');
console.log('User:', user);
console.log('Token:', token);
```

**Expected Output:**
```javascript
User: {
  user_id: "123abc",
  email: "host@example.com",
  fullname: "Host Name",
  role: "HOST",           // ← IMPORTANT: Must be "HOST"
  status: "ACTIVE",       // ← IMPORTANT: Must be "ACTIVE"
  // ... other fields
}
Token: "eyJhbGc..." // ← Should be a long JWT token
```

---

### Step 2: Check User Role

If you're trying to access `/host/dashboard`, verify your role:

**For HOST users:**
```javascript
const user = JSON.parse(localStorage.getItem('user'));
console.log(user.role); // Should print: HOST
```

**For regular USERS:**
```javascript
const user = JSON.parse(localStorage.getItem('user'));
console.log(user.role); // Should print: USER
```

---

### Step 3: Verify Status is ACTIVE

```javascript
const user = JSON.parse(localStorage.getItem('user'));
console.log(user.status); // Should print: ACTIVE
```

**If status is not "ACTIVE":**
- The backend didn't mark the account as verified
- You need to verify your email first
- Navigate to `/verify-email`

---

### Step 4: Clear Cache and Re-login

If still not working:

**Clear localStorage:**
```javascript
localStorage.clear();
```

Then:
1. Refresh page (Ctrl + R)
2. Go to `/login`
3. Login again
4. Check DevTools console again

---

## 🚀 Correct Login Flow

### For Regular Users (ROLE = USER)

```
1. Go to /signup
2. Select "User" from dropdown
3. Fill form and submit
4. Verify email
5. Login with email & password
6. Should redirect to → /dashboard
7. Can access user pages
```

### For Host Users (ROLE = HOST)

```
1. Go to /signup
2. Select "Host" from dropdown
3. Fill form and submit
4. Verify email
5. Login with email & password
6. Should redirect to → /host/dashboard
7. Can access host pages like:
   - /host/dashboard
   - /host/election/new
   - /host/elections
```

---

## 📋 Checklist

- [ ] Backend is running (`npm start` in backend folder)
- [ ] Frontend is running (`npm run dev` in frontend folder)
- [ ] `.env.local` exists in frontend folder
- [ ] Login was successful
- [ ] User role is correct (HOST or USER)
- [ ] User status is "ACTIVE"
- [ ] Token exists in localStorage
- [ ] Browser DevTools shows no errors

---

## 🐛 Common Issues

### Issue 1: "Page shows login screen after successful login"

**Cause:** User status is not "ACTIVE"

**Fix:**
```bash
# In backend, manually set status to ACTIVE
# Or backend login endpoint should return status: 'ACTIVE'
```

**Verify in DevTools:**
```javascript
const user = JSON.parse(localStorage.getItem('user'));
console.log(user.status === 'ACTIVE'); // Should be TRUE
```

---

### Issue 2: "HOST user can't access /host/dashboard"

**Cause:** User role is not "HOST" or user is checking wrong field

**Fix:**
```javascript
// Check the exact role value
const user = JSON.parse(localStorage.getItem('user'));
console.log('Role:', user.role);
console.log('Is HOST:', user.role === 'HOST' || user.role === 'host');
```

**Backend returns:**
```json
{
  "role": "HOST"  // ← Uppercase!
}
```

---

### Issue 3: "Regular USER redirected from /host/dashboard"

**This is CORRECT behavior!** ✓

Users should be redirected away from host-only pages. To access host pages:
1. Logout
2. Signup again as "Host"
3. Verify email
4. Login as host

---

### Issue 4: "Token keeps disappearing"

**Cause:** Token cleared on logout or after API error

**This is normal behavior.** When token disappears:
1. You're logged out
2. Go to `/login`
3. Login again
4. Token will be restored

---

## 🔧 Debug Mode

Add this to console for detailed logging:

```javascript
// Watch localStorage changes
function watchStorage() {
  setInterval(() => {
    const user = localStorage.getItem('user');
    const token = localStorage.getItem('authToken');
    console.log('[Storage Check]');
    console.log('User:', user ? JSON.parse(user).fullname : 'None');
    console.log('Token:', token ? '✓ Present' : '✗ Missing');
    console.log('Status:', user ? JSON.parse(user).status : 'N/A');
    console.log('Role:', user ? JSON.parse(user).role : 'N/A');
  }, 5000);
}

watchStorage();
```

---

## ✨ Working Examples

### After Successful LOGIN (Regular User)

**localStorage state:**
```javascript
{
  authToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  user: {
    user_id: "550e8400-e29b-41d4-a716-446655440000",
    email: "john@example.com",
    fullname: "John Doe",
    role: "USER",           // ← Regular user
    phone_number: "1234567890",
    gender: "M",
    date_of_birth: "2000-01-15",
    address: "123 Main St",
    profile_photo: "https://example.com/photo.jpg",
    joined_at: "2024-11-12T10:00:00Z",
    status: "ACTIVE",       // ← Active account
    isVerified: true        // ← Derived from status
  }
}
```

**URL Navigation:**
```
/login → /dashboard ✓ Allowed
/login → /host/dashboard ✗ Redirected to /
```

---

### After Successful LOGIN (HOST User)

**localStorage state:**
```javascript
{
  authToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  user: {
    user_id: "550e8400-e29b-41d4-a716-446655440001",
    email: "host@example.com",
    fullname: "Host Name",
    role: "HOST",           // ← Host user
    phone_number: "9876543210",
    gender: "F",
    date_of_birth: "1995-05-20",
    address: "456 Admin Ave",
    profile_photo: "https://example.com/host.jpg",
    joined_at: "2024-11-12T10:00:00Z",
    status: "ACTIVE",       // ← Active account
    isVerified: true        // ← Derived from status
  }
}
```

**URL Navigation:**
```
/login → /host/dashboard ✓ Allowed
/host/dashboard → /host/election/new ✓ Allowed
/host/dashboard → /dashboard ✗ Allowed (for any user)
```

---

## 🎯 Final Verification

To confirm everything is working:

1. **Signup as HOST**
   - Go to `/signup`
   - Select "Host"
   - Fill all fields
   - Submit

2. **Verify Email**
   - Go to `/verify-email`
   - Click verify

3. **Login**
   - Go to `/login`
   - Enter credentials
   - Should redirect to `/host/dashboard`

4. **Check DevTools**
   ```javascript
   const user = JSON.parse(localStorage.getItem('user'));
   console.log(user.role === 'HOST' && user.status === 'ACTIVE');
   // Should print: true
   ```

5. **Try to access host pages**
   - `/host/dashboard` ✓
   - `/host/election/new` ✓
   - `/host/elections` ✓

---

## 📞 Still Having Issues?

Check:
1. Is backend running? (`npm start`)
2. Is frontend running? (`npm run dev`)
3. Are there errors in console? (F12 → Console tab)
4. Did you select correct role in signup?
5. Did you verify your email?

**If still stuck:**
1. Clear all localStorage: `localStorage.clear()`
2. Close browser completely
3. Restart both backend and frontend
4. Try signup and login again

---

**You should now be able to access all pages after login! 🎉**
