const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const nodemailer = require('nodemailer');
const axios = require('axios');

const router = express.Router();
const prisma = new PrismaClient();

// Configure email transporter (Gmail example)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Generate random 6-digit OTP
function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send OTP for registration
router.post('/send-otp', async (req, res) => {
  try {
    const { email, phone, name } = req.body;
    
    if (!email && !phone) {
      return res.status(400).json({ message: 'Email or phone number is required' });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          email ? { email } : null,
          phone ? { phone } : null
        ].filter(Boolean)
      }
    });

    if (existingUser) {
      const field = existingUser.email === email ? 'email' : 'phone number';
      return res.status(400).json({ message: `User already exists with this ${field}` });
    }
    
    if (phone && !phone.startsWith('+')) {
      return res.status(400).json({ message: 'Phone number must include country code (e.g., +91...)' });
    }

    // Generate OTP
    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    
    // Delete any existing OTP for this email or phone
    if (email) await prisma.otp.deleteMany({ where: { email } });
    if (phone) await prisma.otp.deleteMany({ where: { phone } });
    
    // Store OTP in database
    await prisma.otp.create({
      data: {
        email: email || null,
        phone: phone || null,
        otp,
        expiresAt
      }
    });
    
    let sentTo = '';

    // Send OTP via SMS if phone is provided
    // Send OTP via SMS if phone is provided (using Fast2SMS)
    if (phone) {
      const cleanPhone = phone.replace(/^\+91/, '').trim();
      
      try {
        if (process.env.FAST2SMS_API_KEY) {
          const response = await axios.get('https://www.fast2sms.com/dev/bulkV2', {
            params: {
              authorization: process.env.FAST2SMS_API_KEY,
              route: 'otp',
              variables_values: otp,
              sender_id: 'TXTIND',
              numbers: cleanPhone
            }
          });
          
          console.log('Fast2SMS Response:', JSON.stringify(response.data));

          if (response.data && response.data.return === false) {
             throw new Error(response.data.message || 'Fast2SMS returned failure status');
          }

          console.log(`✅ SMS OTP sent to ${phone}: ${otp}`);
          sentTo = 'phone';
        } else {
            throw new Error('FAST2SMS_API_KEY not configured');
        }
      } catch (smsError) {
        console.error('SMS error:', smsError.message);
        if (smsError.response) {
            console.error('SMS API Response Data:', smsError.response.data);
        }
        
        // Fallback to console log in dev
        console.log('\n' + '='.repeat(60));
        console.log('📱 SMS SENDING FAILED - DEVELOPMENT MODE');
        console.log('='.repeat(60));
        console.log(`👤 Name: ${name}`);
        console.log(`📱 Phone: ${phone}`);
        console.log(`🔑 OTP: ${otp}`);
        console.log('='.repeat(60) + '\n');
        
        sentTo = 'phone (logged to console)';
      }
    }

    // Send OTP via email if email is provided
    if (email) {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Nutri Kitchen - Verify Your Email',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #4CAF50;">Welcome to Nutri Kitchen!</h2>
            <p>Hi ${name},</p>
            <p>Thank you for registering with Nutri Kitchen. Your OTP for verification is:</p>
            <div style="background-color: #f5f5f5; padding: 20px; text-align: center; margin: 20px 0;">
              <h1 style="color: #4CAF50; letter-spacing: 5px; margin: 0;">${otp}</h1>
            </div>
            <p>This OTP will expire in 10 minutes.</p>
            <p>If you didn't request this, please ignore this email.</p>
            <br>
            <p>Best regards,<br>Nutri Kitchen Team</p>
          </div>
        `
      };
      
      try {
        await transporter.sendMail(mailOptions);
        console.log(`✅ Email OTP sent to ${email}: ${otp}`);
        sentTo = sentTo ? 'both' : 'email';
      } catch (emailError) {
        console.error('Email error:', emailError.message);
        console.log('\n' + '='.repeat(60));
        console.log('📧 EMAIL SENDING FAILED - DEVELOPMENT MODE');
        console.log('='.repeat(60));
        console.log(`👤 Name: ${name}`);
        console.log(`📧 Email: ${email}`);
        console.log(`🔑 OTP: ${otp}`);
        console.log('='.repeat(60) + '\n');
        if (!sentTo) sentTo = 'email (logged to console)';
      }
    }
    
    // Construct final message
    let message = '';
    if (sentTo === 'both') {
        message = 'OTP sent successfully to Email';
    } else if (sentTo === 'phone') {
        message = 'OTP sent successfully to Phone';
    } else if (sentTo === 'email') {
        message = 'OTP sent successfully to Email';
    } else if (sentTo.includes('logged')) {
        message = `OTP generated! Check server logs for code (${sentTo})`;
    } else {
        message = 'OTP sent successfully';
    }

    res.json({ 
      message: message,
      email,
      phone
    });
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ message: 'Error sending OTP', error: error.message });
  }
});

// Verify OTP and register user
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, phone, otp, password, name, address, pincode, state, city } = req.body;
    
    if (!email && !phone) {
      return res.status(400).json({ message: 'Email or phone number is required' });
    }

    // Find OTP record
    const otpRecord = await prisma.otp.findFirst({
      where: {
        OR: [
          email ? { email } : null,
          phone ? { phone } : null
        ].filter(Boolean)
      }
    });
    
    if (!otpRecord) {
      return res.status(400).json({ message: 'OTP not found. Please request a new OTP.' });
    }
    
    // Check if OTP has expired
    if (new Date() > otpRecord.expiresAt) {
      if (email) await prisma.otp.deleteMany({ where: { email } });
      if (phone) await prisma.otp.deleteMany({ where: { phone } });
      return res.status(400).json({ message: 'OTP has expired. Please request a new OTP.' });
    }
    
    // Verify OTP
    if (otpRecord.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP. Please try again.' });
    }
    
    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          email ? { email } : null,
          phone ? { phone } : null
        ].filter(Boolean)
      }
    });

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Hash password and create user
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { 
        email, 
        phone,
        password: hashedPassword, 
        name,
        address,
        pincode,
        state,
        city,
        isVerified: true
      }
    });
    
    // Delete OTP record
    if (email) await prisma.otp.deleteMany({ where: { email } });
    if (phone) await prisma.otp.deleteMany({ where: { phone } });
    
    // Generate JWT token
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);
    
    res.status(201).json({ 
      token, 
      user: { 
        id: user.id, 
        email: user.email, 
        phone: user.phone,
        name: user.name,
        address: user.address,
        city: user.city,
        pincode: user.pincode,
        state: user.state,
        isVerified: user.isVerified
      } 
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ message: 'Error verifying OTP', error: error.message });
  }
});

// Resend OTP
router.post('/resend-otp', async (req, res) => {
  try {
    const { email, phone, name } = req.body;
    
    if (!email && !phone) {
      return res.status(400).json({ message: 'Email or phone number is required' });
    }

    if (phone && !phone.startsWith('+')) {
      return res.status(400).json({ message: 'Phone number must include country code (e.g., +91...)' });
    }

    // Generate new OTP
    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    
    // Update or create OTP record
    if (email) await prisma.otp.deleteMany({ where: { email } });
    if (phone) await prisma.otp.deleteMany({ where: { phone } });
    
    await prisma.otp.create({
      data: {
        email: email || null,
        phone: phone || null,
        otp,
        expiresAt
      }
    });
    
    let sentTo = '';

    // Send OTP via SMS if phone is provided
    // Send OTP via SMS if phone is provided
    if (phone) {
      const cleanPhone = phone.replace(/^\+91/, '').trim();
      
      try {
         if (process.env.FAST2SMS_API_KEY) {
            await axios.get('https://www.fast2sms.com/dev/bulkV2', {
                params: {
                authorization: process.env.FAST2SMS_API_KEY,
                route: 'otp',
                variables_values: otp,
                flash: 0,
                numbers: cleanPhone
                }
            });
            console.log(`✅ SMS OTP resent to ${phone}: ${otp}`);
            sentTo = 'phone';
         } else {
             throw new Error('FAST2SMS_API_KEY not configured');
         }
      } catch (smsError) {
        console.error('SMS error:', smsError.message);
        console.log('\n' + '='.repeat(60));
        console.log('📱 SMS SENDING FAILED - DEVELOPMENT MODE (RESEND)');
        console.log('='.repeat(60));
        console.log(`👤 Name: ${name}`);
        console.log(`📱 Phone: ${phone}`);
        console.log(`🔑 OTP: ${otp}`);
        console.log('='.repeat(60) + '\n');
        sentTo = 'phone (logged to console)';
      }
    }

    // Send OTP via email if email is provided
    if (email) {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Nutri Kitchen - Verify Your Email (Resent)',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #4CAF50;">Nutri Kitchen - OTP Resent</h2>
            <p>Hi ${name},</p>
            <p>Your new OTP for verification is:</p>
            <div style="background-color: #f5f5f5; padding: 20px; text-align: center; margin: 20px 0;">
              <h1 style="color: #4CAF50; letter-spacing: 5px; margin: 0;">${otp}</h1>
            </div>
            <p>This OTP will expire in 10 minutes.</p>
            <p>If you didn't request this, please ignore this email.</p>
            <br>
            <p>Best regards,<br>Nutri Kitchen Team</p>
          </div>
        `
      };
      
      try {
        await transporter.sendMail(mailOptions);
        console.log(`✅ Email OTP resent to ${email}: ${otp}`);
        sentTo = sentTo ? 'both' : 'email';
      } catch (emailError) {
        console.error('Email error:', emailError.message);
        console.log('\n' + '='.repeat(60));
        console.log('📧 EMAIL SENDING FAILED - DEVELOPMENT MODE (RESEND)');
        console.log('='.repeat(60));
        console.log(`👤 Name: ${name}`);
        console.log(`📧 Email: ${email}`);
        console.log(`🔑 OTP: ${otp}`);
        console.log('='.repeat(60) + '\n');
        if (!sentTo) sentTo = 'email (logged to console)';
      }
    }
    
    res.json({ message: `OTP resent successfully to your ${sentTo}` });
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({ message: 'Error resending OTP', error: error.message });
  }
});

// Login (unchanged)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'Email not found. Would you like to create a new account?' });
    }
    
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid password' });
    }
    
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        name: user.name,
        address: user.address,
        city: user.city,
        state: user.state,
        pincode: user.pincode
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in', error });
  }
});

// Get user profile
router.get('/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Unauthorized' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if ID is a valid MongoDB ObjectId (24 hex chars)
    const userId = String(decoded.userId);
    if (!/^[0-9a-fA-F]{24}$/.test(userId)) {
      return res.status(401).json({ message: 'Invalid session. Please login again.' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        phone: true,
        name: true,
        address: true,
        pincode: true,
        state: true,
        city: true,
        createdAt: true
      }
    });

    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile', error: error.message });
  }
});

// Update user profile
router.post('/profile/update', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Unauthorized' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const userId = String(decoded.userId);
    if (!/^[0-9a-fA-F]{24}$/.test(userId)) {
      return res.status(401).json({ message: 'Invalid session. Please login again.' });
    }

    const { name, phone, address, pincode, state, city } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { name, phone, address, pincode, state, city }
    });

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        phone: updatedUser.phone,
        name: updatedUser.name,
        address: updatedUser.address,
        pincode: updatedUser.pincode,
        state: updatedUser.state,
        city: updatedUser.city
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile', error: error.message });
  }
});

// Forgot Password - Send OTP
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'No account found with this email address' });
    }

    // Generate OTP
    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    
    // Delete any existing OTP for this email
    await prisma.otp.deleteMany({ where: { email } });
    
    // Store OTP in database
    await prisma.otp.create({
      data: {
        email,
        phone: null,
        otp,
        expiresAt
      }
    });

    // Send OTP via email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Nutri Kitchen - Password Reset Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4CAF50;">Password Reset Request</h2>
          <p>Hi ${user.name},</p>
          <p>We received a request to reset your password. Your verification code is:</p>
          <div style="background-color: #f5f5f5; padding: 20px; text-align: center; margin: 20px 0;">
            <h1 style="color: #4CAF50; letter-spacing: 5px; margin: 0;">${otp}</h1>
          </div>
          <p>This code will expire in 10 minutes.</p>
          <p>If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
          <br>
          <p>Best regards,<br>Nutri Kitchen Team</p>
        </div>
      `
    };
    
    try {
      await transporter.sendMail(mailOptions);
      console.log(`✅ Password reset OTP sent to ${email}: ${otp}`);
      res.json({ message: 'Verification code sent to your email' });
    } catch (emailError) {
      console.error('Email error:', emailError.message);
      console.log('\n' + '='.repeat(60));
      console.log('📧 PASSWORD RESET EMAIL FAILED - DEVELOPMENT MODE');
      console.log('='.repeat(60));
      console.log(`📧 Email: ${email}`);
      console.log(`🔑 OTP: ${otp}`);
      console.log('='.repeat(60) + '\n');
      res.json({ message: 'Verification code generated (check server logs)' });
    }
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Error processing request', error: error.message });
  }
});

// Verify Reset OTP
router.post('/verify-reset-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    
    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    // Find OTP record
    const otpRecord = await prisma.otp.findFirst({
      where: { email }
    });
    
    if (!otpRecord) {
      return res.status(400).json({ message: 'OTP not found. Please request a new code.' });
    }
    
    // Check if OTP has expired
    if (new Date() > otpRecord.expiresAt) {
      await prisma.otp.deleteMany({ where: { email } });
      return res.status(400).json({ message: 'OTP has expired. Please request a new code.' });
    }
    
    // Verify OTP
    if (otpRecord.otp !== otp) {
      return res.status(400).json({ message: 'Invalid verification code. Please try again.' });
    }

    // Generate a temporary reset token
    const resetToken = jwt.sign({ email, purpose: 'password-reset' }, process.env.JWT_SECRET, { expiresIn: '15m' });
    
    res.json({ 
      message: 'Verification successful',
      resetToken 
    });
  } catch (error) {
    console.error('Verify reset OTP error:', error);
    res.status(500).json({ message: 'Error verifying code', error: error.message });
  }
});

// Reset Password
router.post('/reset-password', async (req, res) => {
  try {
    const { email, resetToken, newPassword } = req.body;
    
    if (!email || !resetToken || !newPassword) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Verify reset token
    try {
      const decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
      if (decoded.email !== email || decoded.purpose !== 'password-reset') {
        return res.status(400).json({ message: 'Invalid reset token' });
      }
    } catch (err) {
      return res.status(400).json({ message: 'Reset token expired or invalid' });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update password
    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword }
    });

    // Delete OTP record
    await prisma.otp.deleteMany({ where: { email } });

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Error resetting password', error: error.message });
  }
});

module.exports = router;
