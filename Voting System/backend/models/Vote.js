class Vote {
    constructor({
        vote_id,
        election_id,
        candidate_id,
        voter_id,
        cast_time
    }) {
        this.vote_id = vote_id;
        this.election_id = election_id;
        this.candidate_id = candidate_id;
        this.voter_id = voter_id;
        this.cast_time = cast_time ? new Date(cast_time) : new Date();
    }

    isValid() {
        return (
            this.election_id &&
            this.candidate_id &&
            this.voter_id
        );
    }

    getValidationErrors() {
        const errors = [];

        if (!this.election_id) errors.push('Election ID is required');
        if (!this.candidate_id) errors.push('Candidate ID is required');
        if (!this.voter_id) errors.push('Voter ID is required');

        return errors;
    }

    toJSON() {
        return {
            vote_id: this.vote_id,
            election_id: this.election_id,
            candidate_id: this.candidate_id,
            voter_id: this.voter_id,
            cast_time: this.cast_time
        };
    }
}

module.exports = Vote;
