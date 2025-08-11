import React, { useState, useEffect } from "react";

function App() {
  const [songsWithArtists, setSongsWithArtists] = useState([]);
  const [selectedLetter, setSelectedLetter] = useState("");

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
