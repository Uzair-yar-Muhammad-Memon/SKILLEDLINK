# SkillLink Backend

Complete backend API for SkillLink - Local Services Marketplace

## Features

- User & Worker Authentication (JWT)
- Service Request Management
- Worker Profiles with Ratings
- Review System
- Location-based Worker Search
- Notifications
- MongoDB Atlas Integration

## Tech Stack

- Node.js
- Express.js
- MongoDB Atlas (Mongoose)
- JWT Authentication
- bcrypt for password hashing

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```bash
cp .env.example .env
```

3. Update `.env` with your MongoDB Atlas credentials

4. Seed database with categories:
```bash
npm run seed
```

5. Start server:
```bash
npm run dev
```

## API Endpoints

### Authentication

**User Auth:**
- POST `/auth/user/signup` - Register user
- POST `/auth/user/login` - Login user

**Worker Auth:**
- POST `/auth/worker/signup` - Register worker
- POST `/auth/worker/login` - Login worker

### Services

- POST `/services/post` - Post service request (User only)
- GET `/services/list` - Get all services
- GET `/services/:id` - Get service by ID
- PUT `/services/:id/accept` - Accept service (Worker only)
- PUT `/services/:id/complete` - Mark service complete

### Workers

- GET `/workers/list` - Get all workers
- GET `/workers/:id` - Get worker by ID
- GET `/workers/by-category` - Get workers by category
- PUT `/workers/update-profile` - Update worker profile (Worker only)

### Reviews

- POST `/reviews/add` - Add review (User only)
- GET `/reviews/worker/:id` - Get worker reviews

### Map

- GET `/map/worker-locations` - Get worker locations for map

### Notifications

- GET `/notifications` - Get user/worker notifications
- PUT `/notifications/:id/read` - Mark notification as read

## Environment Variables

```
PORT=5000
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d
NODE_ENV=development
```

## Project Structure

```
backend/
├── config/
│   ├── db.js
│   └── seed.js
├── controllers/
│   ├── userAuthController.js
│   ├── workerAuthController.js
│   ├── serviceController.js
│   ├── workerController.js
│   ├── reviewController.js
│   ├── mapController.js
│   └── notificationController.js
├── middleware/
│   └── auth.js
├── models/
│   ├── User.js
│   ├── Worker.js
│   ├── Category.js
│   ├── Service.js
│   ├── Review.js
│   └── Notification.js
├── routes/
│   ├── userAuth.js
│   ├── workerAuth.js
│   ├── services.js
│   ├── workers.js
│   ├── reviews.js
│   ├── map.js
│   └── notifications.js
├── .env.example
├── package.json
└── server.js
```

## License

MIT
