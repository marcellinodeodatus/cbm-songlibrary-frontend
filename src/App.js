import React, { useState, useEffect } from "react";

function App() {
  const [songsWithArtists, setSongsWithArtists] = useState([]);

  useEffect(() => {
    fetch("/rest/SongArtists?$expand=song($select=title),artist($select=name)")
      .then((res) => res.json())
      .then((data) => setSongsWithArtists(data.value || []));
  }, []);

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

      <div style={{ margin: "2rem 0" }}>
        <h2>All Songs with Artists</h2>
        <ul>
          {songsWithArtists.map((item, idx) => (
            <li key={idx}>
              <strong>{item.song?.title || "Unknown Song"}</strong> -{" "}
              {item.artist?.name || "Unknown Artist"}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;
