const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Project = require("../models/Project");
const Task = require("../models/Task");
const Notification = require("../models/Notification");
const { protect } = require("../middleware/authMiddleware");

// Helper for auto-status calculation
const calculateAutoStatus = async (projectId) => {
  const tasks = await Task.find({ project: projectId });
  if (tasks.length === 0) return "planning";
  if (tasks.every((t) => t.status === "done")) return "completed";
  if (tasks.some((t) => ["in-progress", "review"].includes(t.status)))
    return "in-progress";
  return "planning";
};

// Get projects where user is owner OR member
router.get("/", protect, async (req, res) => {
  try {
    const projects = await Project.find({
      $or: [{ owner: req.user._id }, { "members.user": req.user._id }],
    })
      .populate("owner", "name email")
      .populate("members.user", "name email")
      .populate("tasks")
      .sort({ createdAt: -1 });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/:id", protect, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate("owner", "name email")
      .populate("members.user", "name email")
      .populate("tasks");
    if (!project) return res.status(404).json({ message: "Project not found" });
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/", protect, async (req, res) => {
  try {
    const { name, description, status, priority, endDate, members } = req.body;

    console.log("📥 Received members array:", JSON.stringify(members));
    console.log("👤 Current user ID:", req.user._id.toString());

    const projectData = {
      name,
      description,
      status,
      priority,
      endDate,
      owner: req.user._id,
      members: [{ user: req.user._id, role: "admin" }],
    };

    if (members && Array.isArray(members) && members.length > 0) {
      let addedCount = 0;
      let skippedCount = 0;

      members.forEach((userId, index) => {
        console.log(
          `🔍 Processing member[${index}]: "${userId}" (type: ${typeof userId})`,
        );

        const isValidId = mongoose.Types.ObjectId.isValid(userId);
        const isNotSelf = userId !== req.user._id.toString();

        if (!isValidId) {
          console.warn(
            `⚠️ SKIPPED [${index}]: Invalid ObjectId format - "${userId}"`,
          );
          skippedCount++;
          return;
        }

        if (!isNotSelf) {
          console.warn(`⚠️ SKIPPED [${index}]: Duplicate of current user`);
          skippedCount++;
          return;
        }

        projectData.members.push({
          user: new mongoose.Types.ObjectId(userId),
          role: "member",
        });
        addedCount++;
        console.log(` ADDED [${index}]: ${userId}`);
      });

      console.log(
        `📊 Summary: Added ${addedCount}, Skipped ${skippedCount} out of ${members.length} members`,
      );
    } else {
      console.log("ℹ️ No members array received or empty array");
    }

    const project = await Project.create(projectData);
    console.log("💾 Project saved with", project.members.length, "members");

    const validMemberIds = project.members
      .filter((m) => m.role === "member")
      .map((m) => m.user.toString());

    if (validMemberIds.length > 0) {
      const notifPromises = validMemberIds.map((userId) =>
        Notification.create({
          recipient: userId,
          sender: req.user._id,
          type: "project_invite",
          message: `You were added to project "${name}"`,
          projectId: project._id,
        }),
      );
      await Promise.all(notifPromises);
      console.log("🔔 Notifications sent to", validMemberIds.length, "members");
    }

    const createdProject = await Project.findById(project._id)
      .populate("owner", "name email")
      .populate("members.user", "name email");

    res.status(201).json(createdProject);
  } catch (error) {
    console.error("❌ CRITICAL PROJECT CREATION ERROR:", error);
    res.status(500).json({ message: error.message });
  }
});

router.post("/:id/members", protect, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });
    if (project.owner.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Only owner can add members" });

    const { userId, role } = req.body;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const alreadyMember = project.members.some(
      (m) => m.user.toString() === userId,
    );
    if (alreadyMember)
      return res.status(400).json({ message: "User already a member" });

    project.members.push({
      user: new mongoose.Types.ObjectId(userId),
      role: role || "member",
    });
    await project.save();

    await Notification.create({
      recipient: userId,
      sender: req.user._id,
      type: "project_invite",
      message: `You were added to project "${project.name}"`,
      projectId: project._id,
    });

    const updated = await Project.findById(project._id)
      .populate("owner", "name email")
      .populate("members.user", "name email");
    res.json(updated);
  } catch (err) {
    console.error("Add member error:", err);
    res.status(500).json({ message: err.message });
  }
});

router.delete("/:id/members/:userId", protect, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project || project.owner.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not authorized" });

    project.members = project.members.filter(
      (m) => m.user.toString() !== req.params.userId,
    );
    await project.save();
    res.json({ message: "Member removed" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

//  NEW: DELETE ENTIRE PROJECT (Owner Only + Cascading Cleanup)
router.delete("/:id", protect, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // 🔒 SECURITY: Only the project owner can delete it
    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Only the project owner can delete this project",
      });
    }

    // 🧹 CASCADE DELETE: Remove all associated data to prevent orphans
    const [deletedTasks, deletedNotifications] = await Promise.all([
      Task.deleteMany({ project: req.params.id }),
      Notification.deleteMany({ projectId: req.params.id }),
    ]);

    console.log(
      `🗑️ Deleted project "${project.name}" (${deletedTasks.deletedCount} tasks, ${deletedNotifications.deletedCount} notifications)`,
    );

    // Finally delete the project itself
    await project.deleteOne();

    res.json({
      message: "Project and all associated data deleted successfully",
    });
  } catch (error) {
    console.error("❌ Delete project error:", error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
