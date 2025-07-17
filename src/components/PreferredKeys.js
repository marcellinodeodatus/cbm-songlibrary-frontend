import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import AddPreferredKeyModal from "./AddPreferredKeyModal";

const PreferredKeys = ({ leaderName }) => {
  const [keys, setKeys] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editId, setEditId] = useState(null);
  const [editKey, setEditKey] = useState("");
  const [message, setMessage] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const isAdmin = !!localStorage.getItem("adminToken");

  // Refresh preferred keys list
  const refreshPreferredKeys = useCallback(() => {
    axios
      .get(`/api/songs/preferred-keys/${leaderName}`)
      .then((res) => setKeys(res.data))
      .catch(() => setKeys([]));
    setEditId(null);
    setMessage("");
  }, [leaderName]);

  useEffect(() => {
    if (!leaderName) return;
    refreshPreferredKeys();
  }, [leaderName, refreshPreferredKeys]);

  // Filter keys by search term
  const filteredKeys = keys.filter((item) =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Unique key for each preferred key row
  const getUniqueKey = (pk) =>
    (pk.title || pk.song_title) +
    "-" +
    (pk.preferred_key || "") +
    "-" +
    leaderName;

  // Save edited key
  const saveEdit = async (pk) => {
    const token = localStorage.getItem("adminToken");
    try {
      if (pk.song_id) {
        // Tracked song
        await axios.put(
          `/api/songs/preferred-keys/track`,
          {
            leader_id: pk.leader_id,
            song_id: pk.song_id,
            preferred_key: editKey,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        // Untracked song
        await axios.put(
          `/api/songs/preferred-keys/notrack`,
          {
            leader_id: pk.leader_id,
            song_title: pk.song_title,
            preferred_key: editKey,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      setKeys((prev) =>
        prev.map((k) =>
          getUniqueKey(k) === getUniqueKey(pk)
            ? { ...k, preferred_key: editKey }
            : k
        )
      );
      setEditId(null);
      setMessage("Preferred key updated!");
    } catch {
      setMessage("Failed to update key.");
    }
  };

  // Delete preferred key
  const deleteKey = async (pk) => {
    if (!window.confirm("Delete this preferred key?")) return;
    const token = localStorage.getItem("adminToken");
    try {
      if (pk.song_id) {
        await axios.delete(`/api/songs/preferred-keys/track`, {
          data: { leader_id: pk.leader_id, song_id: pk.song_id },
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.delete(`/api/songs/preferred-keys/notrack`, {
          data: { leader_id: pk.leader_id, song_title: pk.song_title },
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      setKeys((prev) =>
        prev.filter((k) => getUniqueKey(k) !== getUniqueKey(pk))
      );
      setEditId(null);
      setMessage("Preferred key deleted!");
    } catch {
      setMessage("Failed to delete key.");
    }
  };

  return (
    <div style={{ margin: "2rem 0", textAlign: "center" }}>
      <h2>
        {leaderName}'s Keys ({filteredKeys.length})
      </h2>
      {message && (
        <div style={{ color: "green", marginBottom: 8 }}>{message}</div>
      )}
      <div
        style={{
          marginBottom: "1rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 12,
        }}
      >
        <input
          type="text"
          placeholder="Search song..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            padding: "0.5rem",
            fontSize: "1rem",
            width: "60%",
            borderRadius: 4,
            border: "1px solid #bbb",
            marginRight: 8,
          }}
        />
        {isAdmin && (
          <button
            onClick={() => setShowAddModal(true)}
            style={{
              background: "#4caf50",
              color: "#fff",
              border: "none",
              borderRadius: 4,
              padding: "0.5rem 1.2rem",
              fontSize: "1rem",
              fontWeight: "bold",
              boxShadow: "0 2px 6px rgba(76, 175, 80, 0.08)",
              cursor: "pointer",
              height: "2.5rem",
              transition: "background 0.2s",
              display: "flex",
              alignItems: "center",
            }}
          >
            Add Key
          </button>
        )}
      </div>
      {showAddModal && (
        <AddPreferredKeyModal
          leaderName={leaderName}
          onClose={() => setShowAddModal(false)}
          onAdded={() => {
            setShowAddModal(false); // <-- close the modal
            refreshPreferredKeys(); // <-- refresh the list
            setMessage("Preferred key added!"); // (optional) show success in parent
          }}
        />
      )}

      <div>
        {filteredKeys.map((item) => {
          const uniqueKey = getUniqueKey(item);
          return (
            <div key={uniqueKey} style={{ marginBottom: 8 }}>
              {isAdmin && editId === uniqueKey ? (
                <>
                  <span style={{ fontWeight: "bold", color: "#1976d2" }}>
                    {item.title || item.song_title}
                  </span>
                  <input
                    value={editKey}
                    onChange={(e) => setEditKey(e.target.value)}
                    style={{ marginLeft: 8, width: 60 }}
                  />
                  <button
                    onClick={() => saveEdit(item)}
                    style={{ marginLeft: 4 }}
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditId(null)}
                    style={{ marginLeft: 4 }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => deleteKey(item)}
                    style={{ marginLeft: 4, color: "red" }}
                  >
                    Delete
                  </button>
                </>
              ) : (
                <>
                  <span
                    style={{
                      cursor: isAdmin ? "pointer" : "default",
                      fontWeight: "bold",
                      color: "#1976d2",
                    }}
                    onClick={
                      isAdmin
                        ? () => {
                            setEditId(uniqueKey);
                            setEditKey(item.preferred_key);
                          }
                        : undefined
                    }
                    title={isAdmin ? "Click to edit or delete" : undefined}
                  >
                    {item.title || item.song_title}
                  </span>
                  <span style={{ marginLeft: 8 }}>{item.preferred_key}</span>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PreferredKeys;
