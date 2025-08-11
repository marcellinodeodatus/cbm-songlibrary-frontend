import React, { useState, useEffect } from "react";

function App() {
  const [songsWithArtists, setSongsWithArtists] = useState([]);
  const [selectedLetter, setSelectedLetter] = useState("");
  const [showAddArtist, setShowAddArtist] = useState(false);
  const [newArtistName, setNewArtistName] = useState("");
  const [addArtistMessage, setAddArtistMessage] = useState("");

  async function fetchAll(endpoint) {
    let all = [];
    let url = endpoint;
    while (url) {
      const res = await fetch(url);
      const data = await res.json();
      all = all.concat(data.value || []);
      url = data.nextLink
        ? data.nextLink.replace(/^https?:\/\/[^/]+\/rest\//, "/data-api/rest/")
        : null;
    }
    return all;
  }

  useEffect(() => {
    (async () => {
      const [sa, songs, artists] = await Promise.all([
        fetchAll("/data-api/rest/SongArtists"),
        fetchAll("/data-api/rest/Songs"),
        fetchAll("/data-api/rest/Artists"),
      ]);
      const songMap = {};
      const artistMap = {};
      songs.forEach((s) => (songMap[s.song_id] = s.title));
      artists.forEach((a) => (artistMap[a.artist_id] = a.name));

      let joined = sa.map((item) => ({
        title: songMap[item.song_id] || "Unknown Song",
        artist: artistMap[item.artist_id] || "Unknown Artist",
      }));

      // Always sort alphabetically by song title (A-Z)
      joined.sort((a, b) => a.title.localeCompare(b.title));

      setSongsWithArtists(joined);
    })();
  }, []);

  // Get all starting letters from song titles
  const letters = Array.from(
    new Set(songsWithArtists.map((item) => item.title[0]?.toUpperCase()))
  )
    .filter((l) => l && /^[A-Z]$/.test(l))
    .sort();

  // Filter songs by selected letter
  const filteredSongs =
    selectedLetter === ""
      ? songsWithArtists
      : songsWithArtists.filter(
          (item) => item.title[0]?.toUpperCase() === selectedLetter
        );

  // Add artist handler
  const handleAddArtist = async (e) => {
    e.preventDefault();
    setAddArtistMessage("");
    if (!newArtistName.trim()) {
      setAddArtistMessage("Artist name cannot be empty.");
      return;
    }
    try {
      const res = await fetch("/data-api/rest/Artists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newArtistName.trim() }),
      });
      if (res.ok) {
        setAddArtistMessage("Artist added!");
        setNewArtistName("");
        setShowAddArtist(false);
      } else {
        const err = await res.json();
        setAddArtistMessage(err.error?.message || "Failed to add artist.");
      }
    } catch {
      setAddArtistMessage("Failed to add artist.");
    }
  };

  return (
    <div
      className="App"
      style={{
        fontFamily: "Arial",
        padding: "2rem",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <h1 style={{ textAlign: "center" }}>Song Library</h1>
      <button onClick={() => setShowAddArtist((v) => !v)}>
        {showAddArtist ? "Cancel" : "Add New Artist"}
      </button>
      {showAddArtist && (
        <form onSubmit={handleAddArtist} style={{ margin: "1rem 0" }}>
          <input
            type="text"
            value={newArtistName}
            onChange={(e) => setNewArtistName(e.target.value)}
            placeholder="Artist name"
            style={{ marginRight: "0.5rem" }}
          />
          <button type="submit">Add</button>
          {addArtistMessage && (
            <div style={{ marginTop: "0.5rem", color: "green" }}>
              {addArtistMessage}
            </div>
          )}
        </form>
      )}
      <div style={{ margin: "1rem 0" }}>
        <strong>Filter by letter:</strong>{" "}
        <button
          style={{
            marginRight: "0.5rem",
            fontWeight: selectedLetter === "" ? "bold" : "normal",
          }}
          onClick={() => setSelectedLetter("")}
        >
          All
        </button>
        {letters.map((letter) => (
          <button
            key={letter}
            style={{
              marginRight: "0.5rem",
              fontWeight: selectedLetter === letter ? "bold" : "normal",
            }}
            onClick={() => setSelectedLetter(letter)}
          >
            {letter}
          </button>
        ))}
      </div>
      <div style={{ margin: "2rem 0" }}>
        <ul>
          {filteredSongs.map((item, idx) => (
            <li key={idx}>
              <strong>{item.title}</strong> - {item.artist}
            </li>
          ))}
        </ul>
        {filteredSongs.length === 0 && (
          <div>No songs found for "{selectedLetter}"</div>
        )}
      </div>
    </div>
  );
}

export default App;
