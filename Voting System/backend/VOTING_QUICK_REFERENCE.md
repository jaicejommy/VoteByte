# Voting System - Quick Reference

## 🚀 Quick Start

### Prerequisites
- User must be authenticated (have valid JWT token)
- User must be registered as a voter in the election
- Voter must be verified
- Election must be in ONGOING status

### Basic Voting Flow

1. **Check Voter Status**
   ```bash
   GET /api/votes/voter-status/{electionId}
   ```
   Response tells you if voter can vote or already voted

2. **Get Candidates to Vote For**
   ```bash
   GET /api/votes/candidates/{electionId}
   ```
   Returns only APPROVED candidates

3. **Cast Vote**
   ```bash
   POST /api/votes/cast
   {
     "electionId": "...",
     "candidateId": "..."
   }
   ```

4. **View Results (Optional)**
   ```bash
   GET /api/votes/results/{electionId}
   ```

---

## 📋 API Reference

### Endpoints Summary
| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | `/api/votes/cast` | ✅ | Cast a vote |
| GET | `/api/votes/results/:electionId` | ❌ | View voting results |
| GET | `/api/votes/candidates/:electionId` | ❌ | List candidates to vote for |
| GET | `/api/votes/voter-status/:electionId` | ✅ | Check voter status |
| GET | `/api/votes/voter-info/:electionId` | ✅ | Get full voter info |

---

## 🔐 Authentication

Pass token in either:
1. **Cookie** (preferred)
   ```
   Cookie: token=your_jwt_token
   ```
2. **Authorization Header**
   ```
   Authorization: Bearer your_jwt_token
   ```

---

## ✅ Validation Checks

Before voting, system validates:

| Check | Required | Error Response |
|-------|----------|-----------------|
| User authenticated | ✅ | 401 Unauthorized |
| Election exists | ✅ | 404 Not Found |
| Election is ONGOING | ✅ | 400 Election not active |
| Candidate exists | ✅ | 404 Candidate not found |
| Candidate is APPROVED | ✅ | 400 Not approved |
| Voter exists | ✅ | 404 Voter not found |
| Voter is verified | ✅ | 400 Not verified |
| Voter hasn't voted yet | ✅ | 400 Already voted |

---

## 🎯 Common Scenarios

### Scenario 1: User Votes Successfully
```
POST /api/votes/cast
{
  "electionId": "550e8400-e29b-41d4-a716-446655440000",
  "candidateId": "660e8400-e29b-41d4-a716-446655440000"
}

Response 201:
{
  "success": true,
  "message": "Vote cast successfully",
  "data": {
    "vote": { ... },
    "candidateName": "Democratic Party",
    "totalVotes": 45
  }
}
```

### Scenario 2: User Already Voted
```
POST /api/votes/cast
{
  "electionId": "...",
  "candidateId": "..."
}

Response 400:
{
  "success": false,
  "message": "You have already voted in this election"
}
```

### Scenario 3: View Live Results
```
GET /api/votes/results/550e8400-e29b-41d4-a716-446655440000

Response 200:
{
  "success": true,
  "data": {
    "total_votes_cast": 325,
    "voter_turnout": "65.00%",
    "candidates": [
      {
        "candidateName": "John Doe",
        "party_name": "Democratic",
        "total_votes": 150,
        "vote_percentage": "46.15%"
      },
      ...
    ]
  }
}
```

---

## 🛠️ Integration Steps

### 1. Backend Setup
- ✅ Routes created in `/routes/vote.js`
- ✅ Controllers created in `/controllers/voteController.js`
- ✅ Services created in `/services/voteService.js`
- ✅ Models created in `/models/Vote.js`
- ✅ Registered in `app.js`

### 2. Database Schema
Already in Prisma schema:
- `Vote` model for recording votes
- `Voter.has_voted` flag for preventing duplicate votes
- `Voter.voted_at` timestamp
- `Candidate.total_votes` counter

### 3. Frontend Implementation
See `VOTING_SYSTEM_DOCS.md` for React component example

---

## 🐛 Troubleshooting

### Issue: "Voter record not found for this election"
**Cause:** User is not registered as voter in this election
**Solution:** Make sure user completed voter registration for this election

### Issue: "Voter is not verified"
**Cause:** Voter hasn't completed verification (OTP/Aadhar/etc)
**Solution:** Complete voter verification before voting

### Issue: "You have already voted"
**Cause:** User already cast vote in this election
**Solution:** Cannot vote twice - vote is permanent

### Issue: "Candidate is not approved"
**Cause:** Candidate hasn't been approved by admin yet
**Solution:** Wait for admin approval or select different candidate

### Issue: "Election is not ongoing"
**Cause:** Election hasn't started or has ended
**Solution:** Check election dates - voting only during active period

---

## 💾 Database Relations

```
User → Voter → Vote ← Candidate
  ↓                        ↓
  └────────→ Election ←────┘

Vote Table:
- election_id (FK → Election)
- candidate_id (FK → Candidate)
- voter_id (FK → Voter)
- cast_time (timestamp)

Voter Table:
- user_id (FK → User)
- election_id (FK → Election)
- has_voted (boolean) ← Key field
- voted_at (timestamp)
```

---

## 📊 Vote Counting Logic

```
Total Votes Cast = COUNT(Vote records for election)

For each candidate:
  Votes = Candidate.total_votes (incremented on each vote)
  Percentage = (Votes / Total Votes) × 100
  
Turnout = (Total Votes / Total Registered Voters) × 100
```

---

## 🔒 Security Features

1. **Authentication Required** - All voting actions require JWT
2. **Atomic Transactions** - Vote + status update in single transaction
3. **Duplicate Prevention** - Checked by has_voted flag
4. **Approval Validation** - Only approved candidates receive votes
5. **Time Window Check** - Votes only during active election
6. **Error Message Security** - No sensitive info in error responses

---

## 📱 Response Codes

| Code | Meaning | Common Cause |
|------|---------|-------------|
| 201 | Vote Created | Successful vote |
| 200 | Success | Get requests |
| 400 | Bad Request | Duplicate vote, not verified, etc |
| 401 | Unauthorized | Missing/invalid token |
| 404 | Not Found | Invalid election/candidate ID |
| 500 | Server Error | Unexpected error |

---

## 🎓 Learning Path

1. Read `VOTING_SYSTEM_DOCS.md` for full documentation
2. Review `voteService.js` for business logic
3. Review `voteController.js` for HTTP handling
4. Review `/routes/vote.js` for endpoint mapping
5. Implement frontend components
6. Test with provided test data

---

## 📝 Files Modified/Created

### Created
- `models/Vote.js`
- `services/voteService.js`
- `controllers/voteController.js`
- `routes/vote.js`
- `VOTING_SYSTEM_DOCS.md`
- `VOTING_QUICK_REFERENCE.md` (this file)

### Modified
- `app.js` - Added vote route registration

---

## 🚨 Important Notes

⚠️ **Vote Immutability**
- Once cast, votes CANNOT be changed or deleted
- Design by intent (voting is permanent)

⚠️ **Time Sensitivity**
- Voting only works during election ONGOING period
- Check election status before attempting vote

⚠️ **Voter Authentication**
- Separate from User authentication
- Must complete voter registration + verification

⚠️ **Candidate Approval**
- Only APPROVED candidates appear in voting list
- Admins must approve candidates before voting starts
