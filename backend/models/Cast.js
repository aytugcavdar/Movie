const mongoose = require('mongoose');

const CastSchema = new mongoose.Schema({
  movie: {
    type: mongoose.Schema.ObjectId,
    ref: 'Movie',
    required: true
  },
  person: {
    type: mongoose.Schema.ObjectId,
    ref: 'Person',
    required: true
  },
  character: {
    type: String,
    required: [true, 'Karakter adı gereklidir'],
    trim: true
  },
  order: {
    type: Number,
    required: true,
    min: [0, 'Sıralama negatif olamaz']
  },
  // TMDB cast ID'si
  castId: {
    type: Number
  },
  creditId: {
    type: String
  }
}, {
  timestamps: true
});

// İndeksler
CastSchema.index({ movie: 1, order: 1 });
CastSchema.index({ person: 1 });
CastSchema.index({ movie: 1, person: 1 }, { unique: true });

module.exports = mongoose.model('Cast', CastSchema);
