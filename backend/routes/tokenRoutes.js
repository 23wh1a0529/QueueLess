const express = require("express");
const router = express.Router();
const {
  generateToken,
  getMyTokens,
  getQueueStatus,
  getAllTokens,
  updateTokenStatus,
} = require("../controllers/tokenController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

router.get("/queue-status", getQueueStatus); // public
router.post("/", protect, generateToken);
router.get("/my", protect, getMyTokens);
router.get("/", protect, adminOnly, getAllTokens);
router.put("/:id/status", protect, adminOnly, updateTokenStatus);

module.exports = router;
