# Voting System - Test Data & Examples

## Setup Instructions

### Prerequisites
1. Election must be created and set to status: ONGOING
2. Candidates must be registered and APPROVED
3. Users must be registered as voters and VERIFIED
4. Valid JWT token must be obtained

---

## Test Scenario: Class President Election

### Sample Data

#### Election
```json
{
  "election_id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Class President Election 2024",
  "description": "Vote for your class president",
  "status": "ONGOING",
  "start_time": "2024-11-12T08:00:00Z",
  "end_time": "2024-11-12T18:00:00Z",
  "authType": "OTP",
  "total_voters": 500,
  "total_candidates": 3
}
```

#### Candidates (All APPROVED)
```json
[
  {
    "candidate_id": "660e8400-e29b-41d4-a716-446655440001",
    "election_id": "550e8400-e29b-41d4-a716-446655440000",
    "user_id": "770e8400-e29b-41d4-a716-446655440001",
    "party_name": "Democratic Party",
    "symbol": "symbol1.png",
    "manifesto": "Better facilities for students",
    "age": 22,
    "qualification": "B.Tech CSE",
    "status": "APPROVED",
    "total_votes": 0
  },
  {
    "candidate_id": "660e8400-e29b-41d4-a716-446655440002",
    "election_id": "550e8400-e29b-41d4-a716-446655440000",
    "user_id": "770e8400-e29b-41d4-a716-446655440002",
    "party_name": "Republican Party",
    "symbol": "symbol2.png",
    "manifesto": "Focus on academics and extracurriculars",
    "age": 21,
    "qualification": "B.Tech ECE",
    "status": "APPROVED",
    "total_votes": 0
  },
  {
    "candidate_id": "660e8400-e29b-41d4-a716-446655440003",
    "election_id": "550e8400-e29b-41d4-a716-446655440000",
    "user_id": "770e8400-e29b-41d4-a716-446655440003",
    "party_name": "Progressive Alliance",
    "symbol": "symbol3.png",
    "manifesto": "Student welfare and campus development",
    "age": 23,
    "qualification": "B.Tech ME",
    "status": "APPROVED",
    "total_votes": 0
  }
]
```

#### Voters (Sample)
```json
[
  {
    "voter_id": "880e8400-e29b-41d4-a716-446655440001",
    "user_id": "990e8400-e29b-41d4-a716-446655440001",
    "election_id": "550e8400-e29b-41d4-a716-446655440000",
    "verified": true,
    "authType": "OTP",
    "has_voted": false,
    "voted_at": null
  },
  {
    "voter_id": "880e8400-e29b-41d4-a716-446655440002",
    "user_id": "990e8400-e29b-41d4-a716-446655440002",
    "election_id": "550e8400-e29b-41d4-a716-446655440000",
    "verified": true,
    "authType": "OTP",
    "has_voted": false,
    "voted_at": null
  }
]
```

---

## API Testing Examples

### Using cURL

#### 1. Get Voter Status
```bash
curl -X GET http://localhost:3000/api/votes/voter-status/550e8400-e29b-41d4-a716-446655440000 \
  -H "Cookie: token=YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Voter status retrieved successfully",
  "data": {
    "has_voted": false,
    "verified": true,
    "voted_at": null,
    "authType": "OTP"
  }
}
```

---

#### 2. Get Approved Candidates
```bash
curl -X GET http://localhost:3000/api/votes/candidates/550e8400-e29b-41d4-a716-446655440000 \
  -H "Content-Type: application/json"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Approved candidates retrieved successfully",
  "data": [
    {
      "candidate_id": "660e8400-e29b-41d4-a716-446655440001",
      "party_name": "Democratic Party",
      "symbol": "symbol1.png",
      "manifesto": "Better facilities for students",
      "age": 22,
      "qualification": "B.Tech CSE",
      "candidateName": "John Doe",
      "candidatePhoto": "https://example.com/photo1.jpg",
      "candidateEmail": "john@example.com",
      "total_votes": 0
    },
    {
      "candidate_id": "660e8400-e29b-41d4-a716-446655440002",
      "party_name": "Republican Party",
      "symbol": "symbol2.png",
      "manifesto": "Focus on academics and extracurriculars",
      "age": 21,
      "qualification": "B.Tech ECE",
      "candidateName": "Jane Smith",
      "candidatePhoto": "https://example.com/photo2.jpg",
      "candidateEmail": "jane@example.com",
      "total_votes": 0
    },
    {
      "candidate_id": "660e8400-e29b-41d4-a716-446655440003",
      "party_name": "Progressive Alliance",
      "symbol": "symbol3.png",
      "manifesto": "Student welfare and campus development",
      "age": 23,
      "qualification": "B.Tech ME",
      "candidateName": "Mike Johnson",
      "candidatePhoto": "https://example.com/photo3.jpg",
      "candidateEmail": "mike@example.com",
      "total_votes": 0
    }
  ]
}
```

---

#### 3. Cast a Vote
```bash
curl -X POST http://localhost:3000/api/votes/cast \
  -H "Cookie: token=YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "electionId": "550e8400-e29b-41d4-a716-446655440000",
    "candidateId": "660e8400-e29b-41d4-a716-446655440001"
  }'
```

**Expected Response (201):**
```json
{
  "success": true,
  "message": "Vote cast successfully",
  "data": {
    "vote": {
      "vote_id": "aa0e8400-e29b-41d4-a716-446655440001",
      "election_id": "550e8400-e29b-41d4-a716-446655440000",
      "candidate_id": "660e8400-e29b-41d4-a716-446655440001",
      "voter_id": "880e8400-e29b-41d4-a716-446655440001",
      "cast_time": "2024-11-12T10:30:45.123Z"
    },
    "candidateName": "Democratic Party",
    "totalVotes": 1
  }
}
```

---

#### 4. Try to Vote Again (Error Case)
```bash
curl -X POST http://localhost:3000/api/votes/cast \
  -H "Cookie: token=YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "electionId": "550e8400-e29b-41d4-a716-446655440000",
    "candidateId": "660e8400-e29b-41d4-a716-446655440002"
  }'
```

**Expected Response (400):**
```json
{
  "success": false,
  "message": "You have already voted in this election"
}
```

---

#### 5. Get Voting Results
```bash
curl -X GET http://localhost:3000/api/votes/results/550e8400-e29b-41d4-a716-446655440000 \
  -H "Content-Type: application/json"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Voting results retrieved successfully",
  "data": {
    "election_id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Class President Election 2024",
    "status": "ONGOING",
    "total_registered_voters": 500,
    "total_votes_cast": 325,
    "voter_turnout": "65.00",
    "candidates": [
      {
        "candidate_id": "660e8400-e29b-41d4-a716-446655440001",
        "party_name": "Democratic Party",
        "symbol": "symbol1.png",
        "total_votes": 150,
        "vote_percentage": "46.15",
        "candidateName": "John Doe",
        "candidatePhoto": "https://example.com/photo1.jpg"
      },
      {
        "candidate_id": "660e8400-e29b-41d4-a716-446655440002",
        "party_name": "Republican Party",
        "symbol": "symbol2.png",
        "total_votes": 120,
        "vote_percentage": "36.92",
        "candidateName": "Jane Smith",
        "candidatePhoto": "https://example.com/photo2.jpg"
      },
      {
        "candidate_id": "660e8400-e29b-41d4-a716-446655440003",
        "party_name": "Progressive Alliance",
        "symbol": "symbol3.png",
        "total_votes": 55,
        "vote_percentage": "16.92",
        "candidateName": "Mike Johnson",
        "candidatePhoto": "https://example.com/photo3.jpg"
      }
    ],
    "winner": {
      "candidate_id": "660e8400-e29b-41d4-a716-446655440001",
      "party_name": "Democratic Party",
      "total_votes": 150
    }
  }
}
```

---

### Using Postman

#### Collection Import
Import this JSON into Postman:

```json
{
  "info": {
    "name": "Voting System API",
    "description": "Test the voting system endpoints"
  },
  "item": [
    {
      "name": "Cast Vote",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"electionId\": \"550e8400-e29b-41d4-a716-446655440000\",\n  \"candidateId\": \"660e8400-e29b-41d4-a716-446655440001\"\n}"
        },
        "url": {
          "raw": "http://localhost:3000/api/votes/cast",
          "protocol": "http",
          "host": ["localhost"],
          "port": "3000",
          "path": ["api", "votes", "cast"]
        }
      }
    },
    {
      "name": "Get Voting Results",
      "request": {
        "method": "GET",
        "url": {
          "raw": "http://localhost:3000/api/votes/results/550e8400-e29b-41d4-a716-446655440000",
          "protocol": "http",
          "host": ["localhost"],
          "port": "3000",
          "path": ["api", "votes", "results", "550e8400-e29b-41d4-a716-446655440000"]
        }
      }
    },
    {
      "name": "Get Approved Candidates",
      "request": {
        "method": "GET",
        "url": {
          "raw": "http://localhost:3000/api/votes/candidates/550e8400-e29b-41d4-a716-446655440000",
          "protocol": "http",
          "host": ["localhost"],
          "port": "3000",
          "path": ["api", "votes", "candidates", "550e8400-e29b-41d4-a716-446655440000"]
        }
      }
    },
    {
      "name": "Get Voter Status",
      "request": {
        "method": "GET",
        "url": {
          "raw": "http://localhost:3000/api/votes/voter-status/550e8400-e29b-41d4-a716-446655440000",
          "protocol": "http",
          "host": ["localhost"],
          "port": "3000",
          "path": ["api", "votes", "voter-status", "550e8400-e29b-41d4-a716-446655440000"]
        }
      }
    }
  ]
}
```

---

## Error Scenarios to Test

### 1. Not Authenticated
```bash
curl -X POST http://localhost:3000/api/votes/cast \
  -H "Content-Type: application/json" \
  -d '{
    "electionId": "...",
    "candidateId": "..."
  }'
```
**Expected:** 401 Unauthorized

---

### 2. Invalid Election ID
```bash
curl -X POST http://localhost:3000/api/votes/cast \
  -H "Cookie: token=YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "electionId": "invalid-uuid",
    "candidateId": "660e8400-e29b-41d4-a716-446655440001"
  }'
```
**Expected:** 404 Not Found

---

### 3. Election Not Active
```bash
curl -X POST http://localhost:3000/api/votes/cast \
  -H "Cookie: token=YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "electionId": "550e8400-e29b-41d4-a716-446655440000",
    "candidateId": "660e8400-e29b-41d4-a716-446655440001"
  }'
```
(When election status is not ONGOING)
**Expected:** 400 Bad Request - "Election is not ongoing"

---

### 4. Voter Not Verified
**Expected:** 400 Bad Request - "Voter is not verified"

---

### 5. Candidate Not Approved
**Expected:** 400 Bad Request - "Candidate is not approved for voting"

---

## Load Testing Scenarios

### Simulate 100 Votes
```bash
#!/bin/bash
for i in {1..100}; do
  curl -X POST http://localhost:3000/api/votes/cast \
    -H "Cookie: token=TOKEN_$i" \
    -H "Content-Type: application/json" \
    -d "{
      \"electionId\": \"550e8400-e29b-41d4-a716-446655440000\",
      \"candidateId\": \"660e8400-e29b-41d4-a716-446655440001\"
    }" &
done
wait
```

---

## Database Query Examples

### Get Total Votes for Election
```sql
SELECT COUNT(*) as total_votes 
FROM "Vote" 
WHERE election_id = '550e8400-e29b-41d4-a716-446655440000';
```

### Get Vote Count per Candidate
```sql
SELECT 
  c.candidate_id, 
  c.party_name, 
  COUNT(v.vote_id) as vote_count
FROM "Candidate" c
LEFT JOIN "Vote" v ON c.candidate_id = v.candidate_id
WHERE c.election_id = '550e8400-e29b-41d4-a716-446655440000'
GROUP BY c.candidate_id, c.party_name
ORDER BY vote_count DESC;
```

### Get Voters Who Voted
```sql
SELECT 
  vo.voter_id, 
  u.fullname, 
  vo.voted_at,
  c.party_name
FROM "Voter" vo
JOIN "User" u ON vo.user_id = u.user_id
JOIN "Vote" v ON vo.voter_id = v.voter_id
JOIN "Candidate" c ON v.candidate_id = c.candidate_id
WHERE vo.election_id = '550e8400-e29b-41d4-a716-446655440000'
ORDER BY vo.voted_at;
```

### Voting Timeline
```sql
SELECT 
  DATE_TRUNC('minute', cast_time) as minute,
  COUNT(*) as votes_in_minute
FROM "Vote"
WHERE election_id = '550e8400-e29b-41d4-a716-446655440000'
GROUP BY DATE_TRUNC('minute', cast_time)
ORDER BY minute;
```

---

## Success Metrics to Monitor

- ✅ Total votes cast
- ✅ Voter turnout percentage
- ✅ Votes per candidate (with percentages)
- ✅ Average response time for vote casting
- ✅ No duplicate votes
- ✅ All votes linked to correct candidate
- ✅ Voter has_voted flag updated correctly
- ✅ Voted_at timestamp recorded
