// middlewares/admin.middleware.js
const isAdmin = (req, res, next) => {
    // يجب أن يعمل هذا الميدلوير بعد ميدلوير "protect"
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'الوصول محظور. هذه الوظيفة للمدراء فقط.' });
    }
};

module.exports = { isAdmin };