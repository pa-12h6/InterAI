import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";

function InterviewHistory() {
  const navigate = useNavigate();

  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchInterviewHistory();
  }, []);

  const fetchInterviewHistory = async () => {
    try {
      setLoading(true);
      setError("");

      const userId = localStorage.getItem("userId");

      if (
        !userId ||
        userId === "undefined" ||
        userId === "null"
      ) {
        throw new Error(
          "User ID not found. Please login again."
        );
      }

      const response = await fetch(
        `http://localhost:5000/api/interviews/history/${userId}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to fetch interview history"
        );
      }

      setInterviews(data.interviews || []);
    } catch (error) {
      console.error(
        "Interview History Error:",
        error
      );

      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return "Unknown";

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  const handleViewDetails = (interview) => {
    if (!interview?._id) {
      setError("Interview ID not found.");
      return;
    }

    navigate(
      `/interview-result/${interview._id}`
    );
  };

  if (loading) {
    return (
      <div className="interview-page">
        <header className="interview-header">
          <div>
            <h1>InterAI</h1>
            <p>
              AI-Powered Interview Preparation
            </p>
          </div>

          <button
            onClick={() =>
              navigate("/dashboard")
            }
          >
            ← Dashboard
          </button>
        </header>

        <main className="interview-container">
          <div className="performance-loading">
            <h2>Interview History</h2>

            <p>
              Loading your interview history...
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="interview-page">

      <header className="interview-header">

        <div>
          <h1>InterAI</h1>

          <p>
            AI-Powered Interview Preparation
          </p>
        </div>

        <button
          onClick={() =>
            navigate("/dashboard")
          }
        >
          ← Dashboard
        </button>

      </header>

      <main className="interview-container">

        <section className="performance-title">

          <h2>📋 Interview History</h2>

          <p>
            Review all your completed AI mock
            interviews and their results.
          </p>

        </section>

        {error && (
          <div className="performance-error">

            <p>{error}</p>

            <button
              onClick={fetchInterviewHistory}
            >
              Try Again
            </button>

          </div>
        )}

        {!error && interviews.length === 0 && (
          <div className="empty-performance">

            <div className="empty-performance-icon">
              📋
            </div>

            <h3>
              No Interviews Yet
            </h3>

            <p>
              You haven't completed any AI
              interviews yet.
            </p>

            <button
              onClick={() =>
                navigate("/interview")
              }
            >
              Start Your First Interview →
            </button>

          </div>
        )}

        {!error &&
          interviews.length > 0 && (
            <section className="history-section">

              <div className="history-heading">

                <h2>
                  Your Completed Interviews
                </h2>

                <p>
                  Total Interviews:{" "}
                  <strong>
                    {interviews.length}
                  </strong>
                </p>

              </div>

              <div className="interview-history-list">

                {interviews.map(
                  (interview, index) => (
                    <div
                      className="interview-history-card"
                      key={interview._id}
                    >

                      <div className="interview-info">

                        <h3>
                          {interview.role ||
                            "Interview"}
                        </h3>

                        <div className="interview-details">

                          <span>
                            <strong>
                              Experience:
                            </strong>{" "}
                            {interview.experience ||
                              "N/A"}
                          </span>

                          <span>
                            <strong>
                              Difficulty:
                            </strong>{" "}
                            {interview.difficulty ||
                              "N/A"}
                          </span>

                          <span>
                            <strong>
                              Date:
                            </strong>{" "}
                            {formatDate(
                              interview.createdAt
                            )}
                          </span>

                        </div>

                      </div>

                      <div className="interview-score">

                        <span>
                          Interview {index + 1}
                        </span>

                        <strong>
                          {Number(
                            interview.overallScore ||
                              0
                          ).toFixed(1)}
                          /10
                        </strong>

                        <button
                          className="view-details-button"
                          onClick={() =>
                            handleViewDetails(
                              interview
                            )
                          }
                        >
                          View Details
                        </button>

                      </div>

                    </div>
                  )
                )}

              </div>

            </section>
          )}

        <div className="interview-actions">

          <button
            className="primary-button"
            onClick={() =>
              navigate("/interview")
            }
          >
            Start New Interview
          </button>

          <button
            className="secondary-button"
            onClick={() =>
              navigate("/performance")
            }
          >
            📊 View Performance
          </button>

          <button
            className="secondary-button"
            onClick={() =>
              navigate("/dashboard")
            }
          >
            ← Back to Dashboard
          </button>

        </div>

      </main>
    </div>
  );
}

export default InterviewHistory;