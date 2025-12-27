const Message = require('../models/Message');
const ServiceRequest = require('../models/ServiceRequest');
const Notification = require('../models/Notification');
const User = require('../models/User');
const Worker = require('../models/Worker');
const { getIO } = require('../socket');

// Send a message
exports.sendMessage = async (req, res) => {
  try {
    const { serviceRequestId, content, attachmentUrl, attachmentName } = req.body;
    
    // Verify service request exists
    const serviceRequest = await ServiceRequest.findById(serviceRequestId);
    if (!serviceRequest) {
      return res.status(404).json({ success: false, message: 'Service request not found' });
    }

    // Check if request allows messaging (in-progress or completed)
    if (serviceRequest.status === 'pending' || serviceRequest.status === 'rejected' || serviceRequest.status === 'cancelled') {
      return res.status(403).json({ 
        success: false, 
        message: 'Messaging is only available for in-progress or completed requests' 
      });
    }

    // Determine sender and receiver
    let sender, senderModel, receiver, receiverModel;
    
    if (req.user) {
      // User is sending
      sender = req.user._id;
      senderModel = 'User';
      receiver = serviceRequest.worker;
      receiverModel = 'Worker';
      
      // Verify user is part of this request
      if (serviceRequest.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }
    } else if (req.worker) {
      // Worker is sending
      sender = req.worker._id;
      senderModel = 'Worker';
      receiver = serviceRequest.user;
      receiverModel = 'User';
      
      // Verify worker is part of this request
      if (serviceRequest.worker.toString() !== req.worker._id.toString()) {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }
    } else {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const message = await Message.create({
      serviceRequest: serviceRequestId,
      sender,
      senderModel,
      receiver,
      receiverModel,
      content,
      messageType: attachmentUrl ? 'attachment' : 'text',
      attachmentUrl,
      attachmentName,
      status: 'sent'
    });

    await message.populate('sender', 'name email profileImage');

    // Get sender name
    let senderName = 'Someone';
    if (senderModel === 'User') {
      const senderUser = await User.findById(sender).select('name');
      senderName = senderUser?.name || 'A user';
    } else {
      const senderWorker = await Worker.findById(sender).select('name');
      senderName = senderWorker?.name || 'A worker';
    }

    // Create notification in database
    const notificationData = {
      message: `${senderName} sent you a message`,
      type: 'message',
      isRead: false
    };

    if (receiverModel === 'User') {
      notificationData.userId = receiver;
    } else {
      notificationData.workerId = receiver;
    }

    const notification = await Notification.create(notificationData);

    // Emit real-time message and notification to receiver
    const io = getIO();
    const receiverRoom = receiverModel === 'User' ? `user_${receiver}` : `worker_${receiver}`;
    
    // Emit message event
    io.to(receiverRoom).emit('newMessage', {
      message,
      serviceRequestId,
      senderName
    });
    
    // Emit notification event
    io.to(receiverRoom).emit('notification', {
      _id: notification._id,
      message: notification.message,
      type: notification.type,
      isRead: notification.isRead,
      createdAt: notification.createdAt
    });

    // Mark message as delivered immediately if receiver is online
    // (This would be tracked by socket connections)
    
    res.status(201).json({
      success: true,
      message: 'Message sent',
      data: message
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ success: false, message: 'Failed to send message', error: error.message });
  }
};

// Get messages for a service request
exports.getMessages = async (req, res) => {
  try {
    const { serviceRequestId } = req.params;
    
    const serviceRequest = await ServiceRequest.findById(serviceRequestId);
    if (!serviceRequest) {
      return res.status(404).json({ success: false, message: 'Service request not found' });
    }

    // Verify user has access
    let hasAccess = false;
    if (req.user && serviceRequest.user.toString() === req.user._id.toString()) {
      hasAccess = true;
    } else if (req.worker && serviceRequest.worker.toString() === req.worker._id.toString()) {
      hasAccess = true;
    }

    if (!hasAccess) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const messages = await Message.find({ serviceRequest: serviceRequestId })
      .populate('sender', 'name email profileImage')
      .sort({ createdAt: 1 });

    res.json({
      success: true,
      data: messages
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch messages', error: error.message });
  }
};

// Mark messages as read
exports.markAsRead = async (req, res) => {
  try {
    const { serviceRequestId } = req.params;
    
    const serviceRequest = await ServiceRequest.findById(serviceRequestId);
    if (!serviceRequest) {
      return res.status(404).json({ success: false, message: 'Service request not found' });
    }

    // Determine who is reading (user or worker)
    let receiver;
    if (req.user) {
      receiver = req.user._id;
    } else if (req.worker) {
      receiver = req.worker._id;
    } else {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    // Mark all unread messages as read
    const result = await Message.updateMany(
      {
        serviceRequest: serviceRequestId,
        receiver,
        status: { $ne: 'read' }
      },
      {
        status: 'read',
        readAt: new Date()
      }
    );

    // Emit real-time update to sender
    const io = getIO();
    const senderRoom = req.user ? `worker_${serviceRequest.worker}` : `user_${serviceRequest.user}`;
    
    io.to(senderRoom).emit('messagesRead', {
      serviceRequestId,
      readBy: receiver
    });

    res.json({
      success: true,
      message: 'Messages marked as read',
      data: { modifiedCount: result.modifiedCount }
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ success: false, message: 'Failed to mark as read', error: error.message });
  }
};

// Get conversations list (all service requests with messages)
exports.getConversations = async (req, res) => {
  try {
    let query;
    
    if (req.user) {
      query = { user: req.user._id, status: { $in: ['accepted', 'in-progress', 'completed'] } };
    } else if (req.worker) {
      query = { worker: req.worker._id, status: { $in: ['accepted', 'in-progress', 'completed'] } };
    } else {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const conversations = await ServiceRequest.find(query)
      .populate('user', 'name email profileImage')
      .populate('worker', 'name email profileImage')
      .sort({ updatedAt: -1 });

    // Get last message and unread count for each conversation
    const conversationsWithMessages = await Promise.all(
      conversations.map(async (conv) => {
        const lastMessage = await Message.findOne({ serviceRequest: conv._id })
          .sort({ createdAt: -1 })
          .populate('sender', 'name');

        const unreadCount = await Message.countDocuments({
          serviceRequest: conv._id,
          receiver: req.user?._id || req.worker?._id,
          status: { $ne: 'read' }
        });

        return {
          ...conv.toObject(),
          lastMessage,
          unreadCount
        };
      })
    );

    res.json({
      success: true,
      data: conversationsWithMessages
    });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch conversations', error: error.message });
  }
};

// Get unread message count
exports.getUnreadCount = async (req, res) => {
  try {
    let receiver;
    if (req.user) {
      receiver = req.user._id;
    } else if (req.worker) {
      receiver = req.worker._id;
    } else {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const unreadCount = await Message.countDocuments({
      receiver,
      status: { $ne: 'read' }
    });

    res.json({
      success: true,
      data: { unreadCount }
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ success: false, message: 'Failed to get unread count', error: error.message });
  }
};
