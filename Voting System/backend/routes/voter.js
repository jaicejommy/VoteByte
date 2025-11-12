const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const {
    registerVoter,
    verifyVoter,
    getVotersForElection,
    getVoterStatus,
    getVoterStatistics
} = require('../controllers/voterController');

/**
 * Voter Registration & Management Routes
 * Base path: /api/voters
 */

/**
 * POST /api/voters/register
 * Register a user as a voter for an election
 * Body: { electionId, authType }
 * Auth: Required
 */
router.post('/register', authMiddleware, registerVoter);

/**
 * POST /api/voters/verify/:voterId
 * Verify a voter after authentication (OTP/Aadhar/Face/StudentID)
 * Params: voterId
 * Auth: Required
 */
router.post('/verify/:voterId', authMiddleware, verifyVoter);

/**
 * GET /api/voters/status/:electionId
 * Check if current user is registered voter and their status
 * Params: electionId
 * Auth: Required
 */
router.get('/status/:electionId', authMiddleware, getVoterStatus);

/**
 * GET /api/voters/election/:electionId
 * Get all voters for an election
 * Params: electionId
 * Auth: Not required (can be public)
 */
router.get('/election/:electionId', getVotersForElection);

/**
 * GET /api/voters/statistics/:electionId
 * Get voter statistics for an election
 * Params: electionId
 * Auth: Not required
 */
router.get('/statistics/:electionId', getVoterStatistics);

module.exports = router;
