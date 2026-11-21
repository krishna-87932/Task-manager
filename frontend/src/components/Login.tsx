
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

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("Logging in...");

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

      console.log("Login response:", data);
      console.log("Token:", data.data?.token);

      if (response.ok && data.status) {
        localStorage.setItem("token", data.data.token);
        console.log("Saved token:", localStorage.getItem("token"));
        navigate("/dashboard");
      }

      // Redirect to your dashboard here.
    } catch (error) {
      setMessage("Unable to connect to the server.");
      console.error(error);
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

        <button className="auth-submit" type="submit">Login</button>
      </form>

        <p className="auth-footer">
          New here? <Link to="/register">Create an account</Link>
        </p>
      </section>
    </main>
  );
}

export default Login;
