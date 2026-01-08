import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { query } from '../config/db.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { validateUserRegistration, isValidEmail } from '../utils/validators.js';

// Generate JWT token
const generateToken = (userId, role) => {
    return jwt.sign(
        { userId, role },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '7d' }
    );
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
export const register = asyncHandler(async (req, res) => {
    const { email, password, role } = req.body;

    // Validate input
    validateUserRegistration(req.body);

    // Check if user exists
    const existingUser = await query(
        'SELECT id FROM users WHERE email = $1',
        [email.toLowerCase()]
    );

    if (existingUser.rows.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'User with this email already exists'
        });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user
    const result = await query(
        `INSERT INTO users (email, password_hash, role)
     VALUES ($1, $2, $3)
     RETURNING id, email, role, created_at`,
        [email.toLowerCase(), passwordHash, role]
    );

    const user = result.rows[0];
    const token = generateToken(user.id, user.role);

    res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                created_at: user.created_at
            },
            token
        }
    });
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: 'Please provide email and password'
        });
    }

    // Find user
    const result = await query(
        'SELECT id, email, password_hash, role FROM users WHERE email = $1',
        [email.toLowerCase()]
    );

    if (result.rows.length === 0) {
        return res.status(401).json({
            success: false,
            message: 'Invalid credentials'
        });
    }

    const user = result.rows[0];

    // Check password
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
        return res.status(401).json({
            success: false,
            message: 'Invalid credentials'
        });
    }

    const token = generateToken(user.id, user.role);

    // Get agent info if user is an agent
    let agent = null;
    if (user.role === 'agent') {
        const agentResult = await query(
            'SELECT id, first_name, last_name, photo_url FROM agents WHERE user_id = $1',
            [user.id]
        );
        if (agentResult.rows.length > 0) {
            agent = agentResult.rows[0];
        }
    }

    res.json({
        success: true,
        message: 'Login successful',
        data: {
            user: {
                id: user.id,
                email: user.email,
                role: user.role
            },
            agent,
            token
        }
    });
});

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
export const getMe = asyncHandler(async (req, res) => {
    const result = await query(
        'SELECT id, email, role, created_at, updated_at FROM users WHERE id = $1',
        [req.user.id]
    );

    const user = result.rows[0];

    // Get agent info if user is an agent
    let agent = null;
    if (user.role === 'agent') {
        const agentResult = await query(
            `SELECT id, first_name, last_name, phone, license_number, 
              commission_rate, territory, hire_date, status, photo_url, bio
       FROM agents WHERE user_id = $1`,
            [user.id]
        );
        if (agentResult.rows.length > 0) {
            agent = agentResult.rows[0];
        }
    }

    res.json({
        success: true,
        data: {
            user,
            agent
        }
    });
});

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
export const changePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        return res.status(400).json({
            success: false,
            message: 'Please provide current and new password'
        });
    }

    // Get user with password
    const result = await query(
        'SELECT password_hash FROM users WHERE id = $1',
        [req.user.id]
    );

    const user = result.rows[0];

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);

    if (!isMatch) {
        return res.status(401).json({
            success: false,
            message: 'Current password is incorrect'
        });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    // Update password
    await query(
        'UPDATE users SET password_hash = $1 WHERE id = $2',
        [passwordHash, req.user.id]
    );

    res.json({
        success: true,
        message: 'Password changed successfully'
    });
});
