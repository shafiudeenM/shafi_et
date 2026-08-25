import { 
  Question, 
  TopicMastery, 
  UserInteraction, 
  ErrorType, 
  DailySessionPlan, 
  ReadinessScoreBreakdown,
  ReservationCategory,
  SubjectId,
  MistakeQueueItem
} from '../types';
import { ALL_QUESTIONS, SUBJECT_METADATA, INITIAL_TOPIC_MASTERIES } from '../data/tntetData';

/**
 * Classifies the likely error type when a question is answered incorrectly
 */
export function classifyError(
  question: Question,
  selectedOptionIndex: number,
  timeSpentSec: number,
  confidence?: 'high' | 'medium' | 'low'
): ErrorType {
  // Check if question has a specific distractor mapping
  if (question.distractorNotes && question.distractorNotes[selectedOptionIndex]) {
    return question.distractorNotes[selectedOptionIndex].likelyError;
  }

  // Fast response + high confidence = Careless or Misread
  if (timeSpentSec < 15) {
    return confidence === 'high' ? 'careless_error' : 'misread_question';
  }

  // Slow response (> 65 sec) = Time pressure or Knowledge gap
  if (timeSpentSec > 65) {
    return confidence === 'low' ? 'knowledge_gap' : 'time_pressure';
  }

  // Moderate time + low confidence = Concept confusion
  if (confidence === 'low') {
    return 'concept_confusion';
  }

  return 'concept_confusion';
}

/**
 * Updates a single numeric mastery percentage given a new interaction
 */
export function updateMasteryWithInteraction(
  currentMastery: number,
  isCorrect: boolean,
  timeSpentSec: number
): number {
  const delta = isCorrect ? (timeSpentSec < 45 ? 6 : 4) : -5;
  return Math.min(100, Math.max(15, currentMastery + delta));
}

/**
 * Calculates updated mastery for a topic following a set of interactions
 */
export function calculateTopicMastery(
  existingMastery: TopicMastery,
  newInteractions: UserInteraction[]
): TopicMastery {
  if (newInteractions.length === 0) return existingMastery;

  const totalAttempted = existingMastery.totalAttempted + newInteractions.length;
  const newCorrect = newInteractions.filter(i => i.isCorrect).length;
  const correctCount = existingMastery.correctCount + newCorrect;

  // Accuracy %
  const accuracy = Math.round((correctCount / totalAttempted) * 100);

  let status: 'weak' | 'developing' | 'exam_ready' = 'developing';
  if (accuracy < 55) {
    status = 'weak';
  } else if (accuracy >= 75) {
    status = 'exam_ready';
  }

  const errors = newInteractions
    .filter(i => !i.isCorrect && i.detectedErrorType)
    .map(i => i.detectedErrorType as ErrorType);
  
  let dominantError = existingMastery.dominantErrorType;
  if (errors.length > 0) {
    const counts: Record<string, number> = {};
    errors.forEach(e => counts[e] = (counts[e] || 0) + 1);
    dominantError = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0] as ErrorType;
  }

  return {
    ...existingMastery,
    masteryPercent: accuracy,
    status,
    totalAttempted,
    correctCount,
    lastPracticedAt: Date.now(),
    dominantErrorType: dominantError,
  };
}

/**
 * Calculates full TNTET Readiness score combining 4 dimensions
 */
export function calculateCandidateReadiness(
  topicMasteriesInput: TopicMastery[] | Record<string, number>,
  interactions: UserInteraction[],
  category: ReservationCategory
): ReadinessScoreBreakdown {
  const qualifyingThreshold = category === 'OC_GENERAL' ? 90 : 82;

  // Normalize topicMasteries to TopicMastery[]
  let topicMasteries: TopicMastery[] = [];
  if (Array.isArray(topicMasteriesInput)) {
    topicMasteries = topicMasteriesInput;
  } else {
    topicMasteries = INITIAL_TOPIC_MASTERIES.map(t => ({
      ...t,
      masteryPercent: topicMasteriesInput[t.topicId] !== undefined ? topicMasteriesInput[t.topicId] : t.masteryPercent,
      status: (topicMasteriesInput[t.topicId] ?? t.masteryPercent) >= 75 ? 'exam_ready' : (topicMasteriesInput[t.topicId] ?? t.masteryPercent) < 55 ? 'weak' : 'developing'
    }));
  }

  // 1. Knowledge Score (Average topic mastery across all subjects)
  const avgMastery = topicMasteries.length > 0
    ? topicMasteries.reduce((sum, t) => sum + t.masteryPercent, 0) / topicMasteries.length
    : 50;
  const knowledgeScore = Math.round(avgMastery);

  // 2. Accuracy Score (Weighted by recent interactions)
  const recentInteractions = interactions.slice(-30);
  const correctCount = recentInteractions.filter(i => i.isCorrect).length;
  const accuracyScore = recentInteractions.length > 0
    ? Math.round((correctCount / recentInteractions.length) * 100)
    : 62;

  // 3. Speed Score (Ideal: 35-50s per question)
  const avgSpeed = recentInteractions.length > 0
    ? recentInteractions.reduce((sum, i) => sum + i.timeSpentSec, 0) / recentInteractions.length
    : 45;
  let speedScore = 75;
  if (avgSpeed >= 30 && avgSpeed <= 55) {
    speedScore = 90;
  } else if (avgSpeed > 55 && avgSpeed <= 80) {
    speedScore = 65;
  } else if (avgSpeed > 80) {
    speedScore = 45;
  }

  // 4. Consistency Score
  const consistencyScore = Math.min(95, Math.max(40, Math.round((knowledgeScore + accuracyScore) / 2 + 4)));

  // Weighted overall readiness
  const overallScore = Math.round(
    0.35 * knowledgeScore +
    0.30 * accuracyScore +
    0.20 * speedScore +
    0.15 * consistencyScore
  );

  // Projected Marks out of 150
  const projectedMarks = Math.min(150, Math.max(45, Math.round((overallScore / 100) * 150)));
  const marginAboveCutoff = projectedMarks - qualifyingThreshold;

  // Subject breakdowns
  const subjectMap = new Map<SubjectId, { sum: number; count: number }>();
  topicMasteries.forEach(t => {
    const current = subjectMap.get(t.subjectId) || { sum: 0, count: 0 };
    subjectMap.set(t.subjectId, { sum: current.sum + t.masteryPercent, count: current.count + 1 });
  });

  const subjectScores = (Object.keys(SUBJECT_METADATA) as SubjectId[])
    .filter(subId => subjectMap.has(subId))
    .map(subId => {
      const data = subjectMap.get(subId)!;
      const mastery = Math.round(data.sum / (data.count || 1));
      const maxMarks = SUBJECT_METADATA[subId].totalOfficialMarks;
      const estimatedMarks = Math.round((mastery / 100) * maxMarks);
      
      let status: 'weak' | 'developing' | 'exam_ready' = 'developing';
      if (mastery < 55) status = 'weak';
      else if (mastery >= 75) status = 'exam_ready';

      return {
        subjectId: subId,
        subjectNameEn: SUBJECT_METADATA[subId].nameEn,
        subjectNameTa: SUBJECT_METADATA[subId].nameTa,
        masteryPercent: mastery,
        estimatedMarks,
        maxMarks,
        status,
      };
    });

  // Identify primary bottlenecks
  const weakTopics = topicMasteries.filter(t => t.status === 'weak');
  const bottlenecksEn: string[] = [];
  const bottlenecksTa: string[] = [];

  if (weakTopics.length > 0) {
    bottlenecksEn.push(`Lagging in ${weakTopics[0].topicNameEn} (${weakTopics[0].masteryPercent}% mastery)`);
    bottlenecksTa.push(`${weakTopics[0].topicNameTa} பாடத்தில் தேர்ச்சி குறைவு (${weakTopics[0].masteryPercent}%)`);
  }
  if (speedScore < 60) {
    bottlenecksEn.push('Spending >65s per question in Calculations; time loss in final third of mock');
    bottlenecksTa.push('வினாக்களுக்கு அதிக நேரம் எடுத்துக்கொள்வதால் தேர்வு இறுதியில் நேரப் பற்றாக்குறை ஏற்படும் அபாயம்');
  }
  if (bottlenecksEn.length === 0) {
    bottlenecksEn.push('Keep practicing to build rapid question classification reflexes');
    bottlenecksTa.push('தொடர் பயிற்சிகள் மூலம் வினாக்களை விரைவாக அடையாளம் காணும் திறனை வளர்க்கவும்');
  }

  return {
    overallScore,
    knowledgeScore,
    accuracyScore,
    speedScore,
    consistencyScore,
    qualifyingThreshold,
    projectedMarks,
    marginAboveCutoff,
    isQualifyingProjected: marginAboveCutoff >= 0,
    subjectScores,
    primaryBottlenecksEn: bottlenecksEn,
    primaryBottlenecksTa: bottlenecksTa,
  };
}

export const calculateReadinessScore = calculateCandidateReadiness;

/**
 * Generates the deterministic 35-40 min daily plan
 */
export function generateDailyPlan(
  topicMasteriesInput: TopicMastery[] | Record<string, number>,
  mistakesOrQuestions?: MistakeQueueItem[] | Question[] | string[],
  availableMinutes: number = 35
): DailySessionPlan {
  // Normalize topicMasteries
  let topicMasteries: TopicMastery[] = [];
  if (Array.isArray(topicMasteriesInput)) {
    topicMasteries = topicMasteriesInput;
  } else {
    topicMasteries = INITIAL_TOPIC_MASTERIES.map(t => ({
      ...t,
      masteryPercent: topicMasteriesInput[t.topicId] !== undefined ? topicMasteriesInput[t.topicId] : t.masteryPercent,
    }));
  }

  // 1. Pick weakest topic
  const sortedTopics = [...topicMasteries].sort((a, b) => a.masteryPercent - b.masteryPercent);
  const targetTopic = sortedTopics[0] || {
    topicId: 'maths_fractions_decimals',
    topicNameEn: 'Fractions & Decimals Operations',
    topicNameTa: 'பின்னங்கள் மற்றும் தசம எண்கள்',
    subjectId: 'maths' as SubjectId,
    masteryPercent: 41,
  };

  // Find questions for practice block
  const topicQuestions = ALL_QUESTIONS.filter(q => q.topicId === targetTopic.topicId);
  const otherQuestions = ALL_QUESTIONS.filter(q => q.topicId !== targetTopic.topicId);
  const practiceQuestions = [...topicQuestions, ...otherQuestions].slice(0, 15);

  let mistakeIds: string[] = [];
  if (Array.isArray(mistakesOrQuestions)) {
    mistakeIds = mistakesOrQuestions.map((item: any) => (typeof item === 'string' ? item : item.question?.id || item.id || ALL_QUESTIONS[0].id));
  }
  const reviewQuestions = mistakeIds.slice(0, 3);
  const quickCheckQuestions = ALL_QUESTIONS.slice(0, 5).map(q => q.id);
  const scaleFactor = availableMinutes / 35;

  return {
    id: `plan_${Date.now()}`,
    date: new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }),
    availableMinutes,
    targetSubject: targetTopic.subjectId,
    targetTopicId: targetTopic.topicId,
    targetTopicNameEn: targetTopic.topicNameEn,
    targetTopicNameTa: targetTopic.topicNameTa,
    whyChosenReasonEn: `Identified as your lowest-scoring area (${targetTopic.masteryPercent}% mastery). Closing this concept gap adds immediate safety to your qualifying cutoff.`,
    whyChosenReasonTa: `உங்கள் தற்போதைய குறைந்த மதிப்பெண் பகுதியாக (${targetTopic.masteryPercent}%) கண்டறியப்பட்டது. இந்த இடைவெளியை சரிசெய்வது தகுதி மதிப்பெண்ணை உடனடியாக உறுதி செய்யும்.`,

    learnBlock: {
      estimatedMinutes: Math.round(12 * scaleFactor),
      conceptTitleEn: `Mastery Focus: ${targetTopic.topicNameEn}`,
      conceptTitleTa: `முக்கிய கருத்து: ${targetTopic.topicNameTa}`,
      conceptKeyPointsEn: [
        'Core Rules and SCERT Textbook Definitions',
        'Official TRB Traps & Distractor Analysis',
        'Step-by-step Standard Model Calculations',
        'Mnemonic rules for swift recall during examination'
      ],
      conceptKeyPointsTa: [
        'அடிப்படை சூத்திரங்கள் மற்றும் பாடநூல் வரையறைகள்',
        'TRB தேர்வில் கேட்கப்படும் பொதுவான தவறான வாய்ப்புகள்',
        'படிநிலையான மாதிரி கணக்கீட்டு முறைகள்',
        'தேர்வில் விரைவாக நினைவுகூர உதவும் எளிய குறிப்புகள்'
      ],
      officialTerminologyNotesEn: 'Preserving official Tamil Nadu School Education terms for accurate question decoding.',
      officialTerminologyNotesTa: 'வினாத்தாளில் பயன்படும் கலைச்சொற்கள் துல்லியமாக விளக்கப்பட்டுள்ளன.',
      isCompleted: false,
    },

    practiceBlock: {
      estimatedMinutes: Math.round(15 * scaleFactor),
      questionCount: practiceQuestions.length,
      questionIds: practiceQuestions.map(q => q.id),
      completedCount: 0,
      isCompleted: false,
    },

    reviewBlock: {
      estimatedMinutes: Math.round(5 * scaleFactor),
      mistakeQuestionIds: reviewQuestions.length > 0 ? reviewQuestions : [ALL_QUESTIONS[0].id],
      isCompleted: false,
    },

    quickCheckBlock: {
      estimatedMinutes: Math.round(5 * scaleFactor),
      questionIds: quickCheckQuestions,
      isCompleted: false,
      passScorePercentage: 80,
    },

    overallCompleted: false,
  };
}
