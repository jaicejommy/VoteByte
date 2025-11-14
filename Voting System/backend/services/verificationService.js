const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const mailer = require('../utils/mailer');

// In-memory OTP store: email -> { code, expiresAt }
// NOTE: For production use a persistent store (DB / Redis) so OTPs survive restarts and multiple instances.
const otpStore = new Map();

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendOtp(email) {
  // Ensure user exists - only select columns that actually exist in the database
  const user = await prisma.user.findUnique({ 
    where: { email },
    select: {
      user_id: true,
      email: true,
      status: true,
      fullname: true,
    }
  });
  if (!user) {
    console.error('User not found for email:', email);
    throw new Error('User not found');
  }
  if (user.status === 'ACTIVE') {
    console.warn('User already verified:', email);
    throw new Error('User already verified');
  }

  const code = generateOtp();
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes
  otpStore.set(email, { code, expiresAt });

  console.log(`\n========== OTP GENERATED ==========`);
  console.log(`Email: ${email}`);
  console.log(`OTP Code: ${code}`);
  console.log(`Expires at: ${new Date(expiresAt).toISOString()}`);
  console.log(`OTP Store size: ${otpStore.size}`);
  console.log(`Store contents: ${JSON.stringify(Array.from(otpStore.entries()))}`);
  console.log(`====================================\n`);

  // send email
  try {
    await mailer.sendVerificationMail(email, code);
    console.log(`✓ OTP email sent successfully to ${email}`);
  } catch (mailErr) {
    console.error(`✗ Failed to send OTP email to ${email}:`, mailErr);
    otpStore.delete(email); // Remove OTP if email send fails
    throw new Error(`Failed to send OTP: ${mailErr.message}`);
  }

  return true;
}

async function verifyOtp(email, code) {
  console.log(`\n========== OTP VERIFICATION ==========`);
  console.log(`Email: ${email}`);
  console.log(`Entered Code: "${code}" (type: ${typeof code})`);
  console.log(`Current OTP Store size: ${otpStore.size}`);
  console.log(`Stored entries: ${JSON.stringify(Array.from(otpStore.entries()))}`);
  
  const entry = otpStore.get(email);
  if (!entry) {
    console.error(`✗ No OTP entry found for email: ${email}`);
    console.log(`======================================\n`);
    return { ok: false, reason: 'no_otp' };
  }
  
  console.log(`Stored Code: "${entry.code}" (type: ${typeof entry.code})`);
  console.log(`Expires at: ${new Date(entry.expiresAt).toISOString()}`);
  console.log(`Current time: ${new Date().toISOString()}`);
  
  if (Date.now() > entry.expiresAt) {
    console.warn(`✗ OTP expired for email: ${email}`);
    otpStore.delete(email);
    console.log(`======================================\n`);
    return { ok: false, reason: 'expired' };
  }
  
  const codeMatch = String(code).trim() === String(entry.code).trim();
  console.log(`Code Match: ${codeMatch}`);
  console.log(`Entered (trimmed): "${String(code).trim()}"`);
  console.log(`Stored (trimmed): "${String(entry.code).trim()}"`);
  
  if (!codeMatch) {
    console.error(`✗ OTP code mismatch for email: ${email}`);
    console.log(`======================================\n`);
    return { ok: false, reason: 'invalid' };
  }

  console.log(`✓ OTP verification successful for email: ${email}`);
  // mark user as ACTIVE
  try {
    // Use updateMany to avoid returning full user record. This helps
    // when the Prisma schema and actual DB schema are out-of-sync
    // (missing optional columns) which can cause P2022 errors when
    // Prisma tries to SELECT/RETURN non-existent columns.
    const result = await prisma.user.updateMany({ where: { email }, data: { status: 'ACTIVE' } });
    if (result.count === 0) {
      console.error(`✗ No user updated for email: ${email}`);
      throw new Error('User not found');
    }
    console.log(`✓ User status updated to ACTIVE (rows: ${result.count})`);
  } catch (err) {
    console.error(`✗ Failed to update user status:`, err.message || err);
    console.log(`======================================\n`);
    throw err;
  }
  
  otpStore.delete(email);
  console.log(`✓ OTP deleted from store`);
  console.log(`======================================\n`);
  return { ok: true };
}

module.exports = { sendOtp, verifyOtp };

// Development helper: return OTP for an email (undefined in production)
function getOtp(email) {
  return otpStore.get(email)?.code;
}

module.exports.getOtp = getOtp;
