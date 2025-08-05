import React, { useState, useEffect } from "react";
import RecentSongs from "./components/RecentSongs";
import MostPlayedSongs from "./components/MostPlayedSongs";
import AllSongs from "./components/AllSongs";
import PreferredKeys from "./components/PreferredKeys";
import MostPlayedByLeader from "./components/MostPlayedByLeader";
import AddSongModal from "./components/AddSongModal";
import SundayServices from "./components/SundayServices";
import AdminLogin from "./components/AdminLogin";
import ArtistManager from "./components/ArtistManager";
import AddLeaderModal from "./components/AddLeaderModal";
import EditLeaderModal from "./components/EditLeaderModal";
import DeleteLeaderModal from "./components/DeleteLeaderModal";

function App() {
  const [leaderName, setLeaderName] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [showAddSong, setShowAddSong] = useState(false);
  const [refreshSongs, setRefreshSongs] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [showServices, setShowServices] = useState(false);
  const [isAdmin, setIsAdmin] = useState(!!localStorage.getItem("adminToken"));
  const [leaders, setLeaders] = useState([]);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [showArtistManager, setShowArtistManager] = useState(false);
  const [showAddLeader, setShowAddLeader] = useState(false);
  const [editLeaderId, setEditLeaderId] = useState(null);
  const [editLeaderName, setEditLeaderName] = useState("");
  const [deleteLeaderId, setDeleteLeaderId] = useState(null);
  const [deleteLeaderName, setDeleteLeaderName] = useState("");
  const [logoutMessage, setLogoutMessage] = useState("");

  // start new
  const [songsWithArtists, setSongsWithArtists] = useState([]);

  useEffect(() => {
    fetch("data-api/rest/Songs")
      .then((res) => res.json())
      .then((data) => setSongsWithArtists(data.value || []));
  }, []);

  // Check if the user has been inactive for more than 30 minutes
  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    const loginTime = parseInt(localStorage.getItem("adminLoginTime"), 10);
    const THIRTY_MINUTES = 30 * 60 * 1000;
    if (token && loginTime && Date.now() - loginTime > THIRTY_MINUTES) {
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminLoginTime");
      setIsAdmin(false);
      alert("You have been logged out after 30 minutes of inactivity.");
    }
  }, []);

  // Clear logout message after 2 seconds
  useEffect(() => {
    if (logoutMessage) {
      const timer = setTimeout(() => setLogoutMessage(""), 2000);
      return () => clearTimeout(timer);
    }
  }, [logoutMessage]);

  // Handler to be called after a song is added
  const handleSongAdded = () => {
    setShowAddSong(false);
    setRefreshSongs((r) => r + 1);
  };

  const handleLeaderAdded = () => {
    setShowAddLeader(false);
  };

  useEffect(() => {
    fetch(`/data-api/rest/WorshipLeaders`)
      .then((res) => res.json())
      .then((data) => setLeaders(data.value || []));
  }, [showAddLeader]); // refetch after adding a leader

  useEffect(() => {
    if (leaders.length > 0 && !leaders.some((l) => l.name === leaderName)) {
      setLeaderName(leaders[0].name);
    }
  }, [leaders, leaderName]);

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
      <h1 style={{ textAlign: "center" }}>CBM Orlando Song Library</h1>

      <div style={{ margin: "2rem 0" }}>
        <h2>All Songs with Artists</h2>
        <ul>
          {songsWithArtists.map((item, idx) => (
            <li key={idx}>
              <strong>{item.song?.title || "Unknown Song"}</strong>
              {" by "}
              <span>{item.artist?.name || "Unknown Artist"}</span>
            </li>
          ))}
        </ul>
      </div>

      <MostPlayedSongs />

      <div style={{ position: "absolute", top: 20, right: 20 }}>
        {isAdmin ? (
          <button
            style={{
              padding: "0.5rem 1rem",
              fontSize: "1rem",
              background: "#d32f2f",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
            onClick={() => {
              localStorage.removeItem("adminToken");
              localStorage.removeItem("adminLoginTime");
              setIsAdmin(false);
              setLogoutMessage("You have been logged out.");
            }}
          >
            Logout
          </button>
        ) : (
          <button
            style={{
              padding: "0.5rem 1rem",
              fontSize: "1rem",
              background: "#1976d2",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
            onClick={() => setShowAdminLogin(true)}
          >
            Admin Login
          </button>
        )}
        {showAdminLogin && (
          <AdminLogin
            onLogin={() => {
              setIsAdmin(true);
              setShowAdminLogin(false);
              localStorage.setItem("adminLoginTime", Date.now().toString());
            }}
            onClose={() => setShowAdminLogin(false)}
            logoutMessage={logoutMessage}
            clearLogoutMessage={() => setLogoutMessage("")}
          />
        )}
        {logoutMessage && (
          <div
            style={{
              position: "fixed",
              top: 40,
              left: "50%",
              transform: "translateX(-50%)",
              background: "#4caf50",
              color: "#fff",
              padding: "1rem 2rem",
              borderRadius: 8,
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
              zIndex: 2000,
              fontSize: "1.1rem",
              fontWeight: "bold",
            }}
          >
            {logoutMessage}
          </div>
        )}
      </div>

      <button
        style={{
          marginBottom: "1.5rem",
          padding: "0.5rem 1rem",
          fontSize: "1rem",
        }}
        onClick={() => setShowAll((prev) => !prev)}
      >
        {showAll ? "Hide All Songs" : "Show All Songs"}
      </button>
      {showAll && (
        <>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "1rem",
            }}
          >
            {!showArtistManager && (
              <input
                type="text"
                placeholder="Search song..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  marginRight: "1rem",
                  padding: "0.5rem",
                  fontSize: "1rem",
                  flex: 1,
                }}
              />
            )}
            {isAdmin && (
              <>
                {!showArtistManager && (
                  <button
                    style={{
                      padding: "0.5rem 1rem",
                      fontSize: "1rem",
                      background: "#4caf50",
                      color: "#fff",
                      border: "none",
                      borderRadius: "4px",
                      marginRight: 8,
                    }}
                    onClick={() => {
                      setShowAddSong(true);
                      setShowArtistManager(false);
                    }}
                  >
                    Add a Song
                  </button>
                )}
                <button
                  style={{
                    padding: "0.5rem 1rem",
                    fontSize: "1rem",
                    background: "#ff9800",
                    color: "#fff",
                    border: "none",
                    borderRadius: "4px",
                  }}
                  onClick={() => setShowArtistManager((prev) => !prev)}
                >
                  {showArtistManager ? "Show All Songs" : "Manage Artist"}
                </button>
              </>
            )}
          </div>
          {showAddSong && (
            <AddSongModal
              onClose={() => setShowAddSong(false)}
              onSongAdded={handleSongAdded}
            />
          )}
          {showArtistManager ? (
            <ArtistManager
              isAdmin={isAdmin}
              setRefreshSongs={setRefreshSongs}
            />
          ) : (
            <AllSongs
              refresh={refreshSongs}
              searchTerm={searchTerm}
              isAdmin={isAdmin}
              setIsAdmin={setIsAdmin}
              setRefreshSongs={setRefreshSongs}
            />
          )}
        </>
      )}

      <hr style={{ margin: "3rem 0", width: "100%" }} />
      <h1 style={{ textAlign: "center" }}>Sunday Services Playlists</h1>
      <button
        style={{
          marginBottom: "1rem",
          padding: "0.5rem 1rem",
          fontSize: "1rem",
        }}
        onClick={() => setShowServices((prev) => !prev)}
      >
        {showServices ? "Hide Sunday Services" : "Show Recent Sunday Services"}
      </button>
      {showServices && <SundayServices isAdmin={isAdmin} />}
      <hr style={{ margin: "3rem 0", width: "100%" }} />

      <div style={{ marginBottom: "2rem", textAlign: "center" }}>
        <span>Select Worship Leader: </span>
        {leaders.map((leader) => (
          <span
            key={leader.leader_id}
            style={{
              margin: "0 0.5rem",
              display: "inline-flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <button
              onClick={() => setLeaderName(leader.name)}
              style={{
                padding: "0.5rem 1rem",
                fontWeight: leaderName === leader.name ? "bold" : "normal",
                background: leaderName === leader.name ? "#1976d2" : "#f0f0f0",
                color: leaderName === leader.name ? "#fff" : "#333",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                outline:
                  leaderName === leader.name ? "2px solid #1976d2" : "none",
                marginBottom: isAdmin && leaderName === leader.name ? 4 : 0,
              }}
            >
              {leader.name}
            </button>
            {isAdmin && leaderName === leader.name && (
              <div style={{ display: "flex", gap: 8, marginTop: 2 }}>
                <button
                  style={{
                    background: "#1976d2",
                    color: "#fff",
                    border: "none",
                    borderRadius: 4,
                    cursor: "pointer",
                    fontSize: "1em",
                    padding: "0.4em 1em",
                    fontWeight: "bold",
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditLeaderId(leader.leader_id);
                    setEditLeaderName(leader.name);
                  }}
                  title="Edit"
                >
                  ✏️
                </button>
                <button
                  style={{
                    background: "#d32f2f",
                    color: "#fff",
                    border: "none",
                    borderRadius: 4,
                    cursor: "pointer",
                    fontSize: "1em",
                    padding: "0.4em 1em",
                    fontWeight: "bold",
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteLeaderId(leader.leader_id);
                    setDeleteLeaderName(leader.name);
                  }}
                  title="Delete"
                >
                  🗑️
                </button>
              </div>
            )}
          </span>
        ))}
      </div>
      {/* Edit Leader Modal */}
      {editLeaderId && (
        <EditLeaderModal
          leaderId={editLeaderId}
          currentName={editLeaderName}
          onClose={() => setEditLeaderId(null)}
          onSaved={() => {
            setEditLeaderId(null);
            // Refresh leaders
            fetch("/api/songs/worship-leaders")
              .then((res) => res.json())
              .then((data) => setLeaders(data));
          }}
        />
      )}
      {/* Delete Leader Modal */}
      {deleteLeaderId && (
        <DeleteLeaderModal
          leaderId={deleteLeaderId}
          leaderName={deleteLeaderName}
          onClose={() => setDeleteLeaderId(null)}
          onDeleted={() => {
            setDeleteLeaderId(null);
            // Refresh leaders
            fetch("/api/songs/worship-leaders")
              .then((res) => res.json())
              .then((data) => setLeaders(data));
          }}
        />
      )}

      {isAdmin && (
        <button
          style={{
            marginBottom: "1rem",
            padding: "0.5rem 1rem",
            fontSize: "1rem",
            background: "#4caf50",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
          onClick={() => setShowAddLeader(true)}
        >
          Add a Worship Leader
        </button>
      )}
      {showAddLeader && (
        <AddLeaderModal
          onClose={() => setShowAddLeader(false)}
          onLeaderAdded={handleLeaderAdded}
        />
      )}

      <div
        style={{
          display: "flex",
          gap: "2rem",
          justifyContent: "center",
          alignItems: "flex-start",
          width: "100%",
        }}
      >
        <div style={{ flex: 1 }}>
          <RecentSongs leaderName={leaderName} />
        </div>
        <div style={{ flex: 1 }}>
          <MostPlayedByLeader leaderName={leaderName} />
        </div>
      </div>

      <PreferredKeys leaderName={leaderName} />
    </div>
  );
}

export default App;
