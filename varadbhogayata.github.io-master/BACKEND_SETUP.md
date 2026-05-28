# Backend Setup Guide

This guide explains how to set up and run the MongoDB backend for the Ping Me form.

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas account)
- npm or yarn

## Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure MongoDB connection:**
   
   Edit the `.env` file in the project root and add your MongoDB connection string:
   
   **For Local MongoDB:**
   ```
   MONGO_URI=mongodb://localhost:27017
   PORT=5000
   ```
   
   **For MongoDB Atlas (Cloud):**
   ```
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/
   PORT=5000
   ```
   
   Replace `username`, `password`, and `cluster` with your actual MongoDB Atlas credentials.

## Running the Backend

### Development Mode (with auto-reload):
```bash
npm run dev
```

### Production Mode:
```bash
npm start
```

The server will start on `http://localhost:5000`

## API Endpoints

### POST /api/ping
Saves a ping message (form submission)

**Request Body:**
```json
{
  "name": "John Doe",
  "phone": "9876543210",
  "email": "john@example.com"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Thank you for reaching out! I will get back to you soon.",
  "id": "mongodb_object_id"
}
```

**Response (Error):**
```json
{
  "success": false,
  "message": "Error message"
}
```

### GET /api/ping/messages
Retrieves all ping messages (optional admin endpoint)

**Response:**
```json
{
  "success": true,
  "count": 5,
  "messages": [...]
}
```

## Database Schema

**Collection:** `ping_messages`

**Document Structure:**
```javascript
{
  _id: ObjectId,
  name: String,
  phone: String,
  email: String,
  timestamp: Date,
  ip: String
}
```

## Troubleshooting

**Connection Error:**
- Ensure MongoDB is running
- Check your MONGO_URI in .env file
- For MongoDB Atlas, make sure your IP is whitelisted

**Form Not Submitting:**
- Check browser console for errors
- Ensure the backend server is running on port 5000
- Verify CORS is enabled (it should be by default)

**Port Already in Use:**
- Change the PORT in .env file
- Or kill the process using port 5000

## Deployment

For production deployment:
1. Use a cloud MongoDB service (MongoDB Atlas recommended)
2. Deploy the backend to services like Heroku, Railway, or AWS
3. Update the frontend to send requests to your deployed backend URL
4. Update CORS settings if needed

## Security Note

Never commit the `.env` file containing sensitive credentials. Use environment variables in production.
