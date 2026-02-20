const Token = require("../models/Token");
const Counter = require("../models/Counter");

// 🔢 Generate Sequential Token Number
const getNextTokenNumber = async () => {
  const counter = await Counter.findOneAndUpdate(
    { name: "token" },
    { $inc: { sequenceValue: 1 } },
    { new: true, upsert: true }
  );

  return counter.sequenceValue;
};

// 🎟 Generate Token (User)
exports.generateToken = async (req, res) => {
  try {
    const tokenNumber = await getNextTokenNumber();

    const token = await Token.create({
      tokenNumber,
      user: req.user._id,
    });

    res.status(201).json(token);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 📋 Get My Tokens
exports.getMyTokens = async (req, res) => {
  try {
    const tokens = await Token.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(tokens);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 📊 Get Current Queue Status
exports.getQueueStatus = async (req, res) => {
  try {
    const currentServing = await Token.findOne({ status: "Serving" });

    const waitingCount = await Token.countDocuments({ status: "Waiting" });

    res.json({
      currentServing,
      peopleWaiting: waitingCount,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 👑 Admin: Update Token Status
exports.updateTokenStatus = async (req, res) => {
  try {
    const token = await Token.findById(req.params.id);

    if (!token) {
      return res.status(404).json({ message: "Token not found" });
    }

    token.status = req.body.status;
    await token.save();

    res.json(token);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 👑 Admin: Get All Tokens
exports.getAllTokens = async (req, res) => {
  try {
    const tokens = await Token.find().populate("user", "name email");
    res.json(tokens);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};