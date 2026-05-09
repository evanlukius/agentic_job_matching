import React from "react";

export default function StatsBar({ jobs, scannedAt }) {
  const fresh   = jobs.filter(j => {
    if (!j.posted) return false;
    return (Date.now() - new Date(j.posted).getTime()) / 86400000 <= 7;
  }).length;
  const high    = jobs.filter(j => j.matchScore >= 80).length;
  const avgScore = jobs.length
    ? Math.round(jobs.reduce((a, j) => a + j.matchScore, 0) / jobs.length)
    : 0;
  const withSalary = jobs.filter(j => j.salary && j.salary !== "Not disclosed").length;

  const stats = [
    { label: "Jobs Found",    value: jobs.length,   icon: "🔍", color: "#4f8ef7" },
    { label: "Posted ≤7 days",value: fresh,          icon: "🆕", color: "#22c55e" },
    { label: "80%+ Match",    value: high,           icon: "⭐", color: "#f59e0b" },
    { label: "Avg Match",     value: `${avgScore}%`, icon: "📊", color: "#4f8ef7" },
    { label: "Salary Listed", value: withSalary,     icon: "💰", color: "#a78bfa" },
    { label: "Scanned",       value: scannedAt || "–", icon: "📅", color: "#8b95a8" },
  ];

  return (
    <div style={{
      display: "grid", gridTemplateColumns: "repeat(6, 1fr)",
      gap: 8, marginBottom: 16,
    }}>
      {stats.map(s => (
        <div key={s.label} style={{
          background: "var(--card)", border: "1px solid var(--border)",
          borderRadius: "var(--radius-sm)", padding: "10px 12px", textAlign: "center",
        }}>
          <div style={{ fontSize: 18, marginBottom: 3 }}>{s.icon}</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: s.color }}>{s.value}</div>
          <div style={{ fontSize: 10, color: "var(--text3)", marginTop: 1 }}>{s.label}</div>
        </div>
      ))}
    </div>
  );
}
