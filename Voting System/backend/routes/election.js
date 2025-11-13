const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const { 
    createElection,
    getAllElections,
    getElectionById,
    getUserElections,
    getElectionsByStatus
} = require('../controllers/electionController');

// Create new election (protected route)
router.post('/create', authMiddleware, createElection);

// Get user's own elections (protected route)
router.get('/user/my-elections', authMiddleware, getUserElections);

// Get elections by status (upcoming, ongoing, completed)
router.get('/status/:status', getElectionsByStatus);

// Get all elections
router.get('/', getAllElections);

// Get election by ID
router.get('/:id', getElectionById);

module.exports = router;