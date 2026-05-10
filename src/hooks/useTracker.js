/**
 * useTracker — persists application pipeline to localStorage
 * Each entry: { id, jobId, title, company, location, regionFlag, source,
 *               applyUrl, matchScore, salary, status, appliedAt, notes, coverLang }
 * Status: "saved" | "applied" | "interview" | "offer" | "rejected"
 */
import { useState, useCallback } from "react";

const KEY = "evan_job_tracker_v1";

function load() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

function save(entries) {
  localStorage.setItem(KEY, JSON.stringify(entries));
}

export function useTracker() {
  const [entries, setEntries] = useState(() => load());

  const upsert = useCallback((job, status = "saved", notes = "") => {
    setEntries(prev => {
      const existing = prev.find(e => e.jobId === job.id);
      let next;
      if (existing) {
        next = prev.map(e =>
          e.jobId === job.id
            ? { ...e, status, notes: notes || e.notes, updatedAt: new Date().toISOString() }
            : e
        );
      } else {
        const entry = {
          id: `tr-${Date.now()}`,
          jobId: job.id,
          title: job.title,
          company: job.company,
          location: job.location,
          regionFlag: job.regionFlag || "",
          region: job.region || "ID",
          source: job.source,
          applyUrl: job.applyUrl,
          matchScore: job.matchScore,
          salary: job.salary,
          status,
          notes,
          appliedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        next = [entry, ...prev];
      }
      save(next);
      return next;
    });
  }, []);

  const updateStatus = useCallback((jobId, status) => {
    setEntries(prev => {
      const next = prev.map(e =>
        e.jobId === jobId
          ? { ...e, status, updatedAt: new Date().toISOString() }
          : e
      );
      save(next);
      return next;
    });
  }, []);

  const updateNotes = useCallback((jobId, notes) => {
    setEntries(prev => {
      const next = prev.map(e =>
        e.jobId === jobId ? { ...e, notes, updatedAt: new Date().toISOString() } : e
      );
      save(next);
      return next;
    });
  }, []);

  const remove = useCallback((jobId) => {
    setEntries(prev => {
      const next = prev.filter(e => e.jobId !== jobId);
      save(next);
      return next;
    });
  }, []);

  const getEntry = useCallback((jobId) => {
    return entries.find(e => e.jobId === jobId) || null;
  }, [entries]);

  return { entries, upsert, updateStatus, updateNotes, remove, getEntry };
}

export const STATUSES = [
  { key: "saved",     label: "Saved",     icon: "🔖", color: "#8b95a8", bg: "rgba(139,149,168,.12)" },
  { key: "applied",   label: "Applied",   icon: "🚀", color: "#4f8ef7", bg: "rgba(79,142,247,.12)"  },
  { key: "interview", label: "Interview", icon: "🎯", color: "#f59e0b", bg: "rgba(245,158,11,.12)"  },
  { key: "offer",     label: "Offer",     icon: "🎉", color: "#22c55e", bg: "rgba(34,197,94,.12)"   },
  { key: "rejected",  label: "Rejected",  icon: "❌", color: "#ef4444", bg: "rgba(239,68,68,.10)"   },
];
