require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { MongoClient, ObjectId } = require('mongodb');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// MongoDB connection string
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017';
const DB_NAME = 'portfolio_db';
const COLLECTION_NAME = 'ping_messages';

let db;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the current directory
app.use(express.static(__dirname));

// MongoDB Connection
const connectDB = async () => {
  try {
    const client = new MongoClient(MONGO_URI);
    await client.connect();
    db = client.db(DB_NAME);
    console.log('Connected to MongoDB successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/ping', (req, res) => {
  res.sendFile(path.join(__dirname, 'ping.html'));
});

// API endpoint to save ping message
app.post('/api/ping', async (req, res) => {
  try {
    const { name, phone, email } = req.body;

    // Validation
    if (!name || !phone || !email) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    // Basic phone validation (10 digits)
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid phone number. Please provide a 10-digit number'
      });
    }

    // Insert into MongoDB
    const collection = db.collection(COLLECTION_NAME);
    const result = await collection.insertOne({
      name,
      phone,
      email,
      timestamp: new Date(),
      ip: req.ip
    });

    res.status(201).json({
      success: true,
      message: 'Thank you for reaching out! I will get back to you soon.',
      id: result.insertedId
    });

  } catch (error) {
    console.error('Error saving ping message:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while saving your message. Please try again.'
    });
  }
});

// API endpoint to get all ping messages (optional - for admin purposes)
app.get('/api/ping/messages', async (req, res) => {
  try {
    const collection = db.collection(COLLECTION_NAME);
    const messages = await collection.find({}).toArray();
    res.status(200).json({
      success: true,
      count: messages.length,
      messages
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while fetching messages'
    });
  }
});

// Admin page
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

// Admin auth verification
app.post('/api/admin/auth', (req, res) => {
  try {
    const { password } = req.body;
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    if (password === adminPassword) {
      return res.status(200).json({ success: true, message: 'Authenticated' });
    }
    res.status(401).json({ success: false, message: 'Invalid password' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'An error occurred' });
  }
});

// Delete a ping message by id
app.delete('/api/ping/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid id' });
    }
    const collection = db.collection(COLLECTION_NAME);
    const result = await collection.deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 1) {
      return res.status(200).json({ success: true, message: 'Message deleted' });
    }
    res.status(404).json({ success: false, message: 'Message not found' });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ success: false, message: 'An error occurred while deleting message' });
  }
});

// Start server
const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
};

startServer();
