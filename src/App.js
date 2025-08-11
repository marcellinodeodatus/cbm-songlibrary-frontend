import React, { useState, useEffect } from "react";

function App() {
  const [songsWithArtists, setSongsWithArtists] = useState([]);

  useEffect(() => {
    Promise.all([
      fetch("/data-api/rest/SongArtists").then((res) => res.json()),
      fetch("/data-api/rest/Songs").then((res) => res.json()),
      fetch("/data-api/rest/Artists").then((res) => res.json()),
    ]).then(([sa, songs, artists]) => {
      const songMap = {};
      const artistMap = {};
      (songs.value || []).forEach((s) => (songMap[s.song_id] = s.title));
      (artists.value || []).forEach((a) => (artistMap[a.artist_id] = a.name));

      const joined = (sa.value || []).map((item) => ({
        title: songMap[item.song_id] || "Unknown Song",
        artist: artistMap[item.artist_id] || "Unknown Artist",
      }));
      setSongsWithArtists(joined);
    });
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
              <strong>{item.title}</strong> - {item.artist}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;
