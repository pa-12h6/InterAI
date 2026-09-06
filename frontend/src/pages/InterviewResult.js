import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "../App.css";

function InterviewResult() {
  const navigate = useNavigate();
  const params = useParams();

  console.log("ALL ROUTE PARAMS:", params);

  // IMPORTANT:
  // Your route parameter is interviewid
  const interviewId = params.interviewid;

  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    console.log("Interview ID from URL:", interviewId);

    if (!interviewId) {
      setError("Interview ID not found.");
      setLoading(false);
      return;
    }

    fetchInterviewResult(interviewId);
  }, [interviewId]);

  const fetchInterviewResult = async (id) => {
    try {
      setLoading(true);
      setError("");

      console.log("Fetching interview:", id);

      const response = await fetch(
        `http://localhost:5000/api/interviews/${id}`
      );

      const data = await response.json();

      console.log("Interview result response:", data);

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to fetch interview result"
        );
      }

      setInterview(data.interview);
    } catch (error) {
      console.error("Interview Result Error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Calculate average evaluation scores
  const getAverageEvaluation = () => {
    if (!interview?.questions?.length) {
      return {
        score: "0.0",
        correctness: "0.0",
        technicalQuality: "0.0",
        communication: "0.0",
      };
    }

    const evaluatedQuestions = interview.questions.filter(
      (item) => item.evaluation
    );

    if (evaluatedQuestions.length === 0) {
      return {
        score: "0.0",
        correctness: "0.0",
        technicalQuality: "0.0",
        communication: "0.0",
      };
    }

    const total = evaluatedQuestions.reduce(
      (sum, item) => {
        const evaluation = item.evaluation;

        return {
          score:
            sum.score + Number(evaluation.score || 0),

          correctness:
            sum.correctness +
            Number(evaluation.correctness || 0),

          technicalQuality:
            sum.technicalQuality +
            Number(evaluation.technicalQuality || 0),

          communication:
            sum.communication +
            Number(evaluation.communication || 0),
        };
      },
      {
        score: 0,
        correctness: 0,
        technicalQuality: 0,
        communication: 0,
      }
    );

    const count = evaluatedQuestions.length;

    return {
      score: (total.score / count).toFixed(1),

      correctness: (
        total.correctness / count
      ).toFixed(1),

      technicalQuality: (
        total.technicalQuality / count
      ).toFixed(1),

      communication: (
        total.communication / count
      ).toFixed(1),
    };
  };

  // Download complete interview report as PDF
  const downloadReport = () => {
    if (!interview) {
      return;
    }

    const doc = new jsPDF();

    const margin = 20;
    let y = 20;

    const average = getAverageEvaluation();

    // -----------------------------
    // TITLE
    // -----------------------------

    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");

    doc.text(
      "InterAI Interview Report",
      margin,
      y
    );

    y += 10;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");

    doc.text(
      `Generated on: ${new Date().toLocaleDateString(
        "en-IN",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }
      )}`,
      margin,
      y
    );

    y += 15;

    // -----------------------------
    // INTERVIEW INFORMATION
    // -----------------------------

    doc.setFontSize(15);
    doc.setFont("helvetica", "bold");

    doc.text(
      "Interview Information",
      margin,
      y
    );

    y += 8;

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");

    doc.text(
      `Role: ${interview.role || "N/A"}`,
      margin,
      y
    );

    y += 7;

    doc.text(
      `Experience: ${
        interview.experience || "N/A"
      }`,
      margin,
      y
    );

    y += 7;

    doc.text(
      `Difficulty: ${
        interview.difficulty || "N/A"
      }`,
      margin,
      y
    );

    y += 7;

    doc.text(
      `Overall Score: ${
        interview.overallScore || 0
      }/10`,
      margin,
      y
    );

    y += 15;

    // -----------------------------
    // PERFORMANCE BREAKDOWN
    // -----------------------------

    doc.setFontSize(15);
    doc.setFont("helvetica", "bold");

    doc.text(
      "Performance Breakdown",
      margin,
      y
    );

    y += 5;

    autoTable(doc, {
      startY: y,

      head: [
        ["Category", "Score"],
      ],

      body: [
        [
          "Overall Evaluation",
          `${average.score}/10`,
        ],
        [
          "Correctness",
          `${average.correctness}/10`,
        ],
        [
          "Technical Quality",
          `${average.technicalQuality}/10`,
        ],
        [
          "Communication",
          `${average.communication}/10`,
        ],
      ],

      theme: "grid",

      styles: {
        fontSize: 10,
      },
    });

    y = doc.lastAutoTable.finalY + 15;

    // -----------------------------
    // QUESTIONS
    // -----------------------------

    doc.setFontSize(15);
    doc.setFont("helvetica", "bold");

    doc.text(
      "Interview Questions & Evaluation",
      margin,
      y
    );

    y += 10;

    interview.questions?.forEach(
      (item, index) => {
        const evaluation = item.evaluation;

        // New page if needed
        if (y > 250) {
          doc.addPage();
          y = 20;
        }

        // Question
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");

        doc.text(
          `Question ${index + 1}`,
          margin,
          y
        );

        y += 7;

        // Question text
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");

        const questionText =
          doc.splitTextToSize(
            item.question || "N/A",
            170
          );

        doc.text(
          questionText,
          margin,
          y
        );

        y +=
          questionText.length * 5 + 5;

        // Topic
        doc.setFont("helvetica", "bold");

        doc.text(
          "Topic:",
          margin,
          y
        );

        doc.setFont("helvetica", "normal");

        const topicText =
          item.topic || "N/A";

        doc.text(
          topicText,
          margin + 18,
          y
        );

        y += 8;

        // Answer
        doc.setFont("helvetica", "bold");

        doc.text(
          "Your Answer:",
          margin,
          y
        );

        y += 6;

        doc.setFont("helvetica", "normal");

        const answerText =
          doc.splitTextToSize(
            item.answer ||
              "No answer provided",
            170
          );

        doc.text(
          answerText,
          margin,
          y
        );

        y +=
          answerText.length * 5 + 8;

        // Evaluation
        if (evaluation) {
          if (y > 230) {
            doc.addPage();
            y = 20;
          }

          doc.setFontSize(12);
          doc.setFont("helvetica", "bold");

          doc.text(
            "AI Evaluation",
            margin,
            y
          );

          y += 7;

          doc.setFontSize(10);
          doc.setFont("helvetica", "normal");

          doc.text(
            `Score: ${
              evaluation.score || 0
            }/10`,
            margin,
            y
          );

          y += 6;

          doc.text(
            `Correctness: ${
              evaluation.correctness || 0
            }/10`,
            margin,
            y
          );

          y += 6;

          doc.text(
            `Technical Quality: ${
              evaluation.technicalQuality || 0
            }/10`,
            margin,
            y
          );

          y += 6;

          doc.text(
            `Communication: ${
              evaluation.communication || 0
            }/10`,
            margin,
            y
          );

          y += 9;

          // Feedback
          doc.setFont("helvetica", "bold");

          doc.text(
            "Feedback:",
            margin,
            y
          );

          y += 6;

          doc.setFont("helvetica", "normal");

          const feedbackText =
            doc.splitTextToSize(
              evaluation.feedback ||
                "No feedback available.",
              170
            );

          doc.text(
            feedbackText,
            margin,
            y
          );

          y +=
            feedbackText.length * 5 + 8;

          // Suggestions
          if (y > 245) {
            doc.addPage();
            y = 20;
          }

          doc.setFont("helvetica", "bold");

          doc.text(
            "Suggestions for Improvement:",
            margin,
            y
          );

          y += 6;

          doc.setFont("helvetica", "normal");

          const suggestionsText =
            doc.splitTextToSize(
              evaluation.suggestions ||
                "No suggestions available.",
              170
            );

          doc.text(
            suggestionsText,
            margin,
            y
          );

          y +=
            suggestionsText.length * 5 + 10;
        }

        // Separator
        if (y > 270) {
          doc.addPage();
          y = 20;
        } else {
          doc.setDrawColor(180);

          doc.line(
            margin,
            y,
            190,
            y
          );

          y += 10;
        }
      }
    );

    // -----------------------------
    // FOOTER
    // -----------------------------

    const pageCount =
      doc.internal.getNumberOfPages();

    for (
      let page = 1;
      page <= pageCount;
      page++
    ) {
      doc.setPage(page);

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");

      doc.text(
        `InterAI Interview Report | Page ${page} of ${pageCount}`,
        margin,
        285
      );
    }

    // -----------------------------
    // SAVE PDF
    // -----------------------------

    const safeRole =
      String(
        interview.role || "Interview"
      ).replace(
        /[^a-z0-9]/gi,
        "_"
      );

    doc.save(
      `InterAI_Interview_Report_${safeRole}.pdf`
    );
  };

  // -----------------------------
  // LOADING
  // -----------------------------

  if (loading) {
    return (
      <div className="interview-result-page">

        <div className="performance-container">

          <div className="performance-loading">

            <h2>
              Loading Interview Result...
            </h2>

            <p>
              Please wait while we load your
              interview result.
            </p>

          </div>

        </div>

      </div>
    );
  }

  // -----------------------------
  // ERROR
  // -----------------------------

  if (error) {
    return (
      <div className="interview-result-page">

        <header className="performance-header">

          <div>

            <h1>InterAI</h1>

            <p>
              AI-Powered Interview Preparation
            </p>

          </div>

          <button
            onClick={() =>
              navigate("/performance")
            }
          >
            ← Performance
          </button>

        </header>

        <main className="performance-container">

          <div className="performance-error">

            <h2>
              Unable to Load Result
            </h2>

            <p>{error}</p>

            <button
              onClick={() =>
                fetchInterviewResult(interviewId)
              }
            >
              Try Again
            </button>

            <button
              onClick={() =>
                navigate("/performance")
              }
            >
              ← Back to Performance
            </button>

          </div>

        </main>

      </div>
    );
  }

  // -----------------------------
  // NO RESULT
  // -----------------------------

  if (!interview) {
    return (
      <div className="interview-result-page">

        <header className="performance-header">

          <div>

            <h1>InterAI</h1>

            <p>
              AI-Powered Interview Preparation
            </p>

          </div>

          <button
            onClick={() =>
              navigate("/performance")
            }
          >
            ← Performance
          </button>

        </header>

        <main className="performance-container">

          <div className="performance-error">

            <h2>
              No Interview Result Found
            </h2>

            <button
              onClick={() =>
                navigate("/performance")
              }
            >
              ← Back to Performance
            </button>

          </div>

        </main>

      </div>
    );
  }

  const average =
    getAverageEvaluation();

  // -----------------------------
  // MAIN RESULT PAGE
  // -----------------------------

  return (
    <div className="interview-result-page">

      {/* Header */}

      <header className="performance-header">

        <div>

          <h1>InterAI</h1>

          <p>
            AI-Powered Interview Preparation
          </p>

        </div>

        <button
          onClick={() =>
            navigate("/performance")
          }
        >
          ← Performance
        </button>

      </header>

      {/* Main */}

      <main className="performance-container">

        {/* Title */}

        <section className="performance-title">

          <h2>
            Interview Result
          </h2>

          <p>
            Review your interview performance
            and AI-powered feedback.
          </p>

        </section>

        {/* Interview Summary */}

        <div className="result-summary-card">

          <h3>
            {interview.role}
          </h3>

          <p>
            <strong>
              Experience:
            </strong>{" "}
            {interview.experience}
          </p>

          <p>
            <strong>
              Difficulty:
            </strong>{" "}
            {interview.difficulty}
          </p>

          <p>
            <strong>
              Overall Score:
            </strong>{" "}
            {interview.overallScore}/10
          </p>

        </div>

        {/* PDF Download */}

        <div className="result-action-buttons">

          <button
            className="card-button"
            onClick={downloadReport}
          >
            📥 Download Interview Report
          </button>

          <button
            className="secondary-card-button"
            onClick={() =>
              navigate("/performance")
            }
          >
            ← Back to Performance
          </button>

        </div>

        {/* Performance Breakdown */}

        <section className="result-card">

          <h3>
            📊 Performance Breakdown
          </h3>

          <div className="resume-score-breakdown">

            {/* Overall */}

            <div className="score-breakdown-item">

              <div className="breakdown-header">

                <span>
                  Overall Evaluation
                </span>

                <strong>
                  {average.score}/10
                </strong>

              </div>

              <div className="score-progress">

                <div
                  className="score-progress-fill"
                  style={{
                    width: `${Math.min(
                      Number(
                        average.score
                      ) * 10,
                      100
                    )}%`,
                  }}
                />

              </div>

            </div>

            {/* Correctness */}

            <div className="score-breakdown-item">

              <div className="breakdown-header">

                <span>
                  Correctness
                </span>

                <strong>
                  {average.correctness}/10
                </strong>

              </div>

              <div className="score-progress">

                <div
                  className="score-progress-fill"
                  style={{
                    width: `${Math.min(
                      Number(
                        average.correctness
                      ) * 10,
                      100
                    )}%`,
                  }}
                />

              </div>

            </div>

            {/* Technical Quality */}

            <div className="score-breakdown-item">

              <div className="breakdown-header">

                <span>
                  Technical Quality
                </span>

                <strong>
                  {average.technicalQuality}/10
                </strong>

              </div>

              <div className="score-progress">

                <div
                  className="score-progress-fill"
                  style={{
                    width: `${Math.min(
                      Number(
                        average.technicalQuality
                      ) * 10,
                      100
                    )}%`,
                  }}
                />

              </div>

            </div>

            {/* Communication */}

            <div className="score-breakdown-item">

              <div className="breakdown-header">

                <span>
                  Communication
                </span>

                <strong>
                  {average.communication}/10
                </strong>

              </div>

              <div className="score-progress">

                <div
                  className="score-progress-fill"
                  style={{
                    width: `${Math.min(
                      Number(
                        average.communication
                      ) * 10,
                      100
                    )}%`,
                  }}
                />

              </div>

            </div>

          </div>

        </section>

        {/* Questions */}

        <h2>
          Interview Questions & Evaluation
        </h2>

        {interview.questions?.map(
          (item, index) => {

            const evaluation =
              item.evaluation;

            return (
              <div
                className="question-card"
                key={index}
              >

                <h3>
                  Question {index + 1}
                </h3>

                <p>
                  <strong>
                    {item.question}
                  </strong>
                </p>

                <p>
                  <strong>
                    Topic:
                  </strong>{" "}
                  {item.topic}
                </p>

                {/* Answer */}

                <h4>
                  Your Answer
                </h4>

                <p>
                  {item.answer ||
                    "No answer provided"}
                </p>

                {/* Evaluation */}

                {evaluation && (
                  <div className="evaluation-card">

                    <h3>
                      🤖 AI Evaluation
                    </h3>

                    <p>
                      <strong>
                        Score:
                      </strong>{" "}
                      {evaluation.score}/10
                    </p>

                    <p>
                      <strong>
                        Correctness:
                      </strong>{" "}
                      {evaluation.correctness}/10
                    </p>

                    <p>
                      <strong>
                        Technical Quality:
                      </strong>{" "}
                      {evaluation.technicalQuality}/10
                    </p>

                    <p>
                      <strong>
                        Communication:
                      </strong>{" "}
                      {evaluation.communication}/10
                    </p>

                    {/* Feedback */}

                    <h4>
                      💬 Feedback
                    </h4>

                    <p>
                      {evaluation.feedback ||
                        "No feedback available."}
                    </p>

                    {/* Suggestions */}

                    <h4>
                      💡 Suggestions for Improvement
                    </h4>

                    <p>
                      {evaluation.suggestions ||
                        "No suggestions available."}
                    </p>

                  </div>
                )}

              </div>
            );
          }
        )}

        {/* Bottom Buttons */}

        <div className="result-action-buttons">

          <button
            className="card-button"
            onClick={downloadReport}
          >
            📥 Download Interview Report
          </button>

          <button
            className="secondary-card-button"
            onClick={() =>
              navigate("/performance")
            }
          >
            ← Back to Performance
          </button>

        </div>

      </main>

    </div>
  );
}

export default InterviewResult;