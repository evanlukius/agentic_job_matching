/**
 * Job Agent – Express backend
 * Proxies live job searches to JobStreet Indonesia API (id.jobstreet.com)
 * and scores results against Evan's CV profile.
 */
import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import { randomUUID } from "crypto";

const app = express();
app.use(cors());
app.use(express.json());

// ── Candidate skill keywords for match scoring ────────────────────────────────
const SKILL_KEYWORDS = [
  "sql", "cloud", "gcp", "google cloud", "web development", "web developer",
  "reactjs", "react", "php", "python", "data analysis", "data analyst",
  "erp", "quality control", "odp", "officer development",
  "management trainee", "fresh graduate", "digital transformation",
  "business analyst", "system analyst", "junior developer", "junior it",
  "it analyst", "cloud engineer", "devops", "informatics", "information technology",
  "it staff", "programmer", "software engineer", "software developer",
  "network", "database", "web admin", "administrator",
];

const BOOST_KEYWORDS = [
  "odp", "officer development program", "management trainee",
  "fresh graduate", "cloud", "gcp", "reactjs", "python", "data",
  "digital", "it", "informatics",
];

// ── Score a job against Evan's profile ───────────────────────────────────────
function scoreJob(job) {
  const text = [
    job.title, job.teaser,
    ...(job.bulletPoints || []),
    job.companyName,
    ...(job.classifications || []).map(c =>
      `${c.classification?.description || ""} ${c.subclassification?.description || ""}`
    ),
  ].join(" ").toLowerCase();

  let score = 40; // base

  // Skill keyword hits
  for (const kw of SKILL_KEYWORDS) {
    if (text.includes(kw)) score += 4;
  }

  // Boost keywords (higher weight)
  for (const kw of BOOST_KEYWORDS) {
    if (text.includes(kw)) score += 6;
  }

  // Full-time bonus
  if ((job.workTypes || []).some(w => w.toLowerCase().includes("full"))) score += 5;

  // Salary listed bonus
  if (job.salaryLabel && job.salaryLabel.trim()) score += 3;

  // Recent listing bonus (within 7 days)
  if (job.listingDate) {
    const daysAgo = (Date.now() - new Date(job.listingDate).getTime()) / 86400000;
    if (daysAgo <= 3)  score += 8;
    else if (daysAgo <= 7)  score += 5;
    else if (daysAgo <= 14) score += 2;
  }

  return Math.min(score, 99);
}

// ── Match reasons generator ───────────────────────────────────────────────────
function matchReasons(job) {
  const text = [
    job.title, job.teaser,
    ...(job.bulletPoints || []),
    ...(job.classifications || []).map(c =>
      `${c.classification?.description || ""} ${c.subclassification?.description || ""}`
    ),
  ].join(" ").toLowerCase();

  const reasons = [];
  if (text.includes("fresh graduate") || text.includes("fresh grad")) reasons.push("Fresh graduate welcome");
  if (text.includes("it") || text.includes("information technology") || text.includes("informatics")) reasons.push("IT / Informatics background match");
  if (text.includes("cloud") || text.includes("gcp")) reasons.push("Cloud Computing (GCP) skills match");
  if (text.includes("react") || text.includes("php") || text.includes("web")) reasons.push("Web development skills match");
  if (text.includes("python") || text.includes("data")) reasons.push("Python / Data Analysis skills match");
  if (text.includes("sql") || text.includes("database")) reasons.push("SQL / Database skills match");
  if (text.includes("odp") || text.includes("officer development") || text.includes("management trainee")) reasons.push("ODP / Management Trainee program");
  if (text.includes("erp")) reasons.push("ERP systems knowledge");
  if (text.includes("quality")) reasons.push("Quality control experience");
  if (text.includes("bandung") || text.includes("west java") || text.includes("jawa barat")) reasons.push("Bandung / West Java location match");
  if (text.includes("english")) reasons.push("English proficiency required");
  if (text.includes("digital")) reasons.push("Digital transformation interest");

  if (reasons.length === 0) reasons.push("IT industry match");
  return reasons.slice(0, 5);
}

// ── JobStreet search helper ───────────────────────────────────────────────────
const JOBSTREET_BASE = "https://id.jobstreet.com/api/jobsearch/v5/search";
const HEADERS = {
  "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "Accept": "application/json",
  "Referer": "https://id.jobstreet.com/",
  "Accept-Language": "en-US,en;q=0.9",
};

async function searchJobStreet({ keywords, page = 1, num = 20, daterange }) {
  const uid = randomUUID().replace(/-/g, "").slice(0, 16);
  const params = new URLSearchParams({
    siteKey: "ID-Main",
    sourcesystem: "houston",
    userqueryid: uid,
    userid: uid,
    usersessionid: uid,
    eventCaptureSessionId: uid,
    page: String(page),
    num: String(num),
    keywords,
    where: "Indonesia",
    locale: "en-ID",
  });
  if (daterange) params.set("daterange", String(daterange));

  const url = `${JOBSTREET_BASE}?${params}`;
  const res = await fetch(url, { headers: HEADERS, timeout: 12000 });
  if (!res.ok) throw new Error(`JobStreet API ${res.status}`);
  return res.json();
}

// ── Normalise a raw JobStreet job into our schema ─────────────────────────────
function normalise(raw, source = "JobStreet") {
  const loc = (raw.locations || []).map(l => l.label).join(", ") || "Indonesia";
  const cat = (raw.classifications || [])[0]?.subclassification?.description || "IT";
  const workType = (raw.workTypes || [])[0] || "Full-time";
  const score = scoreJob(raw);

  return {
    id: `js-${raw.id}`,
    title: raw.title || "Untitled",
    company: raw.companyName || raw.employer?.name || "Unknown",
    logo: "🏢",
    location: loc,
    type: workType,
    category: cat,
    salary: raw.salaryLabel || "Not disclosed",
    posted: raw.listingDate ? raw.listingDate.slice(0, 10) : new Date().toISOString().slice(0, 10),
    postedDisplay: raw.listingDateDisplay || "Recently",
    source,
    applyUrl: `https://id.jobstreet.com/job/${raw.id}`,
    matchScore: score,
    matchReasons: matchReasons(raw),
    teaser: raw.teaser || "",
    bulletPoints: raw.bulletPoints || [],
    tags: [
      ...(raw.classifications || []).map(c => c.subclassification?.description).filter(Boolean),
      workType,
    ].slice(0, 5),
    status: "open",
    featured: raw.isFeatured || false,
    expiresLabel: (raw.tags || []).find(t => t.type === "EXPIRES_SOON") ? "Expiring soon" : null,
    arrangement: (raw.workArrangements?.data || []).map(a => a.label?.text).join(", ") || "On-site",
  };
}

// ── /api/scan  ────────────────────────────────────────────────────────────────
// Runs multiple targeted searches in parallel and returns merged, scored results
app.get("/api/scan", async (req, res) => {
  const today = new Date().toISOString().slice(0, 10);

  // Search queries tailored to Evan's profile
  const queries = [
    { keywords: "IT fresh graduate Indonesia",          num: 20, daterange: 30 },
    { keywords: "Officer Development Program IT",       num: 15, daterange: 60 },
    { keywords: "Management Trainee IT digital",        num: 15, daterange: 60 },
    { keywords: "junior web developer ReactJS PHP",     num: 15, daterange: 30 },
    { keywords: "cloud engineer GCP DevOps",            num: 15, daterange: 30 },
    { keywords: "data analyst SQL Python fresh graduate", num: 15, daterange: 30 },
    { keywords: "IT business analyst ERP",              num: 10, daterange: 30 },
    { keywords: "software engineer fresh graduate",     num: 15, daterange: 14 },
  ];

  try {
    // Fire all queries in parallel
    const results = await Promise.allSettled(
      queries.map(q => searchJobStreet(q))
    );

    // Merge and deduplicate by job id
    const seen = new Set();
    const jobs = [];

    for (const r of results) {
      if (r.status !== "fulfilled") continue;
      for (const raw of r.value.data || []) {
        if (seen.has(raw.id)) continue;
        seen.add(raw.id);
        jobs.push(normalise(raw));
      }
    }

    // Sort by match score desc
    jobs.sort((a, b) => b.matchScore - a.matchScore);

    res.json({
      ok: true,
      scannedAt: today,
      systemDate: today,
      totalFound: jobs.length,
      jobs,
    });
  } catch (err) {
    console.error("Scan error:", err.message);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// ── /api/search  ──────────────────────────────────────────────────────────────
app.get("/api/search", async (req, res) => {
  const { q = "IT fresh graduate", page = 1, daterange } = req.query;
  try {
    const data = await searchJobStreet({ keywords: q, page: Number(page), num: 20, daterange });
    const jobs = (data.data || []).map(raw => normalise(raw));
    jobs.sort((a, b) => b.matchScore - a.matchScore);
    res.json({ ok: true, total: data.totalCount, jobs });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// ── /api/health  ──────────────────────────────────────────────────────────────
app.get("/api/health", (_, res) => {
  res.json({ ok: true, date: new Date().toISOString() });
});

const PORT = 3001;
app.listen(PORT, () => console.log(`Job Agent API running on http://localhost:${PORT}`));
