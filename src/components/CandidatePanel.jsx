import React from "react";
import { candidate } from "../data/candidateProfile.js";

export default function CandidatePanel() {
  return (
    <div style={{
      background: "var(--card)",
      border: "1px solid var(--border)",
      borderRadius: "var(--radius)",
      overflow: "hidden",
    }}>
      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, #1a2a4a 0%, #0f1a35 100%)",
        padding: "20px",
        borderBottom: "1px solid var(--border)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            width: 52, height: 52, borderRadius: "50%",
            background: "linear-gradient(135deg, var(--accent), var(--accent2))",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 22, fontWeight: 800, color: "#fff", flexShrink: 0,
            border: "2px solid rgba(255,255,255,.15)",
          }}>
            EA
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15 }}>{candidate.name}</div>
            <div style={{ fontSize: 12, color: "var(--text2)", marginTop: 2 }}>
              {candidate.degree}
            </div>
            <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 1 }}>
              {candidate.university} · GPA {candidate.gpa}
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: "16px" }}>
        {/* Contact */}
        <Section title="Contact">
          {[
            ["📧", candidate.email],
            ["📱", candidate.phone],
            ["🔗", candidate.linkedin],
            ["📍", candidate.location],
          ].map(([icon, val]) => (
            <div key={val} style={{ display: "flex", gap: 8, fontSize: 12, marginBottom: 5, alignItems: "flex-start" }}>
              <span>{icon}</span>
              <span style={{ color: "var(--text2)", wordBreak: "break-all" }}>{val}</span>
            </div>
          ))}
        </Section>

        {/* Skills */}
        <Section title="Skills">
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
            {candidate.skills.map(s => (
              <span key={s} className="badge badge-blue" style={{ fontSize: 10 }}>{s}</span>
            ))}
          </div>
        </Section>

        {/* Languages */}
        <Section title="Languages">
          {candidate.languages.map(l => (
            <div key={l.lang} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
              <span style={{ color: "var(--text)" }}>{l.lang}</span>
              <span className="badge badge-green" style={{ fontSize: 10 }}>{l.level}</span>
            </div>
          ))}
        </Section>

        {/* Match stats */}
        <Section title="Profile Strength">
          {[
            { label: "Technical Skills",    val: 92 },
            { label: "International Exp.",  val: 95 },
            { label: "Leadership",          val: 85 },
            { label: "Communication",       val: 90 },
            { label: "Education",           val: 88 },
          ].map(({ label, val }) => (
            <div key={label} style={{ marginBottom: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 3 }}>
                <span style={{ color: "var(--text2)" }}>{label}</span>
                <span style={{ color: "var(--text)", fontWeight: 600 }}>{val}%</span>
              </div>
              <div style={{ height: 4, background: "var(--bg3)", borderRadius: 2, overflow: "hidden" }}>
                <div style={{
                  width: `${val}%`, height: "100%",
                  background: "linear-gradient(90deg, var(--accent), var(--accent2))",
                  borderRadius: 2,
                }} />
              </div>
            </div>
          ))}
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{
        fontSize: 10, fontWeight: 700, color: "var(--text3)",
        textTransform: "uppercase", letterSpacing: "0.8px",
        marginBottom: 8, paddingBottom: 4,
        borderBottom: "1px solid var(--border)",
      }}>
        {title}
      </div>
      {children}
    </div>
  );
}
