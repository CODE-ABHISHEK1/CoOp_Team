const express = require("express");
const router = express.Router();
const Notification = require("../models/Notification");
const { protect } = require("../middleware/authMiddleware");

// @desc    Get current user's notifications
router.get("/", protect, async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .populate("sender", "name")
      .populate("projectId", "name")
      .sort({ createdAt: -1 })
      .limit(50); // Increased limit for better UX
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Mark notification as read
router.put("/:id/read", protect, async (req, res) => {
  try {
    //  Security: Ensure user owns this notification
    const notif = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { read: true },
      { new: true },
    );
    if (!notif)
      return res.status(404).json({ message: "Notification not found" });
    res.json(notif);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Delete notification
router.delete("/:id", protect, async (req, res) => {
  try {
    const result = await Notification.findOneAndDelete({
      _id: req.params.id,
      recipient: req.user._id,
    });
    if (!result)
      return res.status(404).json({ message: "Notification not found" });
    res.json({ message: "Notification deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
