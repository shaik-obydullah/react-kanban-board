const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Card title is required'],
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    default: '',
    maxlength: 5000
  },
  list: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'List',
    required: true
  },
  board: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Board',
    required: true
  },
  labels: [{
    type: String,
    enum: ['red', 'orange', 'yellow', 'green', 'blue', 'purple', 'pink', 'gray']
  }],
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  dueDate: Date,
  position: {
    type: Number,
    default: 0
  },
  completed: {
    type: Boolean,
    default: false
  },
  checklist: [{
    text: String,
    checked: Boolean,
    _id: { type: mongoose.Schema.Types.ObjectId, auto: true }
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Card', cardSchema);
