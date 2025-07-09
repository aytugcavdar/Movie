const List = require('../models/List');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../utils/asyncHandler');
const Notification = require('../models/Notification');
const User = require('../models/User');

// @desc    Kullanıcının tüm özel listelerini getir
// @route   GET /api/v1/lists
// @access  Private
exports.getLists = asyncHandler(async (req, res, next) => {
    const lists = await List.find({ user: req.user.id }).populate('movies.movie', 'title posterPath');
    res.status(200).json({
        success: true,
        count: lists.length,
        data: lists
    });
});

// @desc    Tek bir listeyi ID ile getir
// @route   GET /api/v1/lists/:id
// @access  Public (eğer liste herkese açıksa)
exports.getList = asyncHandler(async (req, res, next) => {
    const list = await List.findById(req.params.id).populate('movies.movie', 'title posterPath year runtime');

    if (!list) {
        return next(new ErrorResponse(`ID'si ${req.params.id} olan liste bulunamadı`, 404));
    }

    // Liste gizliyse ve sahibi değilse erişimi engelle
    if (!list.isPublic && (!req.user || list.user.toString() !== req.user.id.toString())) {
        return next(new ErrorResponse('Bu listeyi görüntüleme yetkiniz yok', 403));
    }

    res.status(200).json({
        success: true,
        data: list
    });
});

// @desc    Yeni bir özel liste oluştur
// @route   POST /api/v1/lists
// @access  Private
exports.createList = asyncHandler(async (req, res, next) => {
    req.body.user = req.user.id;
    const { title, description, isPublic } = req.body;
    const list = await List.create({ title, description, isPublic, user: req.user.id });
    res.status(201).json({ success: true, data: list });
});

// @desc    Listeye film ekle
// @route   POST /api/v1/lists/:id/movies
// @access  Private
exports.addMovieToList = asyncHandler(async (req, res, next) => {
    const list = await List.findById(req.params.id);
    if (!list) {
        return next(new ErrorResponse('Liste bulunamadı', 404));
    }
    if (list.user.toString() !== req.user.id) {
        return next(new ErrorResponse('Bu listeye film ekleme yetkiniz yok', 403));
    }
    
    // Modeldeki metodumuzu kullanalım
    await list.addMovie(req.body.movieId, list.movies.length + 1); // Sıralama için basit bir mantık

    res.status(200).json({ success: true, data: list });
});

// @desc    Listeden film sil
// @route   DELETE /api/v1/lists/:id/movies/:movieId
// @access  Private
exports.removeMovieFromList = asyncHandler(async (req, res, next) => {
    const list = await List.findById(req.params.id);
    if (!list) {
        return next(new ErrorResponse('Liste bulunamadı', 404));
    }
    if (list.user.toString() !== req.user.id) {
        return next(new ErrorResponse('Bu listeden film silme yetkiniz yok', 403));
    }

    // Modeldeki metodumuzu kullanalım
    await list.removeMovie(req.params.movieId);

    res.status(200).json({ success: true, data: list });
});

// @desc    Listeyi sil
// @route   DELETE /api/v1/lists/:id
// @access  Private
exports.deleteList = asyncHandler(async (req, res, next) => {
    const list = await List.findById(req.params.id);

    if (!list) {
        return next(new ErrorResponse('Liste bulunamadı', 404));
    }

    if (list.user.toString() !== req.user.id.toString()) {
        return next(new ErrorResponse('Bu listeyi silme yetkiniz yok', 403));
    }

    await list.deleteOne();

    res.status(200).json({ success: true, data: {} });
});
// @desc    Bir listeyi beğen/beğenmekten vazgeç
// @route   PUT /api/v1/lists/:id/like
// @access  Private
exports.likeList = asyncHandler(async (req, res, next) => {
    const list = await List.findById(req.params.id);

    if (!list) {
        return next(new ErrorResponse(`ID'si ${req.params.id} olan liste bulunamadı`, 404));
    }

    
    const isLiked = await list.toggleLike(req.user.id);
    
    const message = isLiked ? 'Liste beğenildi.' : 'Liste beğenmekten vazgeçildi.';

    if (isLiked && list.user.toString() !== req.user.id.toString()) {
       const notification = await Notification.create({
            user: list.user,
            sender: req.user.id,
            type: 'list_like',
            message: `${req.user.username}, "${list.title}" adlı listenizi beğendi.`,
            link: `/lists/${list._id}`
        });

        
        const io = req.app.get('socketio');
        io.to(list.user.toString()).emit('newNotification', notification);
    }

    res.status(200).json({
        success: true,
        data: {
            likesCount: list.likesCount
        },
        message
    });
});
// @desc    Listeyi güncelle
// @route   PUT /api/v1/lists/:id
// @access  Private
exports.updateList = asyncHandler(async (req, res, next) => {
    let list = await List.findById(req.params.id);

    if (!list) {
        return next(new ErrorResponse('Liste bulunamadı', 404));
    }

    if (list.user.toString() !== req.user.id) {
        return next(new ErrorResponse('Bu listeyi güncelleme yetkiniz yok', 403));
    }

    const fieldsToUpdate = {
        title: req.body.title || list.title,
        description: req.body.description || list.description,
        isPublic: typeof req.body.isPublic === 'boolean' ? req.body.isPublic : list.isPublic,
    };

    list = await List.findByIdAndUpdate(req.params.id, fieldsToUpdate, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        success: true,
        data: list
    });
});

// @desc    Bir listeyi raporla
// @route   POST /api/v1/lists/:id/report
// @access  Private
exports.reportList = asyncHandler(async (req, res, next) => {
    const list = await List.findById(req.params.id);

    if (!list) {
        return next(new ErrorResponse(`ID'si ${req.params.id} olan liste bulunamadı`, 404));
    }

    // Kullanıcının kendi listesini raporlamasını engelle
    if (list.user.toString() === req.user.id.toString()) {
        return next(new ErrorResponse('Kendi listenizi raporlayamazsınız', 400));
    }

    // Zaten raporlanmışsa ve moderasyon bekliyorsa tekrar raporlamayı engelle
    if (list.isReported && list.moderationStatus === 'pending') {
        return next(new ErrorResponse('Bu liste zaten raporlanmış ve moderasyon bekliyor', 400));
    }

    list.isReported = true;
    list.reportCount = (list.reportCount || 0) + 1;
    list.moderationStatus = 'pending'; // Raporlandığında durumu 'pending' yap

    await list.save({ validateBeforeSave: false });

    res.status(200).json({
        success: true,
        message: 'Liste başarıyla raporlandı ve moderasyon için gönderildi.'
    });
});
// @desc    Bir listeye yorum ekle
// @route   POST /api/v1/lists/:id/comments
// @access  Private
exports.addCommentToList = asyncHandler(async (req, res, next) => {
    const list = await List.findById(req.params.id).populate('user'); // user populate edildi

    if (!list) {
        return next(new ErrorResponse('Liste bulunamadı', 404));
    }

    const { content } = req.body;
    if (!content) {
        return next(new ErrorResponse('Yorum içeriği boş olamaz', 400));
    }

    const comment = {
        user: req.user.id,
        content: content,
        createdAt: new Date()
    };

    list.comments.push(comment);
    list.commentsCount = list.comments.length;
    await list.save();

    // Yorumu yapan kişi, liste sahibi değilse bildirim gönder
    if (list.user._id.toString() !== req.user.id.toString()) {
        const notification = await Notification.create({
            user: list.user._id,
            sender: req.user.id,
            type: 'comment_on_list',
            message: `${req.user.username}, "${list.title}" adlı listenize yorum yaptı.`,
            link: `/lists/${list._id}`
        });
        const io = req.app.get('socketio');
        io.to(list.user._id.toString()).emit('newNotification', notification);
    }

    // Mention (@) ile etiketlenen kullanıcılara bildirim gönder
    const mentions = content.match(/@(\w+)/g);
    if (mentions) {
        const mentionedUsernames = mentions.map(mention => mention.substring(1));
        const mentionedUsers = await User.find({ username: { $in: mentionedUsernames } });

        for (const mentionedUser of mentionedUsers) {
            // Kullanıcı kendine mention atarsa veya liste sahibine zaten bildirim gittiyse tekrar gönderme
            if (mentionedUser._id.toString() !== req.user.id.toString() && mentionedUser._id.toString() !== list.user._id.toString()) {
                const mentionNotification = await Notification.create({
                    user: mentionedUser._id,
                    sender: req.user.id,
                    type: 'mention_in_list_comment',
                    message: `${req.user.username}, "${list.title}" listesindeki bir yorumda sizden bahsetti.`,
                    link: `/lists/${list._id}`
                });
                const io = req.app.get('socketio');
                io.to(mentionedUser._id.toString()).emit('newNotification', mentionNotification);
            }
        }
    }

    // Yorumu ve yorum yapan kullanıcıyı populate ederek geri döndür
    const populatedList = await list.populate({
        path: 'comments.user',
        select: 'username avatar'
    });

    res.status(201).json({
        success: true,
        data: populatedList
    });
});