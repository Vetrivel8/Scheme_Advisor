const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const connectDB = require('../config/db');
const sendEmail = require('../utils/sendEmail');

// OTP Store replaced by Astra DB 'otps' collection for Vercel/Serverless support


// Register a new user
const registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Please provide all required fields' });
  }

  const db = connectDB();
  if (!db) return res.status(500).json({ message: 'Database connection error. Please configure Astra DB' });

  try {
    const usersCollection = db.collection('users');

    // Check if user exists
    const userExists = await usersCollection.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const newUser = {
      name,
      email,
      password: hashedPassword,
      isVerified: false
    };
    
    await usersCollection.insertOne(newUser);

    // Generate 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP in database
    const otpsCollection = db.collection('otps');
    await otpsCollection.deleteOne({ email }); // Remove any existing OTP for this email
    await otpsCollection.insertOne({
      email,
      otp,
      createdAt: Date.now()
    });

    // Send OTP email
    const message = `Your OTP for account verification is ${otp}. It is valid for 5 minutes.`;
    await sendEmail({
      email,
      subject: 'Account Verification OTP',
      message
    });

    res.status(201).json({ message: 'User registered. Please check email for OTP.' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// Verify OTP
const verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: 'Please provide email and OTP' });
  }

  const db = connectDB();
  if (!db) return res.status(500).json({ message: 'Database connection error' });

  try {
    const usersCollection = db.collection('users');

    const otpsCollection = db.collection('otps');
    const otpDoc = await otpsCollection.findOne({ email });

    if (!otpDoc || otpDoc.otp !== otp) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Check if OTP is expired (5 minutes = 300000 ms)
    const now = Date.now();
    if (now - (otpDoc.createdAt || 0) > 300000) {
      await otpsCollection.deleteOne({ email });
      return res.status(400).json({ message: 'OTP has expired. Please register again or request new OTP' });
    }

    // Update user to true
    await usersCollection.updateOne(
      { email },
      { $set: { isVerified: true } }
    );

    // Delete the OTP from database
    await otpsCollection.deleteOne({ email });

    res.status(200).json({ message: 'Account verified successfully' });
  } catch (error) {
    console.error('OTP Verification error:', error);
    res.status(500).json({ message: 'Server error during OTP verification' });
  }
};

// Login user
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide email and password' });
  }

  const db = connectDB();
  if (!db) return res.status(500).json({ message: 'Database connection error' });

  try {
    const usersCollection = db.collection('users');
    const user = await usersCollection.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    if (!user.isVerified) {
      return res.status(401).json({ message: 'Please verify your email first' });
    }

    // Generate JWT
    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET || 'fallback_secret', {
      expiresIn: '1h'
    });

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

module.exports = {
  registerUser,
  verifyOTP,
  loginUser
};
