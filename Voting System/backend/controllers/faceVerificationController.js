const faceRecognitionService = require('../services/faceRecognitionService');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Verify face during voting
 * POST /votes/verify-face
 * Body: { face_descriptor }
 * File: face_image
 */
exports.verifyFaceForVoting = async (req, res) => {
  try {
    const userId = req.user && req.user.user_id;

    if (!userId) {
      return res.status(401).json({ verified: false, message: 'Authentication required' });
    }

    const { face_descriptor } = req.body;

    if (!face_descriptor) {
      return res.status(400).json({ verified: false, message: 'Face descriptor is required' });
    }

    // Parse face descriptor
    let descriptor;
    try {
      descriptor = typeof face_descriptor === 'string' ? JSON.parse(face_descriptor) : face_descriptor;
    } catch (err) {
      return res.status(400).json({ verified: false, message: 'Invalid face descriptor format' });
    }

    // Verify face against stored face
    const verificationResult = await faceRecognitionService.verifyFace(userId, descriptor, 0.5);

    return res.json({
      verified: verificationResult.verified,
      distance: verificationResult.distance,
      message: verificationResult.message,
    });
  } catch (error) {
    console.error('Error verifying face:', error);
    return res.status(500).json({
      verified: false,
      message: error.message || 'Face verification failed',
    });
  }
};

/**
 * Verify face and mark voter as face-verified
 * POST /votes/face-verify/:electionId
 */
exports.markFaceVerified = async (req, res) => {
  try {
    const { electionId } = req.params;
    const userId = req.user && req.user.user_id;
    const { face_descriptor } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    if (!electionId) {
      return res.status(400).json({ success: false, message: 'Election ID is required' });
    }

    if (!face_descriptor) {
      return res.status(400).json({ success: false, message: 'Face descriptor is required' });
    }

    // Parse face descriptor
    let descriptor;
    try {
      descriptor = typeof face_descriptor === 'string' ? JSON.parse(face_descriptor) : face_descriptor;
    } catch (err) {
      return res.status(400).json({ success: false, message: 'Invalid face descriptor format' });
    }

    // Verify face
    const verificationResult = await faceRecognitionService.verifyFace(userId, descriptor, 0.5);

    if (!verificationResult.verified) {
      return res.status(403).json({
        success: false,
        message: 'Face verification failed',
        distance: verificationResult.distance,
      });
    }

    // Update voter as face-verified
    const voter = await prisma.voter.findFirst({
      where: {
        user_id: userId,
        election_id: electionId,
      },
    });

    if (!voter) {
      return res.status(404).json({ success: false, message: 'Voter not found for this election' });
    }

    // Verify face successfully - no database update needed
    return res.json({
      success: true,
      verified: true,
      message: 'Face verified successfully',
      distance: verificationResult.distance,
    });
  } catch (error) {
    console.error('Error marking face verified:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to mark face verified',
    });
  }
};

module.exports = exports;
