
const User = require('../models/User');
const Review = require('../models/Review');
const Watchlist = require('../models/Watchlist');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../utils/asyncHandler');
const Notification = require('../models/Notification');

// @desc    Bir kullanıcının herkese açık profilini getir
// @route   GET /api/v1/users/:username
// @access  Public
exports.getUserProfile = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ username: req.params.username });

  if (!user) {
    return next(new ErrorResponse(`Kullanıcı bulunamadı: ${req.params.username}`, 404));
  }

  // Kullanıcının herkese açık yorumlarını ve izleme listelerini ayrı ayrı ve güvenli bir şekilde getir
  const reviews = await Review.find({ user: user._id, isPublished: true, moderationStatus: 'approved' })
    .populate('movie', 'title posterPath releaseDate') // 'year' yerine 'releaseDate' kullanıyoruz
    .sort({ createdAt: -1 })
    .limit(10)
    .lean(); // Daha hızlı ve daha basit bir sonuç için .lean() kullanıyoruz

  const watchlists = await Watchlist.find({ user: user._id, isPublic: true })
    .populate({
        path: 'movies.movie',
        select: 'title posterPath'
    })
    .sort({ createdAt: -1 })
    .limit(5)
    .lean(); // .lean() kullanıyoruz

  res.status(200).json({
    success: true,
    data: {
      user,
      reviews: reviews || [], // Eğer null dönerse boş bir dizi ata
      watchlists: watchlists || [] // Eğer null dönerse boş bir dizi ata
    }
  });
});

// @desc    Bir kullanıcıyı takip et/takipten çık
// @route   PUT /api/v1/users/:id/follow
// @access  Private
exports.followUser = asyncHandler(async (req, res, next) => {
    const userToFollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user.id);

    if (!userToFollow || !currentUser) {
        return next(new ErrorResponse('Kullanıcı bulunamadı', 404));
    }

    if (userToFollow.id.toString() === currentUser.id.toString()) {
        return next(new ErrorResponse('Kendinizi takip edemezsiniz', 400));
    }

    const isFollowing = currentUser.following.some(id => id.toString() === userToFollow.id.toString());

    if (isFollowing) {
       
        currentUser.following.pull(userToFollow.id);
        userToFollow.followers.pull(currentUser.id);

    } else {
       
        currentUser.following.push(userToFollow.id);
        userToFollow.followers.push(currentUser.id);
    }
    await Notification.create({
            user: userToFollow._id,
            sender: currentUser._id,
            type: 'new_follower',
            message: `${currentUser.username} sizi takip etmeye başladı.`,
            link: `/users/${currentUser.username}`
        });
    
    currentUser.followingCount = currentUser.following.length;
    userToFollow.followersCount = userToFollow.followers.length;


    await currentUser.save();
    await userToFollow.save();

    res.status(200).json({ 
        success: true, 
        data: { 
            isFollowing: !isFollowing,
            followersCount: userToFollow.followersCount
        }, 
        message: isFollowing ? 'Takipten çıkıldı.' : 'Takip edildi.'
    });
});