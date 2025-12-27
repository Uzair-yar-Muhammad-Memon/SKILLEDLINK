const ServiceRequest = require('../models/ServiceRequest');
const User = require('../models/User');
const Worker = require('../models/Worker');
const { getIO } = require('../socket');

// Create a new service request
exports.createRequest = async (req, res) => {
  try {
    const { workerId, title, description, category, location, budget, urgency, scheduledDate } = req.body;
    
    console.log('📝 Creating request from user:', req.user?._id);
    console.log('   Worker ID:', workerId);
    
    if (!req.user || !req.user._id) {
      return res.status(401).json({ success: false, message: 'User authentication failed' });
    }
    
    // Verify worker exists
    const worker = await Worker.findById(workerId);
    if (!worker) {
      return res.status(404).json({ success: false, message: 'Worker not found' });
    }

    const serviceRequest = await ServiceRequest.create({
      user: req.user._id,
      worker: workerId,
      title,
      description,
      category,
      location,
      budget,
      urgency,
      scheduledDate,
      status: 'pending'
    });

    await serviceRequest.populate('user', 'name email phone city');
    await serviceRequest.populate('worker', 'name email phone city skillCategory');

    console.log('✅ Request created successfully:', serviceRequest._id);

    // Emit real-time notification to worker
    const io = getIO();
    io.to(`worker_${workerId}`).emit('newServiceRequest', {
      request: serviceRequest,
      message: `New service request from ${req.user.name}`
    });
    
    // Emit dashboard update event to worker
    io.to(`worker_${workerId}`).emit('dashboardUpdate', {
      type: 'new_request',
      requestId: serviceRequest._id
    });

    res.status(201).json({
      success: true,
      message: 'Service request sent successfully',
      data: serviceRequest
    });
  } catch (error) {
    console.error('Create request error:', error);
    res.status(500).json({ success: false, message: 'Failed to create request', error: error.message });
  }
};

// Get all requests for a user
exports.getUserRequests = async (req, res) => {
  try {
    const { status } = req.query;
    const query = { user: req.user._id };
    
    if (status) {
      query.status = status;
    }

    const requests = await ServiceRequest.find(query)
      .populate('worker', 'name email phone city skillCategory rating profileImage')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: requests
    });
  } catch (error) {
    console.error('Get user requests error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch requests', error: error.message });
  }
};

// Get all requests for a worker
exports.getWorkerRequests = async (req, res) => {
  try {
    const { status } = req.query;
    const query = { worker: req.worker._id };
    
    if (status) {
      query.status = status;
    }

    const requests = await ServiceRequest.find(query)
      .populate('user', 'name email phone city')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: requests
    });
  } catch (error) {
    console.error('Get worker requests error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch requests', error: error.message });
  }
};

// Get single request by ID
exports.getRequestById = async (req, res) => {
  try {
    const request = await ServiceRequest.findById(req.params.id)
      .populate('user', 'name email phone city')
      .populate('worker', 'name email phone city skillCategory rating');

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    // Verify user has access to this request
    const isUser = request.user._id.toString() === req.user?._id?.toString();
    const isWorker = request.worker._id.toString() === req.worker?._id?.toString();
    
    if (!isUser && !isWorker) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    res.json({
      success: true,
      data: request
    });
  } catch (error) {
    console.error('Get request error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch request', error: error.message });
  }
};

// Worker accepts a request (status changes from pending to accepted, then in-progress)
exports.acceptRequest = async (req, res) => {
  try {
    const request = await ServiceRequest.findById(req.params.id)
      .populate('user', 'name email phone city')
      .populate('worker', 'name email phone city skillCategory');

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    // Verify this is the correct worker
    if (request.worker._id.toString() !== req.worker._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Request already processed' });
    }

    console.log(`✅ Worker ${req.worker.name} accepting request ${req.params.id}`);
    console.log(`   Status changing: pending → accepted → in-progress`);

    // First change to 'accepted', then immediately to 'in-progress'
    request.status = 'accepted';
    const { workerNotes } = req.body;
    if (workerNotes) {
      request.workerNotes = workerNotes;
    }
    
    await request.save();
    
    // Immediately move to in-progress
    request.status = 'in-progress';
    await request.save();

    // Re-populate after save to ensure fresh data
    await request.populate('user', 'name email phone city');
    await request.populate('worker', 'name email phone city skillCategory');

    console.log(`✅ Request ${req.params.id} now IN-PROGRESS`);
    console.log(`   Returning status: ${request.status}`);

    // Emit real-time notification to user
    const io = getIO();
    io.to(`user_${request.user._id}`).emit('requestAccepted', {
      request,
      message: `${request.worker.name} accepted your service request and work is now in progress`
    });
    
    // Emit dashboard update events
    io.to(`user_${request.user._id}`).emit('dashboardUpdate', {
      type: 'request_accepted',
      requestId: request._id
    });
    io.to(`worker_${request.worker._id}`).emit('dashboardUpdate', {
      type: 'request_accepted',
      requestId: request._id
    });

    res.json({
      success: true,
      message: 'Request accepted and work is now in progress',
      data: request
    });
  } catch (error) {
    console.error('Accept request error:', error);
    res.status(500).json({ success: false, message: 'Failed to accept request', error: error.message });
  }
};

// Worker rejects a request
exports.rejectRequest = async (req, res) => {
  try {
    const request = await ServiceRequest.findById(req.params.id)
      .populate('user', 'name email')
      .populate('worker', 'name email');

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    // Verify this is the correct worker
    if (request.worker._id.toString() !== req.worker._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Request already processed' });
    }

    request.status = 'rejected';
    const { workerNotes } = req.body;
    if (workerNotes) {
      request.workerNotes = workerNotes;
    }
    
    await request.save();

    // Emit real-time notification to user
    const io = getIO();
    io.to(`user_${request.user._id}`).emit('requestRejected', {
      request,
      message: `${request.worker.name} declined your service request`
    });
    
    // Emit dashboard update events
    io.to(`user_${request.user._id}`).emit('dashboardUpdate', {
      type: 'request_rejected',
      requestId: request._id
    });
    io.to(`worker_${request.worker._id}`).emit('dashboardUpdate', {
      type: 'request_rejected',
      requestId: request._id
    });

    res.json({
      success: true,
      message: 'Request rejected',
      data: request
    });
  } catch (error) {
    console.error('Reject request error:', error);
    res.status(500).json({ success: false, message: 'Failed to reject request', error: error.message });
  }
};

// Mark request as completed (provider marks work as completed)
exports.completeRequest = async (req, res) => {
  try {
    const request = await ServiceRequest.findById(req.params.id)
      .populate('user', 'name email')
      .populate('worker', 'name email');

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    // Only worker can mark as completed
    if (request.worker._id.toString() !== req.worker._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    if (request.status !== 'in-progress') {
      return res.status(400).json({ 
        success: false, 
        message: `Request must be in-progress to mark as completed. Current status: ${request.status}` 
      });
    }

    console.log(`✅ Worker ${req.worker.name} completing request ${req.params.id}`);
    console.log(`   Status changing: in-progress → completed`);

    request.status = 'completed';
    request.completedDate = new Date();
    await request.save();

    console.log(`✅ Request ${req.params.id} now COMPLETED`);

    // Emit real-time notification to user
    const io = getIO();
    io.to(`user_${request.user._id}`).emit('requestCompleted', {
      request,
      message: `${request.worker.name} marked the job as completed`
    });
    
    // Emit dashboard update events
    io.to(`user_${request.user._id}`).emit('dashboardUpdate', {
      type: 'request_completed',
      requestId: request._id
    });
    io.to(`worker_${request.worker._id}`).emit('dashboardUpdate', {
      type: 'request_completed',
      requestId: request._id
    });

    res.json({
      success: true,
      message: 'Request marked as completed',
      data: request
    });
  } catch (error) {
    console.error('Complete request error:', error);
    res.status(500).json({ success: false, message: 'Failed to complete request', error: error.message });
  }
};

// Update request status
exports.updateRequestStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const request = await ServiceRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    // Verify user has access
    const isUser = request.user.toString() === req.user?._id?.toString();
    const isWorker = request.worker.toString() === req.worker?._id?.toString();
    
    if (!isUser && !isWorker) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    request.status = status;
    await request.save();

    res.json({
      success: true,
      message: 'Request status updated',
      data: request
    });
  } catch (error) {
    console.error('Update request status error:', error);
    res.status(500).json({ success: false, message: 'Failed to update status', error: error.message });
  }
};

// Cancel request (user only)
exports.cancelRequest = async (req, res) => {
  try {
    const request = await ServiceRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    // Only user can cancel
    if (request.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    if (request.status === 'completed') {
      return res.status(400).json({ success: false, message: 'Cannot cancel completed request' });
    }

    request.status = 'cancelled';
    await request.save();

    // Emit real-time notification to worker
    const io = getIO();
    io.to(`worker_${request.worker}`).emit('requestCancelled', {
      request,
      message: 'A service request was cancelled'
    });
    
    // Emit dashboard update events
    io.to(`user_${request.user}`).emit('dashboardUpdate', {
      type: 'request_cancelled',
      requestId: request._id
    });
    io.to(`worker_${request.worker}`).emit('dashboardUpdate', {
      type: 'request_cancelled',
      requestId: request._id
    });

    res.json({
      success: true,
      message: 'Request cancelled',
      data: request
    });
  } catch (error) {
    console.error('Cancel request error:', error);
    res.status(500).json({ success: false, message: 'Failed to cancel request', error: error.message });
  }
};
