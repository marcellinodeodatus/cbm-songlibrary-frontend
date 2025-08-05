import axios from "axios";
import { useState } from "react";

const DeleteLeaderModal = ({ leaderId, leaderName, onClose, onDeleted }) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleDelete = async () => {
    setLoading(true);
    setMessage("");
    try {
      // DAB DELETE endpoint for deleting a row
      await axios.delete(`/data-api/rest/WorshipLeaders/${leaderId}`);
      setMessage("Leader deleted!");
      setTimeout(() => {
        if (onDeleted) onDeleted();
        if (onClose) onClose();
      }, 700);
    } catch (err) {
      setMessage(err.response?.data?.error || "Failed to delete leader.");
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
          padding: 24,
          borderRadius: 8,
          minWidth: 300,
        }}
      >
        <h3>Delete Worship Leader</h3>
        <p>
          Are you sure you want to delete <b>{leaderName}</b>?
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

export default DeleteLeaderModal;
