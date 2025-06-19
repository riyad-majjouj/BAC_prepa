// controllers/userController.js
const User = require('../models/User');

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
    // req.user يتم تعيينه بواسطة middleware 'protect'
    const user = await User.findById(req.user._id).select('-password'); // استبعاد كلمة المرور

    if (user) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            track: user.track,
            // يمكنك إضافة أي حقول أخرى من نموذج المستخدم تريد إرجاعها
        });
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
            const allowedTracks = ['PC', 'SVT', 'SM', 'CONCOURS', 'غير محدد']; // أضفت 'غير محدد' إذا كانت قيمة ممكنة
            if(allowedTracks.includes(req.body.track)) {
                user.track = req.body.track;
            } else {
                return res.status(400).json({ message: 'Invalid track value' });
            }
        }
        // يمكنك إضافة تحديثات لحقول أخرى هنا إذا لزم الأمر

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            track: updatedUser.track,
        });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};


module.exports = {
    updateUserProfile,
    getUserProfile // <-- قم بتصدير الدالة الجديدة
};