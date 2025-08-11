import React, { useState, useEffect } from "react";

function App() {
  const [songsWithArtists, setSongsWithArtists] = useState([]);

  // Helper to fetch all paginated data from a DAB endpoint
  async function fetchAll(endpoint) {
    let all = [];
    let url = endpoint;
    while (url) {
      const res = await fetch(url);
      const data = await res.json();
      all = all.concat(data.value || []);
      // Remove domain from nextLink if present
      url = data.nextLink
        ? data.nextLink.replace(/^https?:\/\/[^/]+/, "")
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

      const joined = sa.map((item) => ({
        title: songMap[item.song_id] || "Unknown Song",
        artist: artistMap[item.artist_id] || "Unknown Artist",
      }));
      setSongsWithArtists(joined);
    })();
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
