const express = require('express');
const Transaction = require('../models/Transaction');
const { protect } = require('../middleware/auth');
const router = express.Router();

// All routes are protected
router.use(protect);

// Get all transactions for current user
router.get('/', async (req, res) => {
  try {
    const { type, category, startDate, endDate } = req.query;
    
    // Build filter object
    let filter = { user: req.user._id };
    
    if (type) filter.type = type;
    if (category) filter.category = { $regex: category, $options: 'i' };
    
    // Date filtering
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }
    
    const transactions = await Transaction.find(filter).sort({ date: -1 });
    
    res.json(transactions);
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// Get single transaction
router.get('/:id', async (req, res) => {
  try {
    const transaction = await Transaction.findOne({ 
      _id: req.params.id, 
      user: req.user._id 
    });
    
    if (!transaction) {
      return res.status(404).json({
        status: 'fail',
        message: 'Transaction not found'
      });
    }
    
    res.json(transaction);
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// Create transaction
router.post('/', async (req, res) => {
  try {
    const transactionData = {
      ...req.body,
      user: req.user._id
    };
    
    const transaction = await Transaction.create(transactionData);
    
    res.status(201).json(transaction);
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
});

// Update transaction
router.put('/:id', async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!transaction) {
      return res.status(404).json({
        status: 'fail',
        message: 'Transaction not found'
      });
    }
    
    res.json(transaction);
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
});

// Delete transaction
router.delete('/:id', async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndDelete({ 
      _id: req.params.id, 
      user: req.user._id 
    });
    
    if (!transaction) {
      return res.status(404).json({
        status: 'fail',
        message: 'Transaction not found'
      });
    }
    
    res.json({
      status: 'success',
      message: 'Transaction deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// Get transaction statistics
router.get('/stats', async (req, res) => {
  try {
    const stats = await Transaction.aggregate([
      {
        $match: { user: req.user._id }
      },
      {
        $group: {
          _id: '$type',
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);
    
    // Convert to object format for easier access
    const result = {};
    stats.forEach(item => {
      result[item._id] = item.totalAmount;
    });
    
    res.json({
      income: result.income || 0,
      expense: result.expense || 0,
      balance: (result.income || 0) - (result.expense || 0)
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

module.exports = router;