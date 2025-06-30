
const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  
  sender: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  // Bildirim türü
  type: {
    type: String,
    enum: ['new_follower', 'list_like', 'comment_on_review'],
    required: true
  },
 
  message: {
    type: String,
    required: true
  },
  
  link: {
    type: String,
    required: true
  },
  
  isRead: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});


NotificationSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', NotificationSchema);