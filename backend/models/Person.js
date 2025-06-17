const mongoose = require('mongoose');

const PersonSchema = new mongoose.Schema({
  // TMDB'den gelen veriler
  tmdbId: {
    type: Number,
    required: true,
    unique: true
  },
  imdbId: {
    type: String,
    index: true
  },
  name: {
    type: String,
    required: [true, 'Kişi adı gereklidir'],
    trim: true
  },
  biography: {
    type: String,
    maxlength: [5000, 'Biyografi en fazla 5000 karakter olabilir']
  },
  birthday: {
    type: Date
  },
  deathday: {
    type: Date
  },
  placeOfBirth: {
    type: String,
    trim: true
  },
  profilePath: {
    type: String
  },
  popularity: {
    type: Number,
    min: [0, 'Popülerlik negatif olamaz']
  },
  knownForDepartment: {
    type: String,
    enum: ['Acting', 'Directing', 'Production', 'Writing', 'Camera', 'Art', 'Sound', 'Editing', 'Costume & Make-Up', 'Visual Effects', 'Crew']
  },
  gender: {
    type: Number,
    enum: [0, 1, 2, 3], // 0: Not specified, 1: Female, 2: Male, 3: Non-binary
    default: 0
  },
  adult: {
    type: Boolean,
    default: false
  },
  // Alternatif isimler
  alsoKnownAs: [String],
  // Platform verileri
  isActive: {
    type: Boolean,
    default: true
  },
  // TMDB'den son güncelleme
  lastTmdbUpdate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// İndeksler
PersonSchema.index({ tmdbId: 1 });
PersonSchema.index({ name: 'text', biography: 'text' });
PersonSchema.index({ knownForDepartment: 1 });
PersonSchema.index({ popularity: -1 });

// Virtual alanlar
PersonSchema.virtual('age').get(function() {
  if (!this.birthday) return null;
  
  const endDate = this.deathday || new Date();
  const age = Math.floor((endDate - this.birthday) / (365.25 * 24 * 60 * 60 * 1000));
  return age;
});

PersonSchema.virtual('fullProfileUrl').get(function() {
  if (this.profilePath) {
    return `https://image.tmdb.org/t/p/w500${this.profilePath}`;
  }
  return 'https://via.placeholder.com/500x750?text=No+Photo';
});

PersonSchema.virtual('genderText').get(function() {
  const genderMap = {
    0: 'Belirtilmemiş',
    1: 'Kadın',
    2: 'Erkek',
    3: 'Non-binary'
  };
  return genderMap[this.gender] || 'Belirtilmemiş';
});

module.exports = mongoose.model('Person', PersonSchema);