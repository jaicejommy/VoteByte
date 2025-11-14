const { PrismaClient } = require('@prisma/client');
const Election = require('../models/Election');

class ElectionService {
    constructor() {
        this.prisma = new PrismaClient();
    }

    /**
     * Recalculate and persist election.status for all non-cancelled elections
     * based on start_time/end_time and current time.
     *
     * This keeps UPCOMING / ONGOING / COMPLETED in sync with the actual
     * schedule so that listings and voting logic behave correctly.
     */
    async refreshElectionStatuses() {
        const now = new Date();

        // Fetch only fields we need to compute status
        const elections = await this.prisma.election.findMany({
            select: {
                election_id: true,
                start_time: true,
                end_time: true,
                status: true,
            },
        });

        const updates = [];

        for (const e of elections) {
            // Never override CANCELLED elections automatically
            if (e.status === 'CANCELLED') continue;

            let nextStatus = e.status;

            if (now < e.start_time) {
                nextStatus = 'UPCOMING';
            } else if (now >= e.start_time && now <= e.end_time) {
                nextStatus = 'ONGOING';
            } else if (now > e.end_time) {
                nextStatus = 'COMPLETED';
            }

            if (nextStatus !== e.status) {
                updates.push(
                    this.prisma.election.update({
                        where: { election_id: e.election_id },
                        data: { status: nextStatus },
                    })
                );
            }
        }

        if (updates.length > 0) {
            await this.prisma.$transaction(updates);
        }
    }

    async createElection(electionData, userId) {
        try {
            const election = new Election({
                ...electionData,
                status: 'UPCOMING',
                created_by: userId
            });

            // Validate election data
            if (!election.isValid()) {
                const errors = election.getValidationErrors();
                throw new Error(`Invalid election data: ${errors.join(', ')}`);
            }

            // Create admin first using a generated election_id, then create election with that id
            const { randomUUID } = require('crypto');
            const result = await this.prisma.$transaction(async (prisma) => {
                const electionId = randomUUID();

                // create admin record that references election_id (schema requires non-null election_id)
                const createdAdmin = await prisma.admin.create({
                    data: {
                        user: { connect: { user_id: userId } },
                        election_id: electionId,
                        designation: 'ELECTION_CREATOR',
                        status: 'ACTIVE'
                    }
                });

                // create election and set created_by to the new admin id, and set election_id to electionId
                const createdElection = await prisma.election.create({
                    data: {
                        election_id: electionId,
                        title: election.title,
                        description: election.description,
                        created_by: createdAdmin.admin_id,
                        start_time: election.start_time,
                        end_time: election.end_time,
                        authType: election.authType,
                        status: election.status,
                        total_voters: election.total_voters || 0,
                        total_candidates: election.total_candidates || 0
                    },
                    include: {
                        created_by_admin: {
                            include: { user: true }
                        }
                    }
                });

                return new Election(createdElection);
            });

            return result;
        } catch (error) {
            throw new Error(`Failed to create election: ${error.message}`);
        }
    }

    async getAllElections() {
        try {
            // Keep election statuses in sync with their time windows
            await this.refreshElectionStatuses();

            const elections = await this.prisma.election.findMany({
                include: {
                    created_by_admin: {
                        include: {
                            user: {
                                select: {
                                    fullname: true,
                                    email: true
                                }
                            }
                        }
                    },
                    candidates: true,
                    voters: {
                        select: {
                            voter_id: true,
                            verified: true,
                            has_voted: true
                        }
                    }
                }
            });

            return elections.map(election => new Election(election));
        } catch (error) {
            throw new Error(`Failed to fetch elections: ${error.message}`);
        }
    }

    async getElectionById(electionId) {
        try {
            const election = await this.prisma.election.findUnique({
                where: { 
                    election_id: electionId 
                },
                include: {
                    created_by_admin: {
                        include: {
                            user: {
                                select: {
                                    fullname: true,
                                    email: true
                                }
                            }
                        }
                    },
                    candidates: true,
                    voters: {
                        select: {
                            voter_id: true,
                            verified: true,
                            has_voted: true
                        }
                    },
                    results: true
                }
            });

            if (!election) {
                throw new Error('Election not found');
            }

            return new Election(election);
        } catch (error) {
            throw new Error(`Failed to fetch election: ${error.message}`);
        }
    }

    async updateElectionStatus(electionId, status) {
        try {
            const updatedElection = await this.prisma.election.update({
                where: { election_id: electionId },
                data: { status }
            });

            return new Election(updatedElection);
        } catch (error) {
            throw new Error(`Failed to update election status: ${error.message}`);
        }
    }

    async getUserElections(userId) {
        try {
            // Keep election statuses in sync with their time windows
            await this.refreshElectionStatuses();

            // Find the admin record for this user
            const admin = await this.prisma.admin.findFirst({
                where: {
                    user_id: userId
                }
            });

            if (!admin) {
                return [];
            }

            // Get all elections created by this admin
            const elections = await this.prisma.election.findMany({
                where: {
                    created_by: admin.admin_id
                },
                include: {
                    created_by_admin: {
                        include: {
                            user: {
                                select: {
                                    fullname: true,
                                    email: true
                                }
                            }
                        }
                    },
                    candidates: true,
                    voters: {
                        select: {
                            voter_id: true,
                            verified: true,
                            has_voted: true
                        }
                    }
                },
                orderBy: {
                    created_at: 'desc'
                }
            });

            return elections.map(election => new Election(election));
        } catch (error) {
            throw new Error(`Failed to fetch user elections: ${error.message}`);
        }
    }

    async getElectionsByStatus(status) {
        try {
            const validStatuses = ['UPCOMING', 'ONGOING', 'COMPLETED'];
            const normalizedStatus = status.toUpperCase();

            if (!validStatuses.includes(normalizedStatus)) {
                throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
            }

            // Ensure statuses reflect current time windows before filtering
            await this.refreshElectionStatuses();

            const elections = await this.prisma.election.findMany({
                where: {
                    status: normalizedStatus,
                },
                include: {
                    created_by_admin: {
                        include: {
                            user: {
                                select: {
                                    fullname: true,
                                    email: true,
                                },
                            },
                        },
                    },
                    candidates: true,
                    voters: {
                        select: {
                            voter_id: true,
                            verified: true,
                            has_voted: true,
                        },
                    },
                },
                orderBy: {
                    start_time: 'asc',
                },
            });

            return elections.map((election) => new Election(election));
        } catch (error) {
            throw new Error(`Failed to fetch elections by status: ${error.message}`);
        }
    }
}

module.exports = new ElectionService();