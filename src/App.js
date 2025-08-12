import React, { useState, useEffect } from "react";

function App() {
  const [songsWithArtists, setSongsWithArtists] = useState([]);
  const [selectedLetter, setSelectedLetter] = useState("");
  const [showAddArtist, setShowAddArtist] = useState(false);
  const [newArtistName, setNewArtistName] = useState("");
  const [addArtistMessage, setAddArtistMessage] = useState("");
  const [showAddSong, setShowAddSong] = useState(false);
  const [newSongTitle, setNewSongTitle] = useState("");
  const [selectedArtistId, setSelectedArtistId] = useState("");
  const [addSongMessage, setAddSongMessage] = useState("");
  const [artistList, setArtistList] = useState([]);
  const [searchTerm, setSearchTerm] = useState(""); // <-- Add search state

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

  // Fetch artist list for dropdown
  useEffect(() => {
    fetchAll("/data-api/rest/Artists").then(setArtistList);
  }, []);

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
  let filteredSongs =
    selectedLetter === ""
      ? songsWithArtists
      : songsWithArtists.filter(
          (item) => item.title[0]?.toUpperCase() === selectedLetter
        );

  // Filter by search term
  if (searchTerm.trim() !== "") {
    filteredSongs = filteredSongs.filter((item) =>
      item.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  // Add artist handler
  const handleAddArtist = async (e) => {
    e.preventDefault();
    setAddArtistMessage("");
    const trimmedName = newArtistName.trim();
    if (!trimmedName) {
      setAddArtistMessage("Artist name cannot be empty.");
      return;
    }
    try {
      // Check if artist already exists (case-insensitive)
      const checkRes = await fetch(
        `/data-api/rest/Artists?$filter=tolower(name) eq '${trimmedName
          .toLowerCase()
          .replace(/'/g, "''")}'`
      );
      const checkData = await checkRes.json();
      if (checkData.value && checkData.value.length > 0) {
        setAddArtistMessage("Artist already exists.");
        return;
      }
      // Add new artist
      const res = await fetch("/data-api/rest/Artists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmedName }),
      });
      if (res.ok) {
        setAddArtistMessage("Artist added!");
        setNewArtistName("");
        setShowAddArtist(false);
        // Optionally refresh artist list
        fetchAll("/data-api/rest/Artists").then(setArtistList);
      } else {
        const err = await res.json();
        setAddArtistMessage(err.error?.message || "Failed to add artist.");
      }
    } catch {
      setAddArtistMessage("Failed to add artist.");
    }
  };

  // Add song handler
  const handleAddSong = async (e) => {
    e.preventDefault();
    setAddSongMessage("");
    if (!newSongTitle.trim() || !selectedArtistId) {
      setAddSongMessage("Song title and artist are required.");
      return;
    }
    try {
      // 1. Add song to Songs table
      const songRes = await fetch("/data-api/rest/Songs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newSongTitle.trim() }),
      });
      if (!songRes.ok) {
        const err = await songRes.json();
        setAddSongMessage(err.error?.message || "Failed to add song.");
        return;
      }
      const songData = await songRes.json();
      let newSongId = songData.song_id || songData.id;

      // If song_id is missing, fetch by title
      if (!newSongId) {
        const songsRes = await fetch(
          `/data-api/rest/Songs?$filter=title eq '${newSongTitle
            .trim()
            .replace(/'/g, "''")}'`
        );
        const songsJson = await songsRes.json();
        if (songsJson.value && songsJson.value.length > 0) {
          newSongId = songsJson.value[0].song_id;
        }
      }

      if (!newSongId) {
        setAddSongMessage("Could not determine new song ID.");
        return;
      }

      // 2. Add relationship to SongArtists table
      const saRes = await fetch("/data-api/rest/SongArtists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          song_id: newSongId,
          artist_id: parseInt(selectedArtistId, 10),
        }),
      });
      if (saRes.ok) {
        setAddSongMessage("Song added!");
        setNewSongTitle("");
        setSelectedArtistId("");
        setShowAddSong(false);

        // Refresh the song list after adding
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
          joined.sort((a, b) => a.title.localeCompare(b.title));
          setSongsWithArtists(joined);
        })();
      } else {
        const err = await saRes.json();
        setAddSongMessage(
          err.error?.message || "Failed to link song and artist."
        );
      }
    } catch {
      setAddSongMessage("Failed to add song.");
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
      <button
        onClick={() => setShowAddSong((v) => !v)}
        style={{ marginTop: "1rem" }}
      >
        {showAddSong ? "Cancel" : "Add New Song"}
      </button>
      {showAddSong && (
        <form onSubmit={handleAddSong} style={{ margin: "1rem 0" }}>
          <input
            type="text"
            value={newSongTitle}
            onChange={(e) => setNewSongTitle(e.target.value)}
            placeholder="Song title"
            style={{ marginRight: "0.5rem" }}
          />
          <select
            value={selectedArtistId}
            onChange={(e) => setSelectedArtistId(e.target.value)}
            style={{ marginRight: "0.5rem" }}
          >
            <option value="">Select artist</option>
            {artistList.map((artist) => (
              <option key={artist.artist_id} value={artist.artist_id}>
                {artist.name}
              </option>
            ))}
          </select>
          <button type="submit">Add Song</button>
          {addSongMessage && (
            <div style={{ marginTop: "0.5rem", color: "green" }}>
              {addSongMessage}
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
      <div style={{ margin: "1rem 0" }}>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search song..."
          style={{ padding: "0.5rem", width: "250px" }}
        />
      </div>
      <div style={{ margin: "2rem 0" }}>
        <h2>
          All Songs
          {selectedLetter ? ` starting with "${selectedLetter}"` : ""}
        </h2>
        <div style={{ marginBottom: "1rem" }}>
          <strong>Total songs: {filteredSongs.length}</strong>
        </div>
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
