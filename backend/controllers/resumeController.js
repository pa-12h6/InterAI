const Resume = require("../models/Resume");

const saveResumeAnalysis = async (req, res) => {
  try {
    const {
      user,
      fileName,
      analysis,
      score,
    } = req.body;

    if (!user || !fileName || !analysis) {
      return res.status(400).json({
        success: false,
        message:
          "User, file name and analysis are required",
      });
    }

    const resume = await Resume.create({
      user,
      fileName,
      analysis,
      score: score || 0,
    });

    res.status(201).json({
      success: true,
      message:
        "Resume analysis saved successfully",
      resume,
    });

  } catch (error) {

    console.error(
      "Save Resume Analysis Error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to save resume analysis",
      error: error.message,
    });
  }
};


const getResumeHistory = async (req, res) => {
  try {
    const { userId } = req.params;

    const resumes = await Resume.find({
      user: userId,
    }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      resumes,
    });

  } catch (error) {

    console.error(
      "Get Resume History Error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to fetch resume history",
      error: error.message,
    });
  }
};


// Get individual resume result
const getResumeById = async (req, res) => {
  try {

    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Resume ID is required",
      });
    }

    const resume = await Resume.findById(id);

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: "Resume result not found",
      });
    }

    res.status(200).json({
      success: true,
      resume,
    });

  } catch (error) {

    console.error(
      "Get Resume Result Error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to fetch resume result",
      error: error.message,
    });
  }
};


module.exports = {
  saveResumeAnalysis,
  getResumeHistory,
  getResumeById,
};