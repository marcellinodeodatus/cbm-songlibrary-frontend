import React, { useState } from "react";

const AddLeaderModal = ({ onClose, onLeaderAdded }) => {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!name.trim()) {
      setError("Name is required.");
      return;
    }
    setLoading(true);
    const token = localStorage.getItem("adminToken");
    const res = await fetch("/api/songs/worship-leaders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name }),
    });
    setLoading(false);
    if (res.ok) {
      onLeaderAdded();
    } else {
      const data = await res.json();
      setError(data.error || "Failed to add leader.");
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(0,0,0,0.3)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          background: "#fff",
          padding: 24,
          borderRadius: 8,
          minWidth: 300,
          boxShadow: "0 2px 8px #0002",
        }}
      >
        <h3>Add Worship Leader</h3>
        <input
          type="text"
          placeholder="Leader name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{
            width: "100%",
            padding: 8,
            marginBottom: 12,
            fontSize: "1rem",
          }}
        />
        {error && <div style={{ color: "red", marginBottom: 8 }}>{error}</div>}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <button
            type="button"
            onClick={onClose}
            style={{ padding: "0.5rem 1rem" }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "0.5rem 1rem",
              background: "#1976d2",
              color: "#fff",
              border: "none",
              borderRadius: 4,
            }}
          >
            {loading ? "Adding..." : "Add"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddLeaderModal;
