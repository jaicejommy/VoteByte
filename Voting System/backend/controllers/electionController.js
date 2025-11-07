const electionService = require('../services/electionService');
const ApiResponse = require('../utils/ApiResponse');

/**
 * Controller functions for elections
 * Exported functions match the router expectations:
 *  - createElection
 *  - getAllElections
 *  - getElectionById
 */

exports.createElection = async (req, res) => {
  try {
    const electionData = req.body;
    const userId = req.user && req.user.user_id;

    if (!userId) return ApiResponse.unauthorized(res, 'Authentication required');

    const election = await electionService.createElection(electionData, userId);

    return ApiResponse.success(res, 'Election created successfully', election, 201);
  } catch (error) {
    console.error('Error creating election:', error);
    // If validation error from service, return 400
    if (error.message && error.message.toLowerCase().includes('invalid')) {
      return ApiResponse.badRequest(res, error.message);
    }
    return ApiResponse.error(res, error.message || 'Internal server error');
  }
};

exports.getAllElections = async (req, res) => {
  try {
    const elections = await electionService.getAllElections();
    return ApiResponse.success(res, 'Elections retrieved successfully', elections);
  } catch (error) {
    console.error('Error fetching elections:', error);
    return ApiResponse.error(res, error.message || 'Internal server error');
  }
};

exports.getElectionById = async (req, res) => {
  try {
    const { id } = req.params;
    const election = await electionService.getElectionById(id);
    return ApiResponse.success(res, 'Election retrieved successfully', election);
  } catch (error) {
    console.error('Error fetching election:', error);
    if (error.message && error.message.toLowerCase().includes('not found')) {
      return ApiResponse.notFound(res, 'Election not found');
    }
    return ApiResponse.error(res, error.message || 'Internal server error');
  }
};