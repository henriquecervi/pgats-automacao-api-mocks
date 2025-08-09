const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/userRepository');

const JWT_SECRET = process.env.JWT_SECRET || 'banco-api-secret-key';

class AuthService {
  /**
   * Register new user
   */
  register(userData) {
    const { username, password, email } = userData;

    // Validate required fields
    if (!username || !password || !email) {
      throw new Error('Username, password and email are required');
    }

    // Check if user already exists (by username or email)
    const existingUserByUsername = userRepository.findByUsername(username);
    if (existingUserByUsername) {
      throw new Error('User with this username already exists');
    }

    const existingUserByEmail = userRepository.findByEmail(email);
    if (existingUserByEmail) {
      throw new Error('User with this email already exists');
    }

    // Hash password
    const hashedPassword = bcrypt.hashSync(password, 10);

    // Create user
    const newUser = userRepository.create({
      username,
      password: hashedPassword,
      email,
      balance: 1000.00 // Initial balance
    });

    // Return user without password
    const { password: _, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  }

  /**
   * Login
   */
  login(credentials) {
    const { username, password } = credentials;

    // Validate required fields
    if (!username || !password) {
      throw new Error('Username and password are required');
    }

    // Find user
    const user = userRepository.findByUsername(username);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = bcrypt.compareSync(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Return token and user data (without password)
    const { password: _, ...userWithoutPassword } = user;
    return {
      token,
      user: userWithoutPassword
    };
  }

  /**
   * Verify JWT token
   */
  verifyToken(token) {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  /**
   * Authentication middleware
   */
  authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ error: 'Token not provided' });
    }

    const token = authHeader.split(' ')[1]; // Bearer <token>
    
    if (!token) {
      return res.status(401).json({ error: 'Invalid token format' });
    }

    try {
      const decoded = this.verifyToken(token);
      req.user = decoded;
      next();
    } catch (error) {
      return res.status(401).json({ error: error.message });
    }
  }
}

module.exports = new AuthService();