// Agent simulation steps – what the AI agent does when scanning for jobs
export const agentSteps = [
  { id: 1, label: "Loading candidate profile from CV",         icon: "👤", duration: 600  },
  { id: 2, label: "Extracting skills & keywords",              icon: "🔍", duration: 700  },
  { id: 3, label: "Scanning Glints Indonesia",                 icon: "🌐", duration: 900  },
  { id: 4, label: "Scanning Kalibrr Indonesia",                icon: "🌐", duration: 800  },
  { id: 5, label: "Scanning Dealls.com",                       icon: "🌐", duration: 700  },
  { id: 6, label: "Scanning JobStreet Indonesia",              icon: "🌐", duration: 850  },
  { id: 7, label: "Scanning lokerbumn.com (BUMN/ODP)",         icon: "🏛️", duration: 750  },
  { id: 8, label: "Matching jobs to candidate profile",        icon: "🤖", duration: 1000 },
  { id: 9, label: "Ranking by match score",                    icon: "📊", duration: 600  },
  { id: 10, label: "Generating cover letter templates",        icon: "✍️", duration: 800  },
  { id: 11, label: "Preparing auto-fill data",                 icon: "📋", duration: 500  },
  { id: 12, label: "Ready – 15 jobs found",                    icon: "✅", duration: 0    },
];

// Cover letter template generator — language adapts to job region
// ID → Bahasa Indonesia | MY/SG/PH → English | JP → Japanese
export function generateCoverLetter(job, candidate) {
  const region = job.region || "ID";

  // ── JAPAN (Japanese) ──────────────────────────────────────────────────────
  if (region === "JP") {
    const today = new Date().toLocaleDateString("ja-JP", {
      year: "numeric", month: "long", day: "numeric",
    });
    return `${today}

採用ご担当者様
${job.company}
${job.location}

拝啓

私は${candidate.name}と申します。インドネシアのマラナタ・クリスチャン大学にて情報技術学士号を取得（GPA ${candidate.gpa}/4.0）し、現在${job.company}の**${job.title}**のポジションに応募させていただきます。

日本での実務経験として、京都の株式会社京水にてQuality Management Traineeとして勤務し（2024年10月〜2025年7月）、品質管理プロセスの改善や企業ウェブサイトの開発に携わりました。また、東京で開催されたInternational Student Conference（ISC）にて総務部長を務め、多国籍チームのリーダーとして活動した経験もございます。

主なスキルと実績は以下の通りです：

・**Webおよびクラウド開発**：ReactJS、PHP、Google Cloud Platform（GCP）を活用したシステム開発経験。Bangkit Academy 2024（Google・Tokopedia・Gojek・Traveloka共催）にてAI統合ソリューション「KopAI」を開発。

・**データ分析・システム管理**：SQLおよびPythonを用いたデータ分析、機械学習モデルの構築（学生成績予測プロジェクト）。

・**品質管理**：食品衛生管理（食品衛生管理）の原則を適用し、製品不良率を15%削減。

・**語学力**：日本語（N4/N3相当）、英語（ビジネスレベル）、インドネシア語（母国語）。

貴社の業務に貢献できると確信しており、ぜひ面接の機会をいただければ幸いです。ご検討のほど、よろしくお願い申し上げます。

敬具

${candidate.name}
${candidate.phone}
${candidate.email}
${candidate.linkedin}`;
  }

  // ── SEA ENGLISH (MY / SG / PH) ────────────────────────────────────────────
  if (region === "MY" || region === "SG" || region === "PH") {
    const regionLabel = { MY: "Malaysia", SG: "Singapore", PH: "the Philippines" }[region];
    const today = new Date().toLocaleDateString("en-GB", {
      day: "numeric", month: "long", year: "numeric",
    });
    return `${today}

Dear Hiring Manager,
${job.company}
${job.location}

Re: Application for ${job.title}

I am writing to express my strong interest in the **${job.title}** position at ${job.company}. I hold a Bachelor's degree in Information Technology from Maranatha Christian University, Indonesia (GPA ${candidate.gpa}/4.0), and I am eager to bring my technical skills and international experience to ${regionLabel}.

During my career, I have developed a well-rounded skill set directly relevant to this role:

• **Web & Cloud Development**: Proficient in ReactJS, PHP, and Google Cloud Platform (GCP). Selected for Bangkit Academy 2024 (Google, Tokopedia, Gojek & Traveloka), where I co-developed KopAI — an AI-integrated solution addressing real-world business challenges.

• **Data Analysis & Systems**: Maintained 100% accuracy of a cooperation agreement database and improved data retrieval efficiency by ~30% during my internship at Maranatha Christian University. Built a machine learning model to predict student academic outcomes using Python and SQL.

• **International Work Experience**: Worked as a Quality Management Trainee at Kyosui Co., Ltd. in Kyoto, Japan (Oct 2024 – Jul 2025), applying international quality standards and developing cross-cultural communication skills.

• **Leadership**: Served as Chief of General Affairs at the International Student Conference (ISC) in Tokyo, leading a multinational team and managing conference operations and budget.

I am fluent in English (professional level), Indonesian (native), and Japanese (N4/N3), enabling me to collaborate effectively in multicultural environments — a strength I believe is particularly valuable in ${regionLabel}'s diverse workplace.

I am excited about the opportunity to contribute to ${job.company} and am confident that my technical background and international exposure will add value to your team. I would welcome the chance to discuss how my experience aligns with your needs.

Thank you for your time and consideration.

Yours sincerely,

${candidate.name}
${candidate.phone}
${candidate.email}
${candidate.linkedin}`;
  }

  // ── INDONESIA (Bahasa Indonesia) — default ────────────────────────────────
  const today = new Date().toLocaleDateString("id-ID", {
    day: "numeric", month: "long", year: "numeric",
  });
  return `${today}

Kepada Yth.
Tim Rekrutmen ${job.company}
${job.location}

Dengan hormat,

Saya ${candidate.name}, lulusan S1 Teknologi Informasi dari ${candidate.university} dengan IPK ${candidate.gpa}/4.0, mengajukan lamaran untuk posisi **${job.title}** di ${job.company}.

Selama studi dan pengalaman kerja saya, saya telah mengembangkan keahlian yang relevan dengan posisi ini, antara lain:

• **Pengembangan Web & Cloud**: Berpengalaman dalam ReactJS, PHP, dan Google Cloud Platform (GCP) melalui program Bangkit Academy 2024 (Google, Tokopedia, Gojek & Traveloka), di mana saya mengembangkan proyek KopAI – solusi berbasis AI untuk tantangan bisnis nyata.

• **Analisis Data & Manajemen Sistem**: Mengelola database perjanjian kerja sama dengan akurasi 100% dan meningkatkan efisiensi pengambilan data sebesar ~30% selama magang di Universitas Kristen Maranatha.

• **Pengalaman Internasional**: Bekerja sebagai Quality Management Trainee di Kyosui Co., Ltd., Kyoto, Jepang (Oct 2024 – Jul 2025), mengembangkan kemampuan adaptasi lintas budaya dan standar kerja internasional.

• **Kepemimpinan**: Menjabat sebagai Chief of General Affairs di International Student Conference (ISC) Tokyo, memimpin tim multinasional dan mengelola anggaran serta operasional konferensi.

Saya fasih berbahasa Indonesia, Inggris (profesional), dan Jepang (N4/N3), yang memungkinkan saya berkomunikasi efektif dalam lingkungan multikultural.

Saya sangat antusias untuk berkontribusi pada ${job.company} dan yakin bahwa latar belakang teknis serta pengalaman internasional saya akan memberikan nilai tambah bagi tim. Saya terbuka untuk berdiskusi lebih lanjut mengenai bagaimana saya dapat berkontribusi.

Terima kasih atas perhatian Bapak/Ibu.

Hormat saya,

${candidate.name}
${candidate.phone}
${candidate.email}
${candidate.linkedin}`;
}

// Auto-fill form data — adapts salary currency and labels by region
export function getAutoFillData(candidate, region = "ID") {
  const salaryByRegion = {
    ID: "Rp 8,000,000 – 12,000,000 / month",
    MY: "MYR 3,500 – 5,500 / month",
    SG: "SGD 3,000 – 4,500 / month",
    PH: "PHP 35,000 – 55,000 / month",
    JP: "¥250,000 – 350,000 / month",
  };

  const isEnglish = region !== "ID";

  return {
    [isEnglish ? "Full Name"    : "Full Name / Nama Lengkap"]: candidate.name,
    "Email":                                                    candidate.email,
    [isEnglish ? "Phone"        : "Phone / No. HP"]:           candidate.phone,
    "LinkedIn":                                                 candidate.linkedin,
    [isEnglish ? "Location"     : "Location / Domisili"]:      candidate.location,
    [isEnglish ? "University"   : "University / Universitas"]: candidate.university,
    [isEnglish ? "Degree"       : "Degree / Jurusan"]:         isEnglish
      ? "Bachelor of Information Technology"
      : "S1 Teknologi Informasi",
    [isEnglish ? "GPA"          : "GPA / IPK"]:                `${candidate.gpa} / 4.00`,
    "Graduation Year":                                          candidate.graduationYear,
    "Skills":                                                   candidate.skills.join(", "),
    "English Proficiency":                                      "Professional (TOEFL equiv. 500+)",
    "Japanese Proficiency":                                     "N4/N3",
    ...(region === "JP" ? { "Japanese Proficiency (日本語)": "N4/N3相当" } : {}),
    [isEnglish ? "Expected Salary" : "Expected Salary"]:       salaryByRegion[region] || salaryByRegion.ID,
    "Availability":                                             isEnglish ? "Immediately" : "Immediately / Segera",
    "Marital Status":                                           isEnglish ? "Single" : "Single / Belum Menikah",
    "Nationality":                                              "Indonesian",
    ...(region === "JP" ? { "Visa Status": "Requires work visa sponsorship" } : {}),
  };
}
