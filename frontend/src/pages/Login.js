import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../services/api";
import "../App.css";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setMessage("");

      const data = await loginUser(formData);

      localStorage.setItem("token", data.token);
      localStorage.setItem("userId", data.user._id);
      localStorage.setItem("user", JSON.stringify(data.user));

      navigate("/dashboard");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
  <div className="auth-card">

    <div className="auth-brand">
      <h1>InterAI</h1>
      <p>AI-Powered Interview Preparation</p>
    </div>

    <h2>Login</h2>

    <p className="auth-subtitle">
      Login to continue your interview preparation.
    </p>

    <form onSubmit={handleSubmit} className="auth-form">

      <div className="form-group">
        <label>Email</label>
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label>Password</label>
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />
      </div>

      <button
        type="submit"
        className="auth-button"
        disabled={loading}
      >
        {loading ? "Logging in..." : "Login"}
      </button>

    </form>

    {message && (
      <p className="auth-message">
        {message}
      </p>
    )}

    <p className="auth-footer">
      Don't have an account?{" "}
      <Link to="/register">Create Account</Link>
    </p>

  </div>
</div>
  );
}

export default Login;