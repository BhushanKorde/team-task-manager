const express = require("express");
const Task = require("../models/Task");
const Project = require("../models/Project");
const auth = require("../middleware/auth");

const router = express.Router();

const populateTask = (query) =>
  query.populate("assignedTo", "name email").populate("projectId", "name");

// ── POST /api/tasks — Create (Admin only) ──
router.post("/", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin")
      return res.status(403).json({ message: "Access denied. Only admins can create tasks." });

    const { title, projectId, assignedTo, status, deadline } = req.body;

    if (!title || !assignedTo || !projectId)
      return res.status(400).json({ message: "Title, projectId, and assignedTo are required." });

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: "Project not found." });

    const isMember = project.members.some((m) => m.toString() === assignedTo);
    if (!isMember)
      return res.status(400).json({ message: "Assigned user is not a member of this project." });

    const task = await Task.create({
      title,
      projectId,
      assignedTo,
      status: status || "Pending",
      deadline: deadline || null,
    });

    const populated = await populateTask(Task.findById(task._id));
    return res.status(201).json({ task: populated });
  } catch (error) {
    console.error("Create task error:", error.message);
    return res.status(500).json({ message: "Server error. Please try again." });
  }
});

// ── GET /api/tasks — List (role-based) ──
router.get("/", auth, async (req, res) => {
  try {
    let query;
    if (req.user.role === "admin") {
      query = Task.find();
    } else {
      query = Task.find({ assignedTo: req.user.id });
    }
    const tasks = await populateTask(query.sort({ createdAt: -1 }));
    return res.status(200).json({ tasks });
  } catch (error) {
    console.error("Get tasks error:", error.message);
    return res.status(500).json({ message: "Server error. Please try again." });
  }
});

// ── PUT /api/tasks/:id — Update task ──
//   Admin: can update title, assignedTo, deadline, status
//   Member: can only update status (and only if assigned)
router.put("/:id", auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found." });

    const isAdmin = req.user.role === "admin";
    const isAssigned = task.assignedTo.toString() === req.user.id;

    if (!isAdmin && !isAssigned)
      return res.status(403).json({ message: "Access denied. You are not assigned to this task." });

    // Members can only update status
    if (!isAdmin) {
      if (task.status === "Completed")
        return res.status(400).json({ message: "Task is already completed and cannot be updated." });

      const { status } = req.body;
      const validStatuses = ["Pending", "In Progress", "Completed"];
      if (status && !validStatuses.includes(status))
        return res.status(400).json({ message: `Invalid status. Must be one of: ${validStatuses.join(", ")}` });
      if (status) task.status = status;
    } else {
      // Admin can update all fields
      const { title, assignedTo, deadline, status, projectId } = req.body;
      if (title !== undefined) task.title = title;
      if (deadline !== undefined) task.deadline = deadline;
      if (status !== undefined) {
        const validStatuses = ["Pending", "In Progress", "Completed"];
        if (!validStatuses.includes(status))
          return res.status(400).json({ message: `Invalid status. Must be one of: ${validStatuses.join(", ")}` });
        task.status = status;
      }
      if (assignedTo !== undefined) {
        // Validate new assignee is a project member
        const proj = await Project.findById(projectId || task.projectId);
        if (proj) {
          const isMember = proj.members.some((m) => m.toString() === assignedTo);
          if (!isMember)
            return res.status(400).json({ message: "Assigned user is not a member of this project." });
        }
        task.assignedTo = assignedTo;
      }
    }

    await task.save();
    const populated = await populateTask(Task.findById(task._id));
    return res.status(200).json({ task: populated });
  } catch (error) {
    console.error("Update task error:", error.message);
    return res.status(500).json({ message: "Server error. Please try again." });
  }
});

// ── DELETE /api/tasks/:id — Delete (Admin only) ──
router.delete("/:id", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin")
      return res.status(403).json({ message: "Access denied. Only admins can delete tasks." });

    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found." });

    await Task.findByIdAndDelete(task._id);
    return res.status(200).json({ message: "Task deleted." });
  } catch (error) {
    console.error("Delete task error:", error.message);
    return res.status(500).json({ message: "Server error. Please try again." });
  }
});

module.exports = router;
