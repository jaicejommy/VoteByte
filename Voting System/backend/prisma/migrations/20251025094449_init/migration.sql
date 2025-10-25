-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'SUPERADMIN');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "AdminStatus" AS ENUM ('ACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "AuthType" AS ENUM ('OTP', 'AADHAR', 'FACE_RECOGNITION', 'STUDENT_ID');

-- CreateEnum
CREATE TYPE "ElectionStatus" AS ENUM ('UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "CandidateStatus" AS ENUM ('APPROVED', 'PENDING', 'REJECTED');

-- CreateEnum
CREATE TYPE "ComplaintStatus" AS ENUM ('OPEN', 'UNDER_REVIEW', 'RESOLVED', 'DISMISSED');

-- CreateTable
CREATE TABLE "User" (
    "user_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "fullname" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "phone_number" TEXT,
    "gender" "Gender" NOT NULL,
    "date_of_birth" TIMESTAMP(3) NOT NULL,
    "address" TEXT NOT NULL,
    "profile_photo" TEXT NOT NULL,
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "Status" NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "Candidate" (
    "candidate_id" UUID NOT NULL,
    "election_id" UUID NOT NULL,
    "user_id" UUID,
    "party_name" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "manifesto" TEXT,
    "age" INTEGER NOT NULL,
    "qualification" TEXT NOT NULL,
    "total_votes" INTEGER NOT NULL DEFAULT 0,
    "status" "CandidateStatus" NOT NULL,
    "registered_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Candidate_pkey" PRIMARY KEY ("candidate_id","election_id")
);

-- CreateTable
CREATE TABLE "Election" (
    "election_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "title" TEXT NOT NULL,
    "description" TEXT,
    "created_by" UUID NOT NULL,
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3) NOT NULL,
    "authType" "AuthType" NOT NULL,
    "status" "ElectionStatus" NOT NULL,
    "total_voters" INTEGER NOT NULL,
    "total_candidates" INTEGER NOT NULL,
    "winner_candidate_id" UUID,
    "winner_election_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Election_pkey" PRIMARY KEY ("election_id")
);

-- CreateTable
CREATE TABLE "Admin" (
    "admin_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "election_id" UUID NOT NULL,
    "designation" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "AdminStatus" NOT NULL,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("admin_id")
);

-- CreateTable
CREATE TABLE "Voter" (
    "voter_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "election_id" UUID NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "authType" "AuthType" NOT NULL,
    "has_voted" BOOLEAN NOT NULL DEFAULT false,
    "voted_at" TIMESTAMP(3),

    CONSTRAINT "Voter_pkey" PRIMARY KEY ("voter_id")
);

-- CreateTable
CREATE TABLE "Vote" (
    "vote_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "election_id" UUID NOT NULL,
    "candidate_id" UUID NOT NULL,
    "voter_id" UUID NOT NULL,
    "cast_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Vote_pkey" PRIMARY KEY ("vote_id")
);

-- CreateTable
CREATE TABLE "ElectionResult" (
    "result_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "election_id" UUID NOT NULL,
    "total_votes" INTEGER NOT NULL,
    "voter_turnout_percentage" DOUBLE PRECISION NOT NULL,
    "winner_candidate_id" UUID,
    "winner_election_id" UUID,
    "result_generated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "remarks" TEXT,

    CONSTRAINT "ElectionResult_pkey" PRIMARY KEY ("result_id")
);

-- CreateTable
CREATE TABLE "SuperAdmin" (
    "superadmin_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,

    CONSTRAINT "SuperAdmin_pkey" PRIMARY KEY ("superadmin_id")
);

-- CreateTable
CREATE TABLE "Complaint" (
    "complaint_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "election_id" UUID,
    "user_id" UUID,
    "subject" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "ComplaintStatus" NOT NULL DEFAULT 'OPEN',
    "resolution_notes" TEXT,
    "resolved_by_id" UUID,
    "resolved_at" TIMESTAMP(3),

    CONSTRAINT "Complaint_pkey" PRIMARY KEY ("complaint_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Election_winner_candidate_id_winner_election_id_key" ON "Election"("winner_candidate_id", "winner_election_id");

-- CreateIndex
CREATE UNIQUE INDEX "ElectionResult_election_id_key" ON "ElectionResult"("election_id");

-- CreateIndex
CREATE UNIQUE INDEX "ElectionResult_winner_candidate_id_winner_election_id_key" ON "ElectionResult"("winner_candidate_id", "winner_election_id");

-- CreateIndex
CREATE UNIQUE INDEX "SuperAdmin_user_id_key" ON "SuperAdmin"("user_id");

-- AddForeignKey
ALTER TABLE "Candidate" ADD CONSTRAINT "Candidate_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Candidate" ADD CONSTRAINT "Candidate_election_id_fkey" FOREIGN KEY ("election_id") REFERENCES "Election"("election_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Election" ADD CONSTRAINT "Election_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "Admin"("admin_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Election" ADD CONSTRAINT "Election_winner_candidate_id_winner_election_id_fkey" FOREIGN KEY ("winner_candidate_id", "winner_election_id") REFERENCES "Candidate"("candidate_id", "election_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Admin" ADD CONSTRAINT "Admin_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Voter" ADD CONSTRAINT "Voter_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Voter" ADD CONSTRAINT "Voter_election_id_fkey" FOREIGN KEY ("election_id") REFERENCES "Election"("election_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_election_id_fkey" FOREIGN KEY ("election_id") REFERENCES "Election"("election_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_candidate_id_election_id_fkey" FOREIGN KEY ("candidate_id", "election_id") REFERENCES "Candidate"("candidate_id", "election_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_voter_id_fkey" FOREIGN KEY ("voter_id") REFERENCES "Voter"("voter_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ElectionResult" ADD CONSTRAINT "ElectionResult_election_id_fkey" FOREIGN KEY ("election_id") REFERENCES "Election"("election_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ElectionResult" ADD CONSTRAINT "ElectionResult_winner_candidate_id_winner_election_id_fkey" FOREIGN KEY ("winner_candidate_id", "winner_election_id") REFERENCES "Candidate"("candidate_id", "election_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SuperAdmin" ADD CONSTRAINT "SuperAdmin_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Complaint" ADD CONSTRAINT "Complaint_election_id_fkey" FOREIGN KEY ("election_id") REFERENCES "Election"("election_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Complaint" ADD CONSTRAINT "Complaint_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Complaint" ADD CONSTRAINT "Complaint_resolved_by_id_fkey" FOREIGN KEY ("resolved_by_id") REFERENCES "SuperAdmin"("superadmin_id") ON DELETE SET NULL ON UPDATE CASCADE;
