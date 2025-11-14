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
const {
    verifyFaceForVoting,
    markFaceVerified
} = require('../controllers/faceVerificationController');

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

/**
 * POST /api/votes/verify-face
 * Verify face against stored face for voting
 * Body: { face_descriptor }
 * File: face_image
 * Auth: Required
 */
router.post('/verify-face', authMiddleware, verifyFaceForVoting);

/**
 * POST /api/votes/face-verify/:electionId
 * Verify face and mark voter as face-verified
 * Params: electionId
 * Body: { face_descriptor }
 * Auth: Required
 */
router.post('/face-verify/:electionId', authMiddleware, markFaceVerified);

module.exports = router;
