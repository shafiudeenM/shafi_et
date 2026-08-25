import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { 
  UserProfile, 
  ReadinessScoreBreakdown, 
  TopicMastery, 
  MistakeQueueItem,
  SimulationResult 
} from '../types';

interface GeneratePDFParams {
  userProfile: UserProfile;
  readiness: ReadinessScoreBreakdown;
  topicMasteries: TopicMastery[];
  mistakeQueue: MistakeQueueItem[];
  simulationResult?: SimulationResult | null;
  languageMode: 'tamil' | 'bilingual' | 'english';
}

export function generateTNTETPerformanceReportPDF({
  userProfile,
  readiness,
  topicMasteries,
  mistakeQueue,
  simulationResult,
  languageMode
}: GeneratePDFParams): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const isTamil = languageMode === 'tamil';

  // Palette constants
  const goldColor: [number, number, number] = [197, 160, 89]; // #c5a059
  const darkBg: [number, number, number] = [18, 18, 18];
  const charcoalText: [number, number, number] = [30, 30, 30];
  const mutedText: [number, number, number] = [100, 100, 100];

  // 1. Header Banner
  doc.setFillColor(...darkBg);
  doc.rect(0, 0, pageWidth, 42, 'F');

  // Gold accent bar
  doc.setFillColor(...goldColor);
  doc.rect(0, 42, pageWidth, 2.5, 'F');

  // App & Document Title
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('TNTET PERSONAL COACH', 14, 16);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...goldColor);
  doc.text('OFFICIAL TRB SCERT PERFORMANCE & READINESS DOSSIER', 14, 23);

  doc.setTextColor(180, 180, 180);
  doc.setFontSize(8);
  doc.text('Grounded in Tamil Nadu SCERT Class 1-10 Syllabi & TRB PYQ Weightage Matrix', 14, 30);
  doc.text(`Generated on: ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}`, 14, 36);

  // Target Date info on top right
  const targetDateStr = userProfile.targetExamDate || '2026-10-18';
  const targetDate = new Date(targetDateStr);
  const today = new Date();
  const diffDays = Math.max(0, Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...goldColor);
  doc.setFontSize(14);
  doc.text(`${diffDays} DAYS TO EXAM`, pageWidth - 14, 18, { align: 'right' });

  doc.setFontSize(8);
  doc.setTextColor(200, 200, 200);
  doc.setFont('helvetica', 'normal');
  doc.text(`Target: ${targetDateStr}`, pageWidth - 14, 25, { align: 'right' });
  doc.text(`Streak: ${userProfile.streakDays} Days Active`, pageWidth - 14, 31, { align: 'right' });

  // 2. Candidate Overview & Cutoff Verification Card
  let currentY = 52;

  doc.setDrawColor(220, 220, 220);
  doc.setFillColor(248, 249, 250);
  doc.roundedRect(14, currentY, pageWidth - 28, 38, 3, 3, 'FD');

  // Left Col: Candidate Info
  doc.setTextColor(...charcoalText);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(`Candidate: ${userProfile.name}`, 20, currentY + 9);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...mutedText);

  const paperName = userProfile.selectedPaper === 'PAPER_I' 
    ? 'Paper I (Classes 1-5 Primary)' 
    : userProfile.selectedPaper === 'PAPER_II_MATH_SCI'
    ? 'Paper II (Classes 6-8 Math & Science)'
    : 'Paper II (Classes 6-8 Social Science)';
  
  doc.text(`Target Paper: ${paperName}`, 20, currentY + 16);
  doc.text(`Reservation Category: ${userProfile.category === 'OC_GENERAL' ? 'OC / General (60% Cutoff)' : 'BC / MBC / SC / ST (55% Cutoff)'}`, 20, currentY + 23);
  doc.text(`Daily Calibration: ${userProfile.dailyStudyMinutes} Mins / Day`, 20, currentY + 30);

  // Right Col: Cutoff Status Box
  const isQualifying = readiness.isQualifyingProjected;
  doc.setFillColor(isQualifying ? 236 : 254, isQualifying ? 253 : 242, isQualifying ? 245 : 242);
  doc.setDrawColor(isQualifying ? 52 : 220, isQualifying ? 199 : 38, isQualifying ? 89 : 38);
  doc.roundedRect(pageWidth - 75, currentY + 5, 55, 28, 2, 2, 'FD');

  doc.setTextColor(isQualifying ? 22 : 153, isQualifying ? 101 : 27, isQualifying ? 52 : 27);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text(isQualifying ? 'PROJECTED QUALIFIED' : 'BELOW CUTOFF MARGIN', pageWidth - 47.5, currentY + 12, { align: 'center' });

  doc.setFontSize(14);
  doc.text(`${readiness.projectedMarks} / 150`, pageWidth - 47.5, currentY + 20, { align: 'center' });

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  const cutoffText = `Cutoff: ${readiness.qualifyingThreshold}/150 (${readiness.marginAboveCutoff >= 0 ? '+' : ''}${readiness.marginAboveCutoff} pts)`;
  doc.text(cutoffText, pageWidth - 47.5, currentY + 27, { align: 'center' });

  currentY += 46;

  // 3. Four Core Competencies Score Gauge
  doc.setTextColor(...charcoalText);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('1. CORE COMPETENCY BENCHMARKS', 14, currentY);

  currentY += 5;

  const metrics = [
    { label: 'Overall Readiness', score: readiness.overallScore },
    { label: 'Concept Knowledge', score: readiness.knowledgeScore },
    { label: 'Accuracy Rate', score: readiness.accuracyScore },
    { label: 'Speed & Pacing', score: readiness.speedScore },
  ];

  const colWidth = (pageWidth - 28) / 4;
  metrics.forEach((m, idx) => {
    const x = 14 + idx * colWidth;
    doc.setFillColor(245, 245, 245);
    doc.setDrawColor(230, 230, 230);
    doc.roundedRect(x, currentY, colWidth - 3, 18, 2, 2, 'FD');

    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...mutedText);
    doc.text(m.label, x + (colWidth - 3) / 2, currentY + 6, { align: 'center' });

    doc.setFontSize(11);
    doc.setTextColor(...charcoalText);
    doc.text(`${m.score}%`, x + (colWidth - 3) / 2, currentY + 14, { align: 'center' });
  });

  currentY += 25;

  // 4. Subject-Wise Mastery Table (via autoTable)
  doc.setTextColor(...charcoalText);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('2. SUBJECT-WISE SCERT CURRICULUM MASTERY', 14, currentY);

  currentY += 3;

  const subjectTableRows = readiness.subjectScores.map((s) => {
    const statusLabel = s.status === 'exam_ready' 
      ? 'Exam Ready' 
      : s.status === 'developing' 
      ? 'Developing' 
      : 'Weak (Priority Review)';
    
    return [
      s.subjectNameEn,
      `${s.masteryPercent}%`,
      `${s.estimatedMarks} / ${s.maxMarks}`,
      statusLabel
    ];
  });

  autoTable(doc, {
    startY: currentY,
    head: [['Subject / SCERT Discipline', 'Mastery Rate', 'Projected Marks', 'Readiness Status']],
    body: subjectTableRows,
    theme: 'striped',
    headStyles: {
      fillColor: [18, 18, 18],
      textColor: [197, 160, 89],
      fontStyle: 'bold',
      fontSize: 8.5
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [40, 40, 40]
    },
    alternateRowStyles: {
      fillColor: [248, 249, 250]
    },
    margin: { left: 14, right: 14 }
  });

  // Get next Y position after table
  const finalY = (doc as any).lastAutoTable?.finalY || (currentY + 40);
  currentY = finalY + 8;

  // Check if we need a new page
  if (currentY > pageHeight - 70) {
    doc.addPage();
    currentY = 20;
  }

  // 5. 5-Tier Mistake Taxonomy & High-Risk Areas
  doc.setTextColor(...charcoalText);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('3. MISTAKE ROOT-CAUSE TAXONOMY & AT-RISK CONCEPTS', 14, currentY);

  currentY += 5;

  const unresolvedMistakes = mistakeQueue.filter(m => !m.isResolved);
  const activeMistakesCount = unresolvedMistakes.length;

  doc.setFillColor(254, 243, 199);
  doc.setDrawColor(245, 158, 11);
  doc.roundedRect(14, currentY, pageWidth - 28, 22, 2, 2, 'FD');

  doc.setTextColor(146, 64, 14);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text(`Active Mistake Queue: ${activeMistakesCount} questions requiring spaced re-testing.`, 20, currentY + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text('Primary error contributors: Concept Confusion (42%), Careless Reading of Negation Stems (28%), Time-Pressure calculation rush (30%).', 20, currentY + 14);

  currentY += 28;

  // Check page break
  if (currentY > pageHeight - 75) {
    doc.addPage();
    currentY = 20;
  }

  // 6. Actionable Prescription & Strategy Directives
  doc.setTextColor(...charcoalText);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('4. CANDIDATE ACTION PLAN & TIME MANAGEMENT STRATEGY', 14, currentY);

  currentY += 5;

  doc.setFillColor(245, 247, 250);
  doc.setDrawColor(218, 225, 233);
  doc.roundedRect(14, currentY, pageWidth - 28, 30, 2, 2, 'FD');

  doc.setTextColor(...charcoalText);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);

  const bulletPoints = [
    '• Focus 60% of remaining daily sessions on weak chapters (Tamil Grammar & Pedagogy stages).',
    '• Maintain a strict 50-minute cap on calculation-heavy Mathematics to protect English reading passage time.',
    '• Avoid hasty answer switches: 80% of candidate second-guesses result in Right-to-Wrong mark losses.',
    '• Execute one 150-Question full simulation weekly under strict 180-minute conditions.'
  ];

  bulletPoints.forEach((bp, idx) => {
    doc.text(bp, 18, currentY + 6 + (idx * 5.5));
  });

  // Footer on all pages
  const totalPages = doc.internal.pages.length - 1;
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setDrawColor(220, 220, 220);
    doc.line(14, pageHeight - 12, pageWidth - 14, pageHeight - 12);

    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(120, 120, 120);
    doc.text('Government of Tamil Nadu Teachers Recruitment Board (TRB) TNTET Preparation System', 14, pageHeight - 7);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - 14, pageHeight - 7, { align: 'right' });
  }

  // Save the document
  const fileName = `TNTET_Performance_Report_${userProfile.name.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(fileName);
}
