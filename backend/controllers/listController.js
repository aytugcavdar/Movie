
const List = require('../models/List');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../utils/asyncHandler');

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

    // Modelde tanımladığımız toggleLike metodunu kullanıyoruz
    const isLiked = await list.toggleLike(req.user.id);
    
    const message = isLiked ? 'Liste beğenildi.' : 'Liste beğenmekten vazgeçildi.';

    res.status(200).json({
        success: true,
        data: {
            likesCount: list.likesCount
        },
        message
    });
});
// @desc    Bir listeyi beğen/beğenmekten vazgeç
// @route   PUT /api/v1/lists/:id/like
// @access  Private
exports.likeList = asyncHandler(async (req, res, next) => {
    const list = await List.findById(req.params.id);

    if (!list) {
        return next(new ErrorResponse(`ID'si ${req.params.id} olan liste bulunamadı`, 404));
    }

    // Modelde tanımladığımız toggleLike metodunu kullanıyoruz
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