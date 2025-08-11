import React, { useState, useEffect } from "react";

function App() {
  // start new
  const [songs, setSongs] = useState([]);

  useEffect(() => {
    fetch("data-api/rest/Songs")
      .then((res) => res.json())
      .then((data) => setSongs(data.value || []));
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
        <h2>All Songs</h2>
        <ul>
          {songs.map((item) => (
            <li key={item.song_id}>
              <strong>{item.title}</strong> (ID: {item.song_id})
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;
