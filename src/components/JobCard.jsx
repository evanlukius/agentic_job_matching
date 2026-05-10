import React, { useState } from "react";
import { generateCoverLetter, getAutoFillData } from "../data/agentSteps.js";
import { candidate } from "../data/candidateProfile.js";
import ApplyModal from "./ApplyModal.jsx";
import { STATUSES } from "../hooks/useTracker.js";

function MatchBar({ score }) {
  const color = score >= 80 ? "#22c55e" : score >= 65 ? "#4f8ef7" : "#f59e0b";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ flex: 1, height: 5, background: "#2a3347", borderRadius: 3, overflow: "hidden" }}>
        <div style={{
          width: `${score}%`, height: "100%", background: color,
          borderRadius: 3, transition: "width 1s ease",
        }} />
      </div>
      <span style={{ fontSize: 12, fontWeight: 700, color, minWidth: 32 }}>{score}%</span>
    </div>
  );
}

export default function JobCard({ job, index, trackerEntry, onApply, onStatusChange }) {
  const [expanded, setExpanded] = useState(false);
  const [tab, setTab]           = useState("details");
  const [copied, setCopied]     = useState(false);
  const [showModal, setShowModal] = useState(false);

  const coverLetter = generateCoverLetter(job, candidate);
  const autoFill    = getAutoFillData(candidate, job.region || "ID");
  const matchColor  = job.matchScore >= 80 ? "#22c55e" : job.matchScore >= 65 ? "#4f8ef7" : "#f59e0b";

  const coverLangLabel = {
    ID: { flag: "🇮🇩", label: "Bahasa Indonesia" },
    MY: { flag: "🇲🇾", label: "English" },
    SG: { flag: "🇸🇬", label: "English" },
    PH: { flag: "🇵🇭", label: "English" },
    JP: { flag: "🇯🇵", label: "日本語" },
  }[job.region || "ID"] || { flag: "🌏", label: "English" };

  // Tracker status for this job
  const trackerStatus = trackerEntry
    ? STATUSES.find(s => s.key === trackerEntry.status)
    : null;

  function handleCopy(text) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function handleApplyClick(e) {
    e.stopPropagation();
    setShowModal(true);
  }

  function handleSaveJob(e) {
    e.stopPropagation();
    onApply(job, "saved");
  }

  // Days since posted
  const daysAgo = job.posted
    ? Math.floor((Date.now() - new Date(job.posted).getTime()) / 86400000)
    : null;
  const freshLabel = daysAgo === 0 ? "Today" : daysAgo === 1 ? "Yesterday" : daysAgo != null ? `${daysAgo}d ago` : "";

  return (
    <>
      {showModal && (
        <ApplyModal
          job={job}
          onClose={() => setShowModal(false)}
          onApplied={(j, status, notes) => {
            onApply(j, status, notes);
            setShowModal(false);
          }}
        />
      )}

      <div style={{
        background: "var(--card)",
        border: `1px solid ${expanded ? "var(--accent)" : trackerStatus ? trackerStatus.color + "44" : "var(--border)"}`,
        borderRadius: "var(--radius)",
        overflow: "hidden",
        transition: "border-color .2s, box-shadow .2s",
        boxShadow: expanded ? "0 0 0 1px rgba(79,142,247,.15), 0 8px 32px rgba(0,0,0,.3)" : "none",
        animation: `fadeIn .35s ease ${Math.min(index * 0.04, 0.5)}s both`,
      }}>
        {/* ── Header ── */}
        <div
          onClick={() => setExpanded(!expanded)}
          style={{
            padding: "14px 18px", cursor: "pointer",
            display: "flex", gap: 12, alignItems: "flex-start",
            background: expanded ? "var(--card-hover)" : "transparent",
            transition: "background .2s",
          }}
        >
          {/* Logo */}
          <div style={{
            width: 42, height: 42, borderRadius: 10,
            background: "var(--bg3)", display: "flex", alignItems: "center",
            justifyContent: "center", fontSize: 20, flexShrink: 0,
            border: "1px solid var(--border)",
          }}>
            {job.logo}
          </div>

          {/* Info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 6, flexWrap: "wrap" }}>
              <span style={{ fontWeight: 700, fontSize: 14, color: "var(--text)" }}>
                {job.title}
              </span>
              {job.featured && <span className="badge badge-yellow" style={{ fontSize: 10 }}>⭐ Featured</span>}
              {job.expiresLabel && <span className="badge badge-red" style={{ fontSize: 10 }}>⏰ {job.expiresLabel}</span>}
              {daysAgo !== null && daysAgo <= 3 && (
                <span className="badge badge-green" style={{ fontSize: 10 }}>🆕 {freshLabel}</span>
              )}
              {/* Tracker status badge */}
              {trackerStatus && (
                <span style={{
                  fontSize: 10, padding: "2px 8px", borderRadius: 20, fontWeight: 600,
                  background: trackerStatus.bg, color: trackerStatus.color,
                  border: `1px solid ${trackerStatus.color}44`,
                }}>
                  {trackerStatus.icon} {trackerStatus.label}
                </span>
              )}
            </div>

            <div style={{ color: "var(--text2)", fontSize: 12.5, marginTop: 2 }}>
              {job.company} · {job.regionFlag} {job.location}
            </div>

            <div style={{ display: "flex", gap: 5, marginTop: 7, flexWrap: "wrap" }}>
              <span className="badge badge-gray">{job.type}</span>
              <span className="badge badge-blue">{job.arrangement}</span>
              <span className="badge badge-purple">via {job.source}</span>
              {job.easyApply && <span className="badge badge-green" style={{ fontSize: 10 }}>⚡ Easy Apply</span>}
              {freshLabel && <span className="badge badge-gray">{freshLabel}</span>}
            </div>
          </div>

          {/* Match + salary + quick actions */}
          <div style={{ textAlign: "right", flexShrink: 0, minWidth: 120 }}>
            <div style={{ fontSize: 10, color: "var(--text3)", marginBottom: 3 }}>AI Match</div>
            <MatchBar score={job.matchScore} />
            <div style={{ fontSize: 11, color: "var(--text2)", marginTop: 4, marginBottom: 8 }}>
              {job.salary !== "Not disclosed" ? job.salary : "Salary not listed"}
            </div>
            {/* Quick apply button */}
            <button
              onClick={handleApplyClick}
              style={{
                padding: "5px 12px", fontSize: 11, fontWeight: 600, borderRadius: 7,
                background: trackerEntry?.status === "applied"
                  ? "rgba(79,142,247,.15)"
                  : "linear-gradient(135deg, var(--accent), var(--accent2))",
                border: trackerEntry?.status === "applied"
                  ? "1px solid rgba(79,142,247,.3)"
                  : "none",
                color: "#fff", cursor: "pointer",
                display: "flex", alignItems: "center", gap: 5,
              }}
            >
              {trackerEntry?.status === "applied" ? "🚀 Applied" : "🚀 Apply"}
            </button>
          </div>

          {/* Chevron */}
          <div style={{
            color: "var(--text3)", fontSize: 18, flexShrink: 0,
            transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform .2s",
          }}>⌄</div>
        </div>

        {/* ── Expanded ── */}
        {expanded && (
          <div style={{ borderTop: "1px solid var(--border)" }}>
            {/* Tabs */}
            <div style={{ display: "flex", borderBottom: "1px solid var(--border)" }}>
              {[
                ["details",  "📋 Details"],
                ["cover",    "✍️ Cover Letter"],
                ["autofill", "📝 Auto-Fill"],
              ].map(([key, label]) => (
                <button key={key} onClick={() => setTab(key)} style={{
                  padding: "9px 16px", background: "none", border: "none",
                  borderBottom: tab === key ? "2px solid var(--accent)" : "2px solid transparent",
                  color: tab === key ? "var(--accent)" : "var(--text2)",
                  fontWeight: tab === key ? 600 : 400,
                  fontSize: 12.5, cursor: "pointer", transition: "color .15s",
                }}>
                  {label}
                </button>
              ))}
            </div>

            <div style={{ padding: 18 }}>
              {/* DETAILS */}
              {tab === "details" && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
                  <div>
                    {job.teaser && (
                      <>
                        <h4 style={sectionHead}>About the Role</h4>
                        <p style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.7 }}>{job.teaser}</p>
                      </>
                    )}
                    {job.bulletPoints?.length > 0 && (
                      <>
                        <h4 style={{ ...sectionHead, marginTop: 14 }}>Highlights</h4>
                        <ul style={{ paddingLeft: 0, listStyle: "none" }}>
                          {job.bulletPoints.map((b, i) => (
                            <li key={i} style={{ fontSize: 13, color: "var(--text)", marginBottom: 5, display: "flex", gap: 8 }}>
                              <span style={{ color: "var(--green)" }}>✓</span> {b}
                            </li>
                          ))}
                        </ul>
                      </>
                    )}
                    <h4 style={{ ...sectionHead, marginTop: 14 }}>Tags</h4>
                    <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                      {job.tags.map(t => <span key={t} className="badge badge-gray">{t}</span>)}
                    </div>
                  </div>

                  <div>
                    <h4 style={sectionHead}>Why You Match</h4>
                    <ul style={{ paddingLeft: 0, listStyle: "none" }}>
                      {job.matchReasons.map((r, i) => (
                        <li key={i} style={{ fontSize: 13, color: "var(--text)", marginBottom: 6, display: "flex", gap: 8 }}>
                          <span style={{ color: matchColor, fontSize: 15, lineHeight: 1 }}>★</span> {r}
                        </li>
                      ))}
                    </ul>

                    <div style={{
                      background: "var(--bg3)", borderRadius: 8, padding: 12, marginTop: 14,
                      border: "1px solid var(--border)",
                    }}>
                      <div style={{ fontSize: 11, color: "var(--text2)", marginBottom: 7 }}>Job Info</div>
                      {[
                        ["📅 Posted",      job.postedDisplay || job.posted],
                        ["💰 Salary",      job.salary],
                        ["📍 Location",    job.location],
                        ["🏢 Arrangement", job.arrangement],
                        ["🔗 Source",      job.source],
                      ].map(([label, val]) => (
                        <div key={label} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                          <span style={{ color: "var(--text2)" }}>{label}</span>
                          <span style={{ color: "var(--text)", fontWeight: 500 }}>{val}</span>
                        </div>
                      ))}
                      {/* Tracker status in details */}
                      {trackerEntry && (
                        <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid var(--border)" }}>
                          <div style={{ fontSize: 11, color: "var(--text2)", marginBottom: 6 }}>📊 Tracker Status</div>
                          <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                            {STATUSES.map(s => (
                              <button
                                key={s.key}
                                onClick={() => onStatusChange(job.id, s.key)}
                                style={{
                                  padding: "4px 9px", borderRadius: 6, fontSize: 11, cursor: "pointer",
                                  background: trackerEntry.status === s.key ? s.bg : "var(--bg2)",
                                  border: `1px solid ${trackerEntry.status === s.key ? s.color + "66" : "var(--border)"}`,
                                  color: trackerEntry.status === s.key ? s.color : "var(--text3)",
                                  fontWeight: trackerEntry.status === s.key ? 700 : 400,
                                }}
                              >
                                {s.icon} {s.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
                      <button
                        onClick={handleApplyClick}
                        style={{
                          flex: 1, padding: "10px 0",
                          background: "linear-gradient(135deg, var(--accent), var(--accent2))",
                          border: "none", borderRadius: 8, color: "#fff",
                          fontWeight: 600, fontSize: 13, cursor: "pointer",
                        }}
                      >
                        🚀 Apply on JobStreet
                      </button>
                      {!trackerEntry && (
                        <button
                          onClick={handleSaveJob}
                          style={{
                            padding: "10px 12px",
                            background: "var(--bg3)",
                            border: "1px solid var(--border)",
                            color: "var(--text2)",
                            borderRadius: 8, fontSize: 12, fontWeight: 500, cursor: "pointer",
                          }}
                        >
                          🔖 Save
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* COVER LETTER */}
              {tab === "cover" && (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <div>
                      <h4 style={{ fontSize: 14, fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}>
                        AI-Generated Cover Letter
                        <span style={{
                          fontSize: 11, fontWeight: 600, padding: "2px 8px",
                          background: "var(--bg3)", border: "1px solid var(--border)",
                          borderRadius: 20, color: "var(--text2)",
                        }}>
                          {coverLangLabel.flag} {coverLangLabel.label}
                        </span>
                      </h4>
                      <p style={{ fontSize: 12, color: "var(--text2)", marginTop: 2 }}>
                        Tailored for {job.title} at {job.company}
                      </p>
                    </div>
                    <button
                      onClick={() => handleCopy(coverLetter)}
                      style={{
                        padding: "7px 12px",
                        background: copied ? "rgba(34,197,94,.15)" : "var(--bg3)",
                        border: `1px solid ${copied ? "#22c55e" : "var(--border)"}`,
                        color: copied ? "#22c55e" : "var(--text2)",
                        borderRadius: 8, fontSize: 12,
                      }}
                    >
                      {copied ? "✓ Copied!" : "📋 Copy"}
                    </button>
                  </div>
                  <pre style={{
                    background: "var(--bg3)", border: "1px solid var(--border)",
                    borderRadius: 8, padding: 14, fontSize: 12.5, lineHeight: 1.8,
                    color: "var(--text)", whiteSpace: "pre-wrap", wordBreak: "break-word",
                    maxHeight: 380, overflowY: "auto",
                  }}>
                    {coverLetter}
                  </pre>
                </div>
              )}

              {/* AUTO-FILL */}
              {tab === "autofill" && (
                <div>
                  <div style={{ marginBottom: 10 }}>
                    <h4 style={{ fontSize: 14, fontWeight: 600 }}>Auto-Fill Form Data</h4>
                    <p style={{ fontSize: 12, color: "var(--text2)", marginTop: 2 }}>
                      Click any field to copy it to clipboard
                    </p>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7 }}>
                    {Object.entries(autoFill).map(([key, val]) => (
                      <div
                        key={key}
                        onClick={() => handleCopy(String(val))}
                        style={{
                          background: "var(--bg3)", border: "1px solid var(--border)",
                          borderRadius: 8, padding: "9px 11px", cursor: "pointer",
                          transition: "border-color .15s",
                        }}
                        onMouseOver={e => e.currentTarget.style.borderColor = "var(--accent)"}
                        onMouseOut={e => e.currentTarget.style.borderColor = "var(--border)"}
                      >
                        <div style={{ fontSize: 10, color: "var(--text3)", marginBottom: 2, textTransform: "uppercase", letterSpacing: "0.4px" }}>
                          {key}
                        </div>
                        <div style={{ fontSize: 12.5, color: "var(--text)", fontWeight: 500 }}>{String(val)}</div>
                        <div style={{ fontSize: 10, color: "var(--text3)", marginTop: 2 }}>click to copy</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

const sectionHead = {
  fontSize: 11, color: "var(--text2)", marginBottom: 7,
  textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: 700,
};
