import { useState } from "react";
import axios from "axios";

const EditLeaderModal = ({ leaderId, currentName, onClose, onSaved }) => {
  const [name, setName] = useState(currentName);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    if (!name.trim()) {
      setMessage("Name cannot be empty.");
      return;
    }
    setLoading(true);
    try {
      // DAB PATCH endpoint for updating a row
      await axios.patch(`/data-api/rest/WorshipLeaders/${leaderId}`, {
        name: name.trim(),
      });
      setMessage("Leader updated!");
      setTimeout(() => {
        setLoading(false);
        if (onSaved) onSaved();
        if (onClose) onClose();
      }, 700);
    } catch (err) {
      setMessage(err.response?.data?.error || "Failed to update leader.");
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
      <form
        onSubmit={handleSubmit}
        style={{
          background: "#fff",
          padding: 24,
          borderRadius: 8,
          minWidth: 300,
        }}
      >
        <h3>Edit Worship Leader</h3>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ width: "100%", padding: 8, marginBottom: 12 }}
          autoFocus
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
  );
};

export default EditLeaderModal;
