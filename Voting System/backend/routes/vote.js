const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const {
    castVote,
    getVotingResults,
    getApprovedCandidates,
    getVoterStatus,
    getVoterInfo
} = require('../controllers/voteController');

/**
 * Vote Routes
 * Base path: /api/votes
 */

/**
 * POST /api/votes/cast
 * Cast a vote for a candidate
 * Body: { electionId, candidateId }
 * Auth: Required
 */
router.post('/cast', authMiddleware, castVote);

/**
 * GET /api/votes/results/:electionId
 * Get voting results for an election
 * Params: electionId
 * Auth: Not required
 */
router.get('/results/:electionId', getVotingResults);

/**
 * GET /api/votes/candidates/:electionId
 * Get approved candidates for an election that user can vote for
 * Params: electionId
 * Auth: Not required
 */
router.get('/candidates/:electionId', getApprovedCandidates);

/**
 * GET /api/votes/voter-status/:electionId
 * Get current user's voter status in an election (has_voted, verified)
 * Params: electionId
 * Auth: Required
 */
router.get('/voter-status/:electionId', authMiddleware, getVoterStatus);

/**
 * GET /api/votes/voter-info/:electionId
 * Get current user's voter information for an election
 * Params: electionId
 * Auth: Required
 */
router.get('/voter-info/:electionId', authMiddleware, getVoterInfo);

module.exports = router;
