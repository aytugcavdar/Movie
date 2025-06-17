const express = require('express');
const {
    register,
    login,
    logout,
    getMe,
    updateDetails,
    updatePassword,
    forgotPassword,
    resetPassword,
    verifyEmail,
    resendEmailVerification,


} = require('../controllers/authController');
const router = express.Router();

const { protect } = require('../middlewares/authMiddeleware');

router.post('/register', register);
router.post('/login', login);
router.get('/logout', logout);
router.get('/me', protect, getMe);
router.put('/me/update', protect, updateDetails);
router.put('/me/update-password', protect, updatePassword);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:resetToken', resetPassword);
router.get('/verify-email/:token', verifyEmail);
router.post('/resend-email-verification', resendEmailVerification);

module.exports = router;