const authService = require('../services/authService');
const uploadToCloudinary = require('../utils/uploadToCloudinary');
const verificationService = require('../services/verificationService');
const faceRecognitionService = require('../services/faceRecognitionService');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function register(req, res) {
  console.log('\n========== SIGNUP REQUEST ==========');
  console.log('Body:', { fullname: req.body.fullname, email: req.body.email, role: req.body.role });
  console.log('Files:', req.files ? Object.keys(req.files) : 'none');
  
  try {
    const { fullname, email, password, role, phone_number, gender, date_of_birth, address, face_descriptor } = req.body;

    if (!fullname || !email || !password) {
      console.error('Missing required fields:', { fullname, email, password: !!password });
      return res.status(400).json({ message: 'fullname, email and password are required' });
    }

    // If a file was uploaded via multer memory storage, upload to Cloudinary
    let profilePhotoUrl = '';
    if (req.files && req.files.profile_photo) {
      try {
        profilePhotoUrl = await uploadToCloudinary(req.files.profile_photo[0].buffer, 'profile_photos');
        console.log('Profile photo uploaded to Cloudinary:', profilePhotoUrl);
      } catch (uploadErr) {
        console.error('Cloudinary upload error', uploadErr);
        return res.status(500).json({ message: 'Failed to upload profile photo' });
      }
    } else if (req.body.profile_photo) {
      // fallback: client provided a URL in the body
      profilePhotoUrl = req.body.profile_photo;
    }

    // Handle face photo upload (from face_file field)
    let facePhotoUrl = '';
    let faceFileBuffer = null;
    let faceDescriptorData = null;

    // Check for face file in either req.files (fields) or get the buffer for later use
    if (req.files && req.files.face_file) {
      try {
        faceFileBuffer = req.files.face_file[0].buffer;
        facePhotoUrl = await uploadToCloudinary(faceFileBuffer, 'face_photos');
        console.log('Face photo uploaded to Cloudinary:', facePhotoUrl);
        // If face photo was uploaded and no separate profile photo, use face photo for profile_photo
        if (!profilePhotoUrl && facePhotoUrl) {
          profilePhotoUrl = facePhotoUrl;
          console.log('Using face photo as profile photo (no separate profile photo uploaded)');
        }
      } catch (uploadErr) {
        console.error('Face photo upload error:', uploadErr);
        // Don't fail signup if face upload fails, but log it
        console.warn('Face photo upload failed, continuing without it');
      }
    }

    // Parse face descriptor if provided
    if (face_descriptor) {
      try {
        faceDescriptorData = typeof face_descriptor === 'string' ? JSON.parse(face_descriptor) : face_descriptor;
        console.log('Face descriptor parsed successfully');
      } catch (parseErr) {
        console.warn('Could not parse face descriptor:', parseErr);
      }
    }

    console.log('Creating user...');
    const user = await authService.registerUser({
      fullname,
      email,
      password,
      role: role || 'USER',
      phone_number: phone_number || null,
      gender: gender || 'OTHER',
      date_of_birth: date_of_birth ? new Date(date_of_birth) : new Date(),
      address: address || '',
      profile_photo: profilePhotoUrl,
      // face_photo handled separately to avoid schema issues
    });
    console.log('User created:', user.user_id, 'with profile_photo:', user.profile_photo);

    // Store face descriptor and ensure face photo URL is in DB
    if (user.user_id && faceFileBuffer && faceDescriptorData) {
      try {
        const storeResult = await faceRecognitionService.storeFacePhoto(
          user.user_id,
          faceFileBuffer, // Pass the actual buffer, not the URL
          faceDescriptorData
        );
        console.log('Face descriptor stored successfully for user:', user.user_id);
        // Ensure face photo URL is saved in database if not already saved
        if (storeResult && storeResult.facePhotoUrl) {
          try {
            const updated = await prisma.user.update({
              where: { user_id: user.user_id },
              data: { profile_photo: storeResult.facePhotoUrl }
            });
            console.log('✓ Face photo saved to profile_photo column in DB:', updated.profile_photo);
          } catch (updErr) {
            console.warn('Failed to update profile_photo:', updErr.message);
          }
        }
      } catch (faceErr) {
        console.warn('Could not store face descriptor:', faceErr.message);
        // Ensure face photo URL is still saved even if descriptor storage fails
        if (facePhotoUrl && user.user_id) {
          try {
            const updated = await prisma.user.update({
              where: { user_id: user.user_id },
              data: { profile_photo: facePhotoUrl }
            });
            console.log('✓ Face photo saved to profile_photo despite descriptor failure:', updated.profile_photo);
          } catch (fallbackErr) {
            console.warn('Failed to save face photo URL as fallback:', fallbackErr.message);
          }
        }
      }
    } else {
      // Log if face photo was not saved (no descriptor or no face file)
      if (facePhotoUrl && user.user_id && !faceDescriptorData) {
        console.log('Face photo uploaded but no descriptor provided - face photo URL stored as:', profilePhotoUrl);
      }
    }

    // send verification OTP to the user's email (fire-and-forget; failure shouldn't block signup)
    try {
      await verificationService.sendOtp(user.email);
      console.log('OTP sent successfully for user:', user.email);
    } catch (mailErr) {
      console.error('Failed to send verification email', mailErr);
      // Return 201 with both success and warning
      return res.status(201).json({ 
        user, 
        message: 'User created but failed to send verification email. Error: ' + mailErr.message,
        emailError: mailErr.message
      });
    }

    console.log('========== SIGNUP SUCCESS ==========\n');
    return res.status(201).json({ user, message: 'User created. Verification code sent to email.' });
  } catch (err) {
    console.error('SIGNUP ERROR:', err.message);
    console.error('Stack:', err.stack);
    console.log('========== SIGNUP FAILED ==========\n');
    if (err.code === 'P2002') {
      return res.status(409).json({ message: 'Email already in use' });
    }
    return res.status(500).json({ message: 'Internal server error', error: err.message });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'email and password required' });

    const { token, user } = await authService.authenticateUser(email, password);

    // set token as httpOnly cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({ user });
  } catch (err) {
    console.error(err);
    return res.status(401).json({ message: err.message || 'Invalid credentials' });
  }
}

async function logout(req, res) {
  // clear cookie
  res.clearCookie('token');
  // destroy express-session if used
  if (req.session) {
    req.session.destroy(() => {});
  }
  return res.json({ message: 'Logged out' });
}

async function me(req, res) {
  if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
  // send user without password
  const { password, ...rest } = req.user;
  return res.json({ user: rest });
}

module.exports = { register, login, logout, me };
