import React, { useState } from "react";
import axios from "axios";

const DeleteSundayServiceModal = ({ service, onClose, onDeleted }) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleDelete = async () => {
    setLoading(true);
    setMessage("");
    try {
      const token = localStorage.getItem("adminToken");
      await axios.delete(`/api/songs/services/${service.service_id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage("Service deleted!");
      setTimeout(() => {
        setLoading(false);
        if (onDeleted) onDeleted();
        onClose();
      }, 800);
    } catch (err) {
      setMessage(err.response?.data?.error || "Failed to delete service.");
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
        <h3>Delete Sunday Service</h3>
        <p>
          Are you sure you want to delete the service on {service.service_date}?
        </p>
        {message && (
          <div
            style={{
              color: message.includes("deleted") ? "green" : "red",
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
            type="button"
            onClick={handleDelete}
            disabled={loading}
            style={{
              padding: "0.5rem 1rem",
              background: "#d32f2f",
              color: "#fff",
              border: "none",
              borderRadius: 4,
              cursor: "pointer",
            }}
          >
            {loading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteSundayServiceModal;
