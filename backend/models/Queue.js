const mongoose = require("mongoose");

const queueSchema = new mongoose.Schema({

  currentToken: {
    type: Number,
    default: 0
  },

  totalTokens: {
    type: Number,
    default: 0
  },

  isActive: {
    type: Boolean,
    default: true
  }

}, { timestamps: true });

module.exports = mongoose.model("Queue", queueSchema);
