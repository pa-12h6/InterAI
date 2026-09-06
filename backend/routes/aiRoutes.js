const express = require("express");

const {
  generateQuestions,
  evaluateAnswer,
} = require("../controllers/aiController");

const router = express.Router();

router.post("/generate-questions", generateQuestions);

router.post("/evaluate-answer", evaluateAnswer);

module.exports = router;