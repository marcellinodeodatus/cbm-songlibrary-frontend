import React, { useEffect, useState } from "react";

const AddSongModal = ({
  onClose,
  onSongAdded,
  editMode = false,
  song = null,
}) => {
  const [title, setTitle] = useState(song ? song.title : "");
  const [artistId, setArtistId] = useState(song ? song.artist_id : "");
  const [artists, setArtists] = useState([]);
  const [showNewArtist, setShowNewArtist] = useState(false);
  const [newArtist, setNewArtist] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // 'success' or 'error'
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/songs/artists")
      .then((res) => res.json())
      .then((data) => setArtists(data));
  }, []);

  // When song changes (for editing), update fields
  useEffect(() => {
    if (song) {
      setTitle(song.title);
      setArtistId(song.artist_id);
    }
  }, [song]);

  const handleArtistChange = (e) => {
    const value = e.target.value;
    setArtistId(value);
    setShowNewArtist(value === "new");
    setMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage("");
    setMessageType("");
    const token = localStorage.getItem("adminToken");
    try {
      let res;
      let artist_id = artistId;

      // If adding a new artist
      if (showNewArtist && newArtist.trim()) {
        // Add artist first
        const artistRes = await fetch("/api/songs/artists", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ name: newArtist.trim() }),
        });
        if (!artistRes.ok) {
          setMessage("Failed to add artist");
          setMessageType("error");
          setSubmitting(false);
          return;
        }
        const artistData = await artistRes.json();
        artist_id = artistData.artist_id;
      }

      if (editMode && song) {
        // Edit existing song
        res = await fetch(`/api/songs/${song.song_id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ title, artist_id }),
        });
      } else {
        // Add new song
        res = await fetch("/api/songs", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ title, artist_id }),
        });
      }
      if (res.status === 401) {
        localStorage.removeItem("adminToken");
        setMessage("Session expired. Please log in again.");
        setMessageType("error");
        setSubmitting(false);
        return;
      }
      if (res.ok) {
        setMessage(editMode ? "Song updated!" : "Song added!");
        setMessageType("success");
        onSongAdded && onSongAdded();
      } else {
        const data = await res.json();
        setMessage(data.error || "Failed to save song");
        setMessageType("error");
      }
    } catch (err) {
      setMessage("Network error");
      setMessageType("error");
    }
    setSubmitting(false);
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
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background: "#fff",
          padding: "2rem",
          borderRadius: "8px",
          minWidth: "300px",
          position: "relative",
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
        <h2>{editMode ? "Edit Song" : "Add a Song"}</h2>
        {message && (
          <div
            style={{
              marginBottom: "1rem",
              color: messageType === "error" ? "#b00020" : "#388e3c",
              background: messageType === "error" ? "#ffebee" : "#e8f5e9",
              padding: "0.5rem 1rem",
              borderRadius: "4px",
              textAlign: "center",
            }}
          >
            {message}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "1rem" }}>
            <label htmlFor="song-title">Title: </label>
            <input
              id="song-title"
              name="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              disabled={submitting}
            />
          </div>
          <div style={{ marginBottom: "1rem" }}>
            <label htmlFor="artist-select">Artist: </label>
            <select
              id="artist-select"
              name="artist"
              value={artistId}
              onChange={handleArtistChange}
              required
              disabled={submitting}
            >
              <option value="">Select artist...</option>
              {artists.map((artist) => (
                <option
                  key={artist.artist_id + "-" + artist.name}
                  value={artist.artist_id}
                >
                  {artist.name}
                </option>
              ))}
              <option value="new">Add New Artist</option>
            </select>
          </div>
          {showNewArtist && (
            <div style={{ marginBottom: "1rem" }}>
              <label htmlFor="new-artist-name">New Artist Name: </label>
              <input
                id="new-artist-name"
                name="newArtist"
                value={newArtist}
                onChange={(e) => setNewArtist(e.target.value)}
                required
                disabled={submitting}
              />
            </div>
          )}
          <button
            type="submit"
            style={{ marginRight: "1rem" }}
            disabled={submitting}
          >
            {submitting
              ? editMode
                ? "Saving..."
                : "Adding..."
              : editMode
              ? "Save"
              : "Add"}
          </button>
          <button type="button" onClick={onClose} disabled={submitting}>
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddSongModal;
