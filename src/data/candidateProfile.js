// Evan Agustian Lukius – candidate profile extracted from CV
export const candidate = {
  name: "Evan Agustian Lukius",
  email: "lukiusevanagustian@gmail.com",
  phone: "(+62) 821-4475-0752",
  linkedin: "linkedin.com/in/evanlukius",
  instagram: "@rukius__jinsei",
  location: "Bandung Barat, Jawa Barat, Indonesia",
  gpa: 3.68,
  degree: "Bachelor's Degree – Information Technology",
  university: "Universitas Kristen Maranatha",
  graduationYear: 2025,

  summary:
    "IT graduate (GPA 3.68) with international experience in Japan and strong skills in analysis, " +
    "problem-solving, and digital systems. Experienced in web development, data management, and " +
    "cross-functional coordination. Proven ability in cross-cultural collaboration, web development, " +
    "and business process improvement, with strong analytical thinking and a passion for consulting, " +
    "digital transformation, and global business environments.",

  skills: [
    "SQL", "Cloud Computing (GCP)", "Web Development (PHP, ReactJS)",
    "Python (OOP)", "Data Analysis", "Quality Control", "ERP Systems",
    "Microsoft Office", "Communication", "Team Collaboration",
    "English (Professional)", "Japanese (N4/N3)",
  ],

  languages: [
    { lang: "Indonesian", level: "Native" },
    { lang: "English",    level: "Professional (TOEFL equiv.)" },
    { lang: "Japanese",   level: "N4/N3" },
  ],

  experience: [
    {
      company: "Maranatha Christian University",
      role: "Institutional & Corporate Relations Intern",
      period: "Sep 2025 – Jan 2026",
      location: "Bandung, Indonesia",
      bullets: [
        "Maintained 100% accuracy of cooperation agreement database; improved retrieval ~30%.",
        "Supported 90%+ of coordination meetings; ensured follow-ups across stakeholders.",
        "Reduced cross-directorate coordination delays by ~25%.",
      ],
    },
    {
      company: "Kyosui Co., Ltd.",
      role: "Quality Management Trainee",
      period: "Oct 2024 – Jul 2025",
      location: "Kyoto, Japan",
      bullets: [
        "Participated in Chushin Business Fair 2024, engaging with 50+ companies.",
        "Designed and developed company website; projected 30% increase in engagement.",
        "Applied Shokuhin Eisei Kanri (Food Sanitation Management) principles.",
        "Assisted QC processes; reduced product defects by 15%.",
      ],
    },
    {
      company: "Maranatha Christian University",
      role: "Web Administrator",
      period: "Mar 2023 – Mar 2025",
      location: "Remote",
      bullets: [
        "Maintained 99.9% uptime; reduced page load times by 25%.",
        "Ensured 100% security compliance; improved cross-device compatibility by 30%.",
        "Managed 50+ pages and 20+ blog posts; boosted user engagement by 35%.",
      ],
    },
  ],

  projects: [
    {
      name: "Bangkit Academy – Cloud Computing Cohort",
      org: "Google, Tokopedia, Gojek, Traveloka",
      period: "Feb 2024 – Jul 2024",
      desc: "Selected for Bangkit 2024 Batch 1 (Kampus Merdeka). Specialized in Cloud Computing, GCP, DevOps. Co-developed KopAI – AI-integrated entrepreneurial solution.",
    },
    {
      name: "Predicting Student Success via Machine Learning",
      org: "Academic Project",
      period: "2024",
      desc: "Built ML model to predict student academic success/failure using historical data (grades, attendance, demographics).",
    },
    {
      name: "Global Mind Speaker",
      org: "Hokusei Gakuen University, Japan",
      period: "2023",
      desc: "Speaker on global mindset and personal development at international university event.",
    },
  ],

  organizations: [
    {
      name: "International Student Conference (ISC)",
      role: "Chief of General Affairs",
      period: "Oct 2022 – Oct 2023",
      location: "Tokyo, Japan",
    },
    {
      name: "International Student Conference (ISC)",
      role: "Public Relations",
      period: "Oct 2021 – Oct 2022",
      location: "Tokyo, Japan",
    },
  ],

  volunteering: [
    "Taught Bahasa Indonesia at Hokusei Gakuen University, Japan (International Volunteer)",
    "East Asia Communication event – Hokusei Gakuen University",
    "Summer Scholar Language Program – Tunghai University, Taiwan (2021)",
    "Bridge ASEAN 2022 – Maranatha Christian University (Indonesia representative)",
    "Community service – Andong National University, South Korea",
    "Teaching (Kampus Merdeka): Math, Bahasa Indonesia, Science – Tual, Maluku",
  ],
};

// Keywords used for job matching
export const matchKeywords = [
  "IT", "Information Technology", "Informatics", "Cloud", "GCP",
  "Web Developer", "Web Development", "ReactJS", "PHP", "Python",
  "SQL", "Data Analysis", "ERP", "Quality Control", "ODP",
  "Officer Development Program", "Management Trainee", "Fresh Graduate",
  "Digital Transformation", "Business Analyst", "System Analyst",
  "Junior Developer", "Junior IT", "IT Analyst", "Cloud Engineer",
];
