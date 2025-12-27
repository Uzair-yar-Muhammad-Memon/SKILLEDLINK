const mongoose = require('mongoose');

const serviceRequestSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  worker: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Worker',
    required: true
  },
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service'
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  budget: {
    type: Number
  },
  urgency: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'in-progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  scheduledDate: {
    type: Date
  },
  completedDate: {
    type: Date
  },
  workerNotes: {
    type: String
  },
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  review: {
    type: String
  }
}, {
  timestamps: true
});

// Index for faster queries
serviceRequestSchema.index({ user: 1, status: 1 });
serviceRequestSchema.index({ worker: 1, status: 1 });
serviceRequestSchema.index({ createdAt: -1 });

module.exports = mongoose.model('ServiceRequest', serviceRequestSchema);
