# SkillLink - Local Services Marketplace

Connect service providers with customers in your local area.

## Features
- User and Worker authentication
- Real-time messaging with Socket.io
- Service requests management
- Real-time notifications
- Dashboard analytics
- Review system

## Tech Stack
- **Backend**: Node.js, Express, MongoDB Atlas, Socket.io
- **Frontend**: React, Vite
- **Database**: MongoDB Atlas

## Environment Variables

### Backend (.env)
```
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret_key
PORT=5000
NODE_ENV=production
```

### Frontend (.env)
```
VITE_API_URL=your_backend_url
VITE_SOCKET_URL=your_backend_url
```

## Deployment

### Backend (Railway)
1. Push code to GitHub
2. Create new project on Railway
3. Connect GitHub repository
4. Add environment variables
5. Deploy

### Frontend (Vercel/Netlify)
1. Push code to GitHub
2. Import project from GitHub
3. Set build command: `npm run build`
4. Set output directory: `dist`
5. Add environment variables
6. Deploy

## Local Development

### Backend
```bash
cd backend
npm install
npm start
```

### Frontend
```bash
cd Frontend
npm install
npm run dev
```

## License
MIT
