// controllers/authController.js
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../utils/asyncHandler');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');
const cloudinary = require("cloudinary").v2;

// @desc    Kullanıcı kaydı
// @route   POST /api/v1/auth/register
// @access  Public
exports.register = asyncHandler(async (req, res, next) => {
  const { username, email, password, firstName, lastName } = req.body;

  const avatar = await cloudinary.uploader.upload(req.body.avatar, {
            folder: "avatars",
            width: 100,
            crop: "scale",
        });

  // Kullanıcıyı oluştur
  const user = await User.create({
    username,
    email,
    password,
    firstName,
    lastName,
    avatar: {
      public_id: avatar.public_id,
      url: avatar.secure_url
    }
  });

  // E-posta doğrulama token'ı oluştur
  const emailVerificationToken = user.getEmailVerificationToken();
  await user.save({ validateBeforeSave: false });

  // E-posta doğrulama linkini oluştur
  const verificationUrl = `${req.protocol}://${process.env.CLIENT_URL}/verify-email/${emailVerificationToken}`;

  const message = `
    Merhaba ${user.firstName},
    
    Hesabınızı doğrulamak için aşağıdaki linke tıklayın:
    ${verificationUrl}
    
    Bu link 24 saat geçerlidir.
  `;

  try {
    await sendEmail({
      email: user.email,
      subject: 'E-posta Doğrulama',
      message
    });

    sendTokenResponse(user, 201, res, 'Kayıt başarılı! E-posta doğrulama linki gönderildi.');
  } catch (err) {
    console.error('E-posta gönderme hatası:', err);
    user.emailVerificationToken = undefined;
    await user.save({ validateBeforeSave: false });

    sendTokenResponse(user, 201, res, 'Kayıt başarılı! Ancak e-posta gönderilemedi.');
  }
});

// @desc    Kullanıcı girişi
// @route   POST /api/v1/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // E-posta ve şifre kontrolü
  if (!email || !password) {
    return next(new ErrorResponse('E-posta ve şifre gereklidir', 400));
  }

  // Kullanıcıyı bul (şifre dahil)
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return next(new ErrorResponse('Geçersiz e-posta veya şifre', 401));
  }

  // Şifre kontrolü
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return next(new ErrorResponse('Geçersiz e-posta veya şifre', 401));
  }

  // Aktif kullanıcı kontrolü
  if (!user.isActive) {
    return next(new ErrorResponse('Hesabınız devre dışı bırakılmış', 401));
  }

  // Son giriş tarihini güncelle
  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  sendTokenResponse(user, 200, res, 'Giriş başarılı');
});

// @desc    Çıkış yap
// @route   POST /api/v1/auth/logout
// @access  Private
exports.logout = asyncHandler(async (req, res, next) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json({
    success: true,
    message: 'Çıkış başarılı'
  });
});

// @desc    Mevcut kullanıcı bilgilerini getir
// @route   GET /api/v1/auth/me
// @access  Private
exports.getMe = asyncHandler(async (req, res, next) => {
  // req.user protect middleware'dan geliyor
  const user = await User.findById(req.user.id)
    .populate('reviewsCount')
    .populate('watchlistCount');

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Kullanıcı bilgilerini güncelle
// @route   PUT /api/v1/auth/me
// @access  Private
exports.updateDetails = asyncHandler(async (req, res, next) => {
  const fieldsToUpdate = {
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    username: req.body.username,
    bio: req.body.bio,
    favoriteGenres: req.body.favoriteGenres,
    socialLinks: req.body.socialLinks
  };

  // Undefined değerleri temizle
  Object.keys(fieldsToUpdate).forEach(key => {
    if (fieldsToUpdate[key] === undefined) {
      delete fieldsToUpdate[key];
    }
  });

  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: user,
    message: 'Profil bilgileri güncellendi'
  });
});

// @desc    Şifre değiştir
// @route   PUT /api/v1/auth/updatepassword
// @access  Private
exports.updatePassword = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password');

  // Mevcut şifreyi kontrol et
  if (!(await user.matchPassword(req.body.currentPassword))) {
    return next(new ErrorResponse('Mevcut şifre yanlış', 401));
  }

  user.password = req.body.newPassword;
  await user.save();

  sendTokenResponse(user, 200, res, 'Şifre başarıyla güncellendi');
});

// @desc    Şifre sıfırlama isteği
// @route   POST /api/v1/auth/forgotpassword
// @access  Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new ErrorResponse('Bu e-posta adresi ile kayıtlı kullanıcı bulunamadı', 404));
  }

  // Sıfırlama token'ı oluştur
  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  // Sıfırlama URL'i oluştur
  const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/auth/resetpassword/${resetToken}`;

  const message = `
    Merhaba ${user.firstName},
    
    Şifre sıfırlama talebiniz alındı. Yeni şifre oluşturmak için aşağıdaki linke tıklayın:
    ${resetUrl}
    
    Bu link 10 dakika geçerlidir.
    
    Eğer bu talebi siz yapmadıysanız, bu e-postayı görmezden gelebilirsiniz.
  `;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Şifre Sıfırlama',
      message
    });

    res.status(200).json({
      success: true,
      message: 'Şifre sıfırlama linki e-posta adresinize gönderildi'
    });
  } catch (err) {
    console.error('E-posta gönderme hatası:', err);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new ErrorResponse('E-posta gönderilemedi', 500));
  }
});

// @desc    Şifre sıfırla
// @route   PUT /api/v1/auth/resetpassword/:resettoken
// @access  Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
  // Token'ı hashle
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.resettoken)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() }
  });

  if (!user) {
    return next(new ErrorResponse('Geçersiz veya süresi dolmuş token', 400));
  }

  // Yeni şifreyi ayarla
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  sendTokenResponse(user, 200, res, 'Şifre başarıyla sıfırlandı');
});

// @desc    E-posta doğrula
// @route   GET /api/v1/auth/verify-email/:verifytoken
// @access  Public
exports.verifyEmail = asyncHandler(async (req, res, next) => {
  // Token'ı hashle
  const emailVerificationToken = crypto
    .createHash('sha256')
    .update(req.params.verifytoken)
    .digest('hex');

  const user = await User.findOne({
    emailVerificationToken
  });

  if (!user) {
    return next(new ErrorResponse('Geçersiz doğrulama token\'ı', 400));
  }

  // E-postayı doğrulanmış olarak işaretle
  user.emailVerified = true;
  user.emailVerificationToken = undefined;
  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    message: 'E-posta başarıyla doğrulandı'
  });
});

// @desc    E-posta doğrulama linkini yeniden gönder
// @route   POST /api/v1/auth/resend-verification
// @access  Private
exports.resendEmailVerification = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  if (user.emailVerified) {
    return next(new ErrorResponse('E-posta zaten doğrulanmış', 400));
  }

  // Yeni doğrulama token'ı oluştur
  const emailVerificationToken = user.getEmailVerificationToken();
  await user.save({ validateBeforeSave: false });

  // Doğrulama URL'i oluştur
  const verificationUrl = `${req.protocol}://${req.get('host')}/api/v1/auth/verify-email/${emailVerificationToken}`;

  const message = `
    Merhaba ${user.firstName},
    
    Hesabınızı doğrulamak için aşağıdaki linke tıklayın:
    ${verificationUrl}
    
    Bu link 24 saat geçerlidir.
  `;

  try {
    await sendEmail({
      email: user.email,
      subject: 'E-posta Doğrulama',
      message
    });

    res.status(200).json({
      success: true,
      message: 'E-posta doğrulama linki tekrar gönderildi'
    });
  } catch (err) {
    console.error('E-posta gönderme hatası:', err);
    user.emailVerificationToken = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new ErrorResponse('E-posta gönderilemedi', 500));
  }
});

// Token ile yanıt gönderme yardımcı fonksiyonu
const sendTokenResponse = (user, statusCode, res, message = '') => {
  // Token oluştur
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true
  };

  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      token,
      message,
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          fullName: user.fullName,
          avatar: user.avatar,
          role: user.role,
          emailVerified: user.emailVerified,
          isActive: user.isActive
        }
      }
    });
};