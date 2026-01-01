const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * @route   POST /api/users/register
 * @desc    Register a new user account
 * @access  Public
 * @returns {Object} Success message and user details (without password)
 */
router.post('/register', async (req, res) => {
  // Extract user details from request body
  const { name, email, password } = req.body;
  
  try {
    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({ 
        msg: 'Please provide name, email, and password' 
      });
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        msg: 'Please provide a valid email address' 
      });
    }
    
    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({ 
        msg: 'Password must be at least 6 characters long' 
      });
    }

    // Check if user with this email already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ 
        msg: 'An account with this email already exists' 
      });
    }

    // Create new user instance
    user = new User({ name, email, password });

    // Generate salt for password hashing (10 rounds)
    const salt = await bcrypt.genSalt(10);
    
    // Hash the password before saving to database for security
    user.password = await bcrypt.hash(password, salt);

    // Save user to database
    await user.save();
    
    // Return success response (exclude password from response)
    res.status(201).json({ 
      msg: 'Account created successfully', 
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email 
      } 
    });
  } catch (err) {
    // Log error details for debugging
    console.error('Error registering user:', err.message);
    
    // Handle validation errors from MongoDB
    if (err.name === 'ValidationError') {
      return res.status(400).json({ 
        msg: 'Invalid user data provided. Please check all fields.' 
      });
    }
    
    // Handle duplicate key errors
    if (err.code === 11000) {
      return res.status(400).json({ 
        msg: 'An account with this email already exists' 
      });
    }
    
    // Generic server error response
    res.status(500).json({ 
      msg: 'Failed to create account. Please try again later.' 
    });
  }
});

/**
 * @route   POST /api/users/login
 * @desc    Authenticate user and generate JWT token
 * @access  Public
 * @returns {Object} JWT token and user details
 */
router.post('/login', async (req, res) => {
  // Extract login credentials from request body
  const { email, password } = req.body;
  
  try {
    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ 
        msg: 'Please provide email and password' 
      });
    }

    // Check if user exists in database
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ 
        msg: 'Invalid email or password' 
      });
    }

    // Compare provided password with hashed password in database
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ 
        msg: 'Invalid email or password' 
      });
    }

    // Create JWT payload with user ID
    const payload = { 
      user: { 
        id: user.id 
      } 
    };
    
    // Sign JWT token with secret key and set expiration to 1 hour
    jwt.sign(
      payload, 
      process.env.JWT_SECRET, 
      { expiresIn: '1h' }, 
      (err, token) => {
        // Handle JWT signing errors
        if (err) {
          console.error('JWT signing error:', err.message);
          return res.status(500).json({ 
            msg: 'Failed to generate authentication token' 
          });
        }
        
        // Return token and user details (exclude password)
        res.json({ 
          token, 
          user: { 
            id: user.id, 
            name: user.name, 
            email: user.email 
          } 
        });
      }
    );
  } catch (err) {
    // Log error details for debugging
    console.error('Error logging in user:', err.message);
    
    // Generic server error response
    res.status(500).json({ 
      msg: 'Login failed. Please try again later.' 
    });
  }
});

/**
 * @route   GET /api/users
 * @desc    Retrieve all registered users
 * @access  Public
 * @returns {Array} Array of all users (passwords excluded)
 */
router.get('/', async (req, res) => {
  try {
    // Fetch all users from database and exclude password field for security
    const users = await User.find().select('-password');
    
    // Return users array
    res.json(users);
  } catch (err) {
    // Log error details for debugging
    console.error('Error fetching users:', err.message);
    
    // Return user-friendly error message
    res.status(500).json({ 
      msg: 'Failed to retrieve users. Please try again later.' 
    });
  }
});

/**
 * @route   PUT /api/users/:id
 * @desc    Update user profile information
 * @access  Private
 * @param   {String} id - MongoDB ObjectId of the user to update
 * @returns {Object} Success message and updated user details
 */
router.put('/:id', async (req, res) => {
  // Extract update data from request body
  const { name, email } = req.body;
  
  try {
    // Find user by ID
    let user = await User.findById(req.params.id);
    
    // If user doesn't exist, return 404 error
    if (!user) {
      return res.status(404).json({ 
        msg: 'User not found' 
      });
    }
    
    // Validate email format if provided
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ 
          msg: 'Please provide a valid email address' 
        });
      }
      
      // Check if email is already taken by another user
      const existingUser = await User.findOne({ email, _id: { $ne: req.params.id } });
      if (existingUser) {
        return res.status(400).json({ 
          msg: 'This email is already in use by another account' 
        });
      }
    }

    // Update user fields (only if new values are provided)
    user.name = name || user.name;
    user.email = email || user.email;

    // Save updated user to database
    await user.save();
    
    // Return success response (exclude password)
    res.json({ 
      msg: 'Profile updated successfully', 
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email 
      } 
    });
  } catch (err) {
    // Log error details for debugging
    console.error('Error updating user:', err.message);
    
    // Handle invalid ObjectId format
    if (err.kind === 'ObjectId' || err.name === 'CastError') {
      return res.status(404).json({ 
        msg: 'Invalid user ID provided' 
      });
    }
    
    // Handle validation errors
    if (err.name === 'ValidationError') {
      return res.status(400).json({ 
        msg: 'Invalid user data provided' 
      });
    }
    
    // Generic server error response
    res.status(500).json({ 
      msg: 'Failed to update profile. Please try again later.' 
    });
  }
});

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete a user account
 * @access  Private
 * @param   {String} id - MongoDB ObjectId of the user to delete
 * @returns {Object} Success message
 */
router.delete('/:id', async (req, res) => {
  try {
    // Find user by ID
    let user = await User.findById(req.params.id);
    
    // If user doesn't exist, return 404 error
    if (!user) {
      return res.status(404).json({ 
        msg: 'User not found. Account may have already been deleted.' 
      });
    }

    // Delete user from database
    await User.findByIdAndDelete(req.params.id);
    
    // Return success message
    res.json({ 
      msg: 'Account deleted successfully' 
    });
  } catch (err) {
    // Log error details for debugging
    console.error('Error deleting user:', err.message);
    
    // Handle invalid ObjectId format
    if (err.kind === 'ObjectId' || err.name === 'CastError') {
      return res.status(404).json({ 
        msg: 'Invalid user ID provided' 
      });
    }
    
    // Generic server error response
    res.status(500).json({ 
      msg: 'Failed to delete account. Please try again later.' 
    });
  }
});

module.exports = router;
