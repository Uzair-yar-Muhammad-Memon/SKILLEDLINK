const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  workerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Worker'
  },
  message: {
    type: String,
    required: true
  },
  isRead: {
    type: Boolean,
    default: false
  },
  type: {
    type: String,
    enum: ['job_accepted', 'job_completed', 'new_review', 'new_job'],
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Notification', notificationSchema);
