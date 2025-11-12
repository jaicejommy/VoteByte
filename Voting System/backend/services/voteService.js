const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const Vote = require('../models/Vote');

/**
 * Service layer for vote operations
 */

/**
 * Cast a vote - user votes for one candidate in an election
 * @param {string} electionId - Election ID
 * @param {string} candidateId - Candidate ID to vote for
 * @param {string} userId - User ID of the voter
 * @throws {Error} if validation fails
 * @returns {Object} vote and updated candidate vote count
 */
exports.castVote = async (electionId, candidateId, userId) => {
    try {
        // Validate inputs
        if (!electionId || !candidateId || !userId) {
            throw new Error('Election ID, Candidate ID, and User ID are required');
        }

        // 1. Check if election exists and is ongoing
        const election = await prisma.election.findUnique({
            where: { election_id: electionId }
        });

        if (!election) {
            throw new Error('Election not found');
        }

        const now = new Date();
        if (election.status !== 'ONGOING') {
            throw new Error(`Election is not ongoing. Current status: ${election.status}`);
        }

        if (now < election.start_time || now > election.end_time) {
            throw new Error('Election is not currently active');
        }

        // 2. Check if candidate exists and is approved
        const candidate = await prisma.candidate.findUnique({
            where: {
                candidate_id_election_id: {
                    candidate_id: candidateId,
                    election_id: electionId
                }
            }
        });

        if (!candidate) {
            throw new Error('Candidate not found in this election');
        }

        if (candidate.status !== 'APPROVED') {
            throw new Error('Candidate is not approved for voting');
        }

        // 3. Check if voter exists and is verified
        const voter = await prisma.voter.findFirst({
                where: {
                    user_id: userId,
                    election_id: electionId
                },
                include: { user: true }
            });

        if (!voter) {
        throw new Error('Voter is not registered for this election');
        }

        if (!voter.verified) {
        throw new Error('Voter is not verified');
        }

        if (voter.has_voted) {
        throw new Error('You have already voted in this election');
        }

        // 4. Check if voter has already voted
        if (voter.has_voted) {
            throw new Error('You have already voted in this election');
        }

        // 5. Check if user exists
        const user = await prisma.user.findUnique({
            where: { user_id: userId }
        });

        if (!user) {
            throw new Error('User not found');
        }

        // 6. Use transaction to record vote and update voter status
        const result = await prisma.$transaction(async (tx) => {
            // Record the vote
            const vote = await tx.vote.create({
                data: {
                    election_id: electionId,
                    candidate_id: candidateId,
                     voter_id: voter.voter_id, // ✅ correct foreign key
                    cast_time: new Date()
                }
            });

            // Update voter's has_voted status and voted_at timestamp
            const updatedVoter = await tx.voter.update({
                where: { voter_id: voter.voter_id },
                data: {
                    has_voted: true,
                    voted_at: new Date()
                }
                });

            // Increment candidate's total votes
            const updatedCandidate = await tx.candidate.update({
                where: {
                    candidate_id_election_id: {
                        candidate_id: candidateId,
                        election_id: electionId
                    }
                },
                data: {
                    total_votes: {
                        increment: 1
                    }
                }
            });

            return { vote, updatedVoter, updatedCandidate };
        });

        const voteObj = new Vote(result.vote);

        return {
            success: true,
            vote: voteObj.toJSON(),
            message: 'Vote cast successfully',
            candidateName: candidate.party_name,
            candidateVotes: result.updatedCandidate.total_votes
        };
    } catch (error) {
        throw error;
    }
};

/**
 * Get voting results for an election
 * @param {string} electionId - Election ID
 * @returns {Object} voting results with candidates and their vote counts
 */
exports.getVotingResults = async (electionId) => {
    try {
        if (!electionId) {
            throw new Error('Election ID is required');
        }

        // Check if election exists
        const election = await prisma.election.findUnique({
            where: { election_id: electionId },
            include: {
                candidates: {
                    where: { status: 'APPROVED' },
                    orderBy: { total_votes: 'desc' },
                    include: {
                        user: {
                            select: {
                                fullname: true,
                                profile_photo: true,
                                email: true
                            }
                        }
                    }
                },
                voters: true
            }
        });

        if (!election) {
            throw new Error('Election not found');
        }

        const totalVotesCast = await prisma.vote.count({
            where: { election_id: electionId }
        });

        const results = {
            election_id: electionId,
            title: election.title,
            status: election.status,
            total_registered_voters: election.total_voters,
            total_votes_cast: totalVotesCast,
            voter_turnout: election.total_voters > 0 ? ((totalVotesCast / election.total_voters) * 100).toFixed(2) : 0,
            candidates: election.candidates.map(candidate => ({
                candidate_id: candidate.candidate_id,
                party_name: candidate.party_name,
                symbol: candidate.symbol,
                total_votes: candidate.total_votes,
                vote_percentage: totalVotesCast > 0 ? ((candidate.total_votes / totalVotesCast) * 100).toFixed(2) : 0,
                candidateName: candidate.user ? candidate.user.fullname : 'Unknown',
                candidatePhoto: candidate.user ? candidate.user.profile_photo : null
            }))
        };

        // Determine winner if election is completed
        if (election.status === 'COMPLETED' && results.candidates.length > 0) {
            results.winner = {
                candidate_id: results.candidates[0].candidate_id,
                party_name: results.candidates[0].party_name,
                total_votes: results.candidates[0].total_votes
            };
        }

        return results;
    } catch (error) {
        throw error;
    }
};

/**
 * Check if a user has voted in an election
 * @param {string} userId - User ID
 * @param {string} electionId - Election ID
 * @returns {boolean} true if user has already voted
 */
exports.hasUserVoted = async (userId, electionId) => {
    try {
        const voter = await prisma.voter.findUnique({
            where: { voter_id: userId }
        });

        if (!voter) {
            return false;
        }

        return voter.has_voted && voter.election_id === electionId;
    } catch (error) {
        throw error;
    }
};

/**
 * Get approved candidates for an election
 * @param {string} electionId - Election ID
 * @returns {Array} list of approved candidates
 */
exports.getApprovedCandidates = async (electionId) => {
    try {
        if (!electionId) {
            throw new Error('Election ID is required');
        }

        const candidates = await prisma.candidate.findMany({
            where: {
                election_id: electionId,
                status: 'APPROVED'
            },
            include: {
                user: {
                    select: {
                        fullname: true,
                        profile_photo: true,
                        email: true
                    }
                }
            },
            orderBy: { registered_at: 'asc' }
        });

        return candidates.map(candidate => ({
            candidate_id: candidate.candidate_id,
            party_name: candidate.party_name,
            symbol: candidate.symbol,
            manifesto: candidate.manifesto,
            age: candidate.age,
            qualification: candidate.qualification,
            candidateName: candidate.user ? candidate.user.fullname : 'Unknown',
            candidatePhoto: candidate.user ? candidate.user.profile_photo : null,
            candidateEmail: candidate.user ? candidate.user.email : null,
            total_votes: candidate.total_votes
        }));
    } catch (error) {
        throw error;
    }
};

/**
 * Get voter information for an election
 * @param {string} userId - User ID
 * @param {string} electionId - Election ID
 * @returns {Object} voter information
 */
exports.getVoterInfo = async (userId, electionId) => {
    try {
        const voter = await prisma.voter.findFirst({
            where: {
                user_id: userId,
                election_id: electionId
            },
            include: {
                user: {
                    select: {
                        fullname: true,
                        email: true,
                        profile_photo: true
                    }
                }
            }
        });

        if (!voter) {
            throw new Error('Voter record not found for this election');
        }

        return {
            voter_id: voter.voter_id,
            user_id: voter.user_id,
            election_id: voter.election_id,
            verified: voter.verified,
            has_voted: voter.has_voted,
            voted_at: voter.voted_at,
            authType: voter.authType,
            user: voter.user
        };
    } catch (error) {
        throw error;
    }
};

module.exports = exports;
