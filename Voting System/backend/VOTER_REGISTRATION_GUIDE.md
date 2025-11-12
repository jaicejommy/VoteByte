# Voter Registration & Voting Complete Flow

## 🚨 Issue: "Voter record not found for this election"

**This error occurs because:**
- User hasn't been registered as a voter for the election
- Voter registration is a REQUIRED step before voting

---

## ✅ Complete Voting Process (3 Steps)

### Step 1: User Joins Election (Register as Voter)
```
User accesses election
    ↓
POST /api/voters/register
{
  "electionId": "550e8400-e29b-41d4-a716-446655440000",
  "authType": "OTP"
}
    ↓
Voter record created
{
  "voter_id": "880e8400-...",
  "election_id": "550e8400-...",
  "verified": false,
  "has_voted": false
}
```

### Step 2: User Verifies (Complete Authentication)
```
User completes OTP/Aadhar/Face verification
    ↓
POST /api/voters/verify/{voterId}
    ↓
Voter.verified = true
```

### Step 3: User Votes (Cast Vote)
```
User selects candidate and votes
    ↓
POST /api/votes/cast
{
  "electionId": "550e8400-...",
  "candidateId": "660e8400-..."
}
    ↓
Vote recorded
Voter.has_voted = true
Candidate.total_votes++
```

---

## 📋 New Voter Registration Endpoints

### 1. **Register as Voter for Election**

**Endpoint:**
```
POST /api/voters/register
```

**Auth:** Required (JWT)

**Request Body:**
```json
{
  "electionId": "550e8400-e29b-41d4-a716-446655440000",
  "authType": "OTP"
}
```

**Auth Type Options:**
- `OTP` - One-Time Password
- `AADHAR` - Aadhar verification
- `FACE_RECOGNITION` - Facial recognition
- `STUDENT_ID` - Student ID verification

**Success Response (201):**
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
    "has_voted": false,
    "user": {
      "fullname": "John Doe",
      "email": "john@example.com",
      "profile_photo": "https://example.com/photo.jpg"
    }
  }
}
```

**Error Responses:**
- `401` - Not authenticated
- `400` - Already registered, invalid input
- `404` - User or election not found

---

### 2. **Verify Voter**

**Endpoint:**
```
POST /api/voters/verify/{voterId}
```

**Auth:** Required (JWT)

**URL Parameters:**
- `voterId` - Voter ID from registration

**Success Response (200):**
```json
{
  "success": true,
  "message": "Voter verified successfully",
  "data": {
    "voter_id": "880e8400-e29b-41d4-a716-446655440001",
    "user_id": "990e8400-e29b-41d4-a716-446655440001",
    "election_id": "550e8400-e29b-41d4-a716-446655440000",
    "verified": true,
    "has_voted": false,
    "authType": "OTP"
  }
}
```

---

### 3. **Check Voter Status**

**Endpoint:**
```
GET /api/voters/status/{electionId}
```

**Auth:** Required (JWT)

**URL Parameters:**
- `electionId` - Election ID

**Success Response (200):**
```json
{
  "success": true,
  "message": "Voter status retrieved successfully",
  "data": {
    "registered": true,
    "voter_id": "880e8400-e29b-41d4-a716-446655440001",
    "verified": true,
    "has_voted": false,
    "voted_at": null,
    "authType": "OTP",
    "user": {
      "fullname": "John Doe",
      "email": "john@example.com",
      "profile_photo": "https://example.com/photo.jpg"
    }
  }
}
```

**If Not Registered (400):**
```json
{
  "success": false,
  "message": "User is not registered as a voter for this election"
}
```

---

### 4. **Get All Voters for Election**

**Endpoint:**
```
GET /api/voters/election/{electionId}
```

**Auth:** Not required

**URL Parameters:**
- `electionId` - Election ID

**Success Response:**
```json
{
  "success": true,
  "message": "Voters retrieved successfully",
  "data": [
    {
      "voter_id": "880e8400-e29b-41d4-a716-446655440001",
      "user_id": "990e8400-e29b-41d4-a716-446655440001",
      "election_id": "550e8400-e29b-41d4-a716-446655440000",
      "verified": true,
      "authType": "OTP",
      "has_voted": false,
      "voted_at": null,
      "user": {
        "fullname": "John Doe",
        "email": "john@example.com",
        "profile_photo": "https://example.com/photo.jpg"
      }
    }
  ]
}
```

---

### 5. **Get Voter Statistics**

**Endpoint:**
```
GET /api/voters/statistics/{electionId}
```

**Auth:** Not required

**URL Parameters:**
- `electionId` - Election ID

**Success Response:**
```json
{
  "success": true,
  "message": "Voter statistics retrieved successfully",
  "data": {
    "total_registered_voters": 500,
    "verified_voters": 450,
    "voters_who_voted": 325,
    "unverified_voters": 50,
    "pending_voters": 125
  }
}
```

---

## 🔄 Complete User Workflow

### For Voters

```
1. Login
   ↓
2. View Elections
   ↓
3. Choose Election to Vote In
   ↓
4. Click "Join Election"
   ↓
   POST /api/voters/register
   Get voter_id
   ↓
5. Complete Verification (OTP/Aadhar/etc)
   ↓
   POST /api/voters/verify/{voterId}
   ↓
6. See Approved Candidates
   ↓
   GET /api/votes/candidates/{electionId}
   ↓
7. Select Candidate & Vote
   ↓
   POST /api/votes/cast
   ↓
8. Vote Confirmed!
   Can now view results
   ↓
   GET /api/votes/results/{electionId}
```

---

## 📱 Frontend Implementation

### Step-by-Step Integration

#### Step 1: Check if User is Already Registered
```javascript
async function checkVoterStatus(electionId) {
  try {
    const response = await axios.get(
      `/api/voters/status/${electionId}`,
      { withCredentials: true }
    );
    return response.data.data;
  } catch (err) {
    // Not registered yet
    return null;
  }
}
```

#### Step 2: Register User as Voter
```javascript
async function registerAsVoter(electionId, authType = 'OTP') {
  try {
    const response = await axios.post(
      '/api/voters/register',
      { electionId, authType },
      { withCredentials: true }
    );
    return response.data.data; // Contains voter_id
  } catch (err) {
    throw new Error(err.response?.data?.message);
  }
}
```

#### Step 3: Verify Voter
```javascript
async function verifyVoter(voterId) {
  try {
    const response = await axios.post(
      `/api/voters/verify/${voterId}`,
      {},
      { withCredentials: true }
    );
    return response.data.data;
  } catch (err) {
    throw new Error(err.response?.data?.message);
  }
}
```

#### Step 4: Get Candidates & Vote
```javascript
async function getCandidates(electionId) {
  const response = await axios.get(`/api/votes/candidates/${electionId}`);
  return response.data.data;
}

async function castVote(electionId, candidateId) {
  const response = await axios.post(
    '/api/votes/cast',
    { electionId, candidateId },
    { withCredentials: true }
  );
  return response.data.data;
}
```

---

## 🎯 Complete React Component

```jsx
import { useState, useEffect } from 'react';
import axios from 'axios';

export function VotingFlow({ electionId }) {
  const [step, setStep] = useState('check'); // check, register, verify, vote, results
  const [voterStatus, setVoterStatus] = useState(null);
  const [voterId, setVoterId] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Step 1: Check if already registered
  useEffect(() => {
    checkStatus();
  }, [electionId]);

  const checkStatus = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `/api/voters/status/${electionId}`,
        { withCredentials: true }
      );
      const status = response.data.data;
      setVoterStatus(status);
      setVoterId(status.voter_id);

      if (status.verified) {
        if (status.has_voted) {
          setStep('results');
        } else {
          await loadCandidates();
          setStep('vote');
        }
      } else {
        setStep('verify');
      }
    } catch (err) {
      // Not registered yet
      setStep('register');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Register as voter
  const handleRegister = async () => {
    try {
      setLoading(true);
      const response = await axios.post(
        '/api/voters/register',
        {
          electionId,
          authType: 'OTP'
        },
        { withCredentials: true }
      );
      setVoterId(response.data.data.voter_id);
      setStep('verify');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Verify voter
  const handleVerify = async () => {
    try {
      setLoading(true);
      await axios.post(
        `/api/voters/verify/${voterId}`,
        {},
        { withCredentials: true }
      );
      await loadCandidates();
      setStep('vote');
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  // Step 4: Load candidates
  const loadCandidates = async () => {
    const response = await axios.get(
      `/api/votes/candidates/${electionId}`
    );
    setCandidates(response.data.data);
  };

  // Step 5: Cast vote
  const handleVote = async (candidateId) => {
    try {
      setLoading(true);
      await axios.post(
        '/api/votes/cast',
        { electionId, candidateId },
        { withCredentials: true }
      );
      setStep('results');
    } catch (err) {
      setError(err.response?.data?.message || 'Vote failed');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  // Step 1: Show register button
  if (step === 'register') {
    return (
      <div>
        <h2>Join this election to vote</h2>
        <button onClick={handleRegister}>Register as Voter</button>
      </div>
    );
  }

  // Step 2: Show verification screen
  if (step === 'verify') {
    return (
      <div>
        <h2>Verify Your Identity</h2>
        <p>Complete OTP/Aadhar verification</p>
        <button onClick={handleVerify}>Verify</button>
      </div>
    );
  }

  // Step 3: Show candidates
  if (step === 'vote') {
    return (
      <div>
        <h2>Select a Candidate to Vote For</h2>
        <div className="candidates">
          {candidates.map(candidate => (
            <div key={candidate.candidate_id} className="candidate-card">
              <img src={candidate.candidatePhoto} alt={candidate.candidateName} />
              <h3>{candidate.candidateName}</h3>
              <p>{candidate.party_name}</p>
              <button onClick={() => handleVote(candidate.candidate_id)}>
                Vote
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Step 4: Show results
  if (step === 'results') {
    return <ResultsPage electionId={electionId} />;
  }
}
```

---

## 🔍 Troubleshooting

### Issue: "Voter record not found for this election"

**Cause:** User hasn't registered as voter

**Solution:**
```
1. Call POST /api/voters/register first
2. Get voter_id from response
3. Call POST /api/voters/verify/{voterId}
4. Now can call POST /api/votes/cast
```

---

### Issue: "Voter is not verified"

**Cause:** Voter registered but not verified

**Solution:**
```
1. Have user complete verification
2. Call POST /api/voters/verify/{voterId}
3. Then can vote
```

---

### Issue: "Already registered as a voter"

**Cause:** User trying to register twice for same election

**Solution:**
```
1. Call GET /api/voters/status/{electionId}
2. User already has voter_id
3. Skip to verification step
```

---

## 📊 Database Schema

### Voter Table (Updated)
```sql
{
  voter_id UUID PRIMARY KEY,
  user_id UUID FK → User,
  election_id UUID FK → Election,
  verified BOOLEAN DEFAULT false,
  authType AuthType (OTP, AADHAR, etc),
  has_voted BOOLEAN DEFAULT false,
  voted_at TIMESTAMP nullable
}

Index on (user_id, election_id) for quick lookup
```

---

## ✅ API Endpoints Summary

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | /api/voters/register | ✅ | Register as voter |
| POST | /api/voters/verify/:voterId | ✅ | Verify voter |
| GET | /api/voters/status/:electionId | ✅ | Check voter status |
| GET | /api/voters/election/:electionId | ❌ | Get all voters |
| GET | /api/voters/statistics/:electionId | ❌ | Get voter stats |
| POST | /api/votes/cast | ✅ | Cast a vote |
| GET | /api/votes/results/:electionId | ❌ | View results |
| GET | /api/votes/candidates/:electionId | ❌ | See candidates |

---

## 🎓 Key Takeaway

**Voting requires 3 steps:**
1. **Register** - User joins election (POST /api/voters/register)
2. **Verify** - User proves identity (POST /api/voters/verify)
3. **Vote** - User votes for candidate (POST /api/votes/cast)

**You cannot skip any step!**
