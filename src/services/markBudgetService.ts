// Mark Budget Calculator for TNTET
// Helps candidates plan subject-wise targets to reach qualifying score
// Supports both OC (90/150 = 60%) and BC/MBC/SC/ST (82/150 = 55%) categories

import { ReservationCategory, SubjectId, TopicMastery } from '../types';
import { SUBJECT_METADATA } from '../data/tntetData';

export interface SubjectBudget {
  subjectId: SubjectId;
  nameEn: string;
  nameTa: string;
  maxMarks: number;           // Total marks available in this subject
  targetMarks: number;        // Candidate's target for this subject
  currentMastery: number;     // 0-100 estimated mastery
  estimatedMarks: number;     // Current estimated marks based on mastery
  gap: number;                // targetMarks - estimatedMarks (negative = exceeding)
  priority: 'focus' | 'maintain' | 'relax'; // Study priority
  strategyEn: string;
  strategyTa: string;
}

export interface MarkBudgetPlan {
  category: ReservationCategory;
  qualifyingScore: number;    // 90 for OC, 82 for BC/MBC/SC/ST
  qualifyingPercent: number;  // 60% for OC, 55% for BC/MBC/SC/ST
  totalMaxMarks: number;      // 150
  currentProjected: number;   // Sum of estimated marks
  margin: number;             // projected - qualifying (positive = safe)
  subjectBudgets: SubjectBudget[];
  overallStrategyEn: string;
  overallStrategyTa: string;
}

/**
 * Gets the qualifying score threshold based on category
 */
export function getQualifyingScore(category: ReservationCategory): number {
  return category === 'OC_GENERAL' ? 90 : 82;
}

/**
 * Gets the qualifying percentage based on category
 */
export function getQualifyingPercent(category: ReservationCategory): number {
  return category === 'OC_GENERAL' ? 60 : 55;
}

/**
 * Gets available subjects based on paper type
 */
export function getSubjectsForPaper(paperType: string): SubjectId[] {
  if (paperType === 'PAPER_I') {
    return ['cdp', 'tamil', 'english', 'maths', 'evs'];
  }
  if (paperType === 'PAPER_II_MATH_SCI') {
    return ['cdp', 'tamil', 'english', 'maths', 'maths_science'];
  }
  // PAPER_II_SOC_SCI
  return ['cdp', 'tamil', 'english', 'social_science'];
}

/**
 * Generates a complete mark budget plan
 */
export function generateMarkBudget(
  category: ReservationCategory,
  paperType: string,
  topicMasteries: TopicMastery[]
): MarkBudgetPlan {
  const qualifyingScore = getQualifyingScore(category);
  const qualifyingPercent = getQualifyingPercent(category);
  const subjects = getSubjectsForPaper(paperType);

  const subjectBudgets: SubjectBudget[] = subjects.map(subjectId => {
    const meta = SUBJECT_METADATA[subjectId];
    const maxMarks = meta.totalOfficialMarks;

    // Calculate average mastery for this subject
    const subjectMastery = topicMasteries.filter(t => t.subjectId === subjectId);
    const avgMastery = subjectMastery.length > 0
      ? subjectMastery.reduce((sum, t) => sum + t.masteryPercent, 0) / subjectMastery.length
      : 50; // Default 50% if no data

    // Estimate marks based on mastery (mastery% × maxMarks / 100)
    const estimatedMarks = Math.round((avgMastery / 100) * maxMarks);

    // Target marks: aim for slightly above average to compensate weak areas
    const targetMarks = Math.round(maxMarks * (qualifyingPercent / 100) * 1.1); // 10% buffer

    const gap = targetMarks - estimatedMarks;

    // Priority classification
    let priority: 'focus' | 'maintain' | 'relax';
    let strategyEn: string;
    let strategyTa: string;

    if (gap > 5) {
      priority = 'focus';
      strategyEn = `Focus intensely on ${meta.nameEn}. Practice 10+ questions daily from weak topics.`;
      strategyTa = `${meta.nameTa} பாடத்தில் தீவிரமாக கவனம் செலுத்துங்கள். பலவீனமான தலைப்புகளில் தினமும் 10+ வினாக்கள் பயிற்சி செய்யுங்கள்.`;
    } else if (gap > 0) {
      priority = 'maintain';
      strategyEn = `Maintain current pace in ${meta.nameEn}. Weekly revision is sufficient.`;
      strategyTa = `${meta.nameTa} பாடத்தில் தற்போதைய வேகத்தை பராமரியுங்கள். வாராந்திர மீள்பார்வை போதுமானது.`;
    } else {
      priority = 'relax';
      strategyEn = `${meta.nameEn} is strong. Quick revision only. Use saved time for weaker subjects.`;
      strategyTa = `${meta.nameTa} பாடம் வலுவாக உள்ளது. விரைவு மீள்பார்வை மட்டும் செய்யுங்கள். மீதமுள்ள நேரத்தை பலவீனமான பாடங்களுக்கு பயன்படுத்துங்கள்.`;
    }

    return {
      subjectId,
      nameEn: meta.nameEn,
      nameTa: meta.nameTa,
      maxMarks,
      targetMarks,
      currentMastery: Math.round(avgMastery),
      estimatedMarks,
      gap,
      priority,
      strategyEn,
      strategyTa,
    };
  });

  const currentProjected = subjectBudgets.reduce((sum, b) => sum + b.estimatedMarks, 0);
  const margin = currentProjected - qualifyingScore;

  // Overall strategy
  let overallStrategyEn: string;
  let overallStrategyTa: string;

  if (margin >= 15) {
    overallStrategyEn = `Excellent position! Your projected score of ${currentProjected}/150 is ${margin} marks above the qualifying score of ${qualifyingScore}. Focus on maintaining consistency and reduce careless errors.`;
    overallStrategyTa = `சிறந்த நிலை! உங்கள் மதிப்பெண் ${currentProjected}/150, தகுதி மதிப்பெண் ${qualifyingScore} ஐ விட ${margin} மதிப்புகள் அதிகம். நிலைத்தன்மையை பராமரித்து, கவனக்குறைவு பிழைகளைக் குறையுங்கள்.`;
  } else if (margin >= 0) {
    overallStrategyEn = `On track! Your projected score of ${currentProjected}/150 is ${margin} marks above the qualifying score of ${qualifyingScore}. Focus on your weakest 2 subjects to build a safer margin.`;
    overallStrategyTa = `சரியான பாதையில்! உங்கள் மதிப்பெண் ${currentProjected}/150, தகுதி மதிப்பெண் ${qualifyingScore} ஐ விட ${margin} மதிப்புகள் அதிகம். மிகவும் பலவீனமான 2 பாடங்களில் கவனம் செலுத்துங்கள்.`;
  } else {
    overallStrategyEn = `Urgent attention needed! Your projected score of ${currentProjected}/150 is ${Math.abs(margin)} marks below the qualifying score of ${qualifyingScore}. Prioritize weak subjects and study at least 60 minutes daily.`;
    overallStrategyTa = `அவசர கவனம் தேவை! உங்கள் மதிப்பெண் ${currentProjected}/150, தகுதி மதிப்பெண் ${qualifyingScore} ஐ விட ${Math.abs(margin)} மதிப்புகள் குறைவு. பலவீனமான பாடங்களுக்கு முன்னுரிமை அளித்து, தினமும் குறைந்தது 60 நிமிடம் படியுங்கள்.`;
  }

  return {
    category,
    qualifyingScore,
    qualifyingPercent,
    totalMaxMarks: 150,
    currentProjected,
    margin,
    subjectBudgets,
    overallStrategyEn,
    overallStrategyTa,
  };
}

/**
 * Gets a visual priority color for a subject
 */
export function getPriorityColor(priority: 'focus' | 'maintain' | 'relax'): string {
  switch (priority) {
    case 'focus': return '#ef4444';   // Red
    case 'maintain': return '#f59e0b'; // Amber
    case 'relax': return '#22c55e';    // Green
  }
}

/**
 * Gets priority label in Tamil
 */
export function getPriorityLabelTa(priority: 'focus' | 'maintain' | 'relax'): string {
  switch (priority) {
    case 'focus': return 'கவனம் செலுத்துக';
    case 'maintain': return 'பராமரி';
    case 'relax': return 'ஓய்வு';
  }
}
