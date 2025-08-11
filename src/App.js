import React, { useState, useEffect } from "react";

function App() {
  const [songsWithArtists, setSongsWithArtists] = useState([]);
  const [sortAsc, setSortAsc] = useState(true);

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

      // Sort alphabetically by song title
      joined.sort((a, b) =>
        sortAsc
          ? a.title.localeCompare(b.title)
          : b.title.localeCompare(a.title)
      );

      setSongsWithArtists(joined);
    })();
  }, [sortAsc]);

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
      <button onClick={() => setSortAsc((prev) => !prev)}>
        Sort {sortAsc ? "Z-A" : "A-Z"}
      </button>
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
