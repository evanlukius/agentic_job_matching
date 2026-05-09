import React, { useEffect, useRef } from "react";
import { SCAN_STEPS } from "../hooks/useJobScan.js";

const STATUS_COLOR = {
  running: "#f59e0b",
  done:    "#22c55e",
  error:   "#ef4444",
};
const STATUS_ICON = {
  running: "⟳",
  done:    "✓",
  error:   "✗",
};

export default function AgentConsole({ stepLog, state, totalFound }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [stepLog.length]);

  return (
    <div style={{
      background: "#0d1117",
      border: "1px solid #2a3347",
      borderRadius: 12,
      padding: "14px 18px",
      fontFamily: "'Courier New', monospace",
      fontSize: 12.5,
      maxHeight: 300,
      overflowY: "auto",
    }}>
      {/* Window chrome */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <div style={{ display: "flex", gap: 5 }}>
          {["#ef4444","#f59e0b","#22c55e"].map(c => (
            <div key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c }} />
          ))}
        </div>
        <span style={{ color: "#5a6478", fontSize: 11, marginLeft: 4 }}>
          evan-job-agent ~ live-scan
        </span>
        <span style={{
          marginLeft: "auto", fontSize: 11,
          color: state === "running" ? "#f59e0b" : state === "done" ? "#22c55e" : "#ef4444",
          animation: state === "running" ? "pulse 1.5s infinite" : "none",
        }}>
          ● {state === "running" ? "SCANNING" : state === "done" ? "COMPLETE" : state === "error" ? "ERROR" : "IDLE"}
        </span>
      </div>

      {/* Command line */}
      <div style={{ color: "#4f8ef7", marginBottom: 8 }}>
        $ evan-agent --scan --live --source=jobstreet.co.id --country=ID --date={new Date().toISOString().slice(0,10)}
      </div>

      {/* Step log */}
      {stepLog.map((s, i) => (
        <div key={s.id} style={{
          display: "flex", alignItems: "center", gap: 8,
          marginBottom: 3,
          animation: "fadeIn .25s ease both",
          animationDelay: `${i * 0.03}s`,
        }}>
          <span style={{ color: "#22c55e", minWidth: 12 }}>›</span>
          <span style={{ color: "#5a6478", minWidth: 52, fontSize: 11 }}>
            [{String(s.id).padStart(2,"0")}/{SCAN_STEPS.length}]
          </span>
          <span>{s.icon}</span>
          <span style={{ color: s.status === "running" ? "#e8eaf0" : "#8b95a8", flex: 1 }}>
            {s.label}
          </span>
          <span style={{
            color: STATUS_COLOR[s.status] || "#5a6478",
            fontSize: 11,
            animation: s.status === "running" ? "spin 1s linear infinite" : "none",
            display: "inline-block",
          }}>
            {STATUS_ICON[s.status] || "·"}
            {s.status === "running" ? " running" : s.status === "done" ? " done" : s.status === "error" ? " error" : ""}
            {s.count != null ? ` — ${s.count} jobs` : ""}
          </span>
        </div>
      ))}

      {state === "done" && (
        <div style={{ marginTop: 8, color: "#22c55e", fontWeight: 600 }}>
          ✅ Scan complete — {totalFound} live jobs found from JobStreet Indonesia, ranked by match score.
        </div>
      )}
      {state === "error" && (
        <div style={{ marginTop: 8, color: "#ef4444" }}>
          ✗ Scan failed. Check that the backend server is running on port 3001.
        </div>
      )}
      {state === "running" && (
        <div style={{ color: "#4f8ef7", marginTop: 4 }}>
          <span style={{ animation: "pulse 1s infinite", display: "inline-block" }}>▋</span>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
