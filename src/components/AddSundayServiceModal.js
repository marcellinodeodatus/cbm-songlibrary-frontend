import React, { useState } from "react";
import axios from "axios";

const AddSundayServiceModal = ({ onClose, onAdded }) => {
  const [serviceDate, setServiceDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!serviceDate) {
      setMessage("Please select a date.");
      return;
    }
    setLoading(true);
    setMessage("");
    try {
      const token = localStorage.getItem("adminToken");
      await axios.post(
        "/api/songs/services",
        { service_date: serviceDate },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage("Service added!");
      setTimeout(() => {
        setLoading(false);
        if (onAdded) onAdded();
        onClose();
      }, 800);
    } catch (err) {
      setMessage(err.response?.data?.error || "Failed to add service.");
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        left: 0,
        top: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(0,0,0,0.3)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background: "#fff",
          padding: "2rem",
          borderRadius: "8px",
          minWidth: 320,
          maxWidth: 400,
          position: "relative",
        }}
      >
        <h3>Add Sunday Service</h3>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label>
              Service Date:{" "}
              <input
                type="date"
                value={serviceDate}
                onChange={(e) => setServiceDate(e.target.value)}
                style={{ padding: "0.5rem", fontSize: "1rem" }}
                required
              />
            </label>
          </div>
          {message && (
            <div
              style={{
                color: message.includes("added") ? "green" : "red",
                marginBottom: 8,
              }}
            >
              {message}
            </div>
          )}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: "0.5rem 1rem",
                background: "#ccc",
                border: "none",
                borderRadius: 4,
                cursor: "pointer",
              }}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                padding: "0.5rem 1rem",
                background: "#1976d2",
                color: "#fff",
                border: "none",
                borderRadius: 4,
                cursor: "pointer",
              }}
              disabled={loading}
            >
              {loading ? "Adding..." : "Add"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddSundayServiceModal;
