const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  workerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Worker',
    default: null
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: false
  },
  title: {
    type: String,
    required: [true, 'Title is required']
  },
  skill: {
    type: String,
    required: [true, 'Skill category is required']
  },
  city: {
    type: String,
    required: [true, 'City is required']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    minlength: 10
  },
  budgetMin: {
    type: Number,
    default: 0,
    min: 0
  },
  budgetMax: {
    type: Number,
    default: 0,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'in-progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  address: {
    type: String
  },
  completedAt: {
    type: Date
  },
  cancelledAt: {
    type: Date
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Service', serviceSchema);
