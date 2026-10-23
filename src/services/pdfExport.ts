import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { PklLogbookEntry, StudentProfile, Application, JobListing, User } from '../types';
import { getCompanyProfile } from './storage';

/**
 * Format date to Indonesian locale string (DD MMMM YYYY)
 */
function formatDateIndo(dateStr?: string): string {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

/**
 * Export Siswa PKL Logbook to a formal administrative PDF document.
 */
export function exportSiswaLogbookToPDF({
  currentUser,
  profile,
  logs,
}: {
  currentUser: User;
  profile?: StudentProfile | null;
  logs: PklLogbookEntry[];
}): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // 1. Header & Header Accent Bar
  doc.setFillColor(30, 41, 59); // Slate-800
  doc.rect(0, 0, pageWidth, 22, 'F');

  doc.setFillColor(245, 158, 11); // Amber-500 accent strip
  doc.rect(0, 22, pageWidth, 2, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('LEMBAR LAPORAN HARIAN PKL & LOGBOOK KEGIATAN', pageWidth / 2, 10, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text(
    'Platform InternSpace • Manajemen Praktik Kerja Lapangan (PKL) & Magang Terpadu',
    pageWidth / 2,
    16,
    { align: 'center' }
  );

  // 2. Metadata Box (Siswa & Instansi)
  const startY = 30;
  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(203, 213, 225); // slate-300
  doc.roundedRect(14, startY, pageWidth - 28, 38, 2, 2, 'FD');

  doc.setTextColor(15, 23, 42); // slate-900
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('IDENTITAS SISWA & PELAKSANAAN PKL', 18, startY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);

  const col1X = 18;
  const col2X = (pageWidth / 2) + 2;

  const namaSiswa = profile?.nama || currentUser.nama;
  const nisn = profile?.nisn || '-';
  const asalSekolah = profile?.namaSekolah || profile?.universitas || 'SMK Negeri 1 Jakarta';
  const kelas = profile?.kelas || 'Kelas XI (11) SMK';
  const jurusan = profile?.jurusan || 'Rekayasa Perangkat Lunak (RPL)';
  const guruPembimbing = profile?.guruPembimbing || 'Drs. Bambang Hidayat, M.Kom';
  const perusahaan = logs[0]?.perusahaan || 'PT Teknologi Nusantara (TekNusa)';
  const totalApproved = logs.filter((l) => l.statusVerifikasi === 'disetujui').length;

  doc.text(`Nama Siswa           : ${namaSiswa}`, col1X, startY + 13);
  doc.text(`NISN / Identitas     : ${nisn}`, col1X, startY + 19);
  doc.text(`Asal Sekolah         : ${asalSekolah}`, col1X, startY + 25);
  doc.text(`Tingkat / Kelas      : ${kelas}`, col1X, startY + 31);

  doc.text(`Kompetensi Keahlian  : ${jurusan}`, col2X, startY + 13);
  doc.text(`Guru Pembimbing      : ${guruPembimbing}`, col2X, startY + 19);
  doc.text(`Mitra Industri (DUDI): ${perusahaan}`, col2X, startY + 25);
  doc.text(`Status Entri Logbook : ${totalApproved} Disetujui dari ${logs.length} Hari Kerja`, col2X, startY + 31);

  // 3. Table of Logbook Entries
  const tableData = logs.map((log, index) => {
    const jamText = log.jamMulai && log.jamSelesai ? `${log.jamMulai} - ${log.jamSelesai}` : '08:00 - 16:00';
    const statusText = log.statusVerifikasi === 'disetujui' ? 'DISETUJUI' : 'MENUNGGU';
    return [
      (index + 1).toString(),
      formatDateIndo(log.tanggal),
      jamText,
      log.kegiatan || '-',
      log.hasilPencapaian || '-',
      statusText,
      log.catatanMentor || (log.statusVerifikasi === 'disetujui' ? 'Valid & terverifikasi' : 'Dalam evaluasi'),
    ];
  });

  autoTable(doc, {
    startY: startY + 44,
    head: [['No', 'Tanggal', 'Jam Kerja', 'Uraian Aktivitas Kegiatan', 'Hasil Output / Capaian', 'Status', 'Catatan / Review Mentor']],
    body: tableData.length > 0 ? tableData : [['-', '-', '-', 'Belum ada catatan aktivitas harian', '-', '-', '-']],
    theme: 'grid',
    headStyles: {
      fillColor: [30, 41, 59], // Slate-800
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 7.5,
      halign: 'center',
    },
    styles: {
      fontSize: 7,
      cellPadding: 2.5,
      textColor: [30, 41, 59],
      valign: 'top',
    },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center' },
      1: { cellWidth: 22 },
      2: { cellWidth: 20, halign: 'center' },
      3: { cellWidth: 50 },
      4: { cellWidth: 35 },
      5: { cellWidth: 18, halign: 'center' },
      6: { cellWidth: 29 },
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 5) {
        if (data.cell.raw === 'DISETUJUI') {
          data.cell.styles.textColor = [16, 185, 129]; // Emerald
          data.cell.styles.fontStyle = 'bold';
        } else if (data.cell.raw === 'MENUNGGU') {
          data.cell.styles.textColor = [217, 119, 6]; // Amber
          data.cell.styles.fontStyle = 'bold';
        }
      }
    },
  });

  // 4. Signatures Block (Pengesahan)
  const finalY = (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY || 180;
  
  let signY = finalY + 12;
  if (signY + 45 > pageHeight) {
    doc.addPage();
    signY = 25;
  }

  const currentDateStr = formatDateIndo(new Date().toISOString());

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`Dicetak pada: ${currentDateStr} melalui InternSpace Logbook System`, 14, signY);

  signY += 6;

  const sigLeftX = 25;
  const sigRightX = pageWidth - 75;

  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);

  doc.text('Mengetahui,', sigLeftX, signY, { align: 'center' });
  doc.text('Guru Pembimbing Sekolah', sigLeftX, signY + 4, { align: 'center' });

  doc.text('Menyetujui,', sigRightX, signY, { align: 'center' });
  doc.text('Pembimbing Industri Mitra', sigRightX, signY + 4, { align: 'center' });

  const nameY = signY + 26;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text(guruPembimbing, sigLeftX, nameY, { align: 'center' });
  doc.text(profile?.kontakGuru ? `NIP / Kontak: ${profile.kontakGuru}` : 'NIP. 19750812 200212 1 003', sigLeftX, nameY + 4, { align: 'center' });

  doc.text('Mentor Lapangan / HRD', sigRightX, nameY, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text(perusahaan, sigRightX, nameY + 4, { align: 'center' });

  // Stamp / Validation watermark text
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(sigRightX - 25, signY + 9, 50, 12, 1, 1, 'D');
  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184);
  doc.text('TERVALIDASI ELEKTRONIK', sigRightX, signY + 14, { align: 'center' });
  doc.text('INTERNSPACE SECURE LOG', sigRightX, signY + 18, { align: 'center' });

  // 5. Page numbering footer
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `InternSpace PKL & Magang • Halaman ${i} dari ${totalPages}`,
      pageWidth / 2,
      pageHeight - 8,
      { align: 'center' }
    );
    doc.setDrawColor(226, 232, 240);
    doc.line(14, pageHeight - 11, pageWidth - 14, pageHeight - 11);
  }

  // Trigger download
  const safeName = namaSiswa.replace(/[^a-zA-Z0-9]/g, '_');
  const filename = `Logbook_PKL_${safeName}_${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
}

/**
 * Export Company Applicants List to a professional administrative PDF report.
 */
export function exportApplicantsToPDF({
  companyUser,
  applications,
  allJobs,
  selectedJobId = 'semua',
  selectedStatus = 'semua',
}: {
  companyUser: User;
  applications: Application[];
  allJobs: JobListing[];
  selectedJobId?: string;
  selectedStatus?: string;
}): void {
  // Use Landscape for comprehensive recruitment data
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // 1. Header Bar
  doc.setFillColor(15, 23, 42); // Slate-900
  doc.rect(0, 0, pageWidth, 22, 'F');

  doc.setFillColor(79, 70, 229); // Indigo-600 accent line
  doc.rect(0, 22, pageWidth, 2, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('REKAPITULASI DATA PELAMAR MAGANG & PKL', pageWidth / 2, 9, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  const compProfile = getCompanyProfile(companyUser.id);
  const companyName = compProfile?.namaPerusahaan || companyUser.nama || 'Mitra Perusahaan InternSpace';
  doc.text(
    `${companyName} • InternSpace Talent & Recruitment Management System`,
    pageWidth / 2,
    15,
    { align: 'center' }
  );

  // 2. Report Parameters & Statistics Strip
  const startY = 28;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(12, startY, pageWidth - 24, 20, 2, 2, 'FD');

  const selectedJob = allJobs.find((j) => j.id === selectedJobId);
  const jobTitleText = selectedJobId === 'semua' ? 'Semua Lowongan' : selectedJob?.judul || selectedJobId;
  const statusFilterText = selectedStatus === 'semua' ? 'Semua Tahap Seleksi' : selectedStatus.toUpperCase();

  const countDiterima = applications.filter((a) => a.status === 'diterima').length;
  const countInterview = applications.filter((a) => a.status === 'interview').length;
  const countDireview = applications.filter((a) => a.status === 'direview').length;
  const countMenunggu = applications.filter((a) => a.status === 'menunggu').length;
  const countDitolak = applications.filter((a) => a.status === 'ditolak').length;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(30, 41, 59);
  doc.text(`FILTER LOWONGAN : ${jobTitleText}`, 16, startY + 6);
  doc.text(`TAHAP SELEKSI   : ${statusFilterText}`, 16, startY + 12);
  doc.text(`TOTAL PELAMAR   : ${applications.length} Kandidat Terdata`, 16, startY + 17);

  doc.text(
    `STATISTIK STATUS: [ Diterima: ${countDiterima} | Interview: ${countInterview} | Direview: ${countDireview} | Menunggu: ${countMenunggu} | Ditolak: ${countDitolak} ]`,
    pageWidth - 16,
    startY + 6,
    { align: 'right' }
  );

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text(
    `Tanggal Ekspor: ${formatDateIndo(new Date().toISOString())} • Digenerate otomatis untuk arsip administrasi HRD`,
    pageWidth - 16,
    startY + 14,
    { align: 'right' }
  );

  // 3. Table of Applicants (9 columns, tailored for A4 landscape)
  const tableData = applications.map((app, idx) => {
    const job = allJobs.find((j) => j.id === app.lowonganId);
    const jobName = job?.judul || 'Lowongan';
    const skillsText = app.studentSkills && app.studentSkills.length > 0 ? app.studentSkills.slice(0, 3).join(', ') : '-';
    const interviewText = app.jadwalInterview || '-';
    const internalNoteText = app.catatanInternal || '-';

    return [
      (idx + 1).toString(),
      app.studentName,
      `${app.studentEmail}\n${app.studentPhone || '-'}`,
      `${app.studentUniversity}\n${app.studentMajor}`,
      jobName,
      skillsText,
      app.status.toUpperCase(),
      interviewText,
      internalNoteText,
    ];
  });

  autoTable(doc, {
    startY: startY + 24,
    head: [
      [
        'No',
        'Nama Kandidat',
        'Kontak (Email / Telp)',
        'Asal Kampus / Sekolah & Prodi',
        'Posisi Magang',
        'Keahlian (Skills)',
        'Status Seleksi',
        'Jadwal Wawancara',
        'Catatan Internal HRD',
      ],
    ],
    body: tableData.length > 0 ? tableData : [['-', '-', '-', 'Tidak ada data pelamar sesuai kriteria filter', '-', '-', '-', '-', '-']],
    theme: 'grid',
    headStyles: {
      fillColor: [15, 23, 42], // Slate-900
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 7.5,
      halign: 'center',
    },
    styles: {
      fontSize: 7,
      cellPadding: 2,
      textColor: [30, 41, 59],
      valign: 'top',
    },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center' },
      1: { cellWidth: 35, fontStyle: 'bold' },
      2: { cellWidth: 38 },
      3: { cellWidth: 44 },
      4: { cellWidth: 36 },
      5: { cellWidth: 28 },
      6: { cellWidth: 24, halign: 'center' },
      7: { cellWidth: 32 },
      8: { cellWidth: 35 },
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    didParseCell: (data) => {
      // Colorize Status column (column index 6)
      if (data.section === 'body' && data.column.index === 6) {
        const val = data.cell.raw;
        data.cell.styles.fontStyle = 'bold';
        if (val === 'DITERIMA') {
          data.cell.styles.textColor = [16, 185, 129]; // Emerald
        } else if (val === 'INTERVIEW') {
          data.cell.styles.textColor = [99, 102, 241]; // Indigo
        } else if (val === 'DIREVIEW') {
          data.cell.styles.textColor = [2, 132, 199]; // Sky
        } else if (val === 'MENUNGGU') {
          data.cell.styles.textColor = [217, 119, 6]; // Amber
        } else if (val === 'DITOLAK') {
          data.cell.styles.textColor = [225, 29, 72]; // Rose
        }
      }
    },
  });

  // 4. Verification / Sign-off Block at the end
  const finalY = (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY || 160;
  let signY = finalY + 10;
  if (signY + 35 > pageHeight) {
    doc.addPage();
    signY = 20;
  }

  const currentDateStr = formatDateIndo(new Date().toISOString());

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text(`Dokumen resmi ini digenerate secara otomatis pada ${currentDateStr}`, 12, signY);

  const sigRightX = pageWidth - 60;
  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text('Mengetahui / Mengesahkan,', sigRightX, signY, { align: 'center' });
  doc.text('Tim Rekrutmen & HRD', sigRightX, signY + 4, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.text(companyName, sigRightX, signY + 22, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184);
  doc.text('InternSpace Verified Partner', sigRightX, signY + 25, { align: 'center' });

  // 5. Page numbering footer
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `InternSpace • Laporan Rekapitulasi Pelamar Magang • Halaman ${i} dari ${totalPages}`,
      pageWidth / 2,
      pageHeight - 7,
      { align: 'center' }
    );
    doc.setDrawColor(226, 232, 240);
    doc.line(12, pageHeight - 10, pageWidth - 12, pageHeight - 10);
  }

  // Trigger download
  const safeComp = companyName.replace(/[^a-zA-Z0-9]/g, '_');
  const filename = `Daftar_Pelamar_${safeComp}_${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
}
