// controllers/authController.js
const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    const { name, email, password, role, track } = req.body;

    try {
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({
            name,
            email,
            password,
            role: role === 'admin' ? 'admin' : 'user', // السماح بإنشاء admin مباشرة
            track: track || 'غير محدد', // قيمة افتراضية إذا لم يتم توفيرها
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                track: user.track,
                token: generateToken(user._id),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Auth user & get token (Login)
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                track: user.track,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Handle Google OAuth callback
// @route   GET /api/auth/google/callback
// @access  Public
const googleCallback = (req, res) => {
    // يتم إنشاء التوكن وإرساله إلى الواجهة الأمامية عبر إعادة التوجيه
    const token = generateToken(req.user._id);
    res.redirect(`${process.env.CLIENT_URL}/auth?token=${token}`);
};


module.exports = { registerUser, loginUser, googleCallback };