import React, { useEffect, useState } from "react";

const ArtistManager = ({ isAdmin, setRefreshSongs }) => {
  const [artists, setArtists] = useState([]);
  const [selectedArtistId, setSelectedArtistId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [message, setMessage] = useState("");
  const grouped = groupArtistsByLetter(artists);
  const letters = Object.keys(grouped).sort();
  const [selectedLetter, setSelectedLetter] = useState("");
  const displayArtists = selectedLetter
    ? grouped[selectedLetter] || []
    : artists;

  useEffect(() => {
    fetch("/api/songs/artists")
      .then((res) => res.json())
      .then(setArtists);
  }, [editingId, message, setRefreshSongs]);

  const handleEdit = (artist) => {
    setEditingId(artist.artist_id);
    setEditName(artist.name);
    setMessage("");
  };

  const saveEdit = async (id) => {
    const token = localStorage.getItem("adminToken");
    const res = await fetch(`/api/songs/artists/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name: editName }),
    });
    if (res.ok) {
      setEditingId(null);
      setSelectedArtistId(null);
      setMessage("Artist updated!");
      setRefreshSongs((r) => r + 1);
    } else {
      setMessage("Failed to update artist.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this artist?")) return;
    const token = localStorage.getItem("adminToken");
    const res = await fetch(`/api/songs/artists/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    let data = {};
    try {
      data = await res.json();
    } catch (e) {}
    if (res.ok) {
      setMessage("Artist deleted!");
      setSelectedArtistId(null);
      setRefreshSongs((r) => r + 1);
    } else {
      setMessage(data.error || "Failed to delete artist.");
    }
  };

  if (!isAdmin) return null;

  return (
    <div style={{ margin: "2rem 0" }}>
      <h2>Manage Artists</h2>
      {message && (
        <div style={{ color: message.includes("delete") ? "green" : "red" }}>
          {message}
        </div>
      )}
      <div style={{ marginBottom: "1rem" }}>
        {letters.map((letter) => (
          <button
            key={letter}
            onClick={() => setSelectedLetter(letter)}
            style={{
              marginRight: 4,
              fontWeight: selectedLetter === letter ? "bold" : "normal",
              background: selectedLetter === letter ? "#1976d2" : "#f0f0f0",
              color: selectedLetter === letter ? "#fff" : "#333",
              border: "none",
              borderRadius: "4px",
              padding: "0.25rem 0.75rem",
              cursor: "pointer",
            }}
          >
            {letter}
          </button>
        ))}
        {selectedLetter && (
          <button
            onClick={() => setSelectedLetter("")}
            style={{
              marginLeft: 8,
              background: "#e0e0e0",
              border: "none",
              borderRadius: "4px",
              padding: "0.25rem 0.75rem",
              cursor: "pointer",
            }}
          >
            Show All
          </button>
        )}
      </div>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {displayArtists.map((artist) => (
          <li
            key={artist.artist_id}
            style={{
              background:
                isAdmin && selectedArtistId === artist.artist_id
                  ? "#f0f8ff"
                  : "transparent",
              cursor: isAdmin ? "pointer" : "default",
              padding: "0.25rem 0",
            }}
            onClick={() => isAdmin && setSelectedArtistId(artist.artist_id)}
          >
            {editingId === artist.artist_id ? (
              <>
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
                <button
                  onClick={() => saveEdit(artist.artist_id)}
                  style={{ marginLeft: 8 }}
                >
                  Save
                </button>
                <button
                  onClick={() => setEditingId(null)}
                  style={{ marginLeft: 4 }}
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <strong>{artist.name}</strong>
                {isAdmin && selectedArtistId === artist.artist_id && (
                  <span style={{ marginLeft: 16 }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(artist);
                      }}
                      style={{ marginRight: 8 }}
                    >
                      Edit
                    </button>
                    <button
                      style={{ color: "red" }}
                      onClick={async (e) => {
                        e.stopPropagation();
                        await handleDelete(artist.artist_id);
                      }}
                    >
                      Delete
                    </button>
                  </span>
                )}
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

function groupArtistsByLetter(artists) {
  const grouped = {};
  artists.forEach((artist) => {
    const letter = (artist.name[0] || "").toUpperCase();
    if (!grouped[letter]) grouped[letter] = [];
    grouped[letter].push(artist);
  });
  return grouped;
}

export default ArtistManager;
