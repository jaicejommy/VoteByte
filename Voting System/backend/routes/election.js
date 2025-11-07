const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const { 
    createElection,
    getAllElections,
    getElectionById
} = require('../controllers/electionController');

// Create new election (protected route)
router.post('/create', authMiddleware, createElection);

// Get all elections
router.get('/', getAllElections);

// Get election by ID
router.get('/:id', getElectionById);
//1dbd7eaf-a443-42a0-aff0-c262c6cf7a83
module.exports = router;