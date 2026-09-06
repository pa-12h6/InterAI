import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function ResumeHistory() {
  const navigate = useNavigate();

  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchResumeHistory();
  }, []);

  const fetchResumeHistory = async () => {
    try {
      const userId = localStorage.getItem("userId");

      if (!userId) {
        setMessage("Please login again.");
        setLoading(false);
        return;
      }

      const response = await fetch(
        `http://localhost:5000/api/resumes/history/${userId}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load resume history"
        );
      }

      setResumes(data.resumes || []);
    } catch (error) {
      console.error("Resume History Error:", error);
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  // View complete resume analysis
  const handleViewDetails = (resume) => {
    navigate(`/resume-result/${resume._id}`);
  };

  return (
    <div className="resume-history-page">

      {/* Header */}
      <header className="resume-header">

        <div>
          <h1>InterAI</h1>

          <p>
            AI-Powered Resume Analysis
          </p>
        </div>

        <button
          onClick={() => navigate("/dashboard")}
        >
          ← Dashboard
        </button>

      </header>


      <main className="resume-history-container">

        {/* Title */}
        <div className="history-title">

          <h2>Resume History</h2>

          <p>
            View your previous resume analyses and scores.
          </p>

        </div>


        {/* Loading */}
        {loading && (
          <div className="history-message">
            Loading resume history...
          </div>
        )}


        {/* Error */}
        {!loading && message && (
          <div className="history-message">
            {message}
          </div>
        )}


        {/* Empty History */}
        {!loading &&
          !message &&
          resumes.length === 0 && (

            <div className="empty-history">

              <div className="empty-icon">
                📄
              </div>

              <h3>
                No Resume History
              </h3>

              <p>
                You haven't analyzed a resume yet.
              </p>

              <button
                onClick={() =>
                  navigate("/resume-analysis")
                }
              >
                Analyze Resume
              </button>

            </div>
          )}


        {/* Resume History List */}
        {!loading &&
          resumes.length > 0 && (

            <div className="history-list">

              {resumes.map((resume) => (

                <div
                  className="history-card"
                  key={resume._id}
                >

                  {/* Resume Information */}
                  <div className="history-card-info">

                    <h3>
                      📄 {resume.fileName || "Resume"}
                    </h3>

                    <p>
                      Analyzed on{" "}

                      {resume.createdAt
                        ? new Date(
                            resume.createdAt
                          ).toLocaleDateString()
                        : "Unknown date"}
                    </p>

                  </div>


                  {/* Score + Button */}
                  <div className="history-score">

                    <span>
                      Score
                    </span>

                    <strong>
                      {resume.score ?? 0}/100
                    </strong>

                    <button
                      className="view-details-button"
                      onClick={() =>
                        handleViewDetails(resume)
                      }
                    >
                      View Details
                    </button>

                  </div>

                </div>

              ))}

            </div>
          )}

      </main>

    </div>
  );
}

export default ResumeHistory;