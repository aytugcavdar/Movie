
const Notification = require('../models/Notification');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Kullanıcının tüm bildirimlerini getir
// @route   GET /api/v1/notifications
// @access  Private
exports.getNotifications = asyncHandler(async (req, res, next) => {
    const notifications = await Notification.find({ user: req.user.id })
        .populate('sender', 'username avatar')
        .sort('-createdAt')
        .limit(30); 

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
// @desc    Bir incelemeye yorum ekle
// @route   POST /api/v1/reviews/:id/comments
// @access  Private
exports.addCommentToReview = asyncHandler(async (req, res, next) => {
    const review = await Review.findById(req.params.id).populate('user', 'username avatar'); 

    if (!review) {
        return next(new ErrorResponse(`ID'si ${req.params.id} olan inceleme bulunamadı`, 404));
    }

    const { content } = req.body;
    if (!content) {
        return next(new ErrorResponse(`Yorum içeriği boş olamaz`, 400));
    }

    const newComment = await review.addComment(req.user.id, content); 

  
    if (review.user._id.toString() !== req.user.id.toString()) {
        const notification = await Notification.create({
            user: review.user._id, 
            sender: req.user.id, 
            type: 'comment_on_review',
            message: `${req.user.username} yorumunuza yanıt verdi: "${content.substring(0, 50)}..."`,
            link: `/movies/${review.movie._id}` 
        });

        // Socket.IO ile bildirim gönder
        const io = req.app.get('socketio');
        io.to(review.user._id.toString()).emit('newNotification', notification);
    }

    res.status(201).json({
        success: true,
        data: newComment
    });
});