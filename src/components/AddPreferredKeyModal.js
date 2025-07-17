import { useEffect, useState } from "react";
import axios from "axios";

const AddPreferredKeyModal = ({ leaderName, onClose, onAdded }) => {
  const [songs, setSongs] = useState([]);
  const [songType, setSongType] = useState("track"); // "track" or "untrack"
  const [selectedSongId, setSelectedSongId] = useState("");
  const [untrackedTitle, setUntrackedTitle] = useState("");
  const [preferredKey, setPreferredKey] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [leaderId, setLeaderId] = useState(null);

  // Fetch all tracked songs and leaderId
  useEffect(() => {
    setLoading(true);
    Promise.all([
      axios.get("/api/songs"),
      axios.get("/api/songs/worship-leaders"),
    ])
      .then(([songsRes, leadersRes]) => {
        setSongs(songsRes.data);
        const leader = leadersRes.data.find(
          (l) => l.name.toLowerCase() === leaderName.toLowerCase()
        );
        setLeaderId(leader ? leader.leader_id : null);
      })
      .finally(() => setLoading(false));
  }, [leaderName]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    if (!leaderId) {
      setMessage("Invalid worship leader.");
      return;
    }
    if (songType === "track" && !selectedSongId) {
      setMessage("Please select a song.");
      return;
    }
    if (songType === "notrack" && !untrackedTitle.trim()) {
      setMessage("Please enter a song title.");
      return;
    }
    if (!preferredKey.trim()) {
      setMessage("Please enter a preferred key.");
      return;
    }

    const token = localStorage.getItem("adminToken");
    setLoading(true);
    try {
      if (songType === "track") {
        await axios.post(
          "/api/songs/preferred-keys",
          {
            leader_id: leaderId,
            song_id: selectedSongId,
            preferred_key: preferredKey.trim(),
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.post(
          "/api/songs/preferred-keys/notrack",
          {
            leader_id: leaderId,
            song_title: untrackedTitle.trim(),
            preferred_key: preferredKey.trim(),
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      setMessage("Preferred key added!");
      setTimeout(() => {
        if (onAdded) onAdded();
      }, 800);
    } catch (err) {
      setMessage(err.response?.data?.error || "Failed to add preferred key.");
    } finally {
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
          opacity: loading ? 0.7 : 1, // Gray out while loading
          position: "relative",
        }}
      >
        {loading && (
          <div
            style={{
              position: "absolute",
              top: 12,
              right: 24,
              color: "#1976d2",
              fontWeight: "bold",
              fontSize: "1rem",
            }}
          >
            Loading...
          </div>
        )}
        <h3>Add Preferred Key for {leaderName}</h3>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 12 }}>
            <label>
              <input
                type="radio"
                value="track"
                checked={songType === "track"}
                onChange={() => setSongType("track")}
                style={{ marginRight: 4 }}
              />
              Track Owned
            </label>
            <label style={{ marginLeft: 16 }}>
              <input
                type="radio"
                value="notrack"
                checked={songType === "notrack"}
                onChange={() => setSongType("notrack")}
                style={{ marginRight: 4 }}
              />
              No Track
            </label>
          </div>
          {songType === "track" ? (
            <div style={{ marginBottom: 12 }}>
              <select
                value={selectedSongId}
                onChange={(e) => setSelectedSongId(e.target.value)}
                style={{ width: "100%", padding: "0.5rem" }}
              >
                <option value="">Select a song...</option>
                {songs.map((song) => (
                  <option key={song.song_id} value={song.song_id}>
                    {song.title}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div style={{ marginBottom: 12 }}>
              <input
                type="text"
                placeholder="Song title"
                value={untrackedTitle}
                onChange={(e) => setUntrackedTitle(e.target.value)}
                style={{ width: "100%", padding: "0.5rem" }}
              />
            </div>
          )}
          <div style={{ marginBottom: 12 }}>
            <input
              type="text"
              placeholder="Preferred key (e.g. Bb, G, F#)"
              value={preferredKey}
              onChange={(e) => setPreferredKey(e.target.value)}
              style={{ width: "100%", padding: "0.5rem" }}
            />
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

export default AddPreferredKeyModal;
