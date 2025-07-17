import React, { useEffect, useState } from "react";
import axios from "axios";

const MostPlayedSongs = () => {
  const [songs, setSongs] = useState([]);

  useEffect(() => {
    axios
      .get("/api/songs/most-played")
      .then((res) => setSongs(res.data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div>
      <h2>Most Played Songs 2025 (All Worship Leaders)</h2>
      <ol>
        {songs.map((song, idx) => (
          <li key={idx}>
            <strong>{song.title}</strong> – Played {song.times_played} times
          </li>
        ))}
      </ol>
    </div>
  );
};

export default MostPlayedSongs;
