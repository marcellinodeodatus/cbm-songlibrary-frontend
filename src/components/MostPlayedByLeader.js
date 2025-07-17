import { useEffect, useState } from 'react';
import axios from 'axios';

const MostPlayedByLeader = ({ leaderName }) => {
  const [songs, setSongs] = useState([]);

  useEffect(() => {
    axios.get(`/api/songs/most-played/${leaderName}`)
      .then(res => setSongs(res.data))
      .catch(() => setSongs([]));
  }, [leaderName]);

  return (
    <div style={{ margin: '2rem 0', textAlign: 'center' }}>
      <h2>Most Played Songs by {leaderName}</h2>
      {songs.length === 0 && <div>No data available.</div>}
      {songs.map((song, idx) => (
        <div key={idx}>
          <strong>{song.title}</strong> ({song.times_played} times)
        </div>
      ))}
    </div>
  );
};

export default MostPlayedByLeader;