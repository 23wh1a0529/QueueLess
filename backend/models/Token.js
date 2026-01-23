const mongoose = require("mongoose");

const tokenSchema = new mongoose.Schema({

  tokenNumber: {
    type: Number,
    required: true
  },

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  status: {
    type: String,
    enum: ["Waiting", "Serving", "Completed"],
    default: "Waiting"
  },

  createdAt: {
    type: Date,
    default: Date.now
  }

});

module.exports = mongoose.model("Token", tokenSchema);
