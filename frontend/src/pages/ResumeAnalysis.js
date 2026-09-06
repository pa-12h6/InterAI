import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";

function ResumeAnalysis() {
  const navigate = useNavigate();

  const [file, setFile] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [jobDescription, setJobDescription] = useState("");

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];

    if (!selectedFile) return;

    setFile(selectedFile);
    setAnalysis(null);
    setMessage("");
  };

  const handleAnalyze = async () => {
    if (!file) {
      setMessage("Please select a resume first.");
      return;
    }

    const userId = localStorage.getItem("userId");

    if (!userId || userId === "undefined" || userId === "null") {
      setMessage("Please login again.");
      return;
    }

    setLoading(true);
    setMessage("");
    setAnalysis(null);

    try {
      const formData = new FormData();
      formData.append("resume", file);

      const analyzeResponse = await fetch(
        "http://localhost:5000/api/resumes/analyze",
        {
          method: "POST",
          body: formData,
        }
      );

      const analyzeData = await analyzeResponse.json();

      if (!analyzeResponse.ok) {
        throw new Error(
          analyzeData.message || "Resume analysis failed"
        );
      }

      const result = analyzeData.analysis;

      setAnalysis(result);

      const saveResponse = await fetch(
        "http://localhost:5000/api/resumes/save",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user: userId,
            fileName: file.name,
            analysis: JSON.stringify(result),
            score: result.score,
          }),
        }
      );

      const saveData = await saveResponse.json();

      if (!saveResponse.ok) {
        throw new Error(
          saveData.message || "Failed to save resume analysis"
        );
      }

      setMessage("Resume analyzed and saved successfully!");
    } catch (error) {
      console.error("Resume Analysis Error:", error);
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="resume-page">

      {/* Header */}
      <header className="resume-header">
        <div>
          <h1>InterAI</h1>
          <p>AI-Powered Resume Analysis</p>
        </div>

        <button onClick={() => navigate("/dashboard")}>
          ← Dashboard
        </button>
      </header>

      <main className="resume-container">

        {/* Title */}
        <section className="resume-title">
          <h2>Resume Analysis</h2>

          <p>
            Upload your resume and get AI-powered feedback
            to improve your job readiness.
          </p>
        </section>

        {/* Upload Card */}
        <section className="upload-card">

          <div className="upload-icon">
            📄
          </div>

          <h3>Upload Your Resume</h3>

          <p>
            Supported formats: PDF and DOCX
          </p>

          <input
            id="resume-upload"
            type="file"
            accept=".pdf,.docx"
            onChange={handleFileChange}
          />

          {file && (
            <div className="selected-file">
              <span>📎</span>
              <strong>{file.name}</strong>
            </div>
          )}

          {/* Job Description */}
          <div className="job-description-section">

            <h3>💼 Job Description</h3>

            <p>
              Paste the job description to compare it with your resume.
            </p>

            <textarea
              className="job-description-input"
              placeholder="Paste the job description here..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              rows={8}
            />

          </div>

          <button
            className="analyze-button"
            onClick={handleAnalyze}
            disabled={loading}
          >
            {loading
              ? "🤖 Analyzing with AI..."
              : "✨ Analyze Resume"}
          </button>

          {message && (
            <p className="resume-message">
              {message}
            </p>
          )}

        </section>

        {/* Analysis Results */}
        {analysis && (
          <section className="results-section">

            {/* Score */}
            <div className="score-card">

              <div>
                <p>Resume Score</p>

                <h2>
                  {analysis.score}/100
                </h2>
              </div>

              <div className="score-text">
                {analysis.score >= 80
                  ? "Excellent"
                  : analysis.score >= 60
                  ? "Good"
                  : "Needs Improvement"}
              </div>

            </div>

            {/* Score Breakdown */}
            {analysis.breakdown && (
              <div className="result-card">

                <h3>📊 Resume Score Breakdown</h3>

                <div className="resume-score-breakdown">

                  {Object.entries(analysis.breakdown).map(
                    ([key, value]) => {

                      const formattedName = key
                        .replace(/([A-Z])/g, " $1")
                        .replace(/^./, (str) =>
                          str.toUpperCase()
                        );

                      return (
                        <div
                          className="score-breakdown-item"
                          key={key}
                        >

                          <div className="breakdown-header">

                            <span>
                              {formattedName}
                            </span>

                            <strong>
                              {value}/100
                            </strong>

                          </div>

                          <div className="score-progress">

                            <div
                              className="score-progress-fill"
                              style={{
                                width: `${Math.min(
                                  Math.max(
                                    Number(value) || 0,
                                    0
                                  ),
                                  100
                                )}%`,
                              }}
                            />

                          </div>

                        </div>
                      );
                    }
                  )}

                </div>

              </div>
            )}

            {/* Summary */}
            <div className="result-card">

              <h3>📋 Overall Assessment</h3>

              <p>
                {analysis.summary}
              </p>

            </div>

            {/* Strengths */}
            <div className="result-card">

              <h3>💪 Strengths</h3>

              <ul>
                {analysis.strengths?.map(
                  (item, index) => (
                    <li key={index}>
                      {item}
                    </li>
                  )
                )}
              </ul>

            </div>

            {/* Weaknesses */}
            <div className="result-card">

              <h3>⚠️ Areas to Improve</h3>

              <ul>
                {analysis.weaknesses?.map(
                  (item, index) => (
                    <li key={index}>
                      {item}
                    </li>
                  )
                )}
              </ul>

            </div>

            {/* Skills */}
            <div className="result-card">

              <h3>🛠️ Skills Detected</h3>

              <div className="skills-container">

                {analysis.skills?.map(
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

            </div>

            {/* Suggestions */}
            <div className="result-card">

              <h3>💡 Improvement Suggestions</h3>

              <ul>
                {analysis.suggestions?.map(
                  (item, index) => (
                    <li key={index}>
                      {item}
                    </li>
                  )
                )}
              </ul>

            </div>

          </section>
        )}

      </main>

    </div>
  );
}

export default ResumeAnalysis;