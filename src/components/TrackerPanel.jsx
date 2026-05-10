/**
 * TrackerPanel — Application pipeline tracker
 * Kanban-style columns: Saved → Applied → Interview → Offer → Rejected
 */
import React, { useState } from "react";
import { STATUSES } from "../hooks/useTracker.js";

function timeAgo(iso) {
  if (!iso) return "";
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60)   return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function EntryCard({ entry, onStatusChange, onRemove, onNoteChange }) {
  const [editNote, setEditNote] = useState(false);
  const [note, setNote]         = useState(entry.notes || "");
  const status = STATUSES.find(s => s.key === entry.status) || STATUSES[0];

  function saveNote() {
    onNoteChange(entry.jobId, note);
    setEditNote(false);
  }

  return (
    <div style={{
      background: "var(--card)", border: "1px solid var(--border)",
      borderRadius: 10, padding: "11px 13px", marginBottom: 8,
      transition: "border-color .15s",
    }}
      onMouseOver={e => e.currentTarget.style.borderColor = status.color + "55"}
      onMouseOut={e => e.currentTarget.style.borderColor = "var(--border)"}
    >
      {/* Title row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 6 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: 12.5, lineHeight: 1.3 }}>{entry.title}</div>
          <div style={{ fontSize: 11.5, color: "var(--text2)", marginTop: 2 }}>
            {entry.regionFlag} {entry.company}
          </div>
        </div>
        <button
          onClick={() => onRemove(entry.jobId)}
          style={{
            background: "none", border: "none", color: "var(--text3)",
            fontSize: 14, cursor: "pointer", padding: "0 2px", lineHeight: 1, flexShrink: 0,
          }}
          title="Remove"
        >×</button>
      </div>

      {/* Meta */}
      <div style={{ display: "flex", gap: 5, marginTop: 7, flexWrap: "wrap" }}>
        <span style={{
          fontSize: 10, padding: "2px 7px", borderRadius: 20,
          background: status.bg, color: status.color,
          border: `1px solid ${status.color}44`,
          fontWeight: 600,
        }}>
          {status.icon} {status.label}
        </span>
        <span style={{ fontSize: 10, color: "var(--text3)" }}>
          {timeAgo(entry.appliedAt)}
        </span>
        {entry.matchScore && (
          <span style={{ fontSize: 10, color: "var(--text3)" }}>
            {entry.matchScore}% match
          </span>
        )}
      </div>

      {/* Status change */}
      <div style={{ display: "flex", gap: 4, marginTop: 8, flexWrap: "wrap" }}>
        {STATUSES.map(s => (
          <button
            key={s.key}
            onClick={() => onStatusChange(entry.jobId, s.key)}
            title={s.label}
            style={{
              padding: "3px 7px", borderRadius: 6, fontSize: 10, cursor: "pointer",
              background: entry.status === s.key ? s.bg : "var(--bg3)",
              border: `1px solid ${entry.status === s.key ? s.color + "66" : "var(--border)"}`,
              color: entry.status === s.key ? s.color : "var(--text3)",
              fontWeight: entry.status === s.key ? 700 : 400,
              transition: "all .15s",
            }}
          >
            {s.icon}
          </button>
        ))}
        <a
          href={entry.applyUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            padding: "3px 7px", borderRadius: 6, fontSize: 10,
            background: "var(--bg3)", border: "1px solid var(--border)",
            color: "var(--accent)", textDecoration: "none",
          }}
        >
          ↗
        </a>
      </div>

      {/* Notes */}
      {editNote ? (
        <div style={{ marginTop: 8 }}>
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            rows={2}
            autoFocus
            style={{
              width: "100%", background: "var(--bg2)",
              border: "1px solid var(--accent)", borderRadius: 6,
              color: "var(--text)", fontSize: 11.5, padding: "6px 8px",
              resize: "none", outline: "none", fontFamily: "inherit",
            }}
          />
          <div style={{ display: "flex", gap: 6, marginTop: 5 }}>
            <button onClick={saveNote} style={{
              padding: "4px 10px", fontSize: 11, borderRadius: 6,
              background: "var(--accent)", border: "none", color: "#fff", cursor: "pointer",
            }}>Save</button>
            <button onClick={() => { setNote(entry.notes || ""); setEditNote(false); }} style={{
              padding: "4px 10px", fontSize: 11, borderRadius: 6,
              background: "var(--bg3)", border: "1px solid var(--border)",
              color: "var(--text2)", cursor: "pointer",
            }}>Cancel</button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => setEditNote(true)}
          style={{
            marginTop: 7, fontSize: 11, color: entry.notes ? "var(--text2)" : "var(--text3)",
            cursor: "pointer", fontStyle: entry.notes ? "normal" : "italic",
            padding: "4px 6px", borderRadius: 5,
            background: "transparent",
            transition: "background .15s",
          }}
          onMouseOver={e => e.currentTarget.style.background = "var(--bg3)"}
          onMouseOut={e => e.currentTarget.style.background = "transparent"}
        >
          {entry.notes || "＋ Add note..."}
        </div>
      )}
    </div>
  );
}

export default function TrackerPanel({ entries, onStatusChange, onRemove, onNoteChange, onClose }) {
  const [activeCol, setActiveCol] = useState("all");

  const counts = STATUSES.reduce((acc, s) => {
    acc[s.key] = entries.filter(e => e.status === s.key).length;
    return acc;
  }, {});

  const displayed = activeCol === "all"
    ? entries
    : entries.filter(e => e.status === activeCol);

  // Sort: most recent first
  const sorted = [...displayed].sort((a, b) =>
    new Date(b.updatedAt) - new Date(a.updatedAt)
  );

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(0,0,0,.72)", backdropFilter: "blur(4px)",
        display: "flex", alignItems: "flex-start", justifyContent: "flex-end",
        padding: 0,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "var(--bg2)", borderLeft: "1px solid var(--border)",
          width: "100%", maxWidth: 480, height: "100vh",
          display: "flex", flexDirection: "column",
          animation: "slideInRight .25s ease",
          boxShadow: "-12px 0 48px rgba(0,0,0,.5)",
        }}
      >
        {/* Header */}
        <div style={{
          padding: "18px 20px", borderBottom: "1px solid var(--border)",
          display: "flex", alignItems: "center", gap: 10,
        }}>
          <span style={{ fontSize: 20 }}>📊</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 15 }}>Application Tracker</div>
            <div style={{ fontSize: 12, color: "var(--text2)", marginTop: 1 }}>
              {entries.length} total · {counts.applied || 0} applied · {counts.interview || 0} interviews
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none", border: "none", color: "var(--text3)",
              fontSize: 22, cursor: "pointer", lineHeight: 1,
            }}
          >×</button>
        </div>

        {/* Status filter tabs */}
        <div style={{
          display: "flex", gap: 0, borderBottom: "1px solid var(--border)",
          overflowX: "auto", padding: "0 4px",
        }}>
          <button
            onClick={() => setActiveCol("all")}
            style={{
              padding: "9px 14px", background: "none", border: "none",
              borderBottom: activeCol === "all" ? "2px solid var(--accent)" : "2px solid transparent",
              color: activeCol === "all" ? "var(--accent)" : "var(--text2)",
              fontWeight: activeCol === "all" ? 600 : 400,
              fontSize: 12, cursor: "pointer", whiteSpace: "nowrap",
            }}
          >
            All ({entries.length})
          </button>
          {STATUSES.map(s => (
            <button
              key={s.key}
              onClick={() => setActiveCol(s.key)}
              style={{
                padding: "9px 12px", background: "none", border: "none",
                borderBottom: activeCol === s.key ? `2px solid ${s.color}` : "2px solid transparent",
                color: activeCol === s.key ? s.color : "var(--text2)",
                fontWeight: activeCol === s.key ? 600 : 400,
                fontSize: 12, cursor: "pointer", whiteSpace: "nowrap",
              }}
            >
              {s.icon} {s.label} {counts[s.key] ? `(${counts[s.key]})` : ""}
            </button>
          ))}
        </div>

        {/* Stats row */}
        <div style={{
          display: "flex", gap: 0, padding: "10px 16px",
          borderBottom: "1px solid var(--border)", flexWrap: "wrap",
        }}>
          {STATUSES.map(s => (
            <div key={s.key} style={{
              flex: 1, textAlign: "center", padding: "6px 4px",
              minWidth: 60,
            }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: s.color }}>
                {counts[s.key] || 0}
              </div>
              <div style={{ fontSize: 10, color: "var(--text3)" }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Entries */}
        <div style={{ flex: 1, overflowY: "auto", padding: "14px 16px" }}>
          {sorted.length === 0 ? (
            <div style={{ textAlign: "center", padding: "48px 20px" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
              <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 6 }}>
                {activeCol === "all" ? "No applications yet" : `No ${activeCol} applications`}
              </div>
              <div style={{ fontSize: 12, color: "var(--text2)" }}>
                {activeCol === "all"
                  ? "Click \"Apply\" on any job card to start tracking."
                  : "Change the filter above to see other applications."}
              </div>
            </div>
          ) : (
            sorted.map(entry => (
              <EntryCard
                key={entry.id}
                entry={entry}
                onStatusChange={onStatusChange}
                onRemove={onRemove}
                onNoteChange={onNoteChange}
              />
            ))
          )}
        </div>

        {/* Footer */}
        {entries.length > 0 && (
          <div style={{
            padding: "10px 16px", borderTop: "1px solid var(--border)",
            fontSize: 11, color: "var(--text3)", textAlign: "center",
          }}>
            Saved locally in your browser · Data persists across sessions
          </div>
        )}
      </div>
    </div>
  );
}
