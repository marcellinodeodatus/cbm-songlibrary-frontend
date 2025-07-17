import React, { useState } from "react";
import axios from "axios";

const EditSundayServiceModal = ({ service, onClose, onSaved }) => {
  const [serviceDate, setServiceDate] = useState(service.service_date);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const token = localStorage.getItem("adminToken");
      await axios.put(
        `/api/songs/services/${service.service_id}`,
        { service_date: serviceDate },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage("Service updated!");
      setTimeout(() => {
        setLoading(false);
        if (onSaved) onSaved();
        onClose();
      }, 800);
    } catch (err) {
      setMessage(err.response?.data?.error || "Failed to update service.");
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
        <h3>Edit Sunday Service</h3>
        <form onSubmit={handleSubmit}>
          <input
            type="date"
            value={serviceDate}
            onChange={(e) => setServiceDate(e.target.value)}
            required
            style={{ padding: "0.5rem", fontSize: "1rem", marginBottom: 12 }}
          />
          {message && (
            <div
              style={{
                color: message.includes("updated") ? "green" : "red",
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
              disabled={loading}
              style={{
                padding: "0.5rem 1rem",
                background: "#ccc",
                border: "none",
                borderRadius: 4,
                cursor: "pointer",
              }}
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
                cursor: "pointer",
              }}
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditSundayServiceModal;
