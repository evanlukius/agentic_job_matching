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

// ── Region configs ────────────────────────────────────────────────────────────
const REGIONS = {
  ID: {
    siteKey:  "ID-Main",
    locale:   "en-ID",
    where:    "Indonesia",
    base:     "https://id.jobstreet.com/api/jobsearch/v5/search",
    referer:  "https://id.jobstreet.com/",
    applyBase:"https://id.jobstreet.com/job/",
    label:    "Indonesia",
  },
  MY: {
    siteKey:  "MY-Main",
    locale:   "en-MY",
    where:    "Malaysia",
    base:     "https://my.jobstreet.com/api/jobsearch/v5/search",
    referer:  "https://my.jobstreet.com/",
    applyBase:"https://my.jobstreet.com/job/",
    label:    "Malaysia",
  },
  SG: {
    siteKey:  "SG-Main",
    locale:   "en-SG",
    where:    "Singapore",
    base:     "https://sg.jobstreet.com/api/jobsearch/v5/search",
    referer:  "https://sg.jobstreet.com/",
    applyBase:"https://sg.jobstreet.com/job/",
    label:    "Singapore",
  },
  PH: {
    siteKey:  "PH-Main",
    locale:   "en-PH",
    where:    "Philippines",
    base:     "https://ph.jobstreet.com/api/jobsearch/v5/search",
    referer:  "https://ph.jobstreet.com/",
    applyBase:"https://ph.jobstreet.com/job/",
    label:    "Philippines",
  },
  JP: {
    siteKey:  "JP-Main",
    locale:   "en-JP",
    where:    "Japan",
    base:     "https://jp.jobstreet.com/api/jobsearch/v5/search",
    referer:  "https://jp.jobstreet.com/",
    applyBase:"https://jp.jobstreet.com/job/",
    label:    "Japan",
  },
};

// ── JobStreet search helper ───────────────────────────────────────────────────
async function searchJobStreet({ keywords, page = 1, num = 20, daterange, region = "ID" }) {
  const cfg = REGIONS[region] || REGIONS.ID;
  const uid = randomUUID().replace(/-/g, "").slice(0, 16);
  const params = new URLSearchParams({
    siteKey:              cfg.siteKey,
    sourcesystem:         "houston",
    userqueryid:          uid,
    userid:               uid,
    usersessionid:        uid,
    eventCaptureSessionId:uid,
    page:                 String(page),
    num:                  String(num),
    keywords,
    where:                cfg.where,
    locale:               cfg.locale,
  });
  if (daterange) params.set("daterange", String(daterange));

  const url = `${cfg.base}?${params}`;
  const headers = {
    "User-Agent":      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Accept":          "application/json",
    "Referer":         cfg.referer,
    "Accept-Language": "en-US,en;q=0.9",
  };
  const res = await fetch(url, { headers, timeout: 12000 });
  if (!res.ok) throw new Error(`JobStreet ${region} API ${res.status}`);
  return { data: await res.json(), region };
}

// ── Normalise a raw JobStreet job into our schema ─────────────────────────────
function normalise(raw, region = "ID") {
  const cfg = REGIONS[region] || REGIONS.ID;
  const loc = (raw.locations || []).map(l => l.label).join(", ") || cfg.label;
  const cat = (raw.classifications || [])[0]?.subclassification?.description || "IT";
  const workType = (raw.workTypes || [])[0] || "Full-time";
  const score = scoreJob(raw);

  const regionFlag = { ID: "🇮🇩", MY: "🇲🇾", SG: "🇸🇬", PH: "🇵🇭", JP: "🇯🇵" }[region] || "🌏";

  return {
    id: `js-${region}-${raw.id}`,
    title: raw.title || "Untitled",
    company: raw.companyName || raw.employer?.name || "Unknown",
    logo: "🏢",
    location: loc,
    region,
    regionLabel: cfg.label,
    regionFlag,
    type: workType,
    category: cat,
    salary: raw.salaryLabel || "Not disclosed",
    posted: raw.listingDate ? raw.listingDate.slice(0, 10) : new Date().toISOString().slice(0, 10),
    postedDisplay: raw.listingDateDisplay || "Recently",
    source: `JobStreet ${cfg.label}`,
    applyUrl: `${cfg.applyBase}${raw.id}`,
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
// Runs multiple targeted searches across ID, MY, SG, PH, JP in parallel
app.get("/api/scan", async (req, res) => {
  const today = new Date().toISOString().slice(0, 10);

  // Queries per region
  const idQueries = [
    { keywords: "IT fresh graduate informatics",              num: 40, daterange: 30,  region: "ID" },
    { keywords: "IT fresh graduate informatics",              num: 40, daterange: 30,  region: "ID", page: 2 },
    { keywords: "ODP officer development program IT",         num: 40, daterange: 60,  region: "ID" },
    { keywords: "management trainee digital technology",      num: 30, daterange: 60,  region: "ID" },
    { keywords: "junior web developer ReactJS PHP",           num: 30, daterange: 30,  region: "ID" },
    { keywords: "cloud engineer GCP DevOps infrastructure",   num: 30, daterange: 30,  region: "ID" },
    { keywords: "data analyst SQL Python fresh graduate",     num: 30, daterange: 30,  region: "ID" },
    { keywords: "software engineer programmer fresh graduate",num: 30, daterange: 30,  region: "ID" },
    { keywords: "software engineer programmer fresh graduate",num: 30, daterange: 30,  region: "ID", page: 2 },
    { keywords: "IT business analyst ERP system",             num: 25, daterange: 30,  region: "ID" },
  ];

  const myQueries = [
    { keywords: "IT fresh graduate software engineer",        num: 30, daterange: 30,  region: "MY" },
    { keywords: "junior web developer ReactJS cloud",         num: 25, daterange: 30,  region: "MY" },
    { keywords: "data analyst Python SQL fresh graduate",     num: 25, daterange: 30,  region: "MY" },
    { keywords: "management trainee technology digital",      num: 20, daterange: 60,  region: "MY" },
  ];

  const sgQueries = [
    { keywords: "IT fresh graduate software engineer",        num: 30, daterange: 30,  region: "SG" },
    { keywords: "junior cloud engineer GCP DevOps",           num: 25, daterange: 30,  region: "SG" },
    { keywords: "data analyst SQL Python entry level",        num: 25, daterange: 30,  region: "SG" },
    { keywords: "web developer ReactJS junior",               num: 20, daterange: 30,  region: "SG" },
  ];

  const phQueries = [
    { keywords: "IT fresh graduate software engineer",        num: 25, daterange: 30,  region: "PH" },
    { keywords: "junior web developer ReactJS PHP",           num: 20, daterange: 30,  region: "PH" },
    { keywords: "data analyst SQL Python fresh graduate",     num: 20, daterange: 30,  region: "PH" },
  ];

  const jpQueries = [
    { keywords: "IT engineer fresh graduate bilingual",       num: 25, daterange: 60,  region: "JP" },
    { keywords: "software engineer web developer English",    num: 25, daterange: 60,  region: "JP" },
    { keywords: "cloud engineer data analyst English",        num: 20, daterange: 60,  region: "JP" },
    { keywords: "IT support system analyst English Japanese", num: 20, daterange: 60,  region: "JP" },
  ];

  const allQueries = [...idQueries, ...myQueries, ...sgQueries, ...phQueries, ...jpQueries];

  try {
    const results = await Promise.allSettled(
      allQueries.map(q => searchJobStreet(q))
    );

    // Merge and deduplicate by job id
    const seen = new Set();
    const jobs = [];

    for (const r of results) {
      if (r.status !== "fulfilled") continue;
      const { data, region } = r.value;
      for (const raw of data.data || []) {
        const key = `${region}-${raw.id}`;
        if (seen.has(key)) continue;
        seen.add(key);
        jobs.push(normalise(raw, region));
      }
    }

    // Sort by match score desc
    jobs.sort((a, b) => b.matchScore - a.matchScore);

    res.json({
      ok: true,
      scannedAt: today,
      systemDate: today,
      totalFound: jobs.length,
      regions: ["ID", "MY", "SG", "PH", "JP"],
      jobs,
    });
  } catch (err) {
    console.error("Scan error:", err.message);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// ── /api/search  ──────────────────────────────────────────────────────────────
app.get("/api/search", async (req, res) => {
  const { q = "IT fresh graduate", page = 1, daterange, region = "ID" } = req.query;
  try {
    const { data } = await searchJobStreet({ keywords: q, page: Number(page), num: 20, daterange, region });
    const jobs = (data.data || []).map(raw => normalise(raw, region));
    jobs.sort((a, b) => b.matchScore - a.matchScore);
    res.json({ ok: true, total: data.totalCount, jobs });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// ── LINKEDIN INTEGRATION — Easy Apply only, CV-qualified ─────────────────────
// ══════════════════════════════════════════════════════════════════════════════

// LinkedIn geoIds for target regions
const LI_GEOS = {
  ID: { id: "102478259", label: "Indonesia",   flag: "🇮🇩" },
  MY: { id: "102454443", label: "Malaysia",    flag: "🇲🇾" },
  SG: { id: "90009706",  label: "Singapore",   flag: "🇸🇬" },
  PH: { id: "103121230", label: "Philippines", flag: "🇵🇭" },
  JP: { id: "101355337", label: "Japan",       flag: "🇯🇵" },
};

const LI_HEADERS = {
  "User-Agent":      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "Accept":          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9",
  "Referer":         "https://www.linkedin.com/jobs/search/",
};

// ── CV-specific skill keywords (Evan's actual profile) ────────────────────────
const LI_SKILL_KW = [
  "sql", "cloud", "gcp", "google cloud platform",
  "reactjs", "react", "php", "laravel",
  "python", "data analysis", "data analyst",
  "web developer", "web development", "full stack", "frontend", "backend",
  "software engineer", "software developer", "programmer",
  "cloud engineer", "devops", "kubernetes", "docker",
  "erp", "sap", "quality control", "quality assurance",
  "information technology", "informatics", "it analyst",
  "business analyst", "system analyst",
  "management trainee", "graduate program", "graduate trainee",
  "fresh graduate", "entry level", "junior",
  "digital transformation", "digital",
];

const LI_BOOST_KW = [
  "gcp", "google cloud", "reactjs", "react",
  "python", "data", "cloud", "devops",
  "management trainee", "graduate", "fresh graduate",
  "it", "informatics", "digital",
  // Japan-specific boosts for Evan's N4/N3
  "japanese", "bilingual", "日本語", "english japanese",
];

// ── Score a LinkedIn job against Evan's CV ────────────────────────────────────
function scoreLiJob(title, company, region) {
  const text = `${title} ${company}`.toLowerCase();
  let score = 35;

  for (const kw of LI_SKILL_KW)  if (text.includes(kw)) score += 5;
  for (const kw of LI_BOOST_KW)  if (text.includes(kw)) score += 7;

  // Japan bonus — Evan has N4/N3 Japanese, this is a real differentiator
  if (region === "JP") score += 10;

  return Math.min(score, 99);
}

function matchReasonsLi(title, company, region) {
  const text = `${title} ${company}`.toLowerCase();
  const reasons = [];

  if (text.includes("fresh graduate") || text.includes("entry level") || text.includes("junior"))
    reasons.push("Entry level / fresh graduate welcome");
  if (text.includes("it") || text.includes("information technology") || text.includes("informatics") || text.includes("software"))
    reasons.push("IT / Informatics background match");
  if (text.includes("cloud") || text.includes("gcp") || text.includes("devops"))
    reasons.push("Cloud Computing (GCP) skills match");
  if (text.includes("react") || text.includes("php") || text.includes("web"))
    reasons.push("Web development (ReactJS / PHP) match");
  if (text.includes("python") || text.includes("data"))
    reasons.push("Python / Data Analysis skills match");
  if (text.includes("sql") || text.includes("database"))
    reasons.push("SQL / Database skills match");
  if (text.includes("management trainee") || text.includes("graduate"))
    reasons.push("Graduate / Trainee program");
  if (text.includes("japanese") || text.includes("bilingual") || region === "JP")
    reasons.push("Japanese N4/N3 language advantage");
  if (text.includes("digital"))
    reasons.push("Digital transformation interest");
  if (text.includes("quality"))
    reasons.push("Quality control experience (Kyosui Japan)");

  if (reasons.length === 0) reasons.push("IT industry match");
  return reasons.slice(0, 5);
}

// ── Fetch LinkedIn Easy Apply jobs ────────────────────────────────────────────
// f_AL=true  → Easy Apply only
// f_E=1,2    → Entry level + Associate
// f_JT=F     → Full-time
// f_TPR      → date range
async function searchLinkedIn({ keyword, geoId, region, start = 0, f_TPR = "r2592000" }) {
  const params = new URLSearchParams({
    keywords: keyword,
    geoId:    String(geoId),
    f_AL:     "true",          // ← Easy Apply ONLY
    f_JT:     "F",             // Full-time
    f_E:      "1,2",           // Entry level + Associate
    f_TPR,
    start:    String(start),
    count:    "25",
    sortBy:   "DD",
  });

  const url = `https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?${params}`;
  const res = await fetch(url, { headers: LI_HEADERS, timeout: 14000 });
  if (!res.ok) throw new Error(`LinkedIn ${region} ${res.status}`);
  const html = await res.text();
  return { html, region };
}

// ── Parse LinkedIn HTML job cards ─────────────────────────────────────────────
function parseLinkedInHTML(html, regionKey) {
  const geo = LI_GEOS[regionKey] || LI_GEOS.ID;
  const jobs = [];

  const liRegex = /<li[^>]*>([\s\S]*?)<\/li>/g;
  let liMatch;

  while ((liMatch = liRegex.exec(html)) !== null) {
    const card = liMatch[1];

    // Job ID
    const idMatch = card.match(/data-entity-urn="[^"]*:(\d+)"/) ||
                    card.match(/\/jobs\/view\/(\d+)/);
    if (!idMatch) continue;
    const jobId = idMatch[1];

    // Easy Apply check — only keep Easy Apply jobs
    const isEasyApply = /easy.apply/i.test(card) ||
                        card.includes("f_AL") ||
                        card.includes("easyApply") ||
                        card.includes("easy-apply");
    // Note: since we pass f_AL=true in the query, all returned jobs should be
    // Easy Apply. We still flag it explicitly for the UI badge.

    // Title
    const titleMatch = card.match(/class="[^"]*base-search-card__title[^"]*"[^>]*>\s*([\s\S]*?)\s*<\/h3>/i) ||
                       card.match(/<h3[^>]*>\s*([\s\S]*?)\s*<\/h3>/i);
    const rawTitle = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, "").trim() : "";
    if (!rawTitle) continue;
    // Decode HTML entities
    const title = rawTitle.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&#39;/g, "'").replace(/&quot;/g, '"');

    // Company
    const compMatch = card.match(/class="[^"]*base-search-card__subtitle[^"]*"[\s\S]*?<a[^>]*>\s*([\s\S]*?)\s*<\/a>/i) ||
                      card.match(/class="[^"]*hidden-nested-link[^"]*"[^>]*>\s*([\s\S]*?)\s*<\/a>/i);
    const company = compMatch ? compMatch[1].replace(/<[^>]+>/g, "").trim() : "Unknown";

    // Location
    const locMatch = card.match(/class="[^"]*job-search-card__location[^"]*"[^>]*>\s*([\s\S]*?)\s*<\/span>/i);
    const location = locMatch ? locMatch[1].replace(/<[^>]+>/g, "").trim() : geo.label;

    // Date posted
    const dateMatch = card.match(/datetime="([^"]+)"/);
    const posted = dateMatch ? dateMatch[1].slice(0, 10) : new Date().toISOString().slice(0, 10);
    const daysAgo = (Date.now() - new Date(posted).getTime()) / 86400000;

    // Salary
    const salaryMatch = card.match(/class="[^"]*job-search-card__salary-info[^"]*"[^>]*>\s*([\s\S]*?)\s*<\/span>/i);
    const salary = salaryMatch ? salaryMatch[1].replace(/<[^>]+>/g, "").trim() : "Not disclosed";

    // Company logo
    const logoMatch = card.match(/data-delayed-url="([^"]+)"/);
    const companyLogo = logoMatch ? logoMatch[1] : null;

    // Score — only keep CV-qualified jobs (score ≥ 55)
    const baseScore = scoreLiJob(title, company, regionKey);
    const recentBonus = daysAgo <= 1 ? 8 : daysAgo <= 3 ? 5 : daysAgo <= 7 ? 2 : 0;
    const matchScore = Math.min(baseScore + recentBonus, 99);

    if (matchScore < 55) continue; // drop irrelevant jobs

    jobs.push({
      id:           `li-${regionKey}-${jobId}`,
      title,
      company,
      companyLogo,
      logo:         "💼",
      location,
      region:       regionKey,
      regionLabel:  geo.label,
      regionFlag:   geo.flag,
      type:         "Full-time",
      category:     "LinkedIn",
      salary,
      posted,
      postedDisplay: daysAgo < 1 ? "Today" : daysAgo < 2 ? "Yesterday" : `${Math.floor(daysAgo)}d ago`,
      source:       "LinkedIn",
      applyUrl:     `https://www.linkedin.com/jobs/view/${jobId}`,
      matchScore,
      matchReasons: matchReasonsLi(title, company, regionKey),
      teaser:       "",
      bulletPoints: [],
      tags:         ["LinkedIn", "Easy Apply", "Full-time"],
      status:       "open",
      featured:     false,
      expiresLabel: null,
      arrangement:  "On-site",
      easyApply:    true, // all results from f_AL=true are Easy Apply
    });
  }

  return jobs;
}

// ── /api/scan-linkedin ────────────────────────────────────────────────────────
// Easy Apply only · CV-qualified queries · all 5 regions
app.get("/api/scan-linkedin", async (req, res) => {
  const today = new Date().toISOString().slice(0, 10);

  // Queries tightly matched to Evan's CV:
  // IT/Informatics degree · GCP · ReactJS · PHP · Python · SQL · fresh grad · bilingual JP
  const queries = [
    // ── Indonesia ──────────────────────────────────────────────────────────
    { keyword: "junior software engineer fresh graduate IT",      region: "ID", geoId: LI_GEOS.ID.id },
    { keyword: "junior web developer ReactJS PHP fresh graduate", region: "ID", geoId: LI_GEOS.ID.id },
    { keyword: "cloud engineer GCP DevOps entry level",           region: "ID", geoId: LI_GEOS.ID.id },
    { keyword: "data analyst SQL Python fresh graduate",          region: "ID", geoId: LI_GEOS.ID.id },
    { keyword: "management trainee IT digital technology",        region: "ID", geoId: LI_GEOS.ID.id },
    { keyword: "IT business analyst ERP fresh graduate",          region: "ID", geoId: LI_GEOS.ID.id },

    // ── Malaysia ───────────────────────────────────────────────────────────
    { keyword: "junior software engineer IT fresh graduate",      region: "MY", geoId: LI_GEOS.MY.id },
    { keyword: "junior web developer ReactJS cloud",              region: "MY", geoId: LI_GEOS.MY.id },
    { keyword: "data analyst Python SQL entry level",             region: "MY", geoId: LI_GEOS.MY.id },

    // ── Singapore ──────────────────────────────────────────────────────────
    { keyword: "junior software engineer IT entry level",         region: "SG", geoId: LI_GEOS.SG.id },
    { keyword: "cloud engineer GCP DevOps junior",                region: "SG", geoId: LI_GEOS.SG.id },
    { keyword: "data analyst SQL Python junior",                  region: "SG", geoId: LI_GEOS.SG.id },

    // ── Philippines ────────────────────────────────────────────────────────
    { keyword: "junior software engineer IT fresh graduate",      region: "PH", geoId: LI_GEOS.PH.id },
    { keyword: "junior web developer ReactJS PHP",                region: "PH", geoId: LI_GEOS.PH.id },

    // ── Japan — leverage Evan's N4/N3 Japanese + Kyoto work experience ─────
    { keyword: "IT engineer bilingual English Japanese",          region: "JP", geoId: LI_GEOS.JP.id, f_TPR: "r5184000" },
    { keyword: "software engineer web developer English",         region: "JP", geoId: LI_GEOS.JP.id, f_TPR: "r5184000" },
    { keyword: "cloud engineer data analyst English Japanese",    region: "JP", geoId: LI_GEOS.JP.id, f_TPR: "r5184000" },
    { keyword: "junior developer ReactJS Python English",         region: "JP", geoId: LI_GEOS.JP.id, f_TPR: "r5184000" },
  ];

  try {
    const results = await Promise.allSettled(queries.map(q => searchLinkedIn(q)));

    const seen = new Set();
    const jobs = [];

    for (const r of results) {
      if (r.status !== "fulfilled") continue;
      const { html, region } = r.value;
      for (const job of parseLinkedInHTML(html, region)) {
        if (seen.has(job.id)) continue;
        seen.add(job.id);
        jobs.push(job);
      }
    }

    jobs.sort((a, b) => b.matchScore - a.matchScore);

    res.json({
      ok: true,
      scannedAt: today,
      totalFound: jobs.length,
      source: "LinkedIn",
      jobs,
    });
  } catch (err) {
    console.error("LinkedIn scan error:", err.message);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// ── /api/health  ──────────────────────────────────────────────────────────────
app.get("/api/health", (_, res) => {
  res.json({ ok: true, date: new Date().toISOString() });
});

const PORT = 3001;
app.listen(PORT, () => console.log(`Job Agent API running on http://localhost:${PORT}`));
