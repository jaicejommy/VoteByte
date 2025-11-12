# 🎯 QUICK REFERENCE CARD

## Your Error & Solution (One Page)

### ❌ Error You Got
```
"Voter record not found for this election"
```

### ✅ Why It Happened
You tried to vote without joining the election

### ✅ Quick Fix (Copy-Paste These)

#### 1. Join Election
```bash
curl -X POST http://localhost:3000/api/voters/register \
  -H "Cookie: token=YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"electionId":"YOUR_ELECTION_ID","authType":"OTP"}'
```
**Save the `voter_id` from response!**

#### 2. Verify Identity
```bash
curl -X POST http://localhost:3000/api/voters/verify/YOUR_VOTER_ID \
  -H "Cookie: token=YOUR_TOKEN"
```

#### 3. Vote
```bash
curl -X POST http://localhost:3000/api/votes/cast \
  -H "Cookie: token=YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"electionId":"YOUR_ELECTION_ID","candidateId":"YOUR_CANDIDATE_ID"}'
```

✅ **Done!**

---

## API Endpoints Cheat Sheet

### Voter Management
```
POST   /api/voters/register              Join election
POST   /api/voters/verify/:voterId       Verify identity
GET    /api/voters/status/:electionId    Check if joined
GET    /api/voters/election/:id          See all voters
GET    /api/voters/statistics/:id        Voter stats
```

### Voting
```
POST   /api/votes/cast                   Vote for candidate
GET    /api/votes/results/:id            View results
GET    /api/votes/candidates/:id         See candidates
GET    /api/votes/voter-status/:id       Check voting status
```

---

## Error Quick Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| Voter not found | Haven't joined | `POST /voters/register` |
| Not verified | Joined but not verified | `POST /voters/verify` |
| Already voted | Already voted once | Cannot vote again |
| Not approved | Voting for unapproved candidate | Choose approved candidate |
| Not ongoing | Election not active | Try during active period |

---

## JavaScript (React)

```javascript
// Register
const voter = await axios.post('/api/voters/register', 
  {electionId, authType:'OTP'}, 
  {withCredentials:true}
);

// Verify
await axios.post(`/api/voters/verify/${voter.data.data.voter_id}`,
  {}, 
  {withCredentials:true}
);

// Vote
await axios.post('/api/votes/cast',
  {electionId, candidateId},
  {withCredentials:true}
);
```

---

## Status Checks

### Check if you can vote
```bash
curl http://localhost:3000/api/voters/status/ELECTION_ID \
  -H "Cookie: token=YOUR_TOKEN"
```

Response means:
- `registered: true` - You've joined ✅
- `verified: true` - You're verified ✅
- `has_voted: false` - You haven't voted yet ✅

### Check results
```bash
curl http://localhost:3000/api/votes/results/ELECTION_ID
```

---

## 3-Step Process

```
Step 1       Step 2        Step 3
  ↓            ↓             ↓
REGISTER  →  VERIFY  →  VOTE
  |            |          |
  └────────────┴──────────┘
         ✅ DONE!
```

---

## What Each Step Does

| Step | What | Why |
|------|------|-----|
| Register | Join election | System records you're eligible |
| Verify | Prove identity | Prevents fraud/duplicates |
| Vote | Choose candidate | Your vote counts |

---

## Common Questions

**Q: Do I have to do all 3 steps?**
A: Yes! All 3 are required.

**Q: Can I vote for multiple candidates?**
A: No, only 1 vote per election.

**Q: Can I change my vote?**
A: No, votes are permanent.

**Q: Do I need JWT token?**
A: Yes, for register, verify, and vote.

**Q: Can I vote without verification?**
A: No, must verify first.

---

## Files to Read

| File | Read Time | Purpose |
|------|-----------|---------|
| START_HERE.md | 2 min | Overview |
| ERROR_EXPLAINED_AND_FIXED.md | 5 min | Your error explained |
| FIX_VOTER_NOT_FOUND_ERROR.md | 10 min | Step-by-step fix |
| VOTER_REGISTRATION_GUIDE.md | 20 min | Complete flow |
| VOTING_QUICK_REFERENCE.md | 15 min | API reference |

---

## Endpoints at a Glance

```
🔵 Voter Registration (Must Do First!)
   POST /api/voters/register
   Get: voter_id

🟡 Voter Verification (Must Do Second!)
   POST /api/voters/verify/{voterId}

🟢 Voting (Can Do Last!)
   POST /api/votes/cast
   Result: Your vote is recorded!

⚪ Results (Anytime)
   GET /api/votes/results/{electionId}
```

---

## Auth Info

**Where to put token:**

Option 1 (Cookies):
```
Cookie: token=YOUR_JWT_TOKEN
```

Option 2 (Header):
```
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## Success Responses

### Register Success
```json
{
  "voter_id": "880e..."
}
```

### Verify Success
```json
{
  "verified": true
}
```

### Vote Success
```json
{
  "vote_id": "aa0e...",
  "candidateName": "Party Name",
  "totalVotes": 45
}
```

---

## Remember

✅ **REGISTER first** - Join election
✅ **VERIFY second** - Prove identity
✅ **VOTE third** - Cast your vote

**All 3 steps = Success!**

---

## Still Confused?

1. Read `ERROR_EXPLAINED_AND_FIXED.md`
2. Follow the 3 curl commands above
3. Check the responses
4. You're done!

---

**Last Updated:** November 12, 2025
**System Status:** ✅ READY FOR PRODUCTION
