import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));

  const [resumeStats, setResumeStats] = useState({
    total: 0,
    latest: 0,
    best: 0,
  });

  const [resumeLoading, setResumeLoading] = useState(true);

  useEffect(() => {
    fetchResumeStats();
  }, []);

  const fetchResumeStats = async () => {
    try {
      const userId = localStorage.getItem("userId");

      if (
        !userId ||
        userId === "undefined" ||
        userId === "null"
      ) {
        setResumeLoading(false);
        return;
      }

      const response = await fetch(
        `http://localhost:5000/api/resumes/history/${userId}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to fetch resume history"
        );
      }

      const resumes = data.resumes || [];

      if (resumes.length === 0) {
        setResumeStats({
          total: 0,
          latest: 0,
          best: 0,
        });

        return;
      }

      const scores = resumes.map((resume) =>
        Number(resume.score || 0)
      );

      setResumeStats({
        total: resumes.length,
        latest: Number(resumes[0].score || 0),
        best: Math.max(...scores),
      });
    } catch (error) {
      console.error(
        "Dashboard Resume Stats Error:",
        error
      );

      setResumeStats({
        total: 0,
        latest: 0,
        best: 0,
      });
    } finally {
      setResumeLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("userId");

    navigate("/login");
  };

  /* Resume recommendation */
  const getResumeRecommendation = () => {
    if (resumeStats.total === 0) {
      return {
        title: "Start With Your Resume",
        message:
          "Upload your resume and let InterAI analyze it to identify strengths and areas for improvement.",
        button: "Analyze Resume",
        action: () => navigate("/resume-analysis"),
      };
    }

    if (resumeStats.latest < 60) {
      return {
        title: "Your Resume Needs Improvement",
        message:
          "Your latest resume score is below 60. Focus on improving your skills, projects, achievements and resume structure.",
        button: "Improve Resume",
        action: () => navigate("/resume-analysis"),
      };
    }

    if (resumeStats.latest < 80) {
      return {
        title: "Your Resume Is Good",
        message:
          "Your resume has a good foundation. Strengthen your project descriptions, measurable achievements and job-specific keywords.",
        button: "Analyze Again",
        action: () => navigate("/resume-analysis"),
      };
    }

    return {
      title: "Excellent Resume Performance",
      message:
        "Your latest resume score is excellent. Now focus on practicing interviews and improving your communication.",
      button: "Start Interview",
      action: () => navigate("/interview"),
    };
  };

  const recommendation = getResumeRecommendation();

  return (
    <div className="dashboard">

      {/* Header */}
      <header className="dashboard-header">

        <div className="brand-section">

          <div className="brand-logo">
            AI
          </div>

          <div>

            <h1>
              InterAI
            </h1>

            <p>
              AI-Powered Interview Preparation
            </p>

          </div>

        </div>

        <button
          className="logout-button"
          onClick={handleLogout}
        >
          Logout
        </button>

      </header>

      {/* Main */}
      <main className="dashboard-content">

        {/* Welcome */}
        <section className="welcome-section">

          <div className="welcome-text">

            <span className="welcome-label">
              WELCOME TO INTERAI
            </span>

            <h2>
              Welcome, {user?.name || "User"} 👋
            </h2>

            <p>
              Practice interviews, improve your answers, and
              track your performance with AI-powered feedback.
            </p>

          </div>

          <div className="welcome-icon">
            🤖
          </div>

        </section>

        {/* Features */}
        <section className="dashboard-section">

          <div className="section-heading">

            <h2>
              What would you like to do?
            </h2>

            <p>
              Choose an option to continue your interview
              preparation.
            </p>

          </div>

          <div className="dashboard-cards">

            {/* Interview */}
            <div className="dashboard-card">

              <div className="card-icon">
                🎯
              </div>

              <div className="card-content">

                <h3>
                  Start Interview
                </h3>

                <p>
                  Take an AI-powered mock interview based on
                  your selected job role, experience and
                  difficulty.
                </p>

              </div>

              <button
                className="card-button"
                onClick={() =>
                  navigate("/interview")
                }
              >
                Start Interview →
              </button>

            </div>

            {/* Performance */}
            <div className="dashboard-card">

              <div className="card-icon">
                📊
              </div>

              <div className="card-content">

                <h3>
                  My Performance
                </h3>

                <p>
                  View your previous interview attempts,
                  scores and overall performance.
                </p>

              </div>

              {/* Performance + Interview History */}
              <div className="card-buttons">

                <button
                  className="card-button"
                  onClick={() => navigate("/performance")}
                >
                  View Performance →
                </button>

                <button
                  className="secondary-card-button"
                  onClick={() => navigate("/Interview-history")}
                >
                  📋 Interview History
                </button>

              </div>

            </div>

            {/* Resume */}
            <div className="dashboard-card">

              <div className="card-icon">
                📄
              </div>

              <div className="card-content">

                <h3>
                  Resume Analysis
                </h3>

                <p>
                  Upload your resume and get AI-powered
                  suggestions to improve it.
                </p>

              </div>

              <div className="card-buttons">

                <button
                  className="card-button"
                  onClick={() =>
                    navigate("/resume-analysis")
                  }
                >
                  Analyze Resume →
                </button>

                <button
                  className="secondary-card-button"
                  onClick={() =>
                    navigate("/resume-history")
                  }
                >
                  Resume History
                </button>

              </div>

            </div>

          </div>

        </section>

        {/* Resume Performance */}
        <section className="dashboard-section">

          <div className="section-heading">

            <h2>
              Resume Performance
            </h2>

            <p>
              Track your resume analysis results and improve
              your job readiness.
            </p>

          </div>

          <div className="dashboard-cards">

            {/* Total Resumes */}
            <div className="dashboard-card">

              <div className="card-icon">
                📄
              </div>

              <div className="card-content">

                <h3>
                  {resumeLoading
                    ? "..."
                    : resumeStats.total}
                </h3>

                <p>
                  Resumes Analyzed
                </p>

              </div>

            </div>

            {/* Latest Score */}
            <div className="dashboard-card">

              <div className="card-icon">
                📊
              </div>

              <div className="card-content">

                <h3>
                  {resumeLoading
                    ? "..."
                    : `${resumeStats.latest}/100`}
                </h3>

                <p>
                  Latest Resume Score
                </p>

              </div>

            </div>

            {/* Best Score */}
            <div className="dashboard-card">

              <div className="card-icon">
                🏆
              </div>

              <div className="card-content">

                <h3>
                  {resumeLoading
                    ? "..."
                    : `${resumeStats.best}/100`}
                </h3>

                <p>
                  Best Resume Score
                </p>

              </div>

            </div>

          </div>

          <div className="card-buttons">

            <button
              className="card-button"
              onClick={() =>
                navigate("/resume-analysis")
              }
            >
              Analyze New Resume →
            </button>

            <button
              className="secondary-card-button"
              onClick={() =>
                navigate("/resume-history")
              }
            >
              View Resume History
            </button>

          </div>

        </section>

        {/* AI Recommendation */}
        <section className="dashboard-section">

          <div className="section-heading">

            <h2>
              🤖 AI Recommendation
            </h2>

            <p>
              Personalized guidance based on your resume
              performance.
            </p>

          </div>

          <div className="dashboard-tip">

            <div className="tip-icon">
              💡
            </div>

            <div>

              <h3>
                {resumeLoading
                  ? "Analyzing your performance..."
                  : recommendation.title}
              </h3>

              <p>
                {resumeLoading
                  ? "Please wait while we check your latest resume performance."
                  : recommendation.message}
              </p>

              {!resumeLoading && (
                <button
                  className="card-button"
                  onClick={recommendation.action}
                >
                  {recommendation.button} →
                </button>
              )}

            </div>

          </div>

        </section>

        {/* Tip */}
        <section className="dashboard-tip">

          <div className="tip-icon">
            💡
          </div>

          <div>

            <h3>
              Interview Tip
            </h3>

            <p>
              Practice regularly and review your AI feedback
              after every interview to improve your confidence
              and technical communication.
            </p>

          </div>

        </section>

      </main>

    </div>
  );
}

export default Dashboard;