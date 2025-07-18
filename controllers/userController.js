const User = require('../models/User');

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
    // req.user يتم تعيينه بواسطة middleware 'protect'
    const user = await User.findById(req.user._id).select('-password');

    if (user) {
        // --- [FIX] إرسال كائن المستخدم بالكامل ---
        // الآن سيتم إرسال حقول 'subscription' و 'usage' المحدثة
        // إلى الواجهة الأمامية في كل مرة يتم فيها استدعاء هذا المسار.
        res.json(user); 
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};

// @desc    Update user profile (e.g., set track)
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        user.name = req.body.name || user.name;
        if (req.body.track) {
            const allowedTracks = ['PC', 'SVT', 'SM', 'CONCOURS', 'غير محدد'];
            if(allowedTracks.includes(req.body.track)) {
                user.track = req.body.track;
            } else {
                return res.status(400).json({ message: 'Invalid track value' });
            }
        }
        
        const updatedUser = await user.save();

        // --- [FIX] إرسال الكائن المحدث بالكامل هنا أيضًا ---
        const userResponse = updatedUser.toObject();
        delete userResponse.password; // التأكد من إزالة كلمة المرور
        res.json(userResponse);

    } else {
        res.status(404).json({ message: 'User not found' });
    }
};

module.exports = {
    updateUserProfile,
    getUserProfile
};