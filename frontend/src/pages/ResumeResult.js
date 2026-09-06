import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../App.css";

function ResumeResult() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const fetchResumeResult = useCallback(async () => {
    try {
      setLoading(true);
      setMessage("");

      console.log("Resume ID from URL:", id);

      if (!id) {
        setMessage("Resume ID not found.");
        setLoading(false);
        return;
      }

      // FIXED API URL
      const response = await fetch(
        `http://localhost:5000/api/resumes/${id}`
      );

      const data = await response.json();

      console.log("Resume Result Response:", data);

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to fetch resume result"
        );
      }

      setResume(data.resume);
    } catch (error) {
      console.error("Resume Result Error:", error);
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchResumeResult();
  }, [fetchResumeResult]);

  // -----------------------------
  // LOADING
  // -----------------------------

  if (loading) {
    return (
      <div className="resume-page">
        <header className="resume-header">
          <div>
            <h1>InterAI</h1>
            <p>AI-Powered Resume Analysis</p>
          </div>

          <button onClick={() => navigate("/resume-history")}>
            ← Resume History
          </button>
        </header>

        <main className="resume-container">
          <div className="history-message">
            Loading resume result...
          </div>
        </main>
      </div>
    );
  }

  // -----------------------------
  // ERROR
  // -----------------------------

  if (message) {
    return (
      <div className="resume-page">
        <header className="resume-header">
          <div>
            <h1>InterAI</h1>
            <p>AI-Powered Resume Analysis</p>
          </div>

          <button onClick={() => navigate("/resume-history")}>
            ← Resume History
          </button>
        </header>

        <main className="resume-container">
          <div className="history-message">
            <h3>Unable to Load Resume Result</h3>

            <p>{message}</p>

            <button onClick={fetchResumeResult}>
              Try Again
            </button>

            <button
              onClick={() => navigate("/resume-history")}
            >
              ← Back to Resume History
            </button>
          </div>
        </main>
      </div>
    );
  }

  // -----------------------------
  // NO RESULT
  // -----------------------------

  if (!resume) {
    return (
      <div className="resume-page">
        <header className="resume-header">
          <div>
            <h1>InterAI</h1>
            <p>AI-Powered Resume Analysis</p>
          </div>

          <button onClick={() => navigate("/resume-history")}>
            ← Resume History
          </button>
        </header>

        <main className="resume-container">
          <div className="history-message">
            <h3>No Resume Result Found</h3>

            <button
            onClick={() => navigate("/resume-history")}
            >
              ← Back to Resume History
            </button>
          </div>
        </main>
      </div>
    );
  }

  // -----------------------------
  // PARSE ANALYSIS
  // -----------------------------

  let analysis = resume.analysis;

  if (typeof analysis === "string") {
    try {
      analysis = JSON.parse(analysis);
    } catch (error) {
      console.error("Analysis JSON Parse Error:", error);
    }
  }

  // -----------------------------
  // SCORE
  // -----------------------------

  const resumeScore = Number(
    resume.score ?? analysis?.score ?? 0
  );

  // -----------------------------
  // HELPERS
  // -----------------------------

  const formatKey = (key) => {
    return key
      .replace(/([A-Z])/g, " $1")
      .replace(/[_-]/g, " ")
      .replace(/^./, (str) => str.toUpperCase());
  };

  const renderList = (items) => {
    if (!Array.isArray(items)) {
      return null;
    }

    return (
      <ul>
        {items.map((item, index) => (
          <li key={index}>
            {typeof item === "object"
              ? JSON.stringify(item)
              : item}
          </li>
        ))}
      </ul>
    );
  };

  // -----------------------------
  // MAIN RESULT
  // -----------------------------

  return (
    <div className="resume-page">

      {/* HEADER */}

      <header className="resume-header">
        <div>
          <h1>InterAI</h1>
          <p>AI-Powered Resume Analysis</p>
        </div>

        <button
          onClick={() => navigate("/resume-history")}
        >
          ← Resume History
        </button>
      </header>

      {/* MAIN */}

      <main className="resume-container">

        {/* TITLE */}

        <section className="resume-title">
          <h2>Resume Analysis Result</h2>

          <p>
            Complete AI-powered analysis of your resume.
          </p>
        </section>

        {/* RESUME INFORMATION */}

        <section className="result-card">
          <h3>📄 Resume Information</h3>

          <p>
            <strong>File Name:</strong>{" "}
            {resume.fileName || "Resume"}
          </p>

          <p>
            <strong>Analyzed On:</strong>{" "}
            {resume.createdAt
              ? new Date(
                  resume.createdAt
                ).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })
              : "Unknown"}
          </p>
        </section>

        {/* SCORE */}

        <section className="score-card">
          <div>
            <p>Resume Score</p>

            <h2>
              {resumeScore}/100
            </h2>
          </div>

          <div className="score-text">
            {resumeScore >= 80
              ? "Excellent"
              : resumeScore >= 60
              ? "Good"
              : "Needs Improvement"}
          </div>
        </section>

        {/* SCORE BREAKDOWN */}

        {analysis?.breakdown &&
          typeof analysis.breakdown === "object" && (
            <section className="result-card">
              <h3>
                📊 Resume Score Breakdown
              </h3>

              <div className="resume-score-breakdown">
                {Object.entries(
                  analysis.breakdown
                ).map(([key, value]) => {
                  const numericValue =
                    Number(value) || 0;

                  const safeValue = Math.min(
                    Math.max(numericValue, 0),
                    100
                  );

                  return (
                    <div
                      className="score-breakdown-item"
                      key={key}
                    >
                      <div className="breakdown-header">
                        <span>
                          {formatKey(key)}
                        </span>

                        <strong>
                          {numericValue}/100
                        </strong>
                      </div>

                      <div className="score-progress">
                        <div
                          className="score-progress-fill"
                          style={{
                            width: `${safeValue}%`,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

        {/* SUMMARY */}

        {analysis?.summary && (
          <section className="result-card">
            <h3>
              📋 Overall Assessment
            </h3>

            <p>
              {analysis.summary}
            </p>
          </section>
        )}

        {/* STRENGTHS */}

        {analysis?.strengths && (
          <section className="result-card">
            <h3>
              💪 Strengths
            </h3>

            {renderList(analysis.strengths)}
          </section>
        )}

        {/* WEAKNESSES */}

        {analysis?.weaknesses && (
          <section className="result-card">
            <h3>
              ⚠️ Areas to Improve
            </h3>

            {renderList(analysis.weaknesses)}
          </section>
        )}

        {/* SKILLS */}

        {analysis?.skills && (
          <section className="result-card">
            <h3>
              🛠️ Skills Detected
            </h3>

            <div className="skills-container">
              {Array.isArray(analysis.skills) &&
                analysis.skills.map(
                  (skill, index) => (
                    <span
                      className="skill-tag"
                      key={index}
                    >
                      {skill}
                    </span>
                  )
                )}
            </div>
          </section>
        )}

        {/* SUGGESTIONS */}

        {analysis?.suggestions && (
          <section className="result-card">
            <h3>
              💡 Improvement Suggestions
            </h3>

            {renderList(analysis.suggestions)}
          </section>
        )}

        {/* OTHER ANALYSIS FIELDS */}

        {analysis &&
          typeof analysis === "object" &&
          Object.entries(analysis)
            .filter(
              ([key]) =>
                ![
                  "score",
                  "breakdown",
                  "summary",
                  "strengths",
                  "weaknesses",
                  "skills",
                  "suggestions",
                ].includes(key)
            )
            .map(([key, value]) => {
              if (
                value === null ||
                value === undefined ||
                value === ""
              ) {
                return null;
              }

              return (
                <section
                  className="result-card"
                  key={key}
                >
                  <h3>
                    {formatKey(key)}
                  </h3>

                  {Array.isArray(value) ? (
                    renderList(value)
                  ) : (
                    <p>
                      {typeof value === "object"
                        ? JSON.stringify(value)
                        : value}
                    </p>
                  )}
                </section>
              );
            })}

        {/* BACK BUTTON */}

        <button
          onClick={() =>
            navigate("/resume-history")
          }
        >
          ← Back to Resume History
        </button>

      </main>
    </div>
  );
}

export default ResumeResult;