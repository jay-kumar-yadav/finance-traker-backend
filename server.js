const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const transactionRoutes = require('./routes/transactionRoutes');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Use frontend URL based on environment
const FRONTEND_URL = process.env.NODE_ENV === 'development'
  ? 'http://localhost:5173' // Local frontend during development
  : 'https://finance-traker-one.vercel.app'; // Deployed frontend in production

// CORS configuration
app.use(cors({
  origin: FRONTEND_URL,
  credentials: true,
}));

// Middleware
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/finance-tracker', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected successfully'))
.catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/transactions', transactionRoutes);

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Finance Tracker API' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`CORS enabled for: ${FRONTEND_URL}`);
});
