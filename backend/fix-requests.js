const mongoose = require('mongoose');
const ServiceRequest = require('./models/ServiceRequest');

mongoose.connect('mongodb://localhost:27017/skilllink')
  .then(async () => {
    console.log('✅ Connected to MongoDB');
    
    // Update all 'accepted' requests to 'in-progress'
    const result = await ServiceRequest.updateMany(
      { status: 'accepted' },
      { $set: { status: 'in-progress' } }
    );
    
    console.log(`\n✅ Updated ${result.modifiedCount} requests from 'accepted' to 'in-progress'`);
    
    // Show current status
    const requests = await ServiceRequest.find().select('status title');
    console.log(`\n📋 Current Request Statuses:`);
    requests.forEach(r => {
      console.log(`  - ${r.title}: ${r.status}`);
    });
    
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
  });
