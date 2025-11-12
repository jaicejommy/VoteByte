# Voting System - Architecture & Data Flow

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React)                          │
│  - Voting Interface                                              │
│  - Candidate Selection                                           │
│  - Results Dashboard                                             │
└─────────────────┬───────────────────────────────────────────────┘
                  │
                  │ HTTP/REST
                  │
┌─────────────────▼───────────────────────────────────────────────┐
│                    API LAYER (Express)                           │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │              Routes (/routes/vote.js)                      │ │
│  │  - POST   /api/votes/cast                                  │ │
│  │  - GET    /api/votes/results/:electionId                   │ │
│  │  - GET    /api/votes/candidates/:electionId                │ │
│  │  - GET    /api/votes/voter-status/:electionId              │ │
│  │  - GET    /api/votes/voter-info/:electionId                │ │
│  └────────────────────────────────────────────────────────────┘ │
│                  ↓                                                │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │        Controllers (/controllers/voteController.js)        │ │
│  │  - Request validation                                       │ │
│  │  - Response formatting                                      │ │
│  │  - Error handling                                           │ │
│  └────────────────────────────────────────────────────────────┘ │
│                  ↓                                                │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │        Services (/services/voteService.js)                │ │
│  │  - Business logic                                           │ │
│  │  - Validations                                              │ │
│  │  - Database operations                                      │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────┬───────────────────────────────────────────────┘
                  │
                  │ Prisma ORM
                  │
┌─────────────────▼───────────────────────────────────────────────┐
│                 DATABASE LAYER (PostgreSQL)                      │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Tables:                                                   │ │
│  │  - User              - Election                            │ │
│  │  - Voter             - Candidate                           │ │
│  │  - Vote ← NEW        - Admin                               │ │
│  │  - ElectionResult    - Complaint                           │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## Data Flow: Casting a Vote

```
┌──────────────┐
│ User Clicks  │
│  "Vote" Btn  │
└──────┬───────┘
       │
       ▼
┌─────────────────────────────────────────────────────────────────┐
│ CLIENT SENDS POST /api/votes/cast                               │
│ {                                                               │
│   electionId: "550e8400-e29b-41d4-a716-446655440000"           │
│   candidateId: "660e8400-e29b-41d4-a716-446655440001"          │
│ }                                                               │
│ Headers: { Authorization: "Bearer JWT_TOKEN" }                 │
└──────┬───────────────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────────────┐
│ CONTROLLER: castVote()                                          │
│ ✓ Extract userId from JWT                                      │
│ ✓ Validate electionId and candidateId provided                 │
│ ✓ Check user authenticated                                     │
└──────┬───────────────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────────────┐
│ SERVICE: voteService.castVote()                                 │
│                                                                 │
│ 1. QUERY: Find Election                                         │
│    ├─ Check exists                                              │
│    ├─ Check status === 'ONGOING'                                │
│    └─ Check time window                                         │
│       └─ now() >= start_time && now() <= end_time               │
│                                                                 │
│ 2. QUERY: Find Candidate                                        │
│    ├─ Check exists in this election                             │
│    └─ Check status === 'APPROVED'                               │
│                                                                 │
│ 3. QUERY: Find Voter                                            │
│    ├─ Check exists                                              │
│    ├─ Check verified === true                                   │
│    ├─ Check registered for this election                        │
│    └─ Check has_voted === false                                 │
│                                                                 │
│ 4. QUERY: Find User (verify exists)                             │
│                                                                 │
│ 5. IF ANY CHECK FAILS → THROW ERROR                             │
│    └─ Return to Controller with error                           │
│                                                                 │
│ 6. TRANSACTION BEGIN                                            │
│    ├─ CREATE Vote record                                        │
│    │  INSERT INTO Vote VALUES (                                 │
│    │    vote_id, election_id, candidate_id, voter_id, cast_time │
│    │  )                                                          │
│    │                                                             │
│    ├─ UPDATE Voter                                              │
│    │  UPDATE Voter SET                                          │
│    │    has_voted = true,                                       │
│    │    voted_at = NOW()                                        │
│    │  WHERE voter_id = ?                                        │
│    │                                                             │
│    └─ UPDATE Candidate                                          │
│       UPDATE Candidate SET                                      │
│         total_votes = total_votes + 1                           │
│       WHERE candidate_id = ? AND election_id = ?                │
│                                                                 │
│ 7. TRANSACTION COMMIT (All or nothing)                          │
│                                                                 │
│ 8. RETURN success response                                      │
└──────┬───────────────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────────────┐
│ CONTROLLER: Response Formatting                                 │
│ {                                                               │
│   success: true,                                                │
│   message: "Vote cast successfully",                            │
│   data: {                                                       │
│     vote: { vote_id, election_id, candidate_id, ... },         │
│     candidateName: "Party Name",                                │
│     totalVotes: 45                                              │
│   }                                                             │
│ }                                                               │
│ HTTP 201 Created                                                │
└──────┬───────────────────────────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────┐
│ CLIENT RECEIVES Response         │
│ ✓ Show success message           │
│ ✓ Show vote confirmation         │
│ ✓ Disable voting interface       │
│ ✓ Show live results              │
└──────────────────────────────────┘
```

---

## Error Handling Flow

```
              ┌─── No JWT Token ───┐
              │                    ▼
              │           401 UNAUTHORIZED
              │
    POST Vote Request
              │
              │───► Validation Check ─── Missing Fields ──┐
              │                                           │
              │                                    400 BAD REQUEST
              │
    Call voteService.castVote()
              │
      ┌───────┼───────────┬──────────────┬────────────┬──────────────┐
      │       │           │              │            │              │
      ▼       ▼           ▼              ▼            ▼              ▼
   Election  Candidate  Voter      Duplicate     Status      Time
    Not      Not        Not         Vote        Check       Window
   Found     Approved   Found       Detected    Failed      Invalid
      │       │           │              │            │              │
      └───────┼───────────┴──────────────┴────────────┴──────────────┘
              │
              ▼
    ┌─────────────────────┐
    │  THROW ERROR        │
    └────────┬────────────┘
             │
             ▼
    CATCH in Controller
             │
             ▼
    ┌─────────────────────────────────────────────────┐
    │  ApiResponse.error() or .badRequest() or .notFound() │
    │  Response 400/401/404 with error message        │
    └────────────┬────────────────────────────────────┘
                 │
                 ▼
    ┌──────────────────────────┐
    │ CLIENT ERROR HANDLING    │
    │ Show error message       │
    │ Allow retry              │
    └──────────────────────────┘
```

---

## Database Schema Relationships

```
User (1) ──────────────── (Many) Voter (1) ─────────────── (Many) Vote
 │                                                              │
 │                                                              ▼
 │                                                          Candidate
 │                                                              │
 │                                                              ▼
 └──────────────────────────────────────── (Many) Candidate  Election
                                                (1)     │
                                                        ▼
                                                    (Many)


Vote Table Schema:
┌─────────────────────────────────────────────────┐
│ vote_id (PK)          UUID                      │
│ election_id (FK)  ──► Election.election_id      │
│ candidate_id (FK) ──► Candidate.candidate_id    │
│ voter_id (FK)     ──► Voter.voter_id            │
│ cast_time             TIMESTAMP                 │
└─────────────────────────────────────────────────┘

Voter Table (Updated):
┌─────────────────────────────────────────────────┐
│ voter_id (PK)         UUID                      │
│ user_id (FK)      ──► User.user_id              │
│ election_id (FK)  ──► Election.election_id      │
│ verified              BOOLEAN                   │
│ authType              AuthType Enum             │
│ has_voted             BOOLEAN ◄── KEY FIELD    │
│ voted_at              TIMESTAMP (nullable)      │
└─────────────────────────────────────────────────┘

Candidate Table (Updated):
┌─────────────────────────────────────────────────┐
│ candidate_id (PK)     UUID                      │
│ election_id (PK)  ──► Election.election_id      │
│ total_votes           INT ◄── INCREMENTED       │
│ status                CandidateStatus           │
│ ... other fields                                │
└─────────────────────────────────────────────────┘
```

---

## Voting Results Calculation

```
GET /api/votes/results/:electionId

1. QUERY Election
   ├─ Get basic info (title, status, etc)
   └─ Get all APPROVED candidates with vote counts

2. COUNT Total Votes Cast
   SELECT COUNT(*) FROM Vote WHERE election_id = ?

3. For Each Candidate
   ├─ Get candidate_id, party_name, symbol
   ├─ Get total_votes (from Candidate table)
   ├─ Calculate percentage = (total_votes / total_votes_cast) × 100
   └─ Include user info (name, photo)

4. Sort by total_votes DESC (winners first)

5. Calculate Turnout
   voter_turnout = (total_votes_cast / total_registered_voters) × 100

6. Return JSON Response
   {
     election_id,
     title,
     status,
     total_registered_voters,
     total_votes_cast,
     voter_turnout: "65.00",
     candidates: [
       {
         candidate_id,
         party_name,
         total_votes,
         vote_percentage: "46.15"
       },
       ...
     ],
     winner: { ... } ◄── if status === 'COMPLETED'
   }
```

---

## Transaction Flow (Atomic Operations)

```
BEGIN TRANSACTION
    │
    ├─ INSERT INTO Vote VALUES (...)
    │  └─ Success? Continue : ROLLBACK ALL
    │
    ├─ UPDATE Voter SET has_voted = true, voted_at = NOW()
    │  └─ Success? Continue : ROLLBACK ALL
    │
    ├─ UPDATE Candidate SET total_votes = total_votes + 1
    │  └─ Success? Continue : ROLLBACK ALL
    │
    └─ COMMIT TRANSACTION
       └─ All three updates succeeded atomically

If ANY operation fails:
   ↓
All three operations ROLLBACK
No partial updates
```

---

## API Request/Response Flow

```
REQUEST:
┌──────────────────────────────────────────────────────┐
│ POST /api/votes/cast                                 │
│ Headers:                                             │
│   Authorization: Bearer eyJhbGc...                   │
│   Content-Type: application/json                     │
│                                                      │
│ Body:                                                │
│ {                                                    │
│   "electionId": "550e8400-...",                      │
│   "candidateId": "660e8400-..."                      │
│ }                                                    │
└──────────────────────────────────────────────────────┘
         ↓
    Middleware: authMiddleware
    ├─ Extract JWT from cookie or header
    ├─ Verify JWT
    ├─ Get user info
    └─ Attach req.user

         ↓
    Controller: castVote
    ├─ Extract params
    ├─ Call service
    └─ Format response

         ↓
    Service: voteService.castVote
    ├─ Validate all conditions
    ├─ Execute transaction
    └─ Return result

         ↓
RESPONSE:
┌──────────────────────────────────────────────────────┐
│ HTTP 201 Created                                     │
│                                                      │
│ {                                                    │
│   "success": true,                                   │
│   "message": "Vote cast successfully",               │
│   "data": {                                          │
│     "vote": {                                        │
│       "vote_id": "aa0e8400-...",                     │
│       "election_id": "550e8400-...",                 │
│       "candidate_id": "660e8400-...",                │
│       "voter_id": "880e8400-...",                    │
│       "cast_time": "2024-11-12T10:30:45Z"            │
│     },                                               │
│     "candidateName": "Democratic Party",             │
│     "totalVotes": 45                                 │
│   }                                                  │
│ }                                                    │
└──────────────────────────────────────────────────────┘
```

---

## State Management (Voter State)

```
Before Voting:
┌─────────────────────────────────────────┐
│ Voter Record                            │
│ ├─ verified: true ✓                     │
│ ├─ has_voted: false ◄── Can vote        │
│ ├─ voted_at: null                       │
│ └─ authType: OTP                        │
└─────────────────────────────────────────┘

User Casts Vote
        │
        ▼

After Voting:
┌─────────────────────────────────────────┐
│ Voter Record (UPDATED)                  │
│ ├─ verified: true ✓                     │
│ ├─ has_voted: true ◄── Cannot vote      │
│ ├─ voted_at: "2024-11-12T10:30:45Z"     │
│ └─ authType: OTP                        │
└─────────────────────────────────────────┘

Voter tries to vote again
        │
        ▼

System checks:
├─ Find Voter
├─ Check has_voted === true
└─ REJECT: "You have already voted"
```

---

## Validation Pipeline

```
castVote() Service Function

┌─────────────────────────────────────┐
│ Input: electionId, candidateId, userId │
└────────────┬────────────────────────┘
             │
             ▼
    ┌─ Check all parameters not null/empty
    │
    ▼
    ┌─ Find and Validate ELECTION
    │  ├─ Exists in database
    │  ├─ Status === 'ONGOING'
    │  ├─ Current time >= start_time
    │  └─ Current time <= end_time
    │
    ▼
    ┌─ Find and Validate CANDIDATE
    │  ├─ Exists for this election
    │  └─ Status === 'APPROVED'
    │
    ▼
    ┌─ Find and Validate VOTER
    │  ├─ Exists for this user
    │  ├─ Verified === true
    │  ├─ Registered for this election
    │  └─ Has_voted === false
    │
    ▼
    ┌─ Find and Validate USER
    │  └─ Exists in database
    │
    ▼
    ┌─ Execute TRANSACTION
    │  ├─ CREATE Vote
    │  ├─ UPDATE Voter
    │  └─ UPDATE Candidate
    │
    ▼
    └─ Return success with Vote data
```

---

## Performance Considerations

```
Indexes for Fast Queries:
├─ Vote.election_id → Find votes for election
├─ Vote.voter_id → Find voter's votes (should be 0 or 1)
├─ Voter.user_id → Find voter record
├─ Voter.has_voted → Check if already voted (Boolean)
├─ Candidate.status → Filter APPROVED candidates
└─ Candidate.total_votes → Sort by votes

Query Optimization:
├─ JOIN Candidate with User info (for results)
├─ Use COUNT() for totals
├─ Cache results if possible
└─ Add pagination for large result sets

Database Considerations:
├─ Vote table will have one row per vote (scalable)
├─ Voter has_voted flag prevents full table scan
├─ Denormalized total_votes for fast results
└─ Transactions prevent race conditions
```

---

## Security Model

```
┌─────────────────────────────────────────────────────┐
│ Authentication Layer                                │
│ ├─ JWT Token Required                              │
│ ├─ Token verified in authMiddleware                │
│ └─ User ID extracted from decoded JWT              │
└────────────┬────────────────────────────────────────┘
             │
┌────────────▼────────────────────────────────────────┐
│ Authorization Layer                                 │
│ ├─ User must be registered voter                   │
│ ├─ Voter must be verified                          │
│ └─ Only one vote allowed per election              │
└────────────┬────────────────────────────────────────┘
             │
┌────────────▼────────────────────────────────────────┐
│ Validation Layer                                    │
│ ├─ Election status check                           │
│ ├─ Candidate approval check                        │
│ ├─ Time window check                               │
│ └─ Duplicate vote prevention                       │
└────────────┬────────────────────────────────────────┘
             │
┌────────────▼────────────────────────────────────────┐
│ Data Integrity Layer                                │
│ ├─ Atomic transactions                             │
│ ├─ Foreign key constraints                         │
│ └─ Vote immutability                               │
└─────────────────────────────────────────────────────┘
```

---

## Scalability Path

```
Current Implementation:
├─ Single Node Server
├─ PostgreSQL Database
└─ Works for ~1000s concurrent votes

Future Scaling:
├─ Add Database Replication
│  └─ Read replicas for results queries
│
├─ Implement Caching
│  ├─ Redis for vote counts
│  └─ Cache invalidation on each vote
│
├─ Load Balancing
│  ├─ Multiple Node servers
│  └─ Session management
│
├─ Queue System
│  ├─ Redis Queue for high load
│  ├─ Worker processes
│  └─ Guaranteed vote recording
│
└─ Monitoring
   ├─ Real-time dashboards
   ├─ Performance alerts
   └─ Audit logs
```
