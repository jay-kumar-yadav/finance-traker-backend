const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

// Generate JWT token
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

// Create and send token
const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  
  // Remove password from output
  user.password = undefined;
  
  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user
    }
  });
};

// Register
// Register
router.post('/register', async (req, res, next) => {
  try {
    console.log('Received registration data:', req.body);
    
    const { name, email, password, passwordConfirm } = req.body;

    // 1) Check if all required fields are present
    if (!name || !email || !password || !passwordConfirm) {
      console.log('Missing fields:', { name, email, password, passwordConfirm });
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide all required fields: name, email, password, passwordConfirm'
      });
    }

    // 2) Check if passwords match
    if (password !== passwordConfirm) {
      console.log('Passwords do not match:', { password, passwordConfirm });
      return res.status(400).json({
        status: 'fail',
        message: 'Passwords do not match'
      });
    }

    // 3) Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        status: 'fail',
        message: 'User already exists with this email'
      });
    }

    // 4) Create new user
    const newUser = await User.create({
      name,
      email,
      password
    });

    // 5) Generate token and send response
    createSendToken(newUser, 201, res);
  } catch (error) {
    console.error('Registration error:', error);
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
});

// Login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 1) Check if email and password exist
    if (!email || !password) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide email and password'
      });
    }

    // 2) Check if user exists and password is correct
    const user = await User.findOne({ email }).select('+password');
    
    if (!user || !(await user.correctPassword(password, user.password))) {
      return res.status(401).json({
        status: 'fail',
        message: 'Incorrect email or password'
      });
    }

    // 3) If everything ok, send token to client
    createSendToken(user, 200, res);
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
});

module.exports = router;