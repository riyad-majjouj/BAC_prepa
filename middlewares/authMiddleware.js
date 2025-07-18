const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to protect routes
const protect = async (req, res, next) => {
    // --- [DIAGNOSTIC LOG] هذا هو السطر الأهم للتشخيص ---
    // سيُظهر لنا بالضبط ما الذي يستلمه الخادم في رأس الطلب
    console.log('--- PROTECT MIDDLEWARE CALLED ---');
    console.log('Authorization Header Received:', req.headers.authorization);
    // --- نهاية سطر التشخيص ---

    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Get user from the token (and exclude password)
            req.user = await User.findById(decoded.id).select('-password');
            
            if (!req.user) {
                // هذا يضمن عدم وجود مستخدم محذوف يحاول الوصول
                return res.status(401).json({ message: 'Not authorized, user not found' });
            }

            console.log(`[AUTH] User authenticated successfully: ${req.user.email}`);
            next(); // السماح للطلب بالمرور إذا كان كل شيء صحيحًا
        } catch (error) {
            console.error('[AUTH ERROR] Token verification failed:', error.message);
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    } else {
        // إذا لم يكن هناك header أو لم يبدأ بـ 'Bearer'
        console.warn('[AUTH WARN] No token found in headers or incorrect format.');
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
};

// Middleware to check for admin role
const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized as an admin' });
    }
};

module.exports = { protect, admin };