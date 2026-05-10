import { useState, useCallback } from "react";

// Agent log steps shown in the terminal console
export const SCAN_STEPS = [
  { id: 1,  label: "Loading candidate profile from CV",                         icon: "👤" },
  { id: 2,  label: "Extracting skills & match keywords",                        icon: "🔍" },
  { id: 3,  label: "Scanning JobStreet 🇮🇩 – IT fresh graduate / informatics",  icon: "🌐" },
  { id: 4,  label: "Scanning JobStreet 🇮🇩 – ODP / Officer Development",        icon: "🌐" },
  { id: 5,  label: "Scanning JobStreet 🇮🇩 – Management Trainee / Digital",     icon: "🌐" },
  { id: 6,  label: "Scanning JobStreet 🇮🇩 – Junior Web Developer / Cloud",     icon: "🌐" },
  { id: 7,  label: "Scanning JobStreet 🇮🇩 – Data Analyst / Software Engineer", icon: "🌐" },
  { id: 8,  label: "Scanning JobStreet 🇲🇾 🇸🇬 🇵🇭 – IT / Web / Cloud / Data",  icon: "🌐" },
  { id: 9,  label: "Scanning JobStreet 🇯🇵 – IT / Engineer / Bilingual",        icon: "🌐" },
  { id: 10, label: "Scanning LinkedIn 🇮🇩 – IT / Web / Cloud / Data",           icon: "💼" },
  { id: 11, label: "Scanning LinkedIn 🇲🇾 🇸🇬 🇵🇭 – IT / Developer / Analyst",  icon: "💼" },
  { id: 12, label: "Scanning LinkedIn 🇯🇵 – IT / Engineer / Bilingual",         icon: "💼" },
  { id: 13, label: "Deduplicating & merging all results",                       icon: "🔗" },
  { id: 14, label: "Scoring jobs against candidate profile",                    icon: "🤖" },
  { id: 15, label: "Ranking by AI match score",                                 icon: "📊" },
  { id: 16, label: "Generating cover letter templates",                         icon: "✍️" },
  { id: 17, label: "Done",                                                      icon: "✅" },
];

export function useJobScan() {
  const [state, setState]     = useState("idle");
  const [step, setStep]       = useState(0);
  const [jobs, setJobs]       = useState([]);
  const [meta, setMeta]       = useState(null);
  const [error, setError]     = useState(null);
  const [stepLog, setStepLog] = useState([]);

  const logStep = useCallback((id, status, extra = {}) => {
    setStepLog(prev => {
      const existing = prev.find(s => s.id === id);
      const entry = { ...SCAN_STEPS[id - 1], status, ...extra };
      if (existing) return prev.map(s => s.id === id ? entry : s);
      return [...prev, entry];
    });
    setStep(id);
  }, []);

  const run = useCallback(async () => {
    if (state === "running") return;
    setState("running");
    setStep(0);
    setJobs([]);
    setMeta(null);
    setError(null);
    setStepLog([]);

    // Steps 1–2: local prep
    logStep(1, "running"); logStep(1, "done");
    logStep(2, "running"); logStep(2, "done");

    // Steps 3–12: mark all live-scan steps running
    for (let i = 3; i <= 12; i++) logStep(i, "running");

    // Fire JobStreet + LinkedIn scans in parallel
    const [jsResult, liResult] = await Promise.allSettled([
      fetch("/api/scan").then(r => r.ok ? r.json() : Promise.reject(new Error(`JobStreet ${r.status}`))),
      fetch("/api/scan-linkedin").then(r => r.ok ? r.json() : Promise.reject(new Error(`LinkedIn ${r.status}`))),
    ]);

    // Handle JobStreet result (steps 3–9)
    if (jsResult.status === "fulfilled" && jsResult.value.ok) {
      for (let i = 3; i <= 9; i++) logStep(i, "done");
    } else {
      for (let i = 3; i <= 9; i++) logStep(i, "error");
    }

    // Handle LinkedIn result (steps 10–12)
    if (liResult.status === "fulfilled" && liResult.value.ok) {
      for (let i = 10; i <= 12; i++) logStep(i, "done");
    } else {
      for (let i = 10; i <= 12; i++) logStep(i, "error");
    }

    // If both failed, error out
    const jsJobs = jsResult.status === "fulfilled" && jsResult.value.ok ? jsResult.value.jobs : [];
    const liJobs = liResult.status === "fulfilled" && liResult.value.ok ? liResult.value.jobs : [];

    if (jsJobs.length === 0 && liJobs.length === 0) {
      const errMsg = jsResult.reason?.message || liResult.reason?.message || "Both scans failed";
      setError(errMsg);
      setState("error");
      return;
    }

    // Steps 13–16: post-processing
    for (let i = 13; i <= 16; i++) { logStep(i, "running"); logStep(i, "done"); }

    // Merge + deduplicate by id
    const seen = new Set();
    const merged = [];
    for (const job of [...jsJobs, ...liJobs]) {
      if (seen.has(job.id)) continue;
      seen.add(job.id);
      merged.push(job);
    }
    merged.sort((a, b) => b.matchScore - a.matchScore);

    logStep(17, "done", { count: merged.length });

    const scannedAt = jsResult.value?.scannedAt || new Date().toISOString().slice(0, 10);
    setJobs(merged);
    setMeta({ scannedAt, totalFound: merged.length, linkedInCount: liJobs.length, jobStreetCount: jsJobs.length });
    setState("done");
  }, [state, logStep]);

  return { state, step, jobs, meta, error, stepLog, run };
}
