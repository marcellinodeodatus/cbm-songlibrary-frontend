import React, { useState } from "react";

const AdminLogin = ({
  onLogin,
  onClose,
  logoutMessage,
  clearLogoutMessage,
}) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (res.ok && data.token) {
        localStorage.setItem("adminToken", data.token);
        setSuccess("Login successful!");
        setTimeout(() => {
          setSuccess("");
          onLogin();
        }, 1000);
      } else {
        setError(data.error || "Login failed");
      }
    } catch (err) {
      setError("Network error");
    }
  };

  // Clear logout message when the component mounts
  React.useEffect(() => {
    if (logoutMessage) {
      setTimeout(() => {
        clearLogoutMessage();
      }, 2000);
    }
  }, [logoutMessage, clearLogoutMessage]);

  return (
    <div
      style={{
        maxWidth: 400,
        margin: "4rem auto",
        padding: 32,
        border: "1px solid #ccc",
        borderRadius: 8,
        position: "relative",
        background: "#fff",
      }}
    >
      <button
        onClick={onClose}
        style={{
          position: "absolute",
          top: 8,
          right: 8,
          background: "transparent",
          border: "none",
          fontSize: "1.5rem",
          cursor: "pointer",
        }}
        aria-label="Close"
      >
        ×
      </button>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 16 }}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{ width: "100%", padding: 8, fontSize: "1rem" }}
            required
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: "100%", padding: 8, fontSize: "1rem" }}
            required
          />
        </div>
        {error && <div style={{ color: "red", marginBottom: 12 }}>{error}</div>}
        {success && (
          <div style={{ color: "green", marginBottom: 12 }}>{success}</div>
        )}
        <button
          type="submit"
          style={{ width: "100%", padding: 10, fontSize: "1rem" }}
        >
          Login
        </button>
      </form>
    </div>
  );
};

export default AdminLogin;
