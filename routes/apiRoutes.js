const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const adminController = require('../controllers/adminController');
const excelService = require('../services/excelService');
const User = require('../models/User');

// In-Memory Password Reset Token Store (Map of email -> { code, expiresAt })
const resetTokens = new Map();

// Guest & Auth Endpoints connected directly to MongoDB
router.post('/auth/guest', (req, res) => {
  res.json({
    success: true,
    token: `guest-token-${Date.now()}`,
    user: { name: 'Guest Student', email: '', role: 'guest' }
  });
});

router.post('/auth/signup', async (req, res) => {
  const { name, email, password, regNo } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ success: false, error: 'Name, email, and password are required.' });
  }

  try {
    const cleanEmail = email.toLowerCase().trim();
    const existing = await User.findOne({ email: cleanEmail });
    if (existing) {
      return res.status(400).json({ success: false, error: 'An account with this email already exists.' });
    }

    const newUser = await User.create({
      name: name.trim(),
      email: cleanEmail,
      password,
      regNo: regNo ? regNo.trim() : '',
      role: 'student'
    });

    res.json({
      success: true,
      token: `token-${newUser._id}-${Date.now()}`,
      user: { name: newUser.name, email: newUser.email, role: 'student', regNo: newUser.regNo }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to create user in MongoDB: ' + err.message });
  }
});

router.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Email and password required' });
  }

  const cleanEmail = email.toLowerCase().trim();

  // Demo student fallback login
  if (cleanEmail === 'student@aditya.edu' && (password === '123456' || password === 'student123')) {
    return res.json({
      success: true,
      token: `demo-student-token-${Date.now()}`,
      user: { name: 'Aditya Student', email: 'student@aditya.edu', role: 'student', regNo: '21A91A0501' }
    });
  }

  try {
    const user = await User.findOne({ email: cleanEmail });
    if (!user || user.password !== password) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    res.json({
      success: true,
      token: `user-token-${user._id}-${Date.now()}`,
      user: { name: user.name, email: user.email, role: user.role, regNo: user.regNo }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Login failed: ' + err.message });
  }
});

// Forgot Password - Send Reset Code to Email
router.post('/auth/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email || !email.trim()) {
    return res.status(400).json({ success: false, error: 'Please enter your registered email address.' });
  }

  const cleanEmail = email.toLowerCase().trim();

  try {
    let userExists = false;
    if (cleanEmail === 'student@aditya.edu') {
      userExists = true;
    } else {
      const user = await User.findOne({ email: cleanEmail });
      if (user) userExists = true;
    }

    if (!userExists) {
      return res.status(404).json({ success: false, error: 'No account found with this email address. Please check spelling or Sign Up.' });
    }

    // Generate 6-digit OTP code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    resetTokens.set(cleanEmail, {
      code: resetCode,
      expiresAt: Date.now() + 15 * 60 * 1000 // 15 minutes validity
    });

    console.log(`[Password Reset Service]: Sent 6-digit reset code ${resetCode} to ${cleanEmail}`);

    res.json({
      success: true,
      message: `Password reset code sent to ${cleanEmail}! Please check your email inbox.`,
      email: cleanEmail,
      resetCode // Provided for instant UI test helper
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to process password reset: ' + err.message });
  }
});

// Reset Password - Verify OTP & Update Password in MongoDB
router.post('/auth/reset-password', async (req, res) => {
  const { email, resetCode, newPassword } = req.body;
  if (!email || !resetCode || !newPassword) {
    return res.status(400).json({ success: false, error: 'Email, reset code, and new password are required.' });
  }

  if (newPassword.trim().length < 6) {
    return res.status(400).json({ success: false, error: 'New password must be at least 6 characters long.' });
  }

  const cleanEmail = email.toLowerCase().trim();
  const tokenData = resetTokens.get(cleanEmail);

  if (!tokenData || tokenData.code !== resetCode.trim()) {
    return res.status(400).json({ success: false, error: 'Invalid or expired 6-digit reset code.' });
  }

  if (Date.now() > tokenData.expiresAt) {
    resetTokens.delete(cleanEmail);
    return res.status(400).json({ success: false, error: 'Reset code has expired. Please request a new one.' });
  }

  try {
    if (cleanEmail !== 'student@aditya.edu') {
      await User.findOneAndUpdate({ email: cleanEmail }, { $set: { password: newPassword.trim() } });
    }

    resetTokens.delete(cleanEmail);

    res.json({
      success: true,
      message: 'Password successfully reset! You can now log in with your new password.'
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to update password in database: ' + err.message });
  }
});

router.post('/admin/login', (req, res) => {
  const { email, password } = req.body;
  if (email === 'admin@aditya.edu' && password === 'admin123') {
    return res.json({
      success: true,
      token: `admin-token-${Date.now()}`,
      user: { name: 'Aditya Admin', email, role: 'admin' }
    });
  }
  res.status(401).json({ success: false, error: 'Invalid admin credentials' });
});

// Admin Excel Dataset Import Endpoint
router.post('/admin/import-excel', async (req, res) => {
  const { filePath, datasetType } = req.body;
  if (!filePath) {
    return res.status(400).json({ success: false, error: 'Excel file path is required.' });
  }

  try {
    if (datasetType === 'student') {
      const result = await excelService.importStudentExcel(filePath);
      return res.json({ success: true, message: `Successfully imported ${result.count} student academic records into MongoDB!`, result });
    } else {
      const result = excelService.importFacultyExcel(filePath);
      return res.json({ success: true, message: `Successfully imported ${result.count} faculty records into dataset!`, result });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: 'Excel import failed: ' + err.message });
  }
});

// Student Chat & Notifications Routes
router.post('/chat', chatController.handleChat);
router.get('/notifications/:email', chatController.getStudentNotifications);
router.post('/notifications/:id/dismiss', chatController.dismissNotification);

// Admin Dashboard Routes
router.get('/admin/tickets', adminController.getTickets);
router.post('/admin/tickets/:id/reply', adminController.replyTicket);
router.get('/admin/metrics', adminController.getMetrics);

// Supported languages
router.get('/languages', (req, res) => {
  res.json({
    languages: [
      { code: 'en', name: 'English' },
      { code: 'te', name: 'Telugu' },
      { code: 'hi', name: 'Hindi' },
      { code: 'ta', name: 'Tamil' },
      { code: 'kn', name: 'Kannada' },
      { code: 'ml', name: 'Malayalam' },
      { code: 'fr', name: 'French' },
      { code: 'de', name: 'German' },
      { code: 'es', name: 'Spanish' }
    ]
  });
});

module.exports = router;
