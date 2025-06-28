// back-end/controllers/uploadController.js
const cloudinary = require('../config/cloudinaryConfig');
const asyncHandler = require('express-async-handler');

// @desc    Generate a signature for Cloudinary upload
// @route   GET /api/upload/signature
// @access  Private/Admin
const getUploadSignature = asyncHandler(async (req, res) => {
  // `timestamp` يجب أن يكون بالثواني
  const timestamp = Math.round((new Date()).getTime() / 1000);

  // استخدام دالة Cloudinary لتوليد التوقيع
  const signature = cloudinary.utils.api_sign_request(
    {
      timestamp: timestamp,
      // يمكنك إضافة مجلد معين للرفع إليه في Cloudinary
      // folder: 'devoir_images' 
    },
    process.env.CLOUDINARY_API_SECRET
  );

  res.status(200).json({
    timestamp,
    signature,
    apiKey: process.env.CLOUDINARY_API_KEY,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME
  });
});

module.exports = {
  getUploadSignature,
};