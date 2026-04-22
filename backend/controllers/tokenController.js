const Token = require("../models/Token");

// Generate sequential token number
const generateTokenNumber = async () => {
  const lastToken = await Token.findOne().sort({ createdAt: -1 });
  if (!lastToken) return "T1";
  const lastNum = parseInt(lastToken.tokenNumber.replace("T", ""));
  return `T${lastNum + 1}`;
};

// Average serving time in minutes
const AVG_SERVING_TIME = 5;

// @route POST /api/tokens — Generate token
const generateToken = async (req, res) => {
  try {
    const { purpose } = req.body;

    // Check if user already has an active token
    const existingToken = await Token.findOne({
      userId: req.user._id,
      status: { $in: ["waiting", "serving"] },
    });

    if (existingToken) {
      return res.status(400).json({
        success: false,
        message: `You already have an active token: ${existingToken.tokenNumber}`,
      });
    }

    const tokenNumber = await generateTokenNumber();

    const token = await Token.create({
      tokenNumber,
      userId: req.user._id,
      purpose: purpose || "General",
    });

    res.status(201).json({
      success: true,
      message: "Token generated successfully",
      token,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route GET /api/tokens/my — Get logged-in user's tokens
const getMyTokens = async (req, res) => {
  try {
    const tokens = await Token.find({ userId: req.user._id }).sort({
      createdAt: -1,
    });

    // Calculate position and wait time for active token
    const activeToken = tokens.find(
      (t) => t.status === "waiting" || t.status === "serving"
    );

    let queueInfo = null;
    if (activeToken && activeToken.status === "waiting") {
      const ahead = await Token.countDocuments({
        status: "waiting",
        createdAt: { $lt: activeToken.createdAt },
      });
      queueInfo = {
        position: ahead + 1,
        estimatedWait: ahead * AVG_SERVING_TIME,
      };
    }

    res.json({ success: true, tokens, queueInfo });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route GET /api/tokens/queue-status — Public queue info
const getQueueStatus = async (req, res) => {
  try {
    const serving = await Token.findOne({ status: "serving" }).populate(
      "userId",
      "name"
    );
    const waitingCount = await Token.countDocuments({ status: "waiting" });
    const completedToday = await Token.countDocuments({
      status: "completed",
      updatedAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
    });

    res.json({
      success: true,
      currentlyServing: serving ? serving.tokenNumber : "None",
      waitingCount,
      completedToday,
      estimatedWaitForNew: waitingCount * AVG_SERVING_TIME,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route GET /api/tokens — Admin: get all tokens
const getAllTokens = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = status ? { status } : {};

    const tokens = await Token.find(filter)
      .populate("userId", "name email")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Token.countDocuments(filter);

    res.json({ success: true, tokens, total, page: Number(page) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route PUT /api/tokens/:id/status — Admin: update token status
const updateTokenStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ["waiting", "serving", "completed", "skipped"];

    if (!validStatuses.includes(status)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid status" });
    }

    // If setting to serving, complete current serving token first
    if (status === "serving") {
      await Token.updateMany({ status: "serving" }, { status: "completed" });
    }

    const token = await Token.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate("userId", "name email");

    if (!token) {
      return res
        .status(404)
        .json({ success: false, message: "Token not found" });
    }

    res.json({ success: true, message: "Status updated", token });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  generateToken,
  getMyTokens,
  getQueueStatus,
  getAllTokens,
  updateTokenStatus,
};
