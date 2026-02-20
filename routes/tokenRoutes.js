const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/roleMiddleware");

const {
  generateToken,
  getMyTokens,
  getQueueStatus,
  updateTokenStatus,
  getAllTokens,
} = require("../controllers/tokenController");

// User routes
router.post("/generate", protect, generateToken);
router.get("/my", protect, getMyTokens);
router.get("/status", protect, getQueueStatus);

// Admin routes
router.get("/all", protect, adminOnly, getAllTokens);
router.put("/:id", protect, adminOnly, updateTokenStatus);

module.exports = router;