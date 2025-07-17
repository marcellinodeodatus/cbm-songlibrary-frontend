import React, { useEffect, useState } from "react";
import AddSundayServiceModal from "./AddSundayServiceModal";
import EditSundayServiceModal from "./EditSundayServiceModal";
import DeleteSundayServiceModal from "./DeleteSundayServiceModal";
import ManageSongsModal from "./ManageSongsModal";

const SundayServices = ({ isAdmin }) => {
  const [services, setServices] = useState([]);
  const [monthFilter, setMonthFilter] = useState("3");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editService, setEditService] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [deleteService, setDeleteService] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [manageService, setManageService] = useState(null);
  const [showManageSongsModal, setShowManageSongsModal] = useState(false);

  // Fetch services on mount or refresh
  const fetchServices = () => {
    fetch("/api/songs/services-with-songs")
      .then((res) => res.json())
      .then((data) => {
        // Group by service_id
        const grouped = {};
        data.forEach((row) => {
          if (!grouped[row.service_id]) {
            grouped[row.service_id] = {
              service_date: row.service_date,
              songs: [],
              worship_leaders: new Set(),
              service_worship_leader: row.service_worship_leader || null, // <--- add this
            };
          }
          if (row.worship_leader)
            grouped[row.service_id].worship_leaders.add(row.worship_leader);
          if (row.song_title) {
            grouped[row.service_id].songs.push({
              title: row.song_title,
              key: row.key_used,
              order: row.order_number,
              leader: row.worship_leader,
            });
          }
        });
        // Convert to array and sort by service_date descending
        const servicesArr = Object.entries(grouped)
          .map(([id, svc]) => ({
            service_id: id,
            service_date: svc.service_date,
            worship_leaders: Array.from(svc.worship_leaders),
            service_worship_leader: svc.service_worship_leader, // <--- add this
            songs: svc.songs.sort((a, b) => a.order - b.order),
          }))
          .sort((a, b) => b.service_date.localeCompare(a.service_date));
        setServices(servicesArr);
      });
  };

  useEffect(() => {
    fetchServices();
  }, []);

  // Group services by month
  const servicesByMonth = {};
  services.forEach((service) => {
    const [year, month] = service.service_date.split("-");
    const monthKey = `${year}-${month}`;
    if (!servicesByMonth[monthKey]) servicesByMonth[monthKey] = [];
    servicesByMonth[monthKey].push(service);
  });

  // Sort months descending (most recent first)
  let sortedMonths = Object.keys(servicesByMonth).sort((a, b) =>
    b.localeCompare(a)
  );
  const now = new Date();

  if (monthFilter === "3" || monthFilter === "6") {
    const monthsToShow = parseInt(monthFilter, 10);
    sortedMonths = sortedMonths.filter((monthKey) => {
      const [year, month] = monthKey.split("-").map(Number);
      const diffMonths =
        (now.getFullYear() - year) * 12 + (now.getMonth() - (month - 1));
      return diffMonths < monthsToShow;
    });
  } else if (monthFilter === "2025") {
    sortedMonths = sortedMonths.filter((monthKey) =>
      monthKey.startsWith("2025-")
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <label>
          Show:&nbsp;
          <select
            value={monthFilter}
            onChange={(e) => setMonthFilter(e.target.value)}
          >
            <option value="3">Last 3 months</option>
            <option value="6">Last 6 months</option>
            <option value="2025">Year 2025</option>
          </select>
        </label>
      </div>
      {isAdmin && (
        <button
          style={{
            background: "#1976d2",
            color: "#fff",
            border: "none",
            borderRadius: 4,
            padding: "0.5rem 1.2rem",
            fontWeight: "bold",
            fontSize: "1rem",
            marginBottom: 16,
            cursor: "pointer",
          }}
          onClick={() => setShowAddModal(true)}
        >
          ＋ Add a Sunday Service
        </button>
      )}
      <h2>
        Sunday Services (
        {monthFilter === "2025"
          ? "Year 2025"
          : monthFilter === "6"
          ? "Last 6 months"
          : "Last 3 months"}
        )
      </h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "2rem",
          alignItems: "flex-start",
          width: "100%",
          paddingBottom: 16,
        }}
      >
        {sortedMonths.map((monthKey) => {
          const [year, month] = monthKey.split("-");
          const monthName = new Date(
            Number(year),
            Number(month) - 1
          ).toLocaleString("default", { month: "long", year: "numeric" });
          return (
            <div
              key={monthKey}
              style={{
                minWidth: 220,
                border: "1px solid #ccc",
                borderRadius: 8,
                padding: 16,
                background: "#fafafa",
              }}
            >
              <h3 style={{ textAlign: "center", marginBottom: 16 }}>
                {monthName}
              </h3>
              {servicesByMonth[monthKey].map((service) => (
                <div
                  key={service.service_id}
                  style={{
                    marginBottom: "1.5rem",
                    borderBottom: "1px solid #eee",
                    paddingBottom: 8,
                  }}
                >
                  <div style={{ fontWeight: "bold" }}>
                    {service.service_date} — Leaders:{" "}
                    {service.worship_leaders.length > 0
                      ? service.worship_leaders.join(", ")
                      : service.service_worship_leader || "N/A"}
                  </div>
                  <ol style={{ margin: "0.5rem 0 0 1.2rem" }}>
                    {service.songs.map((song, idx) => (
                      <li key={idx}>
                        <strong>{song.title}</strong>
                        {song.key ? ` (Key: ${song.key})` : ""}
                      </li>
                    ))}
                  </ol>
                  {isAdmin && (
                    <div
                      style={{
                        marginTop: 4,
                        marginBottom: 8,
                        display: "flex",
                        gap: 8,
                      }}
                    >
                      <button
                        style={{
                          background: "#1976d2",
                          color: "#fff",
                          border: "none",
                          borderRadius: 4,
                          padding: "0.2rem 0.8rem",
                          fontWeight: "bold",
                          cursor: "pointer",
                        }}
                        onClick={() => {
                          setEditService(service);
                          setShowEditModal(true);
                        }}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        style={{
                          background: "#d32f2f",
                          color: "#fff",
                          border: "none",
                          borderRadius: 4,
                          padding: "0.2rem 0.8rem",
                          fontWeight: "bold",
                          cursor: "pointer",
                        }}
                        onClick={() => {
                          setDeleteService(service);
                          setShowDeleteModal(true);
                        }}
                      >
                        🗑️ Delete
                      </button>
                      <button
                        style={{
                          background: "#4caf50",
                          color: "#fff",
                          border: "none",
                          borderRadius: 4,
                          padding: "0.2rem 0.8rem",
                          fontWeight: "bold",
                          cursor: "pointer",
                        }}
                        onClick={() => {
                          setManageService(service);
                          setShowManageSongsModal(true);
                        }}
                      >
                        🎵 Manage Songs
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          );
        })}
      </div>
      {showEditModal && editService && (
        <EditSundayServiceModal
          service={editService}
          onClose={() => setShowEditModal(false)}
          onSaved={() => {
            setShowEditModal(false);
            fetchServices();
          }}
        />
      )}
      {showDeleteModal && deleteService && (
        <DeleteSundayServiceModal
          service={deleteService}
          onClose={() => setShowDeleteModal(false)}
          onDeleted={() => {
            setShowDeleteModal(false);
            fetchServices();
          }}
        />
      )}
      {showAddModal && (
        <AddSundayServiceModal
          onClose={() => setShowAddModal(false)}
          onAdded={() => {
            setShowAddModal(false);
            fetchServices();
          }}
        />
      )}
      {showManageSongsModal && manageService && (
        <ManageSongsModal
          service={manageService}
          onClose={() => setShowManageSongsModal(false)}
          onChanged={fetchServices}
        />
      )}
    </div>
  );
};

export default SundayServices;
