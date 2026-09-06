import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Interview() {
  const navigate = useNavigate();

  const [role, setRole] = useState("");
  const [experience, setExperience] = useState("");
  const [difficulty, setDifficulty] = useState("");

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [evaluations, setEvaluations] = useState([]);

  const [currentQuestion, setCurrentQuestion] = useState(0);

  const [loading, setLoading] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [saving, setSaving] = useState(false);

  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);

  const [error, setError] = useState("");

  // Interview timer
  const INTERVIEW_TIME = 10 * 60;
  const [timeLeft, setTimeLeft] = useState(INTERVIEW_TIME);

  // Generate interview questions
  const handleStart = async (e) => {
    e.preventDefault();

    if (!role || !experience || !difficulty) {
      setError("Please select all options.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        "http://localhost:5000/api/ai/generate-questions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            role,
            experience,
            difficulty,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to generate questions"
        );
      }

      setQuestions(data.questions);
      setAnswers(new Array(data.questions.length).fill(""));
      setEvaluations(new Array(data.questions.length).fill(null));

      setCurrentQuestion(0);

      // Start 10-minute timer
      setTimeLeft(INTERVIEW_TIME);

      setStarted(true);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Store answer
  const handleAnswerChange = (e) => {
    const updatedAnswers = [...answers];

    updatedAnswers[currentQuestion] = e.target.value;

    setAnswers(updatedAnswers);
  };

  // Evaluate current answer
  const handleEvaluate = async () => {
    const answer = answers[currentQuestion];

    if (!answer || !answer.trim()) {
      setError("Please write your answer before submitting.");
      return;
    }

    setEvaluating(true);
    setError("");

    try {
      const response = await fetch(
        "http://localhost:5000/api/ai/evaluate-answer",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            question: questions[currentQuestion].question,
            answer: answer,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to evaluate answer"
        );
      }

      const updatedEvaluations = [...evaluations];

      updatedEvaluations[currentQuestion] = data.evaluation;

      setEvaluations(updatedEvaluations);
    } catch (error) {
      setError(error.message);
    } finally {
      setEvaluating(false);
    }
  };

  // Finish interview and save result
  const handleFinishInterview = useCallback(async () => {
    if (saving || finished) {
      return;
    }

    setSaving(true);
    setError("");

    try {
      const userId = localStorage.getItem("userId");

      if (!userId) {
        throw new Error(
          "User ID not found. Please login again."
        );
      }

      const interviewQuestions = questions.map(
        (question, index) => ({
          question: question.question,
          topic: question.topic,
          answer: answers[index],
          evaluation: evaluations[index],
        })
      );

      const validScores = evaluations
        .filter(
          (evaluation) => evaluation !== null
        )
        .map((evaluation) =>
          Number(evaluation.score || 0)
        );

      const totalScore = validScores.reduce(
        (total, score) => total + score,
        0
      );

      const overallScore =
        validScores.length > 0
          ? Number(
              (
                totalScore / validScores.length
              ).toFixed(1)
            )
          : 0;

      const response = await fetch(
        "http://localhost:5000/api/interviews/save",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user: userId,
            role,
            experience,
            difficulty,
            questions: interviewQuestions,
            overallScore,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to save interview"
        );
      }

      setFinished(true);
    } catch (error) {
      setError(error.message);
    } finally {
      setSaving(false);
    }
  }, [
    answers,
    difficulty,
    evaluations,
    experience,
    finished,
    questions,
    role,
    saving,
  ]);

  // Timer finished
  const handleTimeUp = useCallback(async () => {
    if (saving || finished) {
      return;
    }

    setError(
      "Interview time is over. Your completed answers are being saved."
    );

    await handleFinishInterview();
  }, [finished, handleFinishInterview, saving]);

  // Interview timer
  useEffect(() => {
    if (!started || finished || saving) {
      return;
    }

    if (timeLeft <= 0) {
      handleTimeUp();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((previousTime) => previousTime - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [
    started,
    finished,
    saving,
    timeLeft,
    handleTimeUp,
  ]);

  // Format timer
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${String(minutes).padStart(
      2,
      "0"
    )}:${String(remainingSeconds).padStart(
      2,
      "0"
    )}`;
  };

  // Move to next question
  const handleNext = () => {
    if (!evaluations[currentQuestion]) {
      setError(
        "Please submit your answer for evaluation first."
      );
      return;
    }

    setError("");

    if (
      currentQuestion <
      questions.length - 1
    ) {
      setCurrentQuestion(
        currentQuestion + 1
      );
    }
  };

  // Previous question
  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(
        currentQuestion - 1
      );
      setError("");
    }
  };

  // Restart interview
  const handleRestart = () => {
    setQuestions([]);
    setAnswers([]);
    setEvaluations([]);

    setCurrentQuestion(0);

    setStarted(false);
    setFinished(false);

    setTimeLeft(INTERVIEW_TIME);

    setError("");
  };

  // Calculate overall score
  const calculateOverallScore = () => {
    const validEvaluations =
      evaluations.filter(
        (evaluation) => evaluation !== null
      );

    if (validEvaluations.length === 0) {
      return 0;
    }

    const total = validEvaluations.reduce(
      (sum, evaluation) =>
        sum + Number(evaluation.score || 0),
      0
    );

    return (
      total / validEvaluations.length
    ).toFixed(1);
  };

  // Completed interview
  if (finished) {
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

          <div className="interview-completed">

            <div className="completed-icon">
              🎉
            </div>

            <h1>
              Interview Completed!
            </h1>

            <h2>
              Overall Score:{" "}
              <span>
                {calculateOverallScore()}/10
              </span>
            </h2>

            <p>
              Your interview result has been
              saved successfully.
            </p>

          </div>

          <section className="summary-section">

            <div className="section-heading">

              <h2>
                Interview Summary
              </h2>

              <p>
                Review your answers and AI
                evaluation.
              </p>

            </div>

            {questions.map(
              (item, index) => {

                const evaluation =
                  evaluations[index];

                return (
                  <div
                    className="question-card"
                    key={index}
                  >

                    <div className="question-number">
                      Question {index + 1}
                    </div>

                    <h3>
                      {item.question}
                    </h3>

                    <p className="topic-text">
                      Topic:{" "}
                      <strong>
                        {item.topic}
                      </strong>
                    </p>

                    <div className="answer-section">

                      <h4>
                        Your Answer
                      </h4>

                      <p>
                        {answers[index] ||
                          "No answer provided"}
                      </p>

                    </div>

                    {evaluation && (
                      <div className="evaluation-card">

                        <h4>
                          AI Evaluation
                        </h4>

                        <div className="evaluation-stats">

                          <div>
                            <span>
                              Score
                            </span>

                            <strong>
                              {evaluation.score}/10
                            </strong>
                          </div>

                          <div>
                            <span>
                              Correctness
                            </span>

                            <strong>
                              {evaluation.correctness}/10
                            </strong>
                          </div>

                          <div>
                            <span>
                              Technical Quality
                            </span>

                            <strong>
                              {evaluation.technicalQuality}/10
                            </strong>
                          </div>

                          <div>
                            <span>
                              Communication
                            </span>

                            <strong>
                              {evaluation.communication}/10
                            </strong>
                          </div>

                        </div>

                        <div className="feedback-section">

                          <h4>
                            Feedback
                          </h4>

                          <p>
                            {evaluation.feedback}
                          </p>

                          <h4>
                            Suggestions for
                            Improvement
                          </h4>

                          <p>
                            {evaluation.suggestions}
                          </p>

                        </div>

                      </div>
                    )}

                  </div>
                );
              }
            )}

          </section>

          <div className="interview-actions">

            <button
              className="primary-button"
              onClick={handleRestart}
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
              Back to Dashboard
            </button>

          </div>

        </main>

      </div>
    );
  }

  // Active interview
  if (
    started &&
    questions.length > 0
  ) {
    const question =
      questions[currentQuestion];

    const evaluation =
      evaluations[currentQuestion];

    const isLastQuestion =
      currentQuestion ===
      questions.length - 1;

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

          <section className="interview-title">

            <span className="interview-label">
              AI MOCK INTERVIEW
            </span>

            <h2>
              {role} Interview
            </h2>

            <p>
              Question{" "}
              {currentQuestion + 1} of{" "}
              {questions.length}
            </p>

          </section>

          {/* Timer */}
          <div
            className={`interview-timer ${
              timeLeft <= 60
                ? "timer-warning"
                : ""
            }`}
          >
            ⏱️ Time Remaining:{" "}
            <strong>
              {formatTime(timeLeft)}
            </strong>
          </div>

          {/* Progress */}
          <div className="progress-bar">

            <div
              className="progress-fill"
              style={{
                width: `${
                  ((currentQuestion + 1) /
                    questions.length) *
                  100
                }%`,
              }}
            />

          </div>

          <div className="question-card">

            <div className="question-top">

              <span className="question-badge">
                Question{" "}
                {currentQuestion + 1}
              </span>

              <span className="topic-badge">
                {question.topic}
              </span>

            </div>

            <h2>
              {question.question}
            </h2>

            <textarea
              rows="8"
              placeholder="Type your answer here..."
              value={
                answers[currentQuestion]
              }
              onChange={handleAnswerChange}
              disabled={
                evaluating || saving
              }
            />

            {error && (
              <div className="interview-error">
                {error}
              </div>
            )}

            <button
              className="primary-button evaluate-button"
              onClick={handleEvaluate}
              disabled={
                evaluating || saving
              }
            >
              {evaluating
                ? "AI is evaluating..."
                : evaluation
                ? "Re-Evaluate Answer"
                : "Submit Answer"}
            </button>

            {evaluation && (
              <div className="evaluation-card">

                <div className="evaluation-header">

                  <h3>
                    🤖 AI Evaluation
                  </h3>

                  <div className="score-display">
                    {evaluation.score}/10
                  </div>

                </div>

                <div className="evaluation-stats">

                  <div>
                    <span>
                      Correctness
                    </span>

                    <strong>
                      {evaluation.correctness}/10
                    </strong>
                  </div>

                  <div>
                    <span>
                      Technical Quality
                    </span>

                    <strong>
                      {evaluation.technicalQuality}/10
                    </strong>
                  </div>

                  <div>
                    <span>
                      Communication
                    </span>

                    <strong>
                      {evaluation.communication}/10
                    </strong>
                  </div>

                </div>

                <div className="feedback-section">

                  <h4>
                    Feedback
                  </h4>

                  <p>
                    {evaluation.feedback}
                  </p>

                  <h4>
                    Suggestions for
                    Improvement
                  </h4>

                  <p>
                    {evaluation.suggestions}
                  </p>

                </div>

              </div>
            )}

          </div>

          <div className="interview-navigation">

            <button
              className="secondary-button"
              onClick={handlePrevious}
              disabled={
                currentQuestion === 0 ||
                saving
              }
            >
              ← Previous
            </button>

            {!isLastQuestion ? (

              <button
                className="primary-button"
                onClick={handleNext}
                disabled={
                  !evaluation || saving
                }
              >
                Next Question →
              </button>

            ) : (

              <button
                className="primary-button"
                onClick={
                  handleFinishInterview
                }
                disabled={
                  !evaluation || saving
                }
              >
                {saving
                  ? "Saving Interview..."
                  : "Finish Interview ✓"}
              </button>

            )}

          </div>

        </main>

      </div>
    );
  }

  // Interview setup
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

        <section className="interview-setup">

          <div className="setup-icon">
            🎯
          </div>

          <span className="interview-label">
            AI MOCK INTERVIEW
          </span>

          <h2>
            Prepare for Your Interview
          </h2>

          <p>
            Select your job role, experience
            level, and difficulty to generate
            personalized AI interview questions.
          </p>

          <form onSubmit={handleStart}>

            <div className="form-group">

              <label>
                Job Role
              </label>

              <select
                value={role}
                onChange={(e) =>
                  setRole(e.target.value)
                }
              >

                <option value="">
                  Select Role
                </option>

                <option value="Frontend Developer">
                  Frontend Developer
                </option>

                <option value="Backend Developer">
                  Backend Developer
                </option>

                <option value="Full Stack Developer">
                  Full Stack Developer
                </option>

                <option value="Data Analyst">
                  Data Analyst
                </option>

                <option value="Data Scientist">
                  Data Scientist
                </option>

                <option value="Python Developer">
                  Python Developer
                </option>

              </select>

            </div>

            <div className="form-group">

              <label>
                Experience Level
              </label>

              <select
                value={experience}
                onChange={(e) =>
                  setExperience(
                    e.target.value
                  )
                }
              >

                <option value="">
                  Select Experience
                </option>

                <option value="Fresher">
                  Fresher
                </option>

                <option value="0-2 years">
                  0-2 Years
                </option>

                <option value="2-5 years">
                  2-5 Years
                </option>

                <option value="5+ years">
                  5+ Years
                </option>

              </select>

            </div>

            <div className="form-group">

              <label>
                Difficulty
              </label>

              <select
                value={difficulty}
                onChange={(e) =>
                  setDifficulty(
                    e.target.value
                  )
                }
              >

                <option value="">
                  Select Difficulty
                </option>

                <option value="Easy">
                  Easy
                </option>

                <option value="Medium">
                  Medium
                </option>

                <option value="Hard">
                  Hard
                </option>

              </select>

            </div>

            {error && (
              <div className="interview-error">
                {error}
              </div>
            )}

            <button
              className="primary-button start-button"
              type="submit"
              disabled={loading}
            >
              {loading
                ? "Generating Questions..."
                : "Start AI Interview →"}
            </button>

          </form>

        </section>

      </main>

    </div>
  );
}

export default Interview;