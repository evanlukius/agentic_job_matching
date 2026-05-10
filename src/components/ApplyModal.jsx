/**
 * ApplyModal — "Open & Pre-fill" flow
 * 1. Shows all auto-fill fields with one-click copy
 * 2. Shows the cover letter with copy button
 * 3. "Open JobStreet" button opens the job in a new tab
 * 4. Marks the job as Applied in the tracker
 */
import React, { useState, useEffect } from "react";
import { generateCoverLetter, getAutoFillData } from "../data/agentSteps.js";
import { candidate } from "../data/candidateProfile.js";
import { STATUSES } from "../hooks/useTracker.js";

const COVER_LANG = {
  ID: { flag: "🇮🇩", label: "Bahasa Indonesia" },
  MY: { flag: "🇲🇾", label: "English" },
  SG: { flag: "🇸🇬", label: "English" },
  PH: { flag: "🇵🇭", label: "English" },
  JP: { flag: "🇯🇵", label: "日本語" },
};

export default function ApplyModal({ job, onClose, onApplied }) {
  const [step, setStep]         = useState(1); // 1=prefill, 2=cover, 3=done
  const [copiedKey, setCopiedKey] = useState(null);
  const [coverCopied, setCoverCopied] = useState(false);
  const [notes, setNotes]       = useState("");
  const [opened, setOpened]     = useState(false);

  const autoFill    = getAutoFillData(candidate, job.region || "ID");
  const coverLetter = generateCoverLetter(job, candidate);
  const langInfo    = COVER_LANG[job.region || "ID"] || { flag: "🌏", label: "English" };

  // Lock body scroll while modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  function copyField(val, key) {
    navigator.clipboard.writeText(String(val)).then(() => {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 1800);
    });
  }

  function copyAll() {
    const text = Object.entries(autoFill)
      .map(([k, v]) => `${k}: ${v}`)
      .join("\n");
    navigator.clipboard.writeText(text).then(() => {
      setCopiedKey("__all__");
      setTimeout(() => setCopiedKey(null), 1800);
    });
  }

  function copyCover() {
    navigator.clipboard.writeText(coverLetter).then(() => {
      setCoverCopied(true);
      setTimeout(() => setCoverCopied(false), 1800);
    });
  }

  function handleOpenJobStreet() {
    window.open(job.applyUrl, "_blank", "noopener,noreferrer");
    setOpened(true);
  }

  function handleMarkApplied() {
    onApplied(job, "applied", notes);
    setStep(3);
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(0,0,0,.72)", backdropFilter: "blur(4px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "20px 16px",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "var(--bg2)", border: "1px solid var(--border)",
          borderRadius: 16, width: "100%", maxWidth: 680,
          maxHeight: "90vh", display: "flex", flexDirection: "column",
          boxShadow: "0 24px 80px rgba(0,0,0,.6)",
          animation: "fadeIn .2s ease",
        }}
      >
        {/* ── Header ── */}
        <div style={{
          padding: "16px 20px", borderBottom: "1px solid var(--border)",
          display: "flex", alignItems: "flex-start", gap: 12,
        }}>
          <div style={{
            width: 44, height: 44, borderRadius: 10,
            background: "var(--bg3)", display: "flex", alignItems: "center",
            justifyContent: "center", fontSize: 22, flexShrink: 0,
            border: "1px solid var(--border)",
          }}>
            {job.logo}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 15 }}>{job.title}</div>
            <div style={{ color: "var(--text2)", fontSize: 12.5, marginTop: 2 }}>
              {job.company} · {job.regionFlag} {job.location}
            </div>
          </div>
          {/* Step indicator */}
          <div style={{ display: "flex", gap: 6, alignItems: "center", flexShrink: 0 }}>
            {[1, 2, 3].map(s => (
              <div key={s} style={{
                width: s === step ? 22 : 8, height: 8, borderRadius: 4,
                background: s < step ? "#22c55e" : s === step ? "var(--accent)" : "var(--border)",
                transition: "all .3s ease",
              }} />
            ))}
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none", border: "none", color: "var(--text3)",
              fontSize: 20, cursor: "pointer", padding: "0 4px", lineHeight: 1,
              flexShrink: 0,
            }}
          >×</button>
        </div>

        {/* ── Step tabs ── */}
        <div style={{ display: "flex", borderBottom: "1px solid var(--border)" }}>
          {[
            { s: 1, label: "📝 Auto-Fill Data" },
            { s: 2, label: "✍️ Cover Letter" },
            { s: 3, label: "✅ Confirm" },
          ].map(({ s, label }) => (
            <button key={s} onClick={() => setStep(s)} style={{
              flex: 1, padding: "10px 0", background: "none", border: "none",
              borderBottom: step === s ? "2px solid var(--accent)" : "2px solid transparent",
              color: step === s ? "var(--accent)" : "var(--text2)",
              fontWeight: step === s ? 600 : 400,
              fontSize: 12.5, cursor: "pointer",
            }}>
              {label}
            </button>
          ))}
        </div>

        {/* ── Body ── */}
        <div style={{ flex: 1, overflowY: "auto", padding: "18px 20px" }}>

          {/* STEP 1 — Auto-fill */}
          {step === 1 && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>Your Application Data</div>
                  <div style={{ fontSize: 12, color: "var(--text2)", marginTop: 2 }}>
                    Click any field to copy · Use these to fill the JobStreet form
                  </div>
                </div>
                <button onClick={copyAll} style={{
                  padding: "6px 12px", fontSize: 12, borderRadius: 7,
                  background: copiedKey === "__all__" ? "rgba(34,197,94,.15)" : "var(--bg3)",
                  border: `1px solid ${copiedKey === "__all__" ? "#22c55e" : "var(--border)"}`,
                  color: copiedKey === "__all__" ? "#22c55e" : "var(--text2)",
                }}>
                  {copiedKey === "__all__" ? "✓ Copied all!" : "📋 Copy All"}
                </button>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7 }}>
                {Object.entries(autoFill).map(([key, val]) => (
                  <div
                    key={key}
                    onClick={() => copyField(val, key)}
                    style={{
                      background: copiedKey === key ? "rgba(34,197,94,.08)" : "var(--bg3)",
                      border: `1px solid ${copiedKey === key ? "#22c55e" : "var(--border)"}`,
                      borderRadius: 8, padding: "9px 11px", cursor: "pointer",
                      transition: "all .15s",
                    }}
                    onMouseOver={e => { if (copiedKey !== key) e.currentTarget.style.borderColor = "var(--accent)"; }}
                    onMouseOut={e => { if (copiedKey !== key) e.currentTarget.style.borderColor = "var(--border)"; }}
                  >
                    <div style={{ fontSize: 10, color: "var(--text3)", marginBottom: 2, textTransform: "uppercase", letterSpacing: "0.4px" }}>
                      {key}
                    </div>
                    <div style={{ fontSize: 12.5, color: copiedKey === key ? "#4ade80" : "var(--text)", fontWeight: 500 }}>
                      {copiedKey === key ? "✓ Copied!" : String(val)}
                    </div>
                  </div>
                ))}
              </div>

              <div style={{
                marginTop: 14, padding: "10px 12px",
                background: "rgba(79,142,247,.08)", border: "1px solid rgba(79,142,247,.2)",
                borderRadius: 8, fontSize: 12, color: "var(--text2)", display: "flex", gap: 8,
              }}>
                <span>💡</span>
                <span>Copy each field, then paste it into the corresponding field on the JobStreet application form.</span>
              </div>
            </div>
          )}

          {/* STEP 2 — Cover Letter */}
          {step === 2 && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13, display: "flex", alignItems: "center", gap: 8 }}>
                    Cover Letter
                    <span style={{
                      fontSize: 11, padding: "2px 8px",
                      background: "var(--bg3)", border: "1px solid var(--border)",
                      borderRadius: 20, color: "var(--text2)",
                    }}>
                      {langInfo.flag} {langInfo.label}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text2)", marginTop: 2 }}>
                    Copy this into the cover letter field on JobStreet
                  </div>
                </div>
                <button onClick={copyCover} style={{
                  padding: "6px 12px", fontSize: 12, borderRadius: 7,
                  background: coverCopied ? "rgba(34,197,94,.15)" : "var(--bg3)",
                  border: `1px solid ${coverCopied ? "#22c55e" : "var(--border)"}`,
                  color: coverCopied ? "#22c55e" : "var(--text2)",
                }}>
                  {coverCopied ? "✓ Copied!" : "📋 Copy Letter"}
                </button>
              </div>
              <pre style={{
                background: "var(--bg3)", border: "1px solid var(--border)",
                borderRadius: 8, padding: 14, fontSize: 12.5, lineHeight: 1.8,
                color: "var(--text)", whiteSpace: "pre-wrap", wordBreak: "break-word",
                maxHeight: 360, overflowY: "auto",
              }}>
                {coverLetter}
              </pre>
            </div>
          )}

          {/* STEP 3 — Confirm */}
          {step === 3 && (
            <div style={{ textAlign: "center" }}>
              {opened ? (
                <>
                  <div style={{ fontSize: 52, marginBottom: 12 }}>🎉</div>
                  <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>Application Sent!</div>
                  <div style={{ color: "var(--text2)", fontSize: 13, marginBottom: 20 }}>
                    Logged to your tracker as <strong style={{ color: "#4f8ef7" }}>Applied</strong>.
                  </div>
                  <div style={{
                    background: "var(--bg3)", border: "1px solid var(--border)",
                    borderRadius: 10, padding: 14, textAlign: "left", marginBottom: 16,
                  }}>
                    <div style={{ fontSize: 11, color: "var(--text3)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.4px" }}>
                      Add a note (optional)
                    </div>
                    <textarea
                      value={notes}
                      onChange={e => setNotes(e.target.value)}
                      placeholder="e.g. Applied via JobStreet, used cover letter v2..."
                      rows={3}
                      style={{
                        width: "100%", background: "var(--bg2)",
                        border: "1px solid var(--border)", borderRadius: 7,
                        color: "var(--text)", fontSize: 12.5, padding: "8px 10px",
                        resize: "vertical", outline: "none", fontFamily: "inherit",
                      }}
                    />
                  </div>
                  <button
                    onClick={handleMarkApplied}
                    style={{
                      padding: "11px 28px",
                      background: "linear-gradient(135deg, var(--accent), var(--accent2))",
                      border: "none", borderRadius: 9,
                      color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer",
                    }}
                  >
                    ✅ Save to Tracker & Close
                  </button>
                </>
              ) : (
                <>
                  <div style={{ fontSize: 52, marginBottom: 12 }}>🚀</div>
                  <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>Ready to Apply</div>
                  <div style={{ color: "var(--text2)", fontSize: 13, margin: "0 auto 20px", maxWidth: 380 }}>
                    Make sure you're logged in to JobStreet first — your application will be linked to your profile automatically.
                  </div>

                  {/* Login + Profile links */}
                  <div style={{
                    display: "flex", gap: 8, marginBottom: 18, justifyContent: "center", flexWrap: "wrap",
                  }}>
                    {job.source === "LinkedIn" ? (
                      <>
                        <a
                          href={candidate.linkedinLogin}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: "inline-flex", alignItems: "center", gap: 6,
                            padding: "8px 16px", borderRadius: 8, fontSize: 12, fontWeight: 600,
                            background: "rgba(10,102,194,.12)", border: "1px solid rgba(10,102,194,.28)",
                            color: "#60a5fa", textDecoration: "none",
                          }}
                        >
                          🔑 Log in to LinkedIn
                        </a>
                        <a
                          href={candidate.linkedinProfile}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: "inline-flex", alignItems: "center", gap: 6,
                            padding: "8px 16px", borderRadius: 8, fontSize: 12, fontWeight: 600,
                            background: "rgba(10,102,194,.08)", border: "1px solid rgba(10,102,194,.2)",
                            color: "#60a5fa", textDecoration: "none",
                          }}
                        >
                          💼 View My Profile
                        </a>
                      </>
                    ) : (
                      <>
                        <a
                          href={candidate.jobstreetLogin}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: "inline-flex", alignItems: "center", gap: 6,
                            padding: "8px 16px", borderRadius: 8, fontSize: 12, fontWeight: 600,
                            background: "rgba(34,197,94,.12)", border: "1px solid rgba(34,197,94,.25)",
                            color: "#4ade80", textDecoration: "none",
                          }}
                        >
                          🔑 Log in to JobStreet
                        </a>
                        <a
                          href={candidate.jobstreetProfile}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: "inline-flex", alignItems: "center", gap: 6,
                            padding: "8px 16px", borderRadius: 8, fontSize: 12, fontWeight: 600,
                            background: "rgba(79,142,247,.12)", border: "1px solid rgba(79,142,247,.25)",
                            color: "#7eb3ff", textDecoration: "none",
                          }}
                        >
                          👤 View My Profile
                        </a>
                      </>
                    )}
                  </div>

                  {/* Checklist */}
                  <div style={{
                    background: "var(--bg3)", border: "1px solid var(--border)",
                    borderRadius: 10, padding: 14, textAlign: "left", marginBottom: 16,
                  }}>
                    {[
                      ["🔑", "Logged in to JobStreet", "ensures application links to your account"],
                      ["📝", "Auto-fill data ready",   "copied from Step 1"],
                      ["✍️", "Cover letter ready",     "copied from Step 2"],
                      ["🌐", "Job page",               "opens in a new tab on click below"],
                    ].map(([icon, label, sub]) => (
                      <div key={label} style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 8 }}>
                        <span style={{ fontSize: 16 }}>{icon}</span>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 500 }}>{label}</div>
                          <div style={{ fontSize: 11, color: "var(--text3)" }}>{sub}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={handleOpenJobStreet}
                    style={{
                      padding: "13px 32px",
                      background: job.source === "LinkedIn"
                        ? "linear-gradient(135deg, #0a66c2, #0077b5)"
                        : "linear-gradient(135deg, var(--accent), var(--accent2))",
                      border: "none", borderRadius: 10,
                      color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer",
                      display: "inline-flex", alignItems: "center", gap: 8,
                    }}
                  >
                    {job.source === "LinkedIn" ? "💼 Open LinkedIn & Apply" : "🚀 Open JobStreet & Apply"}
                    {job.easyApply && <span style={{ fontSize: 11, background: "rgba(255,255,255,.2)", padding: "2px 7px", borderRadius: 10 }}>⚡ Easy Apply</span>}
                  </button>
                  <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 10 }}>
                    Opens in a new tab · Come back here to log your application
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* ── Footer nav ── */}
        {step < 3 && (
          <div style={{
            padding: "12px 20px", borderTop: "1px solid var(--border)",
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <button
              onClick={() => setStep(s => Math.max(1, s - 1))}
              disabled={step === 1}
              style={{
                padding: "8px 16px", borderRadius: 8, fontSize: 12,
                background: "var(--bg3)", border: "1px solid var(--border)",
                color: step === 1 ? "var(--text3)" : "var(--text2)",
                cursor: step === 1 ? "not-allowed" : "pointer",
              }}
            >
              ← Back
            </button>

            <span style={{ fontSize: 11, color: "var(--text3)" }}>
              Step {step} of 3
            </span>

            <button
              onClick={() => setStep(s => Math.min(3, s + 1))}
              style={{
                padding: "8px 20px", borderRadius: 8, fontSize: 12, fontWeight: 600,
                background: "var(--accent)", border: "none", color: "#fff", cursor: "pointer",
              }}
            >
              {step === 2 ? "Next: Apply →" : "Next →"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
