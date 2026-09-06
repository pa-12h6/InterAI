const express = require("express");
const multer = require("multer");

const {
  saveResumeAnalysis,
  getResumeHistory,
  getResumeById,
} = require("../controllers/resumeController");

const {
  analyzeResume,
} = require("../controllers/aiController");

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),

  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});


// Analyze resume
router.post(
  "/analyze",
  upload.single("resume"),
  analyzeResume
);


// Save resume analysis
router.post(
  "/save",
  saveResumeAnalysis
);


// Resume history
router.get(
  "/history/:userId",
  getResumeHistory
);


// Individual resume result
router.get(
  "/:id",
  getResumeById
);

module.exports = router;