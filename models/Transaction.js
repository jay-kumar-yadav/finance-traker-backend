const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a title for the transaction'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  amount: {
    type: Number,
    required: [true, 'Please provide an amount'],
    min: [0, 'Amount cannot be negative']
  },
  type: {
    type: String,
    enum: {
      values: ['income', 'expense'],
      message: 'Type must be either income or expense'
    },
    required: [true, 'Please provide a type (income/expense)']
  },
  date: {
    type: Date,
    required: [true, 'Please provide a date'],
    default: Date.now
  },
  category: {
    type: String,
    required: [true, 'Please provide a category'],
    trim: true,
    maxlength: [50, 'Category cannot be more than 50 characters']
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Transaction must belong to a user']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot be more than 500 characters']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for better query performance
transactionSchema.index({ user: 1, date: -1 });
transactionSchema.index({ user: 1, type: 1 });
transactionSchema.index({ user: 1, category: 1 });

module.exports = mongoose.model('Transaction', transactionSchema);