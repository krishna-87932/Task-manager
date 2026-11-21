import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Auth.css";

const API_URL = "https://task-manager-s47d.onrender.com/account/register/";

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    password_confirm: "",
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    setFormData((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    setMessage("");

    if (formData.password !== formData.password_confirm) {
      setMessage("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        if (typeof data.password_confirm === "string") {
          throw new Error(data.password_confirm);
        }
        if (typeof data.password === "string") {
          throw new Error(data.password);
        }
        if (typeof data.email === "string") {
          throw new Error(data.email);
        }
        if (typeof data.username === "string") {
          throw new Error(data.username);
        }
        throw new Error(data.detail || data.message || "Unable to create account.");
      }

      if (data.status && data.data?.token) {
        localStorage.setItem("token", data.data.token);
        navigate("/dashboard");
        return;
      }

      throw new Error("Account created, but no login token was returned.");
    } catch (error) {
      setMessage(error.message || "Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-card" aria-labelledby="register-title">
        <div className="auth-heading">
          <p className="auth-brand">Task Manager</p>
          <h1 id="register-title">Create an account</h1>
          <p>Start organizing your work and stay productive.</p>
        </div>

        <form className="auth-form" onSubmit={handleRegister}>
          <label htmlFor="username">Username</label>
          <input
            id="username"
            type="text"
            name="username"
            placeholder="Enter your username"
            value={formData.username}
            onChange={handleChange}
            autoComplete="username"
            required
          />

          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            name="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={handleChange}
            autoComplete="email"
            required
          />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            name="password"
            placeholder="Create a password"
            value={formData.password}
            onChange={handleChange}
            autoComplete="new-password"
            required
          />

          <label htmlFor="password_confirm">Confirm password</label>
          <input
            id="password_confirm"
            type="password"
            name="password_confirm"
            placeholder="Repeat your password"
            value={formData.password_confirm}
            onChange={handleChange}
            autoComplete="new-password"
            required
          />

          {message && (
            <p className="auth-message" role="alert">
              {message}
            </p>
          )}

          <button className="auth-submit" type="submit" disabled={loading}>
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </section>
    </main>
  );
}

export default Register;
