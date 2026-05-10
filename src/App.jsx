import React, { useState, useMemo } from "react";
import AgentConsole from "./components/AgentConsole.jsx";
import CandidatePanel from "./components/CandidatePanel.jsx";
import JobCard from "./components/JobCard.jsx";
import StatsBar from "./components/StatsBar.jsx";
import FilterBar from "./components/FilterBar.jsx";
import TrackerPanel from "./components/TrackerPanel.jsx";
import { useJobScan, SCAN_STEPS } from "./hooks/useJobScan.js";
import { useTracker } from "./hooks/useTracker.js";

const TODAY = new Date().toLocaleDateString("en-ID", {
  weekday: "long", year: "numeric", month: "long", day: "numeric",
});

export default function App() {
  const { state, jobs, meta, error, stepLog, run } = useJobScan();
  const { entries, upsert, updateStatus, updateNotes, remove, getEntry } = useTracker();
  const [showTracker, setShowTracker] = useState(false);

  const [filters, setFilters] = useState({
    search: "",
    region: "All",
    source: "All",
    workType: "All",
    arrangement: "All",
    minMatch: 0,
    sort: "match",
    freshOnly: false,
  });

  const filtered = useMemo(() => {
    let list = [...jobs];

    if (filters.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(j =>
        j.title.toLowerCase().includes(q) ||
        j.company.toLowerCase().includes(q) ||
        j.location.toLowerCase().includes(q) ||
        j.teaser?.toLowerCase().includes(q) ||
        j.tags.some(t => t.toLowerCase().includes(q))
      );
    }
    if (filters.region && filters.region !== "All") {
      list = list.filter(j => j.region === filters.region);
    }
    if (filters.source && filters.source !== "All") {
      list = list.filter(j => j.source?.includes(filters.source));
    }
    if (filters.workType !== "All") {
      list = list.filter(j => j.type?.toLowerCase().includes(filters.workType.toLowerCase()));
    }
    if (filters.arrangement !== "All") {
      list = list.filter(j => j.arrangement?.toLowerCase().includes(filters.arrangement.toLowerCase()));
    }
    if (filters.minMatch > 0) {
      list = list.filter(j => j.matchScore >= filters.minMatch);
    }
    if (filters.freshOnly) {
      list = list.filter(j => {
        if (!j.posted) return false;
        return (Date.now() - new Date(j.posted).getTime()) / 86400000 <= 7;
      });
    }

    switch (filters.sort) {
      case "match":  list.sort((a, b) => b.matchScore - a.matchScore); break;
      case "newest": list.sort((a, b) => (b.posted || "").localeCompare(a.posted || "")); break;
      case "salary": list.sort((a, b) => {
        const sa = a.salary !== "Not disclosed" ? 1 : 0;
        const sb = b.salary !== "Not disclosed" ? 1 : 0;
        return sb - sa || b.matchScore - a.matchScore;
      }); break;
    }

    return list;
  }, [jobs, filters]);

  const showJobs  = state === "done" || (state === "error" && jobs.length > 0);
  const isRunning = state === "running";

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      {/* Tracker panel */}
      {showTracker && (
        <TrackerPanel
          entries={entries}
          onStatusChange={updateStatus}
          onRemove={remove}
          onNoteChange={updateNotes}
          onClose={() => setShowTracker(false)}
        />
      )}
      {/* Nav */}
      <nav style={{
        background: "var(--bg2)", borderBottom: "1px solid var(--border)",
        padding: "0 22px", height: 54,
        display: "flex", alignItems: "center", gap: 14,
        position: "sticky", top: 0, zIndex: 100,
      }}>
        <span style={{ fontSize: 20 }}>🤖</span>
        <span style={{ fontWeight: 800, fontSize: 15 }}>Evan's Job Agent</span>
        <span className="badge badge-blue" style={{ fontSize: 10 }}>Indonesia · Malaysia · Singapore · Philippines · Japan · Live</span>
        <a
          href="https://id.jobstreet.com/profiles/evanagustian-lukius-c91Xq276yM"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "flex", alignItems: "center", gap: 5,
            padding: "4px 10px", borderRadius: 7, fontSize: 11, fontWeight: 600,
            background: "rgba(79,142,247,.12)", border: "1px solid rgba(79,142,247,.25)",
            color: "#7eb3ff", textDecoration: "none",
          }}
        >
          🌐 JobStreet ↗
        </a>
        <a
          href="https://www.linkedin.com/in/evanlukius/"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "flex", alignItems: "center", gap: 5,
            padding: "4px 10px", borderRadius: 7, fontSize: 11, fontWeight: 600,
            background: "rgba(10,102,194,.15)", border: "1px solid rgba(10,102,194,.3)",
            color: "#60a5fa", textDecoration: "none",
          }}
        >
          💼 LinkedIn ↗
        </a>

        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 11, color: "var(--text3)" }}>📅 {TODAY}</span>
          {state === "done" && (
            <span className="badge badge-green" style={{ fontSize: 10 }}>
              ● {jobs.length} Live Jobs
            </span>
          )}
          {isRunning && (
            <span className="badge badge-yellow" style={{ fontSize: 10, animation: "pulse 1.5s infinite" }}>
              ⟳ Scanning...
            </span>
          )}
          {/* Tracker button */}
          <button
            onClick={() => setShowTracker(true)}
            style={{
              padding: "5px 12px", borderRadius: 8, fontSize: 12, fontWeight: 600,
              background: entries.length > 0 ? "rgba(79,142,247,.15)" : "var(--bg3)",
              border: `1px solid ${entries.length > 0 ? "rgba(79,142,247,.3)" : "var(--border)"}`,
              color: entries.length > 0 ? "#7eb3ff" : "var(--text2)",
              cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
            }}
          >
            📊 Tracker
            {entries.length > 0 && (
              <span style={{
                background: "var(--accent)", color: "#fff",
                borderRadius: 10, fontSize: 10, fontWeight: 700,
                padding: "1px 6px", minWidth: 18, textAlign: "center",
              }}>
                {entries.length}
              </span>
            )}
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: 1300, margin: "0 auto", padding: "22px 18px" }}>
        {/* Title */}
        <div style={{ marginBottom: 20 }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 5 }}>
            🎯 Agentic Job Finder — Live Scan
          </h1>
          <p style={{ color: "var(--text2)", fontSize: 13 }}>
            Scans <strong>JobStreet</strong> & <strong>LinkedIn</strong> across 🇮🇩 Indonesia, 🇲🇾 Malaysia, 🇸🇬 Singapore, 🇵🇭 Philippines & 🇯🇵 Japan in real-time,
            scores every result against your CV, and generates cover letters + auto-fill data.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "270px 1fr", gap: 18, alignItems: "start" }}>
          {/* Sidebar */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <CandidatePanel />

            {/* Agent control card */}
            <div style={{
              background: "var(--card)", border: "1px solid var(--border)",
              borderRadius: "var(--radius)", padding: 14,
            }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>🤖 Job Search Agent</div>

              <button
                onClick={run}
                disabled={isRunning}
                style={{
                  width: "100%", padding: "11px 0",
                  background: isRunning
                    ? "var(--bg3)"
                    : "linear-gradient(135deg, var(--accent), var(--accent2))",
                  border: "none", borderRadius: 8,
                  color: isRunning ? "var(--text3)" : "#fff",
                  fontWeight: 700, fontSize: 13,
                  cursor: isRunning ? "not-allowed" : "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                }}
              >
                {isRunning ? (
                  <><span style={{ animation: "spin 1s linear infinite", display: "inline-block" }}>⟳</span> Scanning live jobs...</>
                ) : state === "done" ? "🔄 Re-scan Now" : "▶ Scan Live Jobs"}
              </button>

              {state !== "idle" && (
                <div style={{ marginTop: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "var(--text3)", marginBottom: 3 }}>
                    <span>Progress</span>
                    <span>{stepLog.filter(s => s.status === "done").length} / {SCAN_STEPS.length} steps</span>
                  </div>
                  <div style={{ height: 3, background: "var(--bg3)", borderRadius: 2, overflow: "hidden" }}>
                    <div style={{
                      width: `${(stepLog.filter(s => s.status === "done").length / SCAN_STEPS.length) * 100}%`,
                      height: "100%",
                      background: state === "done" ? "#22c55e" : "linear-gradient(90deg, var(--accent), var(--accent2))",
                      borderRadius: 2, transition: "width .4s ease",
                    }} />
                  </div>
                </div>
              )}

              {/* What it scans */}
              <div style={{ marginTop: 14 }}>
                <div style={{ fontSize: 10, color: "var(--text3)", marginBottom: 7, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Live Sources
                </div>
                {[
                  { name: "JobStreet Indonesia 🇮🇩", url: "https://id.jobstreet.com",    icon: "🌐", live: true  },
                  { name: "JobStreet Malaysia 🇲🇾",  url: "https://my.jobstreet.com",    icon: "🌐", live: true  },
                  { name: "JobStreet Singapore 🇸🇬", url: "https://sg.jobstreet.com",    icon: "🌐", live: true  },
                  { name: "JobStreet Philippines 🇵🇭",url: "https://ph.jobstreet.com",   icon: "🌐", live: true  },
                  { name: "JobStreet Japan 🇯🇵",     url: "https://jp.jobstreet.com",    icon: "🌐", live: true  },
                  { name: "LinkedIn 🇮🇩🇲🇾🇸🇬🇵🇭🇯🇵",  url: "https://www.linkedin.com/jobs/", icon: "💼", live: true  },
                  { name: "Glints Indonesia",         url: "https://glints.com/id/en",   icon: "🌐", live: false },
                  { name: "Kalibrr",                  url: "https://www.kalibrr.id",     icon: "🌐", live: false },
                  { name: "Dealls.com",               url: "https://dealls.com",         icon: "🌐", live: false },
                  { name: "Loker BUMN",               url: "https://lokerbumn.com",      icon: "🏛️", live: false },
                ].map(p => (
                  <a key={p.name} href={p.url} target="_blank" rel="noopener noreferrer"
                    style={{
                      display: "flex", alignItems: "center", gap: 7,
                      padding: "5px 7px", borderRadius: 6,
                      fontSize: 12, color: "var(--text2)", textDecoration: "none",
                      transition: "background .15s",
                    }}
                    onMouseOver={e => e.currentTarget.style.background = "var(--bg3)"}
                    onMouseOut={e => e.currentTarget.style.background = "transparent"}
                  >
                    <span>{p.icon}</span>
                    <span style={{ flex: 1 }}>{p.name}</span>
                    {p.live
                      ? <span className="badge badge-green" style={{ fontSize: 9 }}>● Live</span>
                      : <span style={{ fontSize: 10, color: "var(--text3)" }}>↗</span>
                    }
                  </a>
                ))}
              </div>

              {/* Search queries used */}
              <div style={{ marginTop: 12 }}>
                <div style={{ fontSize: 10, color: "var(--text3)", marginBottom: 7, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Search Queries
                </div>
                {[
                  "IT fresh graduate Indonesia 🇮🇩",
                  "ODP / Management Trainee IT",
                  "Junior Web Developer ReactJS PHP",
                  "Cloud Engineer GCP DevOps",
                  "Data Analyst SQL Python",
                  "Software Engineer fresh graduate",
                  "IT Business Analyst ERP",
                  "IT fresh graduate Malaysia 🇲🇾",
                  "IT fresh graduate Singapore 🇸🇬",
                  "IT fresh graduate Philippines 🇵🇭",
                  "IT Engineer bilingual Japan 🇯🇵",
                  "LinkedIn: IT entry level 🇮🇩🇲🇾🇸🇬🇵🇭🇯🇵",
                ].map(q => (
                  <div key={q} style={{ fontSize: 11, color: "var(--text3)", padding: "2px 0", display: "flex", gap: 6 }}>
                    <span style={{ color: "var(--accent)" }}>›</span> {q}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main */}
          <div>
            {/* Console — show when running or done */}
            {state !== "idle" && (
              <div style={{ marginBottom: 18, animation: "fadeIn .3s ease" }}>
                <AgentConsole
                  stepLog={stepLog}
                  state={state}
                  totalFound={jobs.length}
                />
              </div>
            )}

            {/* Idle splash */}
            {state === "idle" && (
              <div style={{
                background: "var(--card)", border: "1px dashed var(--border)",
                borderRadius: "var(--radius)", padding: "56px 36px",
                textAlign: "center", animation: "fadeIn .4s ease",
              }}>
                <div style={{ fontSize: 52, marginBottom: 14 }}>🤖</div>
                <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>
                  Ready to Scan Live Jobs
                </h2>
                <p style={{ color: "var(--text2)", fontSize: 13, maxWidth: 420, margin: "0 auto 22px" }}>
                  Click <strong>Scan Live Jobs</strong> to fetch real-time openings from
                  <strong> JobStreet</strong> & <strong>LinkedIn</strong> across 🇮🇩 🇲🇾 🇸🇬 🇵🇭 🇯🇵,
                  scored against your CV profile.
                </p>
                <button
                  onClick={run}
                  style={{
                    padding: "12px 28px",
                    background: "linear-gradient(135deg, var(--accent), var(--accent2))",
                    border: "none", borderRadius: 10,
                    color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer",
                  }}
                >
                  ▶ Scan Live Jobs Now
                </button>

                <div style={{ display: "flex", gap: 18, justifyContent: "center", marginTop: 30, flexWrap: "wrap" }}>
                  {[
                    ["🌐", "Live JobStreet API"],
                    ["📅", "Today's date"],
                    ["🤖", "AI match scoring"],
                    ["✍️", "Cover letter gen"],
                    ["📋", "Auto-fill forms"],
                    ["🚀", "One-click apply"],
                    ["📊", "App tracker"],
                  ].map(([icon, label]) => (
                    <div key={label} style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 22, marginBottom: 3 }}>{icon}</div>
                      <div style={{ fontSize: 11, color: "var(--text3)" }}>{label}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Error state */}
            {state === "error" && jobs.length === 0 && (
              <div style={{
                background: "rgba(239,68,68,.08)", border: "1px solid rgba(239,68,68,.25)",
                borderRadius: "var(--radius)", padding: "24px 20px",
                animation: "fadeIn .3s ease",
              }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>⚠️</div>
                <h3 style={{ color: "#f87171", marginBottom: 6 }}>Scan Failed</h3>
                <p style={{ color: "var(--text2)", fontSize: 13 }}>
                  Could not reach the backend. Make sure the API server is running:
                </p>
                <pre style={{
                  background: "#0d1117", borderRadius: 7, padding: "10px 14px",
                  fontSize: 12, color: "#4f8ef7", marginTop: 10,
                }}>
                  node server.js
                </pre>
                <button
                  onClick={run}
                  style={{
                    marginTop: 14, padding: "9px 20px",
                    background: "var(--accent)", border: "none",
                    borderRadius: 8, color: "#fff", fontWeight: 600, fontSize: 13, cursor: "pointer",
                  }}
                >
                  🔄 Retry
                </button>
              </div>
            )}

            {/* Results */}
            {showJobs && jobs.length > 0 && (
              <div style={{ animation: "fadeIn .4s ease" }}>
                <StatsBar jobs={jobs} scannedAt={meta?.scannedAt} />
                <FilterBar
                  filters={filters}
                  setFilters={setFilters}
                  totalShown={filtered.length}
                  totalJobs={jobs.length}
                />

                {filtered.length === 0 ? (
                  <div style={{
                    background: "var(--card)", border: "1px solid var(--border)",
                    borderRadius: "var(--radius)", padding: "36px", textAlign: "center",
                  }}>
                    <div style={{ fontSize: 32, marginBottom: 10 }}>🔍</div>
                    <p style={{ color: "var(--text2)" }}>No jobs match your filters. Try adjusting them.</p>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                    {filtered.map((job, i) => (
                      <JobCard
                        key={job.id}
                        job={job}
                        index={i}
                        trackerEntry={getEntry(job.id)}
                        onApply={(j, status, notes) => upsert(j, status, notes)}
                        onStatusChange={updateStatus}
                      />
                    ))}
                  </div>
                )}

                <div style={{
                  marginTop: 20, padding: "12px 14px",
                  background: "var(--card)", border: "1px solid var(--border)",
                  borderRadius: "var(--radius)", fontSize: 11.5, color: "var(--text3)",
                  display: "flex", gap: 8,
                }}>
                  <span>ℹ️</span>
                  <span>
                    Live data from <strong>JobStreet</strong> & <strong>LinkedIn</strong> — 🇮🇩 Indonesia, 🇲🇾 Malaysia, 🇸🇬 Singapore, 🇵🇭 Philippines & 🇯🇵 Japan — scanned {meta?.scannedAt || "today"}.
                    {meta?.jobStreetCount != null && ` JobStreet: ${meta.jobStreetCount} · LinkedIn: ${meta.linkedInCount}.`}
                    {" "}Match scores calculated against Evan's CV. Click any job to apply.
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
