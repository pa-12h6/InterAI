const express = require("express");
const router = express.Router();

const {
  saveInterview,
  getInterviewHistory,
  getInterviewById,
} = require("../controllers/interviewController");

// Save interview
router.post("/save", saveInterview);

// Get user's interview history
router.get("/history/:userId", getInterviewHistory);

// Get complete interview result
router.get("/:interviewId", getInterviewById);

module.exports = router;