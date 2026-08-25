import jsPDF from 'jspdf';
import { Question, PaperType } from '../types';

export interface GenerateOMROptions {
  paper: PaperType;
  candidateName?: string;
  rollNumber?: string;
  testDate?: string;
  totalQuestions?: number; // default 150
  questions?: Question[];
  includeQuestionBooklet?: boolean;
  languageMode?: 'tamil' | 'bilingual' | 'english';
}

/**
 * Generates an Authentic TRB Optical Mark Recognition (OMR) Answer Sheet PDF (150 Questions)
 * + Optional Printable Test Booklet
 */
export function generateTRBOMRSheetPDF(options: GenerateOMROptions): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const totalQuestions = options.totalQuestions || 150;
  const paperTitle = options.paper === 'PAPER_I' 
    ? 'PAPER I (CLASSES 1-5 PRIMARY)' 
    : options.paper === 'PAPER_II_MATH_SCI' 
    ? 'PAPER II (MATHS & SCIENCE)' 
    : 'PAPER II (SOCIAL SCIENCE)';

  // ==========================================
  // PAGE 1: AUTHENTIC 150-QUESTION OMR SHEET
  // ==========================================

  // Border frame
  doc.setDrawColor(40, 40, 40);
  doc.setLineWidth(0.8);
  doc.rect(7, 7, pageWidth - 14, pageHeight - 14);

  // Inner double border
  doc.setLineWidth(0.3);
  doc.rect(8.5, 8.5, pageWidth - 17, pageHeight - 17);

  // Top Header Banner
  doc.setFillColor(240, 240, 240);
  doc.rect(9, 9, pageWidth - 18, 24, 'F');
  doc.line(9, 33, pageWidth - 9, 33);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(20, 20, 20);
  doc.text('GOVERNMENT OF TAMIL NADU - TEACHERS RECRUITMENT BOARD', pageWidth / 2, 16, { align: 'center' });

  doc.setFontSize(10.5);
  doc.setTextColor(160, 110, 20);
  doc.text(`TAMIL NADU TEACHER ELIGIBILITY TEST (TNTET) 2026 - ${paperTitle}`, pageWidth / 2, 22, { align: 'center' });

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);
  doc.text('OFFICIAL OMR OPTICAL RESPONSE SHEET • USE BLUE OR BLACK BALLPOINT PEN ONLY', pageWidth / 2, 28, { align: 'center' });

  // Candidate Details Grid
  let curY = 36;
  doc.setFontSize(8);
  doc.setTextColor(30, 30, 30);
  
  // Left: Candidate Name & Roll No Box
  doc.rect(12, curY, 115, 20);
  doc.setFont('helvetica', 'bold');
  doc.text('CANDIDATE NAME:', 15, curY + 6);
  doc.setFont('helvetica', 'normal');
  doc.text(options.candidateName || '________________________________________', 50, curY + 6);

  doc.setFont('helvetica', 'bold');
  doc.text('ROLL NO / REG NO:', 15, curY + 14);
  doc.setFont('helvetica', 'normal');
  doc.text(options.rollNumber || 'TNTET-2026-______________', 50, curY + 14);

  // Right: Instructions & Barcode placeholder
  doc.rect(130, curY, 68, 20);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('OMR SHADING RULES:', 133, curY + 5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.text('• Darken completely: [●] Correct   [X] [✓] Wrong', 133, curY + 10);
  doc.text('• Do not fold, tear or make stray marks.', 133, curY + 14);
  doc.text('• Each question carries 1 Mark. No negative mark.', 133, curY + 18);

  curY += 24;

  // 150 Question Grid - 5 Columns of 30 Questions Each
  const columns = 5;
  const qPerCol = 30;
  const colWidth = (pageWidth - 24) / columns;
  const optionsList = ['A', 'B', 'C', 'D'];

  for (let c = 0; c < columns; c++) {
    const colX = 12 + c * colWidth;
    const startQ = c * qPerCol + 1;
    const endQ = (c + 1) * qPerCol;

    // Column Header Box
    doc.setFillColor(230, 230, 230);
    doc.rect(colX, curY, colWidth - 2, 6, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(30, 30, 30);
    doc.text(`Q.${startQ} – Q.${endQ}`, colX + (colWidth - 2) / 2, curY + 4.2, { align: 'center' });

    // 30 Question Rows
    for (let r = 0; r < qPerCol; r++) {
      const qNum = startQ + r;
      const rowY = curY + 7.5 + r * 6.4;

      // Subtle alternate zebra striping
      if (r % 5 === 4) {
        doc.setDrawColor(200, 200, 200);
        doc.line(colX, rowY + 3.2, colX + colWidth - 2, rowY + 3.2);
      }

      // Question Number
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.5);
      doc.setTextColor(50, 50, 50);
      doc.text(String(qNum).padStart(3, ' '), colX + 1, rowY + 1.8);

      // 4 Bubbles (A, B, C, D)
      optionsList.forEach((opt, optIdx) => {
        const bubbleX = colX + 8.5 + optIdx * 6.2;
        const bubbleY = rowY;
        
        doc.setDrawColor(60, 60, 60);
        doc.setLineWidth(0.2);
        doc.circle(bubbleX, bubbleY, 1.8, 'S');

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(5);
        doc.setTextColor(90, 90, 90);
        doc.text(opt, bubbleX, bubbleY + 0.8, { align: 'center' });
      });
    }
  }

  // Bottom Signature Row
  const footerY = pageHeight - 20;
  doc.setDrawColor(180, 180, 180);
  doc.line(12, footerY - 2, pageWidth - 12, footerY - 2);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(60, 60, 60);
  doc.text('Signature of Candidate: _______________________', 15, footerY + 5);
  doc.text('Invigilator Verification Seal & Signature: _______________________', pageWidth - 15, footerY + 5, { align: 'right' });

  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(120, 120, 120);
  doc.text(`Sheet Code: TNTET-OMR-2026-${options.paper} • Printed via TNTET Coach Platform`, pageWidth / 2, footerY + 10, { align: 'center' });

  // ==============================================================
  // PAGE 2+: OPTIONAL TEST QUESTION BOOKLET (IF QUESTIONS PROVIDED)
  // ==============================================================
  if (options.includeQuestionBooklet && options.questions && options.questions.length > 0) {
    doc.addPage();

    // Question Booklet Cover & Questions Header
    doc.setFillColor(18, 18, 18);
    doc.rect(0, 0, pageWidth, 28, 'F');
    doc.setTextColor(197, 160, 89);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('TNTET PRACTICE QUESTION BOOKLET', 14, 12);
    
    doc.setFontSize(8.5);
    doc.setTextColor(220, 220, 220);
    doc.setFont('helvetica', 'normal');
    doc.text(`OFFICIAL SCERT SYLLABUS ALIGNED • ${paperTitle}`, 14, 18);
    doc.text(`Total Questions: ${options.questions.length} • Duration: ${Math.round(options.questions.length * 1.0)} Mins`, 14, 23);

    let bookY = 36;
    const isTa = options.languageMode === 'tamil';

    options.questions.forEach((q, idx) => {
      // Check space on page (needs at least 38mm for 1 question + 4 options)
      if (bookY > pageHeight - 45) {
        doc.addPage();
        bookY = 20;
      }

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(20, 20, 20);

      const qText = isTa ? (q.questionTa || q.questionEn) : q.questionEn;
      const splitTitle = doc.splitTextToSize(`Q.${idx + 1}. [${q.subject.toUpperCase()}] ${qText}`, pageWidth - 28);
      doc.text(splitTitle, 14, bookY);
      bookY += splitTitle.length * 4.5 + 2;

      // 4 Options Grid (2x2 layout)
      const optionsArr = isTa ? (q.optionsTa || q.optionsEn) : q.optionsEn;
      const optLabels = ['(A)', '(B)', '(C)', '(D)'];

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(50, 50, 50);

      // Row 1 (A & B)
      const optA = doc.splitTextToSize(`${optLabels[0]} ${optionsArr[0]}`, (pageWidth - 34) / 2);
      const optB = doc.splitTextToSize(`${optLabels[1]} ${optionsArr[1]}`, (pageWidth - 34) / 2);
      doc.text(optA, 18, bookY);
      doc.text(optB, pageWidth / 2 + 3, bookY);
      bookY += Math.max(optA.length, optB.length) * 4 + 2;

      // Row 2 (C & D)
      const optC = doc.splitTextToSize(`${optLabels[2]} ${optionsArr[2]}`, (pageWidth - 34) / 2);
      const optD = doc.splitTextToSize(`${optLabels[3]} ${optionsArr[3]}`, (pageWidth - 34) / 2);
      doc.text(optC, 18, bookY);
      doc.text(optD, pageWidth / 2 + 3, bookY);
      bookY += Math.max(optC.length, optD.length) * 4 + 5;

      // Light separator line between questions
      doc.setDrawColor(230, 230, 230);
      doc.line(14, bookY - 2, pageWidth - 14, bookY - 2);
      bookY += 2;
    });
  }

  // Save the PDF
  const filename = `TNTET_Official_150Q_OMR_Sheet_${options.paper}_${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
}
