// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Kullanıcı adı gereklidir'],
    unique: true,
    trim: true,
    minlength: [3, 'Kullanıcı adı en az 3 karakter olmalıdır'],
    maxlength: [20, 'Kullanıcı adı en fazla 20 karakter olabilir']
  },
  email: {
    type: String,
    required: [true, 'E-posta adresi gereklidir'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Geçerli bir e-posta adresi giriniz'
    ]
  },
  password: {
    type: String,
    required: [true, 'Şifre gereklidir'],
    minlength: [6, 'Şifre en az 6 karakter olmalıdır'],
    select: false // Şifre varsayılan olarak sorgulamada gelmeyecek
  },
  firstName: {
    type: String,
    required: [true, 'Ad gereklidir'],
    trim: true,
    maxlength: [50, 'Ad en fazla 50 karakter olabilir']
  },
  lastName: {
    type: String,
    required: [true, 'Soyad gereklidir'],
    trim: true,
    maxlength: [50, 'Soyad en fazla 50 karakter olabilir']
  },
  bio: {
    type: String,
    maxlength: [500, 'Biyografi en fazla 500 karakter olabilir']
  },
  avatar: {
        public_id: {
            type: String,
            default: null
        },
        url: {
            type: String,
            default: null
        },
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  // Film tercihleri
  favoriteGenres: [{
    type: Number, // TMDB genre ID'leri
  }],
  // Sosyal medya linkleri
  socialLinks: {
    twitter: String,
    instagram: String,
    letterboxd: String
  },
  // Şifre sıfırlama
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  // E-posta doğrulama
  emailVerificationToken: String,
  emailVerified: {
    type: Boolean,
    default: false
  },
  // Takipçi/Takip sistemi
  followers: [{
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  }],
  following: [{
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  }],
  followersCount: {
    type: Number,
    default: 0
  },
  followingCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual alanlar
UserSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

UserSchema.virtual('reviewsCount', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'user',
  count: true
});

UserSchema.virtual('watchlistCount', {
  ref: 'Watchlist',
  localField: '_id',
  foreignField: 'user',
  count: true
});

// Şifre hashleme
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// JWT token oluşturma
UserSchema.methods.getSignedJwtToken = function() {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// Şifre karşılaştırma
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Şifre sıfırlama token'ı oluşturma
UserSchema.methods.getResetPasswordToken = function() {
  const resetToken = crypto.randomBytes(20).toString('hex');
  
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
    
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 dakika
  
  return resetToken;
};

// E-posta doğrulama token'ı oluşturma
UserSchema.methods.getEmailVerificationToken = function() {
  const verificationToken = crypto.randomBytes(20).toString('hex');
  
  this.emailVerificationToken = crypto
    .createHash('sha256')
    .update(verificationToken)
    .digest('hex');
    
  return verificationToken;
};

module.exports = mongoose.model('User', UserSchema);