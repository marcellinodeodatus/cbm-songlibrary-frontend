import React, { useEffect, useState } from "react";
import axios from "axios";

const MostPlayedSongs = () => {
  const [songs, setSongs] = useState([]);

  useEffect(() => {
    // Group by song_id, count, order by count desc, expand to get song title
    axios
      .get("/data-api/rest/ServiceSongs?$top=1")
      .then((res) => setSongs(res.data.value || []))
      .catch((err) => {
        console.error("MostPlayedSongs error:", err?.response?.data || err);
        setSongs([]);
      });
  }, []);

  return (
    <div>
      <h2>Most Played Songs 2025 (All Worship Leaders)</h2>
      <ol>
        {songs.map((item, idx) => (
          <li key={idx}>
            <strong>{item.song?.title || "Unknown"}</strong> – Played{" "}
            {item.playCount} times
          </li>
        ))}
      </ol>
    </div>
  );
};

export default MostPlayedSongs;
