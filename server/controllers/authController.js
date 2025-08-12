const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { generateTokens } = require('../middleware/auth');
const { sendEmail } = require('../services/emailService');
const Joi = require('joi');

const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  firstName: Joi.string().min(2).required(),
  lastName: Joi.string().min(2).required(),
  phone: Joi.string().optional()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

const register = async (req, res) => {
  try {
    console.log('Registration attempt:', req.body);
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      console.log('Validation error:', error.details[0].message);
      return res.status(400).json({ error: error.details[0].message });
    }

    const { email, password, firstName, lastName, phone } = value;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = new User({
      email,
      password_hash: passwordHash,
      first_name: firstName,
      last_name: lastName,
      phone
    });
    
    await user.save();
    const tokens = generateTokens(user._id);

    // Send welcome email
    try {
      await sendEmail(
        email,
        'Welcome to EduPlanner!',
        `Hi ${firstName}, welcome to EduPlanner! Start organizing your academic life today.`
      );
    } catch (emailError) {
      console.log('Email sending failed:', emailError);
    }

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user._id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name
      },
      ...tokens
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

const login = async (req, res) => {
  try {
    console.log('Login attempt:', req.body);
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      console.log('Login validation error:', error.details[0].message);
      return res.status(400).json({ error: error.details[0].message });
    }

    const { email, password } = value;

    // Find user
    const user = await User.findOne({ email });
    console.log('User found:', user ? 'Yes' : 'No');
    
    if (!user) {
      console.log('User not found for email:', email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    console.log('Password valid:', isValidPassword);
    if (!isValidPassword) {
      console.log('Invalid password for user:', email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const tokens = generateTokens(user._id);

    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name
      },
      ...tokens
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(401).json({ error: 'Refresh token required' });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const tokens = generateTokens(decoded.userId);

    res.json(tokens);
  } catch (error) {
    res.status(403).json({ error: 'Invalid refresh token' });
  }
};

const logout = async (req, res) => {
  res.json({ message: 'Logged out successfully' });
};

module.exports = {
  register,
  login,
  refreshToken,
  logout
};