import { useState, useCallback } from "react";

// Agent log steps shown in the terminal console
export const SCAN_STEPS = [
  { id: 1,  label: "Loading candidate profile from CV",              icon: "👤", ms: 400  },
  { id: 2,  label: "Extracting skills & match keywords",             icon: "🔍", ms: 500  },
  { id: 3,  label: "Scanning JobStreet Indonesia – IT fresh grad",   icon: "🌐", ms: 0    }, // real fetch
  { id: 4,  label: "Scanning JobStreet – ODP / Management Trainee",  icon: "🌐", ms: 0    },
  { id: 5,  label: "Scanning JobStreet – Web Developer (React/PHP)", icon: "🌐", ms: 0    },
  { id: 6,  label: "Scanning JobStreet – Cloud / GCP / DevOps",      icon: "🌐", ms: 0    },
  { id: 7,  label: "Scanning JobStreet – Data Analyst / Python",     icon: "🌐", ms: 0    },
  { id: 8,  label: "Scanning JobStreet – Software Engineer",         icon: "🌐", ms: 0    },
  { id: 9,  label: "Scanning JobStreet – IT Business Analyst / ERP", icon: "🌐", ms: 0    },
  { id: 10, label: "Deduplicating & merging results",                icon: "🔗", ms: 300  },
  { id: 11, label: "Scoring jobs against candidate profile",         icon: "🤖", ms: 400  },
  { id: 12, label: "Ranking by AI match score",                      icon: "📊", ms: 300  },
  { id: 13, label: "Generating cover letter templates",              icon: "✍️", ms: 300  },
  { id: 14, label: "Preparing auto-fill data",                       icon: "📋", ms: 200  },
  { id: 15, label: "Done",                                           icon: "✅", ms: 0    },
];

export function useJobScan() {
  const [state, setState]       = useState("idle");   // idle | running | done | error
  const [step, setStep]         = useState(0);
  const [jobs, setJobs]         = useState([]);
  const [meta, setMeta]         = useState(null);     // { scannedAt, totalFound }
  const [error, setError]       = useState(null);
  const [stepLog, setStepLog]   = useState([]);       // { id, label, icon, status, count? }

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

    // Steps 1–2: local prep (animated delay)
    logStep(1, "running");
    await delay(SCAN_STEPS[0].ms);
    logStep(1, "done");

    logStep(2, "running");
    await delay(SCAN_STEPS[1].ms);
    logStep(2, "done");

    // Steps 3–9: mark as running (real fetch happens in parallel)
    for (let i = 3; i <= 9; i++) logStep(i, "running");

    // Fire the real scan
    let data;
    try {
      const res = await fetch("/api/scan");
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      data = await res.json();
      if (!data.ok) throw new Error(data.error || "Scan failed");
    } catch (err) {
      // Mark fetch steps as error
      for (let i = 3; i <= 9; i++) logStep(i, "error");
      setError(err.message);
      setState("error");
      return;
    }

    // Mark fetch steps done
    for (let i = 3; i <= 9; i++) logStep(i, "done");

    // Steps 10–14: post-processing (animated)
    for (let i = 10; i <= 14; i++) {
      logStep(i, "running");
      await delay(SCAN_STEPS[i - 1].ms);
      logStep(i, "done");
    }

    logStep(15, "done", { count: data.jobs.length });

    setJobs(data.jobs);
    setMeta({ scannedAt: data.scannedAt, totalFound: data.totalFound });
    setState("done");
  }, [state, logStep]);

  return { state, step, jobs, meta, error, stepLog, run };
}

function delay(ms) {
  return new Promise(r => setTimeout(r, ms));
}
