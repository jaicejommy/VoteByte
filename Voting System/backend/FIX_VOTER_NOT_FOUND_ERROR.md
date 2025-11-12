# Fix: "Voter record not found for this election" Error

## 🚨 What's the Problem?

You're getting this error because you're trying to **vote without being registered as a voter first**.

```json
{
  "success": false,
  "message": "Voter record not found for this election",
  "data": null
}
```

---

## ✅ Solution: 3-Step Fix

### Step 1: Register as Voter

**First, you MUST register as a voter for the election:**

```bash
curl -X POST http://localhost:3000/api/voters/register \
  -H "Cookie: token=YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "electionId": "550e8400-e29b-41d4-a716-446655440000",
    "authType": "OTP"
  }'
```

**Success Response:**
```json
{
  "success": true,
  "message": "Voter registered successfully",
  "data": {
    "voter_id": "880e8400-e29b-41d4-a716-446655440001",
    "user_id": "990e8400-e29b-41d4-a716-446655440001",
    "election_id": "550e8400-e29b-41d4-a716-446655440000",
    "authType": "OTP",
    "verified": false,
    "has_voted": false
  }
}
```

✅ **Save the `voter_id`** - you'll need it for the next step!

---

### Step 2: Verify Your Identity

**Next, verify yourself (OTP/Aadhar/etc):**

```bash
curl -X POST http://localhost:3000/api/voters/verify/880e8400-e29b-41d4-a716-446655440001 \
  -H "Cookie: token=YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Success Response:**
```json
{
  "success": true,
  "message": "Voter verified successfully",
  "data": {
    "voter_id": "880e8400-e29b-41d4-a716-446655440001",
    "verified": true,
    "has_voted": false
  }
}
```

✅ **Now you're verified and ready to vote!**

---

### Step 3: Cast Your Vote

**Now you can vote:**

```bash
curl -X POST http://localhost:3000/api/votes/cast \
  -H "Cookie: token=YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "electionId": "550e8400-e29b-41d4-a716-446655440000",
    "candidateId": "660e8400-e29b-41d4-a716-446655440001"
  }'
```

**Success Response:**
```json
{
  "success": true,
  "message": "Vote cast successfully",
  "data": {
    "vote": {
      "vote_id": "aa0e8400-...",
      "election_id": "550e8400-...",
      "candidate_id": "660e8400-...",
      "voter_id": "880e8400-...",
      "cast_time": "2024-11-12T10:30:45Z"
    },
    "candidateName": "Democratic Party",
    "totalVotes": 45
  }
}
```

✅ **Vote cast successfully!**

---

## 🔍 Check Your Status Anytime

To check if you're registered and verified:

```bash
curl -X GET http://localhost:3000/api/voters/status/550e8400-e29b-41d4-a716-446655440000 \
  -H "Cookie: token=YOUR_JWT_TOKEN"
```

**Response if NOT registered:**
```json
{
  "success": false,
  "message": "User is not registered as a voter for this election"
}
```

**Response if registered but NOT verified:**
```json
{
  "success": true,
  "message": "Voter status retrieved successfully",
  "data": {
    "registered": true,
    "verified": false,
    "has_voted": false
  }
}
```

**Response if registered AND verified:**
```json
{
  "success": true,
  "message": "Voter status retrieved successfully",
  "data": {
    "registered": true,
    "verified": true,
    "has_voted": false
  }
}
```

---

## 🚦 Voting Process Flowchart

```
┌─────────────────────────────────┐
│ User Accesses Election          │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ Check Voter Status              │
│ GET /api/voters/status/{id}     │
└────────┬────────────────────────┘
         │
    ┌────┴──────────────────┬────────────────────┐
    │                       │                    │
    ▼                       ▼                    ▼
  NOT REGISTERED       REGISTERED          REGISTERED
  (error)              BUT NOT             AND VERIFIED
                       VERIFIED
    │                       │                    │
    │                       │                    │
    ▼                       ▼                    ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────────┐
│  REGISTER    │  │   VERIFY     │  │   VOTE NOW       │
│  POST        │  │   POST       │  │   POST           │
│  /register   │  │   /verify    │  │   /votes/cast    │
└──────────────┘  └──────────────┘  └──────────────────┘
```

---

## 📋 Common Mistakes

### ❌ Mistake 1: Trying to Vote Without Registering

```bash
# ❌ WRONG - This will fail
POST /api/votes/cast {
  "electionId": "...",
  "candidateId": "..."
}
# Error: "Voter record not found for this election"
```

**Fix:**
```bash
# ✅ CORRECT - Register first
POST /api/voters/register { "electionId": "...", "authType": "OTP" }
# Then verify
POST /api/voters/verify/{voterId}
# Then vote
POST /api/votes/cast { "electionId": "...", "candidateId": "..." }
```

---

### ❌ Mistake 2: Not Verifying

```bash
# ❌ WRONG - Voting without verification
POST /api/votes/cast
# Error: "Voter is not verified"
```

**Fix:**
```bash
# ✅ CORRECT - Verify before voting
POST /api/voters/verify/{voterId}
# Then vote
POST /api/votes/cast
```

---

### ❌ Mistake 3: Wrong Election ID

```bash
# ❌ WRONG - Using wrong election ID
POST /api/voters/register {
  "electionId": "WRONG_ID",
  "authType": "OTP"
}
# Error: "Election not found"
```

**Fix:**
```bash
# ✅ CORRECT - Use actual election ID
POST /api/voters/register {
  "electionId": "550e8400-e29b-41d4-a716-446655440000",
  "authType": "OTP"
}
```

---

## 🎯 Before You Vote - Checklist

- [ ] Election ID is correct
- [ ] User is authenticated (have JWT token)
- [ ] Registered as voter? → Call GET /api/voters/status/{electionId}
  - If no → Register with POST /api/voters/register
- [ ] Verified? → Check response from above
  - If no → Verify with POST /api/voters/verify/{voterId}
- [ ] Now vote with POST /api/votes/cast

---

## 📱 Frontend Quick Fix

If you're building a frontend, here's the correct order:

```javascript
// 1. Check if user is registered
try {
  const status = await axios.get(
    `/api/voters/status/${electionId}`,
    { withCredentials: true }
  );
  
  if (!status.data.data.registered) {
    // 2. Register if not registered
    const voter = await axios.post(
      '/api/voters/register',
      { electionId, authType: 'OTP' },
      { withCredentials: true }
    );
    voterId = voter.data.data.voter_id;
  }
  
  if (!status.data.data.verified) {
    // 3. Verify if not verified
    await axios.post(
      `/api/voters/verify/${voterId}`,
      {},
      { withCredentials: true }
    );
  }
  
  // 4. Now vote
  await axios.post(
    '/api/votes/cast',
    { electionId, candidateId },
    { withCredentials: true }
  );
  
} catch (error) {
  console.error(error.response.data.message);
}
```

---

## ✨ Summary

| Step | What to Do | Endpoint | Status After |
|------|-----------|----------|--------------|
| 1 | Register | POST /api/voters/register | registered=true, verified=false |
| 2 | Verify | POST /api/voters/verify | registered=true, verified=true |
| 3 | Vote | POST /api/votes/cast | has_voted=true |

**All 3 steps are mandatory!**

---

## 🆘 Still Having Issues?

1. **Check voter status:**
   ```bash
   GET /api/voters/status/{electionId}
   ```

2. **Verify election exists:**
   ```bash
   GET /api/elections/{electionId}
   ```

3. **Check JWT token is valid:**
   - Token should be in cookies or Authorization header
   - Token should not be expired

4. **Get candidates list:**
   ```bash
   GET /api/votes/candidates/{electionId}
   ```

---

## 📚 Related Documentation

- **VOTER_REGISTRATION_GUIDE.md** - Detailed voter registration docs
- **VOTING_QUICK_REFERENCE.md** - Quick API reference
- **VOTING_SYSTEM_DOCS.md** - Complete system documentation
