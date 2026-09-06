import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function Performance() {
  const navigate = useNavigate();

  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters
  const [selectedRole, setSelectedRole] = useState("All Roles");
  const [selectedDifficulty, setSelectedDifficulty] =
    useState("All Difficulties");

  useEffect(() => {
    loadInterviewHistory();
  }, []);

  const loadInterviewHistory = async () => {
    try {
      setLoading(true);
      setError("");

      const userId = localStorage.getItem("userId");

      if (!userId || userId === "undefined" || userId === "null") {
        setError("User ID not found. Please login again.");
        setLoading(false);
        return;
      }

      const url = `http://localhost:5000/api/interviews/history/${userId}`;

      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to fetch interview history"
        );
      }

      setInterviews(data.interviews || []);
    } catch (error) {
      console.error("Interview history error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Average score
  const getAverageScore = () => {
    if (interviews.length === 0) return "0.0";

    const total = interviews.reduce(
      (sum, interview) =>
        sum + Number(interview.overallScore || 0),
      0
    );

    return (total / interviews.length).toFixed(1);
  };

  // Best score
  const getBestScore = () => {
    if (interviews.length === 0) return "0.0";

    return Math.max(
      ...interviews.map((interview) =>
        Number(interview.overallScore || 0)
      )
    ).toFixed(1);
  };

  // Lowest score
  const getLowestScore = () => {
    if (interviews.length === 0) return "0.0";

    return Math.min(
      ...interviews.map((interview) =>
        Number(interview.overallScore || 0)
      )
    ).toFixed(1);
  };

  // First interview score
  const getFirstScore = () => {
    if (interviews.length === 0) return "0.0";

    const orderedInterviews = [...interviews].reverse();

    return Number(
      orderedInterviews[0]?.overallScore || 0
    ).toFixed(1);
  };

  // Latest interview score
  const getLatestScore = () => {
    if (interviews.length === 0) return "0.0";

    return Number(
      interviews[0]?.overallScore || 0
    ).toFixed(1);
  };

  // Improvement
  const getImprovement = () => {
    if (interviews.length < 2) return "0.0";

    const first = Number(
      [...interviews].reverse()[0]?.overallScore || 0
    );

    const latest = Number(
      interviews[0]?.overallScore || 0
    );

    return (latest - first).toFixed(1);
  };

  // Improvement percentage
  const getImprovementPercentage = () => {
    if (interviews.length < 2) return "0.0";

    const first = Number(
      [...interviews].reverse()[0]?.overallScore || 0
    );

    const latest = Number(
      interviews[0]?.overallScore || 0
    );

    if (first === 0) return "0.0";

    return (((latest - first) / first) * 100).toFixed(1);
  };

  const formatDate = (date) => {
    if (!date) return "Unknown";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Get unique roles
  const roles = useMemo(() => {
    const uniqueRoles = interviews
      .map((interview) => interview.role)
      .filter(Boolean);

    return ["All Roles", ...new Set(uniqueRoles)];
  }, [interviews]);

  // Get unique difficulties
  const difficulties = useMemo(() => {
    const uniqueDifficulties = interviews
      .map((interview) => interview.difficulty)
      .filter(Boolean);

    return ["All Difficulties", ...new Set(uniqueDifficulties)];
  }, [interviews]);

  // Filter interviews
  const filteredInterviews = useMemo(() => {
    return interviews.filter((interview) => {
      const roleMatches =
        selectedRole === "All Roles" ||
        interview.role === selectedRole;

      const difficultyMatches =
        selectedDifficulty === "All Difficulties" ||
        interview.difficulty === selectedDifficulty;

      return roleMatches && difficultyMatches;
    });
  }, [interviews, selectedRole, selectedDifficulty]);

  // Chart data
  const getChartData = () => {
    return [...interviews]
      .reverse()
      .map((interview, index) => ({
        name: `Interview ${index + 1}`,
        score: Number(interview.overallScore || 0),
      }));
  };

  // Highest scoring interview
  const getHighestInterview = () => {
    if (interviews.length === 0) return null;

    return interviews.reduce((best, current) => {
      return Number(current.overallScore || 0) >
        Number(best.overallScore || 0)
        ? current
        : best;
    });
  };

  // Lowest scoring interview
  const getLowestInterview = () => {
    if (interviews.length === 0) return null;

    return interviews.reduce((lowest, current) => {
      return Number(current.overallScore || 0) <
        Number(lowest.overallScore || 0)
        ? current
        : lowest;
    });
  };

  // View complete interview result
  const handleViewDetails = (interview) => {
    if (!interview || !interview._id) {
      console.error("Interview ID is missing:", interview);
      return;
    }

    console.log("Opening interview:", interview._id);

    navigate(`/interview-result/${interview._id}`);
  };

  const highestInterview = getHighestInterview();
  const lowestInterview = getLowestInterview();

  if (loading) {
    return (
      <div className="performance-page">
        <div className="performance-container">
          <div className="performance-loading">
            <h2>Performance Dashboard</h2>
            <p>Loading your interview history...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="performance-page">

      {/* Header */}
      <header className="performance-header">
        <div>
          <h1>InterAI</h1>
          <p>AI-Powered Interview Preparation</p>
        </div>

        <button onClick={() => navigate("/dashboard")}>
          ← Dashboard
        </button>
      </header>

      <main className="performance-container">

        {/* Title */}
        <section className="performance-title">
          <h2>Performance Dashboard</h2>

          <p>
            Track your AI interview performance and improvement.
          </p>
        </section>

        {/* Error */}
        {error && (
          <div className="performance-error">
            <p>{error}</p>

            <button onClick={loadInterviewHistory}>
              Try Again
            </button>
          </div>
        )}

        {!error && (
          <>

            {/* Statistics */}
            <section className="performance-stats">

              <div className="performance-stat-card">
                <span className="stat-icon">🎯</span>

                <h3>{interviews.length}</h3>

                <p>Total Interviews</p>
              </div>

              <div className="performance-stat-card">
                <span className="stat-icon">📊</span>

                <h3>{getAverageScore()}/10</h3>

                <p>Average Score</p>
              </div>

              <div className="performance-stat-card">
                <span className="stat-icon">🏆</span>

                <h3>{getBestScore()}/10</h3>

                <p>Best Score</p>
              </div>

            </section>

            {/* Interview Analytics */}
            {interviews.length > 0 && (
              <section className="performance-chart-card">

                <div className="chart-heading">
                  <h2>📈 Interview Analytics</h2>

                  <p>
                    Understand your interview performance and
                    improvement over time.
                  </p>
                </div>

                <div className="performance-stats">

                  {/* First Score */}
                  <div className="performance-stat-card">
                    <span className="stat-icon">🚀</span>

                    <h3>
                      {getFirstScore()}/10
                    </h3>

                    <p>First Interview</p>
                  </div>

                  {/* Latest Score */}
                  <div className="performance-stat-card">
                    <span className="stat-icon">⭐</span>

                    <h3>
                      {getLatestScore()}/10
                    </h3>

                    <p>Latest Interview</p>
                  </div>

                  {/* Improvement */}
                  <div className="performance-stat-card">
                    <span className="stat-icon">
                      📈
                    </span>

                    <h3>
                      {Number(getImprovement()) > 0
                        ? `+${getImprovement()}`
                        : getImprovement()}
                    </h3>

                    <p>Score Improvement</p>
                  </div>

                  {/* Improvement Percentage */}
                  <div className="performance-stat-card">
                    <span className="stat-icon">
                      💯
                    </span>

                    <h3>
                      {Number(
                        getImprovementPercentage()
                      ) > 0
                        ? `+${getImprovementPercentage()}%`
                        : `${getImprovementPercentage()}%`}
                    </h3>

                    <p>Improvement Percentage</p>
                  </div>

                  {/* Lowest Score */}
                  <div className="performance-stat-card">
                    <span className="stat-icon">
                      ⚠️
                    </span>

                    <h3>
                      {getLowestScore()}/10
                    </h3>

                    <p>Lowest Score</p>
                  </div>

                </div>

                {/* Strongest / Weakest */}
                <div className="history-section">

                  <div className="interview-history-list">

                    {highestInterview && (
                      <div className="interview-history-card">

                        <div className="interview-info">
                          <h3>
                            🏆 Strongest Interview
                          </h3>

                          <div className="interview-details">
                            <span>
                              <strong>Role:</strong>{" "}
                              {highestInterview.role}
                            </span>

                            <span>
                              <strong>Date:</strong>{" "}
                              {formatDate(
                                highestInterview.createdAt
                              )}
                            </span>
                          </div>
                        </div>

                        <div className="interview-score">

                          <span>Best Score</span>

                          <strong>
                            {highestInterview.overallScore}/10
                          </strong>

                        </div>

                      </div>
                    )}

                    {lowestInterview &&
                      interviews.length > 1 && (
                        <div className="interview-history-card">

                          <div className="interview-info">
                            <h3>
                              ⚠️ Interview Needing Improvement
                            </h3>

                            <div className="interview-details">
                              <span>
                                <strong>Role:</strong>{" "}
                                {lowestInterview.role}
                              </span>

                              <span>
                                <strong>Date:</strong>{" "}
                                {formatDate(
                                  lowestInterview.createdAt
                                )}
                              </span>
                            </div>
                          </div>

                          <div className="interview-score">

                            <span>Lowest Score</span>

                            <strong>
                              {lowestInterview.overallScore}/10
                            </strong>

                          </div>

                        </div>
                      )}

                  </div>

                </div>

              </section>
            )}

            {/* Score Progress Chart */}
            {interviews.length > 0 && (
              <section className="performance-chart-card">

                <div className="chart-heading">
                  <h2>📊 Score Progress</h2>

                  <p>
                    Track how your interview scores have changed
                    over time.
                  </p>
                </div>

                <div className="performance-chart">

                  <ResponsiveContainer
                    width="100%"
                    height={320}
                  >

                    <LineChart
                      data={getChartData()}
                      margin={{
                        top: 20,
                        right: 20,
                        left: 0,
                        bottom: 10,
                      }}
                    >

                      <CartesianGrid
                        strokeDasharray="3 3"
                      />

                      <XAxis
                        dataKey="name"
                      />

                      <YAxis
                        domain={[0, 10]}
                        allowDecimals={false}
                      />

                      <Tooltip />

                      <Line
                        type="monotone"
                        dataKey="score"
                        stroke="#4f46e5"
                        strokeWidth={3}
                        dot={{
                          r: 5,
                        }}
                        activeDot={{
                          r: 7,
                        }}
                      />

                    </LineChart>

                  </ResponsiveContainer>

                </div>

              </section>
            )}

            {/* Interview History */}
            <section className="history-section">

              <div className="history-heading">
                <h2>Interview History</h2>

                <p>
                  Review your previous AI interview attempts.
                </p>
              </div>

              {/* Filters */}
              {interviews.length > 0 && (
                <div
                  className="interview-filters"
                  style={{
                    display: "flex",
                    gap: "15px",
                    marginBottom: "25px",
                    flexWrap: "wrap",
                  }}
                >

                  <select
                    value={selectedRole}
                    onChange={(e) =>
                      setSelectedRole(e.target.value)
                    }
                    style={{
                      padding: "10px 14px",
                      borderRadius: "8px",
                      border: "1px solid #d1d5db",
                      fontSize: "14px",
                      background: "#ffffff",
                      cursor: "pointer",
                    }}
                  >
                    {roles.map((role) => (
                      <option
                        key={role}
                        value={role}
                      >
                        {role}
                      </option>
                    ))}
                  </select>

                  <select
                    value={selectedDifficulty}
                    onChange={(e) =>
                      setSelectedDifficulty(e.target.value)
                    }
                    style={{
                      padding: "10px 14px",
                      borderRadius: "8px",
                      border: "1px solid #d1d5db",
                      fontSize: "14px",
                      background: "#ffffff",
                      cursor: "pointer",
                    }}
                  >
                    {difficulties.map((difficulty) => (
                      <option
                        key={difficulty}
                        value={difficulty}
                      >
                        {difficulty}
                      </option>
                    ))}
                  </select>

                  {(selectedRole !== "All Roles" ||
                    selectedDifficulty !==
                      "All Difficulties") && (
                    <button
                      onClick={() => {
                        setSelectedRole("All Roles");
                        setSelectedDifficulty(
                          "All Difficulties"
                        );
                      }}
                    >
                      Clear Filters
                    </button>
                  )}

                </div>
              )}

              {interviews.length === 0 ? (

                <div className="empty-performance">

                  <div className="empty-performance-icon">
                    📋
                  </div>

                  <h3>No Interviews Yet</h3>

                  <p>
                    You haven't completed any interviews yet.
                  </p>

                  <button
                    onClick={() => navigate("/interview")}
                  >
                    Start Your First Interview
                  </button>

                </div>

              ) : filteredInterviews.length === 0 ? (

                <div className="empty-performance">

                  <div className="empty-performance-icon">
                    🔍
                  </div>

                  <h3>No Matching Interviews</h3>

                  <p>
                    No interviews match your selected
                    filters.
                  </p>

                  <button
                    onClick={() => {
                      setSelectedRole("All Roles");
                      setSelectedDifficulty(
                        "All Difficulties"
                      );
                    }}
                  >
                    Clear Filters
                  </button>

                </div>

              ) : (

                <div className="interview-history-list">

                  {filteredInterviews.map((interview) => (

                    <div
                      className="interview-history-card"
                      key={interview._id}
                    >

                      <div className="interview-info">

                        <h3>
                          {interview.role}
                        </h3>

                        <div className="interview-details">

                          <span>
                            <strong>Experience:</strong>{" "}
                            {interview.experience}
                          </span>

                          <span>
                            <strong>Difficulty:</strong>{" "}
                            {interview.difficulty}
                          </span>

                          <span>
                            <strong>Date:</strong>{" "}
                            {formatDate(
                              interview.createdAt
                            )}
                          </span>

                        </div>

                      </div>

                      <div className="interview-score">

                        <span>Score</span>

                        <strong>
                          {interview.overallScore}/10
                        </strong>

                        <button
                          className="view-details-button"
                          onClick={() =>
                            handleViewDetails(interview)
                          }
                        >
                          View Details
                        </button>

                      </div>

                    </div>

                  ))}

                </div>

              )}

            </section>

            {/* Back Button */}
            <button
              className="performance-back-button"
              onClick={() => navigate("/dashboard")}
            >
              ← Back to Dashboard
            </button>

          </>
        )}

      </main>
    </div>
  );
}

export default Performance;