import React, { useEffect, useState } from "react";
import AddSongModal from "./AddSongModal";

function AllSongs({
  refresh,
  searchTerm,
  isAdmin,
  setIsAdmin,
  setRefreshSongs,
}) {
  const [songs, setSongs] = useState([]);
  const [selectedLetter, setSelectedLetter] = useState("");
  const [selectedSongId, setSelectedSongId] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [songToEdit, setSongToEdit] = useState(null);

  useEffect(() => {
    fetch("/api/songs/songs-with-artists")
      .then((res) => res.json())
      .then((data) => setSongs(data));
  }, [refresh]);

  // Filter by search term
  const filteredSongs = songs.filter(
    (song) =>
      song.title.toLowerCase().includes((searchTerm || "").toLowerCase()) ||
      (song.artist_name || "")
        .toLowerCase()
        .includes((searchTerm || "").toLowerCase())
  );

  // Group by first letter
  const grouped = groupSongsByLetter(filteredSongs);
  const letters = Object.keys(grouped).sort();

  // Show only songs for the selected letter, or all if none selected
  const displaySongs = selectedLetter
    ? grouped[selectedLetter] || []
    : filteredSongs;

  return (
    <div>
      <h2>All Songs ({filteredSongs.length})</h2>
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
        {displaySongs.map((song) => (
          <li
            key={song.song_id + "-" + (song.artist_name || "")}
            style={{
              background:
                isAdmin && selectedSongId === song.song_id
                  ? "#f0f8ff"
                  : "transparent",
              cursor: isAdmin ? "pointer" : "default",
              padding: "0.25rem 0",
            }}
            onClick={() => isAdmin && setSelectedSongId(song.song_id)}
          >
            <strong>{song.title}</strong>
            {song.artist_name ? ` — ${song.artist_name}` : ""}
            {isAdmin && selectedSongId === song.song_id && (
              <span style={{ marginLeft: 16 }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSongToEdit(song);
                    setEditModalOpen(true);
                  }}
                  style={{ marginRight: 8 }}
                >
                  Edit
                </button>
                <button
                  style={{ color: "red" }}
                  onClick={async (e) => {
                    e.stopPropagation();
                    if (window.confirm("Delete this song?")) {
                      const token = localStorage.getItem("adminToken");
                      const res = await fetch(`/api/songs/${song.song_id}`, {
                        method: "DELETE",
                        headers: { Authorization: `Bearer ${token}` },
                      });
                      if (res.ok) {
                        setSelectedSongId(null);
                        setRefreshSongs((r) => r + 1);
                      } else if (res.status === 401) {
                        localStorage.removeItem("adminToken");
                        if (typeof setIsAdmin === "function") setIsAdmin(false);
                        alert("Session expired. Please log in again.");
                      } else {
                        alert("Failed to delete song.");
                      }
                    }
                  }}
                >
                  Delete
                </button>
              </span>
            )}
          </li>
        ))}
      </ul>
      {editModalOpen && (
        <AddSongModal
          editMode={true}
          song={songToEdit}
          onClose={() => {
            setEditModalOpen(false);
            setSongToEdit(null);
          }}
          onSongAdded={() => {
            setEditModalOpen(false);
            setSongToEdit(null);
            setRefreshSongs((r) => r + 1);
            if (typeof refresh === "function") refresh((r) => r + 1);
          }}
        />
      )}
    </div>
  );
}

// Helper function
function groupSongsByLetter(songs) {
  const grouped = {};
  songs.forEach((song) => {
    const letter = (song.title[0] || "").toUpperCase();
    if (!grouped[letter]) grouped[letter] = [];
    grouped[letter].push(song);
  });
  return grouped;
}

export default AllSongs;
