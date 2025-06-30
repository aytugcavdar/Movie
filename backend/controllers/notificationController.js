
const Notification = require('../models/Notification');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Kullanıcının tüm bildirimlerini getir
// @route   GET /api/v1/notifications
// @access  Private
exports.getNotifications = asyncHandler(async (req, res, next) => {
    const notifications = await Notification.find({ user: req.user.id })
        .populate('sender', 'username avatar')
        .sort('-createdAt')
        .limit(30); // Son 30 bildirimi getir

    res.status(200).json({
        success: true,
        count: notifications.length,
        data: notifications
    });
});

// @desc    Tüm bildirimleri okundu olarak işaretle
// @route   PUT /api/v1/notifications/mark-all-read
// @access  Private
exports.markAllAsRead = asyncHandler(async (req, res, next) => {
    await Notification.updateMany({ user: req.user.id, isRead: false }, { isRead: true });

    res.status(200).json({
        success: true,
        data: {}
    });
});