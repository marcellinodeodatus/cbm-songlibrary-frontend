import React, { useState, useEffect } from "react";
import axios from "axios";

const initialForm = {
  leader_id: "",
  song_id: "",
  key_used: "",
  order_number: "",
};

const ManageSongsModal = ({ service, onClose, onChanged }) => {
  const [songs, setSongs] = useState([]);
  const [leaders, setLeaders] = useState([]);
  const [allSongs, setAllSongs] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editing, setEditing] = useState(null); // {leader_id, song_id}
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [selectedLeaderId, setSelectedLeaderId] = useState("");

  useEffect(() => {
    fetch("/api/songs/worship-leaders")
      .then((res) => res.json())
      .then(setLeaders);
    fetch("/api/songs")
      .then((res) => res.json())
      .then(setAllSongs);
    fetchSongs();
    // eslint-disable-next-line
  }, [service.service_id]);

  const fetchSongs = () => {
    axios
      .get(`/api/songs/services/${service.service_id}/songs`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      })
      .then((res) => setSongs(res.data));
  };

  // Save worship leader for the service (even if no songs)
  const handleSaveLeader = async () => {
    if (!selectedLeaderId) {
      setMessage("Please select a worship leader.");
      return;
    }
    setLoading(true);
    setMessage("");
    try {
      await axios.put(
        `/api/songs/services/${service.service_id}/leader`,
        { leader_id: selectedLeaderId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
        }
      );
      setMessage("Worship leader saved for this service!");
      if (onChanged) onChanged();
    } catch (err) {
      setMessage(
        err.response?.data?.error ||
          "Failed to save worship leader for this service."
      );
    }
    setLoading(false);
  };

  const handleAdd = async () => {
    if (!selectedLeaderId) {
      setMessage("Please select a worship leader.");
      return;
    }
    if (!form.order_number || Number(form.order_number) < 1) {
      setMessage("Order must be a positive number.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setMessage("");
    try {
      await axios.post(
        `/api/songs/services/${service.service_id}/songs`,
        {
          ...form,
          leader_id: selectedLeaderId,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
        }
      );
      fetchSongs();
      setForm(initialForm);
      if (onChanged) onChanged();
    } catch (err) {
      setMessage(err.response?.data?.error || "Failed to add song.");
    }
    setLoading(false);
  };

  const handleEdit = (song) => {
    setEditing({ leader_id: song.leader_id, song_id: song.song_id });
    setForm({
      leader_id: song.leader_id,
      song_id: song.song_id,
      key_used: song.key_used,
      order_number: song.order_number,
    });
    setSelectedLeaderId(song.leader_id);
    setMessage("");
  };

  const handleSaveEdit = async () => {
    if (!selectedLeaderId) {
      setMessage("Please select a worship leader.");
      return;
    }
    if (!form.order_number || Number(form.order_number) < 1) {
      setMessage("Order must be a positive number.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setMessage("");
    try {
      await axios.put(
        `/api/songs/services/${service.service_id}/songs`,
        {
          ...form,
          leader_id: selectedLeaderId,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
        }
      );
      fetchSongs();
      setEditing(null);
      setForm(initialForm);
      if (onChanged) onChanged();
    } catch (err) {
      setMessage(err.response?.data?.error || "Failed to update song.");
    }
    setLoading(false);
  };

  const handleDelete = async (song) => {
    if (!window.confirm("Delete this song from the service?")) return;
    setLoading(true);
    setMessage("");
    try {
      await axios.delete(`/api/songs/services/${service.service_id}/songs`, {
        data: { leader_id: song.leader_id, song_id: song.song_id },
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      });
      fetchSongs();
      if (onChanged) onChanged();
    } catch (err) {
      setMessage(err.response?.data?.error || "Failed to delete song.");
    }
    setLoading(false);
  };

  const handleCancelEdit = () => {
    setEditing(null);
    setForm(initialForm);
    setMessage("");
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
          minWidth: 340,
          maxWidth: 420,
          position: "relative",
        }}
      >
        <h3>Manage Songs for {service.service_date}</h3>
        <div
          style={{
            marginBottom: 16,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <label>
            Worship Leader:&nbsp;
            <select
              value={selectedLeaderId}
              onChange={(e) => setSelectedLeaderId(e.target.value)}
              disabled={loading}
            >
              <option value="">Select Leader</option>
              {leaders.map((l) => (
                <option key={l.leader_id} value={l.leader_id}>
                  {l.name}
                </option>
              ))}
            </select>
          </label>
          <button
            onClick={handleSaveLeader}
            disabled={loading || !selectedLeaderId}
            style={{
              background: "#1976d2",
              color: "#fff",
              border: "none",
              borderRadius: 4,
              padding: "0.3rem 1rem",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            Save
          </button>
        </div>
        <ul>
          {songs.map((song) => (
            <li
              key={song.song_id + "-" + song.leader_id}
              style={{ marginBottom: 6 }}
            >
              <strong>{song.title}</strong>
              {song.key_used ? ` (Key: ${song.key_used})` : ""}
              <button
                style={{ marginLeft: 8 }}
                onClick={() => handleEdit(song)}
                disabled={loading}
              >
                ✏️ Edit
              </button>
              <button
                style={{ marginLeft: 4, color: "red" }}
                onClick={() => handleDelete(song)}
                disabled={loading}
              >
                🗑️ Delete
              </button>
            </li>
          ))}
        </ul>
        <div style={{ marginTop: 16 }}>
          <select
            value={form.song_id}
            onChange={(e) =>
              setForm((f) => ({ ...f, song_id: e.target.value }))
            }
            disabled={loading}
          >
            <option value="">Select Song</option>
            {allSongs.map((s) => (
              <option key={s.song_id} value={s.song_id}>
                {s.title}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Key"
            value={form.key_used}
            onChange={(e) =>
              setForm((f) => ({ ...f, key_used: e.target.value }))
            }
            disabled={loading}
            style={{ width: 60, marginLeft: 4 }}
          />
          <input
            type="number"
            placeholder="Order"
            min={1}
            value={form.order_number}
            onChange={(e) =>
              setForm((f) => ({ ...f, order_number: e.target.value }))
            }
            disabled={loading}
            style={{ width: 60, marginLeft: 4 }}
          />
          {!editing ? (
            <button
              onClick={handleAdd}
              disabled={
                loading ||
                !selectedLeaderId ||
                !form.song_id ||
                !form.key_used ||
                !form.order_number ||
                Number(form.order_number) < 1
              }
              style={{ marginLeft: 8, background: "#4caf50", color: "#fff" }}
            >
              Add Song
            </button>
          ) : (
            <>
              <button
                onClick={handleSaveEdit}
                disabled={
                  loading ||
                  !selectedLeaderId ||
                  !form.song_id ||
                  !form.key_used ||
                  !form.order_number ||
                  Number(form.order_number) < 1
                }
                style={{ marginLeft: 8, background: "#1976d2", color: "#fff" }}
              >
                Save
              </button>
              <button
                onClick={handleCancelEdit}
                disabled={loading}
                style={{ marginLeft: 4 }}
              >
                Cancel
              </button>
            </>
          )}
        </div>
        {message && <div style={{ color: "red", marginTop: 8 }}>{message}</div>}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <button
            onClick={onClose}
            style={{
              marginTop: 20,
              padding: "0.5rem 1rem",
              background: "#ccc",
              border: "none",
              borderRadius: 4,
              cursor: "pointer",
            }}
            disabled={loading}
          >
            Close
          </button>
          {editing && (
            <button
              onClick={handleSaveEdit}
              disabled={
                loading ||
                !selectedLeaderId ||
                !form.song_id ||
                !form.key_used ||
                form.order_number === ""
              }
              style={{
                marginTop: 20,
                padding: "0.5rem 1rem",
                background: "#1976d2",
                color: "#fff",
                border: "none",
                borderRadius: 4,
                cursor: "pointer",
              }}
            >
              Save
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageSongsModal;
