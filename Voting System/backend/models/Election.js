class Election {
    constructor({
        election_id,
        title,
        description,
        created_by,
        start_time,
        end_time,
        authType,
        status,
        total_voters,
        total_candidates,
        winner_candidate_id,
        winner_election_id,
        created_at
    }) {
        this.election_id = election_id;
        this.title = title;
        this.description = description;
        this.created_by = created_by;
        this.start_time = new Date(start_time);
        this.end_time = new Date(end_time);
        this.authType = authType;
        this.status = status;
        this.total_voters = total_voters;
        this.total_candidates = total_candidates;
        this.winner_candidate_id = winner_candidate_id;
        this.winner_election_id = winner_election_id;
        this.created_at = created_at;
    }

    isValid() {
        const now = new Date();
        return (
            this.title &&
            this.start_time &&
            this.end_time &&
            this.authType &&
            this.start_time > now &&
            this.end_time > this.start_time
        );
    }

    getValidationErrors() {
        const errors = [];
        const now = new Date();

        if (!this.title) errors.push('Title is required');
        if (!this.start_time) errors.push('Start time is required');
        if (!this.end_time) errors.push('End time is required');
        if (!this.authType) errors.push('Authentication type is required');
        if (this.start_time <= now) errors.push('Start time cannot be in the past');
        if (this.end_time <= this.start_time) errors.push('End time must be after start time');

        return errors;
    }

    toJSON() {
        return {
            election_id: this.election_id,
            title: this.title,
            description: this.description,
            created_by: this.created_by,
            start_time: this.start_time,
            end_time: this.end_time,
            authType: this.authType,
            status: this.status,
            total_voters: this.total_voters,
            total_candidates: this.total_candidates,
            winner_candidate_id: this.winner_candidate_id,
            winner_election_id: this.winner_election_id,
            created_at: this.created_at
        };
    }
}

module.exports = Election;