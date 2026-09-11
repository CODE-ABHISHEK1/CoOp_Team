const express = require("express");
const router = express.Router();
const Task = require("../models/Task");
const Project = require("../models/Project");
const Notification = require("../models/Notification"); //  Added for task assignment notifications
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

//  FIXED: Get tasks by project WITH populated assignee
router.get("/project/:projectId", protect, async (req, res) => {
  try {
    const tasks = await Task.find({ project: req.params.projectId })
      .populate("assignedTo", "name email") //  CRITICAL FIX: Populates user name/email
      .populate("createdBy", "name email") //  Also populates creator info
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single task by ID
router.get("/:id", protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email")
      .populate("project", "name");

    if (!task) return res.status(404).json({ message: "Task not found" });
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create task with assignment notification
router.post("/", protect, async (req, res) => {
  try {
    const {
      title,
      description,
      status,
      priority,
      dueDate,
      assignedTo,
      project,
    } = req.body;

    const projectDoc = await Project.findById(project);
    if (!projectDoc)
      return res.status(404).json({ message: "Project not found" });

    const taskData = {
      title,
      description,
      status,
      priority,
      dueDate,
      project,
      createdBy: req.user._id,
    };

    // Only add assignedTo if it's a valid ObjectId and not empty
    if (assignedTo && assignedTo !== "") {
      taskData.assignedTo = assignedTo;
    }

    const task = await Task.create(taskData);

    // Add task to project's task array
    projectDoc.tasks.push(task._id);
    await projectDoc.save();

    // Auto-update project status
    if (projectDoc.autoStatus) {
      const newStatus = await calculateAutoStatus(project);
      await Project.findByIdAndUpdate(project, { status: newStatus });
    }

    //  SEND NOTIFICATION WHEN TASK IS ASSIGNED
    if (assignedTo && assignedTo !== req.user._id.toString()) {
      await Notification.create({
        recipient: assignedTo,
        sender: req.user._id,
        type: "task_assigned",
        message: `You were assigned to task "${title}"`,
        taskId: task._id,
        projectId: project,
      });
    }

    const createdTask = await Task.findById(task._id)
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email");

    res.status(201).json(createdTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update task with reassignment notification
router.put("/:id", protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    })
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email");

    //  SEND NOTIFICATION IF ASSIGNEE CHANGED
    if (
      req.body.assignedTo &&
      req.body.assignedTo !== task.assignedTo?.toString()
    ) {
      await Notification.create({
        recipient: req.body.assignedTo,
        sender: req.user._id,
        type: "task_assigned",
        message: `You were assigned to task "${updatedTask.title}"`,
        taskId: updatedTask._id,
        projectId: updatedTask.project,
      });
    }

    // Auto-update project status
    const project = await Project.findById(task.project);
    if (project && project.autoStatus) {
      const newStatus = await calculateAutoStatus(task.project);
      await Project.findByIdAndUpdate(task.project, { status: newStatus });
    }

    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete task
router.delete("/:id", protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    await Project.findByIdAndUpdate(task.project, {
      $pull: { tasks: task._id },
    });
    await task.deleteOne();

    // Auto-update project status
    const project = await Project.findById(task.project);
    if (project && project.autoStatus) {
      const newStatus = await calculateAutoStatus(task.project);
      await Project.findByIdAndUpdate(task.project, { status: newStatus });
    }

    res.json({ message: "Task removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
