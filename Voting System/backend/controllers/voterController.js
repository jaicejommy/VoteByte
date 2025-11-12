const voterService = require('../services/voterService');
const ApiResponse = require('../utils/ApiResponse');

/**
 * Controller functions for voter registration and management
 */

/**
 * Register a user as a voter for an election
 * POST /api/voters/register
 * Body: { electionId, authType }
 */

exports.registerVoter = async (req, res) => {
    try {
        const { electionId, authType } = req.body;
        const userId = req.user && req.user.user_id;

        // Validate authentication
        if (!userId) {
            return ApiResponse.unauthorized(res, 'Authentication required');
        }

        // Validate input
        if (!electionId || !authType) {
            return ApiResponse.badRequest(res, 'Election ID and Auth Type are required');
        }

        // Register voter
        const result = await voterService.registerVoter(userId, electionId, authType);

        return ApiResponse.success(
            res,
            result.message,
            result.voter,
            201
        );
    } catch (error) {
        console.error('Error registering voter:', error);

        if (error.message.includes('already registered')) {
            return ApiResponse.badRequest(res, error.message);
        }
        if (error.message.includes('not found')) {
            return ApiResponse.notFound(res, error.message);
        }

        return ApiResponse.error(res, error.message || 'Internal server error');
    }
};

/**
 * Verify a voter (after OTP/Aadhar/Face verification)
 * POST /api/voters/verify/:voterId
 */
exports.verifyVoter = async (req, res) => {
    try {
        const { voterId } = req.params;
        const userId = req.user && req.user.user_id;

        if (!userId) {
            return ApiResponse.unauthorized(res, 'Authentication required');
        }

        if (!voterId) {
            return ApiResponse.badRequest(res, 'Voter ID is required');
        }

        const result = await voterService.verifyVoter(voterId);

        return ApiResponse.success(
            res,
            result.message,
            result.voter
        );
    } catch (error) {
        console.error('Error verifying voter:', error);

        if (error.message.includes('not found')) {
            return ApiResponse.notFound(res, error.message);
        }

        return ApiResponse.error(res, error.message || 'Internal server error');
    }
};

/**
 * Get voters for an election (Admin only)
 * GET /api/voters/election/:electionId
 */
exports.getVotersForElection = async (req, res) => {
    try {
        const { electionId } = req.params;

        if (!electionId) {
            return ApiResponse.badRequest(res, 'Election ID is required');
        }

        const voters = await voterService.getVotersForElection(electionId);

        return ApiResponse.success(
            res,
            'Voters retrieved successfully',
            voters
        );
    } catch (error) {
        console.error('Error fetching voters:', error);

        return ApiResponse.error(res, error.message || 'Internal server error');
    }
};

/**
 * Check voter registration status
 * GET /api/voters/status/:electionId
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

        const status = await voterService.getVoterStatus(userId, electionId);

        if (!status.registered) {
            return ApiResponse.badRequest(res, status.message);
        }

        return ApiResponse.success(
            res,
            'Voter status retrieved successfully',
            status
        );
    } catch (error) {
        console.error('Error fetching voter status:', error);

        return ApiResponse.error(res, error.message || 'Internal server error');
    }
};

/**
 * Get voter statistics for an election
 * GET /api/voters/statistics/:electionId
 */
exports.getVoterStatistics = async (req, res) => {
    try {
        const { electionId } = req.params;

        if (!electionId) {
            return ApiResponse.badRequest(res, 'Election ID is required');
        }

        const stats = await voterService.getVoterStatistics(electionId);

        return ApiResponse.success(
            res,
            'Voter statistics retrieved successfully',
            stats
        );
    } catch (error) {
        console.error('Error fetching voter statistics:', error);

        return ApiResponse.error(res, error.message || 'Internal server error');
    }
};

module.exports = exports;
