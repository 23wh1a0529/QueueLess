const mongoose = require("mongoose");

const tokenSchema = new mongoose.Schema(
  {
    tokenNumber: {
      type: Number,
      required: true,
      unique: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    status: {
      type: String,
      enum: ["Waiting", "Serving", "Completed", "Skipped"],
      default: "Waiting",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Token", tokenSchema);