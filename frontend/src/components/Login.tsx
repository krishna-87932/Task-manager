
import { useState } from "react";
import { useNavigate, Link } from 'react-router-dom';
import "./Auth.css";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setMessage("");

    try {
      const response = await fetch(
        "https://task-manager-s47d.onrender.com/account/login/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (response.ok && data.status) {
        localStorage.setItem("token", data.data.token);
        navigate("/dashboard");
        return;
      }

      throw new Error(
        typeof data.msg === "string"
          ? data.msg
          : "Unable to log in. Check your username and password."
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to connect to the server."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-card" aria-labelledby="login-title">
        <div className="auth-heading">
          <p className="auth-brand">Task Manager</p>
          <h1 id="login-title">Welcome back</h1>
          <p>Sign in to manage your tasks.</p>
        </div>

        <form className="auth-form" onSubmit={handleLogin}>
        <label htmlFor="login-username">Username</label>
        <input
          id="login-username"
          type="text"
          name="username"
          placeholder="Username"
          value={formData.username}
          onChange={handleChange}
          required
        />

        <label htmlFor="login-password">Password</label>
        <input
          id="login-password"
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />

        {message && <p className="auth-message" role="alert">{message}</p>}

        <button className="auth-submit" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Signing in..." : "Login"}
        </button>
      </form>

        <p className="auth-footer">
          New here? <Link to="/register">Create an account</Link>
        </p>
      </section>
    </main>
  );
}

export default Login;
