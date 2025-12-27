const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  serviceRequest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ServiceRequest',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'senderModel'
  },
  senderModel: {
    type: String,
    required: true,
    enum: ['User', 'Worker']
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'receiverModel'
  },
  receiverModel: {
    type: String,
    required: true,
    enum: ['User', 'Worker']
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  messageType: {
    type: String,
    enum: ['text', 'attachment', 'system'],
    default: 'text'
  },
  attachmentUrl: {
    type: String
  },
  attachmentName: {
    type: String
  },
  status: {
    type: String,
    enum: ['sent', 'delivered', 'read'],
    default: 'sent'
  },
  readAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for faster queries
messageSchema.index({ serviceRequest: 1, createdAt: -1 });
messageSchema.index({ sender: 1, receiver: 1 });

module.exports = mongoose.model('Message', messageSchema);
