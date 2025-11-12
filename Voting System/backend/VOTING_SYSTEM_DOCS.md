# Voting System Documentation

## Overview
The voting system allows verified voters to cast one vote per election for an approved candidate. The system ensures:
- Only verified voters can vote
- Voters can only vote once per election
- Only approved candidates can receive votes
- Votes are only cast when election is ONGOING
- Real-time vote count tracking

## Database Models

### Vote Model
```javascript
{
  vote_id: String (UUID),
  election_id: String (UUID),
  candidate_id: String (UUID),
  voter_id: String (UUID),
  cast_time: DateTime
}
```

### Voter Model (Updated)
```javascript
{
  voter_id: String (UUID),
  user_id: String (UUID),
  election_id: String (UUID),
  verified: Boolean,
  authType: AuthType,
  has_voted: Boolean,
  voted_at: DateTime (nullable)
}
```

### Candidate Model (Existing)
```javascript
{
  total_votes: Int (incremented on each vote cast)
  status: CandidateStatus (APPROVED, PENDING, REJECTED)
}
```

## Files Created

### 1. Models
- **`models/Vote.js`** - Vote class with validation

### 2. Services
- **`services/voteService.js`** - Business logic for voting operations
  - `castVote()` - Cast a vote for a candidate
  - `getVotingResults()` - Get election results with vote counts
  - `hasUserVoted()` - Check if user already voted
  - `getApprovedCandidates()` - Get list of candidates to vote for
  - `getVoterInfo()` - Get voter information for an election

### 3. Controllers
- **`controllers/voteController.js`** - HTTP request handlers
  - `castVote()` - POST /api/votes/cast
  - `getVotingResults()` - GET /api/votes/results/:electionId
  - `getApprovedCandidates()` - GET /api/votes/candidates/:electionId
  - `getVoterStatus()` - GET /api/votes/voter-status/:electionId
  - `getVoterInfo()` - GET /api/votes/voter-info/:electionId

### 4. Routes
- **`routes/vote.js`** - All voting-related endpoints

## API Endpoints

### 1. Cast a Vote
**POST** `/api/votes/cast`

**Authentication:** Required (Bearer Token or Cookie)

**Request Body:**
```json
{
  "electionId": "election-uuid",
  "candidateId": "candidate-uuid"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Vote cast successfully",
  "data": {
    "vote": {
      "vote_id": "vote-uuid",
      "election_id": "election-uuid",
      "candidate_id": "candidate-uuid",
      "voter_id": "voter-uuid",
      "cast_time": "2024-11-12T10:30:00Z"
    },
    "candidateName": "Party Name",
    "totalVotes": 45
  }
}
```

**Error Responses:**
- `400` - Already voted, candidate not approved, election not active
- `401` - Not authenticated
- `404` - Election/Candidate/Voter not found

**Business Logic:**
1. Verify user is authenticated
2. Check election exists and is ONGOING
3. Check candidate exists and is APPROVED
4. Check voter exists and is verified
5. Check voter hasn't already voted
6. Use transaction to:
   - Create Vote record
   - Update Voter.has_voted = true
   - Increment Candidate.total_votes

---

### 2. Get Voting Results
**GET** `/api/votes/results/:electionId`

**Authentication:** Not required

**URL Parameters:**
- `electionId` (required) - Election UUID

**Success Response (200):**
```json
{
  "success": true,
  "message": "Voting results retrieved successfully",
  "data": {
    "election_id": "election-uuid",
    "title": "Class President Election 2024",
    "status": "ONGOING",
    "total_registered_voters": 500,
    "total_votes_cast": 325,
    "voter_turnout": "65.00",
    "winner": {
      "candidate_id": "candidate-uuid",
      "party_name": "Democratic Party",
      "total_votes": 150
    },
    "candidates": [
      {
        "candidate_id": "candidate-uuid-1",
        "party_name": "Democratic Party",
        "symbol": "symbol.png",
        "total_votes": 150,
        "vote_percentage": "46.15",
        "candidateName": "John Doe",
        "candidatePhoto": "photo-url"
      },
      {
        "candidate_id": "candidate-uuid-2",
        "party_name": "Republican Party",
        "symbol": "symbol.png",
        "total_votes": 120,
        "vote_percentage": "36.92",
        "candidateName": "Jane Smith",
        "candidatePhoto": "photo-url"
      }
    ]
  }
}
```

---

### 3. Get Approved Candidates
**GET** `/api/votes/candidates/:electionId`

**Authentication:** Not required

**URL Parameters:**
- `electionId` (required) - Election UUID

**Success Response (200):**
```json
{
  "success": true,
  "message": "Approved candidates retrieved successfully",
  "data": [
    {
      "candidate_id": "candidate-uuid",
      "party_name": "Democratic Party",
      "symbol": "symbol.png",
      "manifesto": "Our vision for the future...",
      "age": 25,
      "qualification": "Bachelor's Degree",
      "candidateName": "John Doe",
      "candidatePhoto": "photo-url",
      "candidateEmail": "john@example.com",
      "total_votes": 45
    }
  ]
}
```

---

### 4. Get Voter Status
**GET** `/api/votes/voter-status/:electionId`

**Authentication:** Required (Bearer Token or Cookie)

**URL Parameters:**
- `electionId` (required) - Election UUID

**Success Response (200):**
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

**Use Case:** Check if current user can vote before showing voting interface

---

### 5. Get Voter Info
**GET** `/api/votes/voter-info/:electionId`

**Authentication:** Required (Bearer Token or Cookie)

**URL Parameters:**
- `electionId` (required) - Election UUID

**Success Response (200):**
```json
{
  "success": true,
  "message": "Voter information retrieved successfully",
  "data": {
    "voter_id": "voter-uuid",
    "user_id": "user-uuid",
    "election_id": "election-uuid",
    "verified": true,
    "has_voted": false,
    "voted_at": null,
    "authType": "OTP",
    "user": {
      "fullname": "John Doe",
      "email": "john@example.com",
      "profile_photo": "photo-url"
    }
  }
}
```

---

## Voting Flow

### Step 1: Pre-Voting Checks
```
User → GET /api/votes/voter-status/:electionId
       ↓
Check if voter is verified and hasn't voted
```

### Step 2: Display Candidates
```
User → GET /api/votes/candidates/:electionId
       ↓
Display list of approved candidates with details
```

### Step 3: Cast Vote
```
User → POST /api/votes/cast
       Body: { electionId, candidateId }
       ↓
       Validate and record vote atomically
       ↓
Update voter status and candidate vote count
```

### Step 4: View Results (Optional)
```
Any User → GET /api/votes/results/:electionId
           ↓
Display live voting results and vote percentages
```

---

## Business Rules

1. **One Vote Per Voter Per Election**
   - Checked by `Voter.has_voted` flag
   - Set to true after successful vote
   - Returns error if already voted

2. **Only Approved Candidates Receive Votes**
   - Candidate.status must be 'APPROVED'
   - Rejected and pending candidates cannot receive votes

3. **Election Must Be Active**
   - Election.status must be 'ONGOING'
   - Current time must be between start_time and end_time
   - Returns error if election not active

4. **Voter Must Be Verified**
   - Voter.verified must be true
   - Returns error if voter not verified

5. **Atomicity**
   - Vote creation, Voter update, and Candidate vote increment happen in transaction
   - If any fails, all rollback

---

## Error Handling

### Common Errors

| Error | HTTP Code | Cause |
|-------|-----------|-------|
| "You have already voted in this election" | 400 | User tries to vote twice |
| "Candidate is not approved for voting" | 400 | Voting for unapproved candidate |
| "Election is not currently active" | 400 | Election not ONGOING or outside time window |
| "Voter is not verified" | 400 | Voter not verified |
| "Election not found" | 404 | Invalid election ID |
| "Candidate not found in this election" | 404 | Invalid candidate ID |
| "Voter record not found for this election" | 404 | User not registered as voter |
| "Authentication required" | 401 | No token provided |

---

## Frontend Integration Example

### React Component Example

```jsx
import { useState, useEffect } from 'react';
import axios from 'axios';

export function VotingPage({ electionId }) {
  const [candidates, setCandidates] = useState([]);
  const [voterStatus, setVoterStatus] = useState(null);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchVotingData();
  }, [electionId]);

  const fetchVotingData = async () => {
    try {
      // Check voter status
      const statusRes = await axios.get(
        `/api/votes/voter-status/${electionId}`,
        { withCredentials: true }
      );
      setVoterStatus(statusRes.data.data);

      // If already voted, show results
      if (statusRes.data.data.has_voted) {
        const resultsRes = await axios.get(`/api/votes/results/${electionId}`);
        // Display results
        return;
      }

      // Get candidates to vote for
      const candRes = await axios.get(`/api/votes/candidates/${electionId}`);
      setCandidates(candRes.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching data');
    } finally {
      setLoading(false);
    }
  };

  const handleCastVote = async () => {
    if (!selectedCandidate) {
      setError('Please select a candidate');
      return;
    }

    try {
      const response = await axios.post(
        '/api/votes/cast',
        {
          electionId,
          candidateId: selectedCandidate
        },
        { withCredentials: true }
      );
      alert('Vote cast successfully!');
      // Redirect to results page
    } catch (err) {
      setError(err.response?.data?.message || 'Error casting vote');
    }
  };

  if (voterStatus?.has_voted) {
    return <ResultsPage electionId={electionId} />;
  }

  return (
    <div>
      {error && <div className="error">{error}</div>}
      <div className="candidates">
        {candidates.map(candidate => (
          <div
            key={candidate.candidate_id}
            className={`candidate-card ${selectedCandidate === candidate.candidate_id ? 'selected' : ''}`}
            onClick={() => setSelectedCandidate(candidate.candidate_id)}
          >
            <img src={candidate.candidatePhoto} alt={candidate.candidateName} />
            <h3>{candidate.candidateName}</h3>
            <p>{candidate.party_name}</p>
            <p>{candidate.manifesto}</p>
          </div>
        ))}
      </div>
      <button onClick={handleCastVote}>Cast Vote</button>
    </div>
  );
}
```

---

## Data Constraints & Validations

### In Service Layer
- Empty/null checks for required fields
- Election status validation
- Candidate approval status validation
- Voter verification status validation
- Duplicate vote prevention
- Time window validation

### In Database
- Foreign key constraints
- Atomic transaction for vote + updates
- Unique constraint on Voter (user_id, election_id)

---

## Future Enhancements

1. **Vote Secrecy**
   - Separate Voter ID from User identity
   - Anonymous vote recording

2. **Audit Trail**
   - Log all voting actions
   - Track vote modifications

3. **Voting Analytics**
   - Real-time vote trends
   - Demographic analysis

4. **Multi-Stage Elections**
   - Primary elections
   - Runoff elections

5. **Accessibility**
   - Braille support
   - Screen reader optimization
   - Multiple language support
