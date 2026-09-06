const Interview = require("../models/Interview");

// Save interview result
const saveInterview = async (req, res) => {
  try {
    const {
      user,
      role,
      experience,
      difficulty,
      questions,
      overallScore,
    } = req.body;

    if (
      !user ||
      !role ||
      !experience ||
      !difficulty ||
      !questions
    ) {
      return res.status(400).json({
        success: false,
        message: "Required interview data is missing",
      });
    }

    const interview = await Interview.create({
      user,
      role,
      experience,
      difficulty,
      questions,
      overallScore,
    });

    res.status(201).json({
      success: true,
      message: "Interview result saved successfully",
      interview,
    });
  } catch (error) {
    console.error("Save Interview Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to save interview result",
      error: error.message,
    });
  }
};

// Get user's interview history
const getInterviewHistory = async (req, res) => {
  try {
    const { userId } = req.params;

    const interviews = await Interview.find({
      user: userId,
    }).sort({ createdAt: -1})
      .select(
        "role experience difficulty overall createdAt"
      );
      
    

    res.status(200).json({
      success: true,
      interviews,
    });
  } catch (error) {
    console.error("Get Interview History Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch interview history",
      error: error.message,
    });
  }
};

// Get complete interview result
const getInterviewById = async (req, res) => {
  try {
    const { interviewId } = req.params;

    if (!interviewId) {
      return res.status(400).json({
        success: false,
        message: "Interview ID is required",
      });
    }

    const interview = await Interview.findById(interviewId);

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Interview result not found",
      });
    }

    res.status(200).json({
      success: true,
      interview,
    });
  } catch (error) {
    console.error("Get Interview Result Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch interview result",
      error: error.message,
    });
  }
};

module.exports = {
  saveInterview,
  getInterviewHistory,
  getInterviewById,
};