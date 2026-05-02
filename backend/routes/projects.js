const express = require("express");
const Project = require("../models/Project");
const Task = require("../models/Task");
const User = require("../models/User");
const auth = require("../middleware/auth");

const router = express.Router();

const populateProject = (query) =>
  query.populate("createdBy", "name email").populate("members", "name email");

// ── POST /api/projects — Create (Admin) ──
router.post("/", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin")
      return res.status(403).json({ message: "Access denied. Only admins can create projects." });

    const { name, description, deadline, members } = req.body;
    if (!name) return res.status(400).json({ message: "Project name is required." });

    // Validate & deduplicate members
    const uniqueMembers = [...new Set(members || [])];
    if (uniqueMembers.length > 0) {
      const valid = await User.find({ _id: { $in: uniqueMembers } });
      if (valid.length !== uniqueMembers.length)
        return res.status(400).json({ message: "One or more member IDs are invalid." });
    }

    const project = await Project.create({
      name,
      description: description || "",
      deadline: deadline || null,
      createdBy: req.user.id,
      members: uniqueMembers,
    });

    const populated = await populateProject(Project.findById(project._id));
    return res.status(201).json({ project: populated });
  } catch (error) {
    console.error("Create project error:", error.message);
    return res.status(500).json({ message: "Server error. Please try again." });
  }
});

// ── GET /api/projects — List (role-based) ──
router.get("/", auth, async (req, res) => {
  try {
    let query;
    if (req.user.role === "admin") {
      query = Project.find();
    } else {
      query = Project.find({ members: req.user.id });
    }
    const projects = await populateProject(query.sort({ createdAt: -1 }));
    return res.status(200).json({ projects });
  } catch (error) {
    console.error("Get projects error:", error.message);
    return res.status(500).json({ message: "Server error. Please try again." });
  }
});

// ── PUT /api/projects/:id — Update project (Admin) ──
router.put("/:id", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin")
      return res.status(403).json({ message: "Access denied. Only admins can update projects." });

    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found." });

    const { name, description, deadline, members } = req.body;
    if (name !== undefined) project.name = name;
    if (description !== undefined) project.description = description;
    if (deadline !== undefined) project.deadline = deadline;

    if (members !== undefined) {
      const uniqueMembers = [...new Set(members)];
      const valid = await User.find({ _id: { $in: uniqueMembers } });
      if (valid.length !== uniqueMembers.length)
        return res.status(400).json({ message: "One or more member IDs are invalid." });
      project.members = uniqueMembers;
    }

    await project.save();
    const populated = await populateProject(Project.findById(project._id));
    return res.status(200).json({ project: populated });
  } catch (error) {
    console.error("Update project error:", error.message);
    return res.status(500).json({ message: "Server error. Please try again." });
  }
});

// ── PUT /api/projects/:id/members — Add members (Admin) ──
router.put("/:id/members", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin")
      return res.status(403).json({ message: "Access denied. Only admins can manage project members." });

    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found." });

    const { members } = req.body;
    if (!members || !Array.isArray(members))
      return res.status(400).json({ message: "Members array is required." });

    const valid = await User.find({ _id: { $in: members } });
    if (valid.length !== members.length)
      return res.status(400).json({ message: "One or more member IDs are invalid." });

    const existingIds = project.members.map((m) => m.toString());
    const newMembers = members.filter((m) => !existingIds.includes(m));
    project.members.push(...newMembers);

    await project.save();
    const populated = await populateProject(Project.findById(project._id));
    return res.status(200).json({ project: populated });
  } catch (error) {
    console.error("Add members error:", error.message);
    return res.status(500).json({ message: "Server error. Please try again." });
  }
});

// ── DELETE /api/projects/:id — Delete (Admin) ──
router.delete("/:id", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin")
      return res.status(403).json({ message: "Access denied. Only admins can delete projects." });

    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found." });

    // Delete all tasks belonging to this project
    await Task.deleteMany({ projectId: project._id });
    await Project.findByIdAndDelete(project._id);

    return res.status(200).json({ message: "Project and associated tasks deleted." });
  } catch (error) {
    console.error("Delete project error:", error.message);
    return res.status(500).json({ message: "Server error. Please try again." });
  }
});

module.exports = router;
