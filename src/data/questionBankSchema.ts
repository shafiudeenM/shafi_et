// TNTET Question Bank - Excel Import Schema & Mapping
// This file defines the database structure for importing Previous Year Questions from Excel

import {
  ALL_SYLLABUS_SUBJECTS,
  PAPER_I_SUBJECTS,
  PAPER_II_SUBJECTS,
  getAllTopicsForPaper,
  type SyllabusSubject,
  type SyllabusUnit,
  type SyllabusTopic,
} from './trbSyllabusData';

// Re-export syllabus data for consumers
export { ALL_SYLLABUS_SUBJECTS, PAPER_I_SUBJECTS, PAPER_II_SUBJECTS, getAllTopicsForPaper };
export type { SyllabusSubject, SyllabusUnit, SyllabusTopic };

// Backward-compatible type aliases
export type SCERTUnit = SyllabusSubject;
export type SCERTChapter = SyllabusUnit;
export type SCERTTopic = SyllabusTopic;

/**
 * Complete SCERT Syllabus for TNTET (re-exported from trbSyllabusData)
 */
export const PAPER_I_SYLLABUS: SyllabusSubject[] = PAPER_I_SUBJECTS;
export const PAPER_II_SYLLABUS: SyllabusSubject[] = PAPER_II_SUBJECTS;

/**
 * Excel Row Format for Question Import
 * This maps directly to columns in the Excel file
 */
export interface ExcelQuestionRow {
  // Required columns
  sno: number;                    // A: Serial Number
  paper: string;                  // B: Paper I / Paper II Math Sci / Paper II Soc Sci
  subject: string;                // C: Subject name (English)
  unit: string;                   // D: Unit name
  chapter: string;                // E: Chapter name
  topic: string;                  // F: Topic name
  year: number;                   // G: Year (2019, 2020, 2022, etc.)
  questionNo: string;             // H: Original question number in exam paper
  shift?: string;                 // I: Shift (Morning/Afternoon) or exam session

  // Question content
  questionEn: string;             // J: Question in English
  questionTa: string;             // K: Question in Tamil
  optionAEn: string;              // L: Option A in English
  optionATa: string;              // M: Option A in Tamil
  optionBEn: string;              // N: Option B in English
  optionBTa: string;              // O: Option B in Tamil
  optionCEn: string;              // P: Option C in English
  optionCTa: string;              // Q: Option C in Tamil
  optionDEn: string;              // R: Option D in English
  optionDTa: string;              // S: Option D in Tamil
  correctAnswer: string;          // T: Correct answer (A/B/C/D)
  difficulty?: string;            // U: Easy/Medium/Hard (optional, can be auto-classified)

  // Explanation (optional - can be filled later)
  explanationEn?: string;         // V: Explanation in English
  explanationTa?: string;         // W: Explanation in Tamil
  conceptSummaryEn?: string;      // X: Concept summary in English
  conceptSummaryTa?: string;      // Y: Concept summary in Tamil
  syllabusRef?: string;           // Z: Reference to SCERT textbook section
}

/**
 * Maps a subject name from Excel to our internal SubjectId
 */
export function mapExcelSubjectToId(subjectName: string): string {
  const lower = subjectName.toLowerCase().trim();

  // Social Science must be checked BEFORE science (order matters)
  if (lower.includes('social') || lower.includes('சமூக')) {
    return 'social_science';
  }
  // CDP variations
  if (lower.includes('cdp') || lower.includes('child development') || lower.includes('pedagogy') || lower.includes('குழந்தை வளர்ச்சி')) {
    return 'cdp';
  }
  // Tamil variations
  if (lower.includes('tamil') || lower.includes('தமிழ்') || lower === 'language i' || lower === 'மொழி i' || lower === 'language 1') {
    return 'tamil';
  }
  // English variations
  if (lower.includes('english') || lower.includes('ஆங்கிலம்') || lower === 'language ii' || lower === 'மொழி ii' || lower === 'language 2') {
    return 'english';
  }
  // Maths variations
  if (lower.includes('math') || lower.includes('கணித') || lower.includes('mathematics')) {
    return 'maths';
  }
  // EVS variations
  if (lower.includes('evs') || lower.includes('environment') || lower.includes('சூழ்நிலை')) {
    return 'evs';
  }
  // Science (Paper II) - checked after social_science
  if (lower.includes('science') || lower.includes('அறிவியல்')) {
    return 'maths_science';
  }

  return 'cdp'; // default fallback
}

/**
 * Maps a paper name from Excel to our internal PaperType
 */
export function mapExcelPaperToId(paperName: string): string {
  const lower = paperName.toLowerCase().trim();

  if (lower.includes('paper ii') || lower.includes('paper 2') || lower.includes('தாள் ii') || lower.includes('தாள் 2')) {
    if (lower.includes('social') || lower.includes('சமூக')) {
      return 'PAPER_II_SOC_SCI';
    }
    return 'PAPER_II_MATH_SCI';
  }
  if (lower.includes('paper i') || lower.includes('paper 1') || lower.includes('தாள் i') || lower.includes('தாள் 1')) {
    return 'PAPER_I';
  }

  return 'PAPER_I'; // default fallback
}

/**
 * Maps correct answer letter to index (0-3)
 */
export function mapAnswerToIndex(answer: string): number {
  const upper = answer.toUpperCase().trim();
  switch (upper) {
    case 'A': return 0;
    case 'B': return 1;
    case 'C': return 2;
    case 'D': return 3;
    default: return 0;
  }
}

/**
 * Auto-classifies difficulty based on question content and options
 */
export function classifyDifficulty(row: ExcelQuestionRow): 'Easy' | 'Medium' | 'Hard' {
  if (row.difficulty) {
    const d = row.difficulty.toLowerCase().trim();
    if (d === 'easy' || d === 'எளிது') return 'Easy';
    if (d === 'hard' || d === 'கடினம்') return 'Hard';
    return 'Medium';
  }

  // Auto-classify based on question characteristics
  const qLen = (row.questionEn || '').length;
  if (qLen < 80) return 'Easy';
  if (qLen > 150) return 'Hard';
  return 'Medium';
}

/**
 * Auto-classifies question type based on content
 */
export function classifyQuestionType(row: ExcelQuestionRow): 'conceptual' | 'factual' | 'application' | 'pedagogy' {
  const lower = (row.questionEn || '').toLowerCase();

  if (lower.includes('which of the following') || lower.includes('which one') || lower.match(/\bwho\b.*\bwas\b/)) {
    return 'factual';
  }
  if (lower.includes('apply') || lower.includes('calculate') || lower.includes('find') || lower.includes('solve')) {
    return 'application';
  }
  if (lower.includes('teaching') || lower.includes('pedagogy') || lower.includes('method') || lower.includes('approach')) {
    return 'pedagogy';
  }
  return 'conceptual';
}

/**
 * Classification result from auto-classification against official syllabus
 */
export interface TopicClassification {
  subjectId: string;
  subjectNameEn: string;
  subjectNameTa: string;
  unitId: string;
  unitNameEn: string;
  unitNameTa: string;
  topicId: string;
  topicNameEn: string;
  topicNameTa: string;
  confidence: number; // 0-1, based on keyword match count
  matchedKeywords: string[];
}

/**
 * Auto-classifies a question to a syllabus topic using keyword matching
 * against the official TRB syllabus data.
 *
 * @param questionText - The question text (English or Tamil) to classify
 * @param paperId - 'PAPER_I' or 'PAPER_II' to narrow search
 * @param subjectHint - Optional subject name hint from Excel import
 * @returns Best matching topic with confidence score, or null if no match
 */
export function classifyTopicFromSyllabus(
  questionText: string,
  paperId: 'PAPER_I' | 'PAPER_II',
  subjectHint?: string,
): TopicClassification | null {
  if (!questionText || questionText.trim().length === 0) return null;

  const textLower = questionText.toLowerCase();
  const textTa = questionText; // Tamil text for keyword matching

  // Get subjects for the given paper
  const subjects = paperId === 'PAPER_I' ? PAPER_I_SUBJECTS : PAPER_II_SUBJECTS;

  // If subject hint is provided, filter to matching subjects first
  let candidates = subjects;
  if (subjectHint) {
    const hintId = mapExcelSubjectToId(subjectHint);
    const filtered = subjects.filter(s => s.id === hintId);
    if (filtered.length > 0) candidates = filtered;
  }

  let bestMatch: TopicClassification | null = null;
  let bestScore = 0;

  for (const subject of candidates) {
    for (const unit of subject.units) {
      for (const topic of unit.topics) {
        let score = 0;
        const matched: string[] = [];

        // Check English keywords
        for (const kw of topic.keywordEn) {
          if (textLower.includes(kw.toLowerCase())) {
            score += 1;
            matched.push(kw);
          }
        }

        // Check Tamil keywords
        for (const kw of topic.keywordTa) {
          if (textTa.includes(kw)) {
            score += 1.5; // Slightly higher weight for Tamil matches (more specific)
            matched.push(kw);
          }
        }

        if (score > bestScore) {
          bestScore = score;
          // Normalize confidence to 0-1 range (capped at 1.0)
          const maxPossibleScore = topic.keywordEn.length + topic.keywordTa.length * 1.5;
          const confidence = maxPossibleScore > 0 ? Math.min(score / Math.max(maxPossibleScore * 0.3, 1), 1) : 0;

          bestMatch = {
            subjectId: subject.id,
            subjectNameEn: subject.nameEn,
            subjectNameTa: subject.nameTa,
            unitId: unit.id,
            unitNameEn: unit.nameEn,
            unitNameTa: unit.nameTa,
            topicId: topic.id,
            topicNameEn: topic.nameEn,
            topicNameTa: topic.nameTa,
            confidence,
            matchedKeywords: matched,
          };
        }
      }
    }
  }

  // Only return matches with at least 1 keyword hit
  if (bestScore >= 1 && bestMatch) {
    return bestMatch;
  }

  return null;
}

/**
 * Converts an Excel row to our internal Question format
 * Uses auto-classification from official syllabus when topic is not explicitly provided
 */
export function convertExcelRowToQuestion(row: ExcelQuestionRow, index: number): any {
  const subjectId = mapExcelSubjectToId(row.subject);
  const paperId = mapExcelPaperToId(row.paper);
  const correctIndex = mapAnswerToIndex(row.correctAnswer);
  const difficulty = classifyDifficulty(row);
  const questionType = classifyQuestionType(row);

  // Auto-classify topic from official syllabus using question text
  const questionText = `${row.questionEn || ''} ${row.questionTa || ''}`;
  const paperType: 'PAPER_I' | 'PAPER_II' =
    paperId === 'PAPER_I' ? 'PAPER_I' : 'PAPER_II';
  const classification = classifyTopicFromSyllabus(questionText, paperType, row.subject);

  // Use explicit topic if provided, otherwise use classified topic
  const topicId = row.topic
    ? `${subjectId}_${row.topic.toLowerCase().replace(/[^a-z0-9]+/g, '_').slice(0, 40)}`
    : classification?.topicId || `${subjectId}_general`;

  const topicName = row.topic || classification?.topicNameEn || row.chapter || 'General';
  const unitName = row.unit || classification?.unitNameEn || '';
  const chapterName = row.chapter || classification?.unitNameEn || '';

  // Build source string
  const source = `TRB TNTET ${row.year} ${row.paper} Q.${row.questionNo || (index + 1)}`;

  return {
    id: `pyq_${subjectId}_${row.year}_${index + 1}`,
    paper: paperId,
    subject: subjectId,
    unit: unitName,
    chapter: chapterName,
    topic: topicName,
    topicId,
    subtopic: classification?.topicNameEn || '',
    concept: classification?.topicNameEn || topicName,
    questionType,
    difficulty,
    source,
    year: row.year,

    questionEn: row.questionEn || '',
    questionTa: row.questionTa || row.questionEn || '',
    optionsEn: [
      row.optionAEn || '',
      row.optionBEn || '',
      row.optionCEn || '',
      row.optionDEn || '',
    ] as [string, string, string, string],
    optionsTa: [
      row.optionATa || row.optionAEn || '',
      row.optionBTa || row.optionBEn || '',
      row.optionCTa || row.optionCEn || '',
      row.optionDTa || row.optionDEn || '',
    ] as [string, string, string, string],
    correctOptionIndex: correctIndex,

    explanationEn: row.explanationEn || '',
    explanationTa: row.explanationTa || row.explanationEn || '',
    conceptSummaryEn: row.conceptSummaryEn || '',
    conceptSummaryTa: row.conceptSummaryTa || row.conceptSummaryEn || '',
    syllabusRef: row.syllabusRef || classification?.topicId || '',

    // Classification metadata
    _classification: classification ? {
      subjectId: classification.subjectId,
      unitId: classification.unitId,
      topicId: classification.topicId,
      confidence: classification.confidence,
      matchedKeywords: classification.matchedKeywords,
    } : null,
  };
}
