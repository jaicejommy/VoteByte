const voteService = require('../services/voteService');
const ApiResponse = require('../utils/ApiResponse');

/**
 * Controller functions for voting operations
 */

/**
 * Cast a vote for a candidate
 * POST /votes/cast
 * Body: { electionId, candidateId }
 */
exports.castVote = async (req, res) => {
        try {
            const { electionId, candidateId } = req.body;
            const userId = req.user && req.user.user_id;
            


        // Validate authentication
        if (!userId) {
            return ApiResponse.unauthorized(res, 'Authentication required');
        }

        // Validate input
        if (!electionId || !candidateId) {
            return ApiResponse.badRequest(res, 'Election ID and Candidate ID are required');
        }

        // Cast the vote
        const result = await voteService.castVote(electionId, candidateId, userId);

        return ApiResponse.success(
            res,
            result.message,
            {
                vote: result.vote,
                candidateName: result.candidateName,
                totalVotes: result.candidateVotes
            },
            201
        );
    } catch (error) {
        console.error('Error casting vote:', error);

        // Handle specific error messages
        if (error.message.includes('already voted')) {
            return ApiResponse.badRequest(res, error.message);
        }
        if (error.message.includes('not found')) {
            return ApiResponse.notFound(res, error.message);
        }
        if (error.message.includes('not verified') || error.message.includes('not approved')) {
            return ApiResponse.badRequest(res, error.message);
        }
        if (error.message.includes('not ongoing') || error.message.includes('not currently active')) {
            return ApiResponse.badRequest(res, error.message);
        }

        return ApiResponse.error(res, error.message || 'Internal server error');
    }
};

/**
 * Get voting results for an election
 * GET /votes/results/:electionId
 */
exports.getVotingResults = async (req, res) => {
    try {
        const { electionId } = req.params;

        if (!electionId) {
            return ApiResponse.badRequest(res, 'Election ID is required');
        }

        const results = await voteService.getVotingResults(electionId);

        return ApiResponse.success(
            res,
            'Voting results retrieved successfully',
            results
        );
    } catch (error) {
        console.error('Error fetching voting results:', error);

        if (error.message.includes('not found')) {
            return ApiResponse.notFound(res, error.message);
        }

        return ApiResponse.error(res, error.message || 'Internal server error');
    }
};

/**
 * Get approved candidates for an election
 * GET /votes/candidates/:electionId
 */
exports.getApprovedCandidates = async (req, res) => {
    try {
        const { electionId } = req.params;

        if (!electionId) {
            return ApiResponse.badRequest(res, 'Election ID is required');
        }

        const candidates = await voteService.getApprovedCandidates(electionId);

        return ApiResponse.success(
            res,
            'Approved candidates retrieved successfully',
            candidates
        );
    } catch (error) {
        console.error('Error fetching candidates:', error);

        return ApiResponse.error(res, error.message || 'Internal server error');
    }
};

/**
 * Check if user has voted and get voter status
 * GET /votes/voter-status/:electionId
 */
exports.getVoterStatus = async (req, res) => {
    try {
        const { electionId } = req.params;
        const userId = req.user && req.user.user_id;

        if (!userId) {
            return ApiResponse.unauthorized(res, 'Authentication required');
        }

        if (!electionId) {
            return ApiResponse.badRequest(res, 'Election ID is required');
        }

        const voterInfo = await voteService.getVoterInfo(userId, electionId);

        return ApiResponse.success(
            res,
            'Voter status retrieved successfully',
            {
                has_voted: voterInfo.has_voted,
                verified: voterInfo.verified,
                voted_at: voterInfo.voted_at,
                authType: voterInfo.authType
            }
        );
    } catch (error) {
        console.error('Error fetching voter status:', error);

        if (error.message.includes('not found')) {
            return ApiResponse.notFound(res, error.message);
        }

        return ApiResponse.error(res, error.message || 'Internal server error');
    }
};

/**
 * Get voter information for an election
 * GET /votes/voter-info/:electionId
 */
exports.getVoterInfo = async (req, res) => {
    try {
        const { electionId } = req.params;
        const userId = req.user && req.user.user_id;

        if (!userId) {
            return ApiResponse.unauthorized(res, 'Authentication required');
        }

        if (!electionId) {
            return ApiResponse.badRequest(res, 'Election ID is required');
        }

        const voterInfo = await voteService.getVoterInfo(userId, electionId);

        return ApiResponse.success(
            res,
            'Voter information retrieved successfully',
            voterInfo
        );
    } catch (error) {
        console.error('Error fetching voter info:', error);

        if (error.message.includes('not found')) {
            return ApiResponse.notFound(res, error.message);
        }

        return ApiResponse.error(res, error.message || 'Internal server error');
    }
};

module.exports = exports;
