import { useEffect, useState } from 'react';
import axios from 'axios';

const RecentSongs = ({ leaderName }) => {
  const [songs, setSongs] = useState([]);

  useEffect(() => {
    axios.get(`/api/songs/recent/${leaderName}`)
      .then(res => setSongs(res.data))
      .catch(err => console.error(err));
  }, [leaderName]);

  return (
    <div style={{ margin: '2rem 0', textAlign: 'center' }}>
      <h2>Recent Songs by {leaderName}</h2>
      <ul>
      {songs.map((song, index) => {
        const [year, month, day] = song.service_date.split('-');
        const formattedDate = `${month}/${day}/${year}`;
        return (
          <ul key={index}>
            <strong>{song.title}</strong> — Key: {song.key_used}, <strong>Date: </strong>{formattedDate}
          </ul>
        );
    })}
      </ul>
    </div>
  );
};

export default RecentSongs;
