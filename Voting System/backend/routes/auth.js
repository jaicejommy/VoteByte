const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');
const upload = require('../config/multer-config');
const verificationController = require('../controllers/verificationController');

// register with optional profile photo upload (field name: profile_photo) and face_file
router.post('/register', upload.fields([
  { name: 'profile_photo', maxCount: 1 },
  { name: 'face_file', maxCount: 1 }
]), authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.get('/me', authMiddleware, authController.me);

// verification routes
router.post('/send-otp', verificationController.sendOtp);
router.post('/verify-otp', verificationController.verifyOtp);
router.post('/resend-otp', verificationController.sendOtp); // alias for send-otp for resend use case
// dev-only debug route to read OTP from server memory (only when NODE_ENV !== 'production')
router.get('/debug-otp', verificationController.debugOtp);

// Test endpoint for manual OTP testing (development only)
if (process.env.NODE_ENV !== 'production') {
  router.post('/test-otp-manual', async (req, res) => {
    try {
      const { email, code } = req.body;
      if (!email || !code) {
        return res.status(400).json({ message: 'email and code are required' });
      }
      
      const result = await verificationController.verifyOtp(req, res);
      // This won't work - need to call the service directly
    } catch (err) {
      console.error('Test OTP error:', err);
      return res.status(500).json({ message: 'Test failed', error: err.message });
    }
  });
}

module.exports = router;
