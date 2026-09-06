const mongoose = require("mongoose");

const interviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    role: {
      type: String,
      required: true,
    },

    experience: {
      type: String,
      required: true,
    },

    difficulty: {
      type: String,
      required: true,
    },

    questions: [
      {
        question: {
          type: String,
          required: true,
        },

        topic: {
          type: String,
        },

        answer: {
          type: String,
        },

        evaluation: {
          score: Number,
          correctness: Number,
          technicalQuality: Number,
          communication: Number,
          feedback: String,
          suggestions: String,
        },
      },
    ],

    overallScore: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Interview", interviewSchema);