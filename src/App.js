import React, { useState, useEffect } from "react";
import bcrypt from "bcryptjs";

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
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleteIdx, setShowDeleteIdx] = useState(null);
  // login
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError("");
    try {
      // Query the Admins table for the username
      const res = await fetch(
        `/data-api/rest/Admins?$filter=username eq '${loginUsername.replace(
          /'/g,
          "''"
        )}'`
      );
      const data = await res.json();
      if (!data.value || data.value.length === 0) {
        setLoginError("Invalid username or password.");
        return;
      }
      const admin = data.value[0];
      // Use bcryptjs to compare password
      const match = await bcrypt.compare(loginPassword, admin.password_hash);
      if (match) {
        setIsLoggedIn(true);
        setShowLogin(false);
        setLoginUsername("");
        setLoginPassword("");
      } else {
        setLoginError("Invalid username or password.");
      }
    } catch {
      setLoginError("Login failed. Please try again.");
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

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

  // Filter by search term (searches both song title and artist name)
  if (searchTerm.trim() !== "") {
    const term = searchTerm.toLowerCase();
    filteredSongs = filteredSongs.filter(
      (item) =>
        item.title.toLowerCase().includes(term) ||
        item.artist.toLowerCase().includes(term)
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

  // Delete a Song Artist Connection
  const handleDeleteSongArtist = async (songTitle, artistName) => {
    // Find song_id by title
    const songsRes = await fetch(
      `/data-api/rest/Songs?$filter=title eq '${songTitle.replace(/'/g, "''")}'`
    );
    const songsJson = await songsRes.json();
    if (!songsJson.value || songsJson.value.length === 0) {
      alert("Song not found.");
      return;
    }
    const songId = songsJson.value[0].song_id;

    // Fetch all artists and match in JS (case-insensitive)
    const artistsRes = await fetch("/data-api/rest/Artists");
    const artistsJson = await artistsRes.json();
    const artist = (artistsJson.value || []).find(
      (a) => a.name.toLowerCase() === artistName.toLowerCase()
    );
    if (!artist) {
      alert("Artist not found.");
      return;
    }
    const artistId = artist.artist_id;

    // Call the stored procedure
    const spRes = await fetch("/data-api/rest/DeleteSongArtistConnection", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ song_id: songId, artist_id: artistId }),
    });
    if (!spRes.ok) {
      const err = await spRes.json();
      alert(err.error?.message || "Failed to delete connection.");
      return;
    }

    // Refresh the song list
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
        position: "relative",
      }}
    >
      {/* Login/Logout Button */}
      <div style={{ position: "absolute", top: 20, right: 30 }}>
        {isLoggedIn ? (
          <button
            style={{
              background: "#1976d2",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              padding: "0.5rem 1rem",
              cursor: "pointer",
            }}
            onClick={handleLogout}
          >
            Logout
          </button>
        ) : (
          <button
            style={{
              background: "#1976d2",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              padding: "0.5rem 1rem",
              cursor: "pointer",
            }}
            onClick={() => setShowLogin(true)}
          >
            Login
          </button>
        )}
      </div>

      {/* Login Modal */}
      {showLogin && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <form
            onSubmit={handleLogin}
            style={{
              background: "#fff",
              padding: "2rem",
              borderRadius: "8px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
              minWidth: "300px",
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
            }}
          >
            <h2>Admin Login</h2>
            <input
              type="text"
              placeholder="Username"
              value={loginUsername}
              onChange={(e) => setLoginUsername(e.target.value)}
              autoFocus
            />
            <input
              type="password"
              placeholder="Password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
            />
            {loginError && <div style={{ color: "red" }}>{loginError}</div>}
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "1rem",
              }}
            >
              <button type="button" onClick={() => setShowLogin(false)}>
                Cancel
              </button>
              <button
                type="submit"
                style={{
                  background: "#1976d2",
                  color: "#fff",
                  border: "none",
                  borderRadius: "4px",
                  padding: "0.5rem 1rem",
                  cursor: "pointer",
                }}
              >
                Login
              </button>
            </div>
          </form>
        </div>
      )}

      <h1 style={{ textAlign: "center" }}>Song Library</h1>

      {/* Only show add artist/song if logged in */}
      {isLoggedIn && (
        <>
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
        </>
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
          placeholder="Search song or artist..."
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
        <div>
          {filteredSongs.map((item, idx) => (
            <div key={idx} style={{ marginBottom: "0.5rem" }}>
              <strong
                style={{
                  cursor: isLoggedIn ? "pointer" : "default",
                  textDecoration: isLoggedIn ? "underline" : "none",
                }}
                onClick={
                  isLoggedIn
                    ? () => setShowDeleteIdx(showDeleteIdx === idx ? null : idx)
                    : undefined
                }
              >
                {item.title}
              </strong>
              {" - "}
              {item.artist}
              {/* Only show delete if logged in */}
              {isLoggedIn && showDeleteIdx === idx && (
                <button
                  style={{ marginLeft: "1rem", color: "red" }}
                  onClick={() => {
                    handleDeleteSongArtist(item.title, item.artist);
                    setShowDeleteIdx(null);
                  }}
                >
                  Delete
                </button>
              )}
            </div>
          ))}
        </div>
        {filteredSongs.length === 0 && (
          <div>No songs found for "{selectedLetter}"</div>
        )}
      </div>
    </div>
  );
}

export default App;
