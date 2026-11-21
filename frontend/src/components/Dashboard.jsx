
import { useEffect, useState } from "react";
import "./Dashboard.css";

const API_URL = "https://task-manager-s47d.onrender.com/todo";

function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    desc: "",
    status: false,
  });

  const token = localStorage.getItem("token");

  // Common API headers
  const getHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Token ${token}`,
  });

  // Fetch all tasks
  const fetchTasks = async () => {
    try {
      const response = await fetch(`${API_URL}/alltasks/`, {
        headers: getHeaders(),
      });

      const data = await response.json();

      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem("token");
        window.location.href = "/login";
        return;
      }

      if (!response.ok || !data.status) {
        throw new Error(data.msg || "Unable to fetch tasks");
      }

      setTasks(data.data || []);
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      window.location.href = "/login";
      return;
    }

    fetchTasks();
  }, []);

  // Input change
  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // Open create form
  const handleCreate = () => {
    setEditId(null);

    setFormData({
      title: "",
      desc: "",
      status: false,
    });

    setShowForm(true);
  };

  // Open edit form
  const handleEdit = (task) => {
    setEditId(task.id);

    setFormData({
      title: task.title,
      desc: task.desc,
      status: task.status,
    });

    setShowForm(true);
  };

  // Create or update task

  const handleSubmit = async (e) => {
    e.preventDefault();

    const isEditing = editId !== null;
    const taskId = editId;
    const previousTask = isEditing
      ? tasks.find((task) => task.id === taskId)
      : null;
    const updatedTask = { ...formData };

    const url = isEditing
      ? `${API_URL}/updatetask/${taskId}/`
      : `${API_URL}/addtask/`;

    if (isEditing) {
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === taskId ? { ...task, ...updatedTask } : task
        )
      );
      setShowForm(false);
      setEditId(null);
    }

    try {
      const response = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: getHeaders(),
        body: JSON.stringify(updatedTask),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.msg || data.error || "Operation failed");
      }

      if (isEditing) {
        setTasks((prevTasks) =>
          prevTasks.map((task) =>
            task.id === taskId
              ? { ...task, ...updatedTask, ...(data.task || {}) }
              : task
          )
        );
      } else {
        setTasks((prevTasks) => [...prevTasks, data.data]);
      }

      setShowForm(false);
      setEditId(null);

      setFormData({
        title: "",
        desc: "",
        status: false,
      });

      setError("");

    } catch (err) {
      if (isEditing && previousTask) {
        setTasks((prevTasks) =>
          prevTasks.map((task) => (task.id === taskId ? previousTask : task))
        );
        setShowForm(true);
        setEditId(taskId);
      }
      setError(err.message);
    }
  };

  // Delete task
  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this task?"
    );

    if (!confirmed) return;

    const deletedTaskIndex = tasks.findIndex((task) => task.id === id);
    const deletedTask = tasks[deletedTaskIndex];
    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== id));

    try {
      const response = await fetch(`${API_URL}/delete/${id}/`, {
        method: "DELETE",
        headers: getHeaders(),
      });

      if (!response.ok) {
        throw new Error("Unable to delete task");
      }
      setError("");
    } catch (err) {
      if (deletedTask) {
        setTasks((prevTasks) => {
          if (prevTasks.some((task) => task.id === id)) return prevTasks;
          const restoredTasks = [...prevTasks];
          restoredTasks.splice(
            Math.min(deletedTaskIndex, restoredTasks.length),
            0,
            deletedTask
          );
          return restoredTasks;
        });
      }
      setError(err.message);
    }
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  const completedTasks = tasks.filter((task) => task.status).length;
  const pendingTasks = tasks.length - completedTasks;

  return (
    <div className="dashboard">

      <header className="dashboard-header">
        <h2>Todo App</h2>

        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </header>

      <main className="dashboard-content">

        <div className="dashboard-title">
          <div>
            <h1>My Dashboard</h1>
            <p>Manage your tasks and stay productive.</p>
          </div>

          <button className="add-btn" onClick={handleCreate}>
            + Create Task
          </button>
        </div>

        {/* Summary */}
        <div className="task-summary">

          <div className="summary-card">
            <h2>{tasks.length}</h2>
            <p>Total Tasks</p>
          </div>

          <div className="summary-card">
            <h2>{completedTasks}</h2>
            <p>Completed</p>
          </div>

          <div className="summary-card">
            <h2>{pendingTasks}</h2>
            <p>Pending</p>
          </div>

        </div>

        {/* Task Form */}
        {showForm && (
          <section className="task-form-section">

            <h2>{editId ? "Edit Task" : "Create New Task"}</h2>

            <form onSubmit={handleSubmit}>

              <input
                type="text"
                name="title"
                placeholder="Task title"
                value={formData.title}
                onChange={handleChange}
                maxLength={150}
                required
              />

              <textarea
                name="desc"
                placeholder="Task description"
                value={formData.desc}
                onChange={handleChange}
                maxLength={700}
                required
              />

              <label className="status-label">
                <input
                  type="checkbox"
                  name="status"
                  checked={formData.status}
                  onChange={handleChange}
                />
                Mark as completed
              </label>

              <div className="form-actions">
                <button type="submit" className="save-btn">
                  {editId ? "Update Task" : "Create Task"}
                </button>

                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>
              </div>

            </form>
          </section>
        )}

        {/* All Tasks */}
        <section className="tasks-section">

          <h2>All Tasks ({tasks.length})</h2>

          {error && <p className="error-message">{error}</p>}

          {loading ? (
            <p>Loading tasks...</p>
          ) : tasks.length === 0 ? (
            <div className="empty-state">
              <h3>No tasks found</h3>
              <p>Create your first task to get started.</p>
            </div>
          ) : (

            <div className="tasks-grid">

              {tasks.map((task) => (

                <div className="task-card" key={task.id}>

                  <div className="task-card-header">

                    <h3>{task.title}</h3>

                    <span className={task.status ? "completed" : "pending"}>
                      {task.status ? "Completed" : "Pending"}
                    </span>

                  </div>

                  <p>{task.desc}</p>

                  <small>Created: {task.created_at}</small>

                  <div className="task-actions">

                    <button
                      className="edit-btn"
                      onClick={() => handleEdit(task)}
                    >
                      Edit
                    </button>

                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(task.id)}
                    >
                      Delete
                    </button>

                  </div>

                </div>

              ))}

            </div>
          )}

        </section>

      </main>
    </div>
  );
}

export default Dashboard;
