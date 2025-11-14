const fs = require('fs');
const path = require('path');
const uploadToCloudinary = require('../utils/uploadToCloudinary');

/**
 * Face Recognition Service
 * Handles face capture, storage, and verification
 */

const FACE_STORAGE_DIR = path.join(__dirname, '../face_storage');

// Ensure face storage directory exists
if (!fs.existsSync(FACE_STORAGE_DIR)) {
  fs.mkdirSync(FACE_STORAGE_DIR, { recursive: true });
}

/**
 * Store face photo and descriptor for a user during signup
 * @param {string} userId - User ID
 * @param {Buffer} faceImageBuffer - Face image buffer (PNG/JPG)
 * @param {Array} faceDescriptor - Face descriptor vector from face-api
 * @returns {Promise<Object>} { facePhotoUrl, faceDescriptorPath }
 */
async function storeFacePhoto(userId, faceImageBuffer, faceDescriptor) {
  try {
    if (!faceImageBuffer) {
      throw new Error('Face image buffer is required');
    }

    // Upload face photo to Cloudinary
    const facePhotoUrl = await uploadToCloudinary(faceImageBuffer, 'face_photos');

    // Store face descriptor locally (as JSON file)
    const descriptorFilename = `${userId}_descriptor.json`;
    const descriptorPath = path.join(FACE_STORAGE_DIR, descriptorFilename);

    const descriptorData = {
      userId,
      descriptor: faceDescriptor,
      storedAt: new Date().toISOString(),
    };

    fs.writeFileSync(descriptorPath, JSON.stringify(descriptorData, null, 2));

    return {
      success: true,
      facePhotoUrl,
      descriptorPath,
    };
  } catch (error) {
    console.error('Error storing face photo:', error);
    throw error;
  }
}

/**
 * Get stored face descriptor for a user
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Face descriptor vector
 */
function getFaceDescriptor(userId) {
  try {
    const descriptorFilename = `${userId}_descriptor.json`;
    const descriptorPath = path.join(FACE_STORAGE_DIR, descriptorFilename);

    if (!fs.existsSync(descriptorPath)) {
      throw new Error(`Face descriptor not found for user ${userId}`);
    }

    const data = JSON.parse(fs.readFileSync(descriptorPath, 'utf8'));
    return data.descriptor;
  } catch (error) {
    console.error('Error retrieving face descriptor:', error);
    throw error;
  }
}

/**
 * Compare two face descriptors for similarity
 * Uses Euclidean distance to measure similarity
 * @param {Array} descriptor1 - First face descriptor
 * @param {Array} descriptor2 - Second face descriptor
 * @param {number} threshold - Distance threshold (default 0.6, lower = stricter)
 * @returns {boolean} True if faces match
 */
function compareFaceDescriptors(descriptor1, descriptor2, threshold = 0.6) {
  try {
    if (!Array.isArray(descriptor1) || !Array.isArray(descriptor2)) {
      throw new Error('Both descriptors must be arrays');
    }

    if (descriptor1.length !== descriptor2.length) {
      throw new Error('Descriptor lengths do not match');
    }

    // Calculate Euclidean distance
    let sumSquares = 0;
    for (let i = 0; i < descriptor1.length; i++) {
      const diff = descriptor1[i] - descriptor2[i];
      sumSquares += diff * diff;
    }

    const distance = Math.sqrt(sumSquares);

    // Distance below threshold = match
    return distance < threshold;
  } catch (error) {
    console.error('Error comparing face descriptors:', error);
    throw error;
  }
}

/**
 * Verify a face during voting
 * @param {string} userId - User ID to verify
 * @param {Array} currentFaceDescriptor - Face descriptor from current capture
 * @param {number} matchThreshold - Matching threshold (default 0.6)
 * @returns {Promise<Object>} { verified: boolean, distance: number, message: string }
 */
async function verifyFace(userId, currentFaceDescriptor, matchThreshold = 0.6) {
  try {
    if (!currentFaceDescriptor || !Array.isArray(currentFaceDescriptor)) {
      throw new Error('Valid face descriptor is required');
    }

    // Get stored descriptor
    const storedDescriptor = getFaceDescriptor(userId);

    // Compare descriptors
    const isMatch = compareFaceDescriptors(
      storedDescriptor,
      currentFaceDescriptor,
      matchThreshold
    );

    // Calculate distance for logging/debugging
    let distance = 0;
    for (let i = 0; i < storedDescriptor.length; i++) {
      const diff = storedDescriptor[i] - currentFaceDescriptor[i];
      distance += diff * diff;
    }
    distance = Math.sqrt(distance);

    return {
      verified: isMatch,
      distance: parseFloat(distance.toFixed(4)),
      message: isMatch
        ? 'Face verified successfully'
        : `Face verification failed. Distance: ${distance.toFixed(4)} (threshold: ${matchThreshold})`,
    };
  } catch (error) {
    console.error('Error verifying face:', error);
    throw error;
  }
}

/**
 * Delete face data for a user (privacy/cleanup)
 * @param {string} userId - User ID
 */
function deleteFaceData(userId) {
  try {
    const descriptorFilename = `${userId}_descriptor.json`;
    const descriptorPath = path.join(FACE_STORAGE_DIR, descriptorFilename);

    if (fs.existsSync(descriptorPath)) {
      fs.unlinkSync(descriptorPath);
    }

    return { success: true, message: 'Face data deleted' };
  } catch (error) {
    console.error('Error deleting face data:', error);
    throw error;
  }
}

module.exports = {
  storeFacePhoto,
  getFaceDescriptor,
  compareFaceDescriptors,
  verifyFace,
  deleteFaceData,
};
