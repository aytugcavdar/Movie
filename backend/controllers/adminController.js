
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Tüm kullanıcıları getir (Admin)
// @route   GET /api/v1/admin/users
// @access  Private/Admin
exports.getAllUsers = asyncHandler(async (req, res, next) => {
    // Gelişmiş sonuçlar middleware'ini burada doğrudan kullanmak yerine
    // basit bir listeleme yapıyoruz. İstenirse daha sonra eklenebilir.
    const users = await User.find({});
    res.status(200).json({
        success: true,
        count: users.length,
        data: users
    });
});

// @desc    Tek bir kullanıcıyı ID ile getir (Admin)
// @route   GET /api/v1/admin/users/:id
// @access  Private/Admin
exports.getUserById = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.params.id);
    if (!user) {
        return next(new ErrorResponse(`ID'si ${req.params.id} olan kullanıcı bulunamadı`, 404));
    }
    res.status(200).json({ success: true, data: user });
});

// @desc    Bir kullanıcının bilgilerini güncelle (Admin)
// @route   PUT /api/v1/admin/users/:id
// @access  Private/Admin
exports.updateUser = asyncHandler(async (req, res, next) => {
    // Adminin değiştirebileceği alanları belirliyoruz
    const { role, isActive } = req.body;
    const fieldsToUpdate = {};
    if (role) fieldsToUpdate.role = role;
    if (typeof isActive === 'boolean') fieldsToUpdate.isActive = isActive;

    const user = await User.findByIdAndUpdate(req.params.id, fieldsToUpdate, {
        new: true,
        runValidators: true
    });

    if (!user) {
        return next(new ErrorResponse(`ID'si ${req.params.id} olan kullanıcı bulunamadı`, 404));
    }

    res.status(200).json({ success: true, data: user, message: "Kullanıcı bilgileri güncellendi." });
});