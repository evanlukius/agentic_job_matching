import React from "react";

export default function FilterBar({ filters, setFilters, totalShown, totalJobs }) {
  function update(key, val) {
    setFilters(prev => ({ ...prev, [key]: val }));
  }

  return (
    <div style={{
      background: "var(--card)", border: "1px solid var(--border)",
      borderRadius: "var(--radius)", padding: "12px 14px",
      marginBottom: 14, display: "flex", gap: 10,
      alignItems: "center", flexWrap: "wrap",
    }}>
      {/* Search */}
      <div style={{ position: "relative", flex: "1 1 180px" }}>
        <span style={{
          position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)",
          color: "var(--text3)", fontSize: 13,
        }}>🔍</span>
        <input
          type="text"
          placeholder="Search title, company, skill..."
          value={filters.search}
          onChange={e => update("search", e.target.value)}
          style={{
            width: "100%", padding: "7px 9px 7px 30px",
            background: "var(--bg3)", border: "1px solid var(--border)",
            borderRadius: 7, color: "var(--text)", fontSize: 12.5, outline: "none",
          }}
        />
      </div>

      {/* Region */}
      <select value={filters.region || "All"} onChange={e => update("region", e.target.value)} style={sel}>
        <option value="All">🌏 All Regions</option>
        <option value="ID">🇮🇩 Indonesia</option>
        <option value="MY">🇲🇾 Malaysia</option>
        <option value="SG">🇸🇬 Singapore</option>
        <option value="PH">🇵🇭 Philippines</option>
        <option value="JP">🇯🇵 Japan</option>
      </select>

      {/* Source */}
      <select value={filters.source || "All"} onChange={e => update("source", e.target.value)} style={sel}>
        <option value="All">📡 All Sources</option>
        <option value="JobStreet">🌐 JobStreet</option>
        <option value="LinkedIn">💼 LinkedIn</option>
      </select>

      {/* Work type */}
      <select value={filters.workType} onChange={e => update("workType", e.target.value)} style={sel}>
        <option value="All">All Types</option>
        <option value="Full time">Full-time</option>
        <option value="Contract">Contract</option>
        <option value="Part time">Part-time</option>
      </select>

      {/* Arrangement */}
      <select value={filters.arrangement} onChange={e => update("arrangement", e.target.value)} style={sel}>
        <option value="All">All Arrangements</option>
        <option value="On-site">On-site</option>
        <option value="Remote">Remote</option>
        <option value="Hybrid">Hybrid</option>
      </select>

      {/* Min match */}
      <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12, color: "var(--text2)" }}>
        <span>Min match:</span>
        <input
          type="range" min={0} max={99} step={5}
          value={filters.minMatch}
          onChange={e => update("minMatch", Number(e.target.value))}
          style={{ width: 70, accentColor: "var(--accent)" }}
        />
        <span style={{ color: "var(--accent)", fontWeight: 600, minWidth: 30 }}>
          {filters.minMatch}%
        </span>
      </div>

      {/* Sort */}
      <select value={filters.sort} onChange={e => update("sort", e.target.value)} style={sel}>
        <option value="match">Best Match</option>
        <option value="newest">Newest First</option>
        <option value="salary">Salary Listed</option>
      </select>

      {/* Fresh only toggle */}
      <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--text2)", cursor: "pointer" }}>
        <input
          type="checkbox"
          checked={filters.freshOnly}
          onChange={e => update("freshOnly", e.target.checked)}
          style={{ accentColor: "var(--accent)" }}
        />
        Last 7 days only
      </label>

      <span style={{ fontSize: 11, color: "var(--text3)", marginLeft: "auto", whiteSpace: "nowrap" }}>
        {totalShown} / {totalJobs} jobs
      </span>
    </div>
  );
}

const sel = {
  padding: "7px 9px", background: "var(--bg3)",
  border: "1px solid var(--border)", borderRadius: 7,
  color: "var(--text)", fontSize: 12, outline: "none", cursor: "pointer",
};
