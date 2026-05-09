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

// Cover letter template generator
export function generateCoverLetter(job, candidate) {
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

// Auto-fill form data
export function getAutoFillData(candidate) {
  return {
    "Full Name / Nama Lengkap": candidate.name,
    "Email": candidate.email,
    "Phone / No. HP": candidate.phone,
    "LinkedIn": candidate.linkedin,
    "Location / Domisili": candidate.location,
    "University / Universitas": candidate.university,
    "Degree / Jurusan": "S1 Teknologi Informasi",
    "GPA / IPK": `${candidate.gpa} / 4.00`,
    "Graduation Year": candidate.graduationYear,
    "Skills": candidate.skills.join(", "),
    "English Proficiency": "Professional (TOEFL equiv. 500+)",
    "Japanese Proficiency": "N4/N3",
    "Expected Salary": "Rp 8.000.000 – 12.000.000",
    "Availability": "Immediately / Segera",
    "Marital Status": "Single / Belum Menikah",
    "Religion": "Christianity / Kristen",
  };
}
