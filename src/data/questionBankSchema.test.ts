import { describe, it, expect } from 'vitest';
import {
  mapExcelSubjectToId,
  mapExcelPaperToId,
  mapAnswerToIndex,
  classifyDifficulty,
  classifyQuestionType,
  classifyTopicFromSyllabus,
  convertExcelRowToQuestion,
  PAPER_I_SYLLABUS,
  PAPER_II_SYLLABUS,
} from '../data/questionBankSchema';
import {
  ALL_SYLLABUS_SUBJECTS,
  PAPER_I_SUBJECTS,
  PAPER_II_SUBJECTS,
  getAllTopicsForPaper,
  getSyllabusStats,
} from '../data/trbSyllabusData';
import type { ExcelQuestionRow } from '../data/questionBankSchema';

describe('Question Bank Schema', () => {
  describe('mapExcelSubjectToId', () => {
    it('should map CDP variations', () => {
      expect(mapExcelSubjectToId('Child Development & Pedagogy')).toBe('cdp');
      expect(mapExcelSubjectToId('CDP')).toBe('cdp');
      expect(mapExcelSubjectToId('குழந்தை வளர்ச்சி')).toBe('cdp');
    });

    it('should map Tamil variations', () => {
      expect(mapExcelSubjectToId('Tamil')).toBe('tamil');
      expect(mapExcelSubjectToId('Language I')).toBe('tamil');
      expect(mapExcelSubjectToId('தமிழ்')).toBe('tamil');
    });

    it('should map English variations', () => {
      expect(mapExcelSubjectToId('English')).toBe('english');
      expect(mapExcelSubjectToId('Language II')).toBe('english');
      expect(mapExcelSubjectToId('ஆங்கிலம்')).toBe('english');
    });

    it('should map Maths variations', () => {
      expect(mapExcelSubjectToId('Mathematics')).toBe('maths');
      expect(mapExcelSubjectToId('Maths')).toBe('maths');
      expect(mapExcelSubjectToId('கணிதம்')).toBe('maths');
    });

    it('should map EVS variations', () => {
      expect(mapExcelSubjectToId('EVS')).toBe('evs');
      expect(mapExcelSubjectToId('Environmental Studies')).toBe('evs');
    });

    it('should map Science', () => {
      expect(mapExcelSubjectToId('Science')).toBe('maths_science');
      expect(mapExcelSubjectToId('அறிவியல்')).toBe('maths_science');
    });

    it('should map Social Science', () => {
      expect(mapExcelSubjectToId('Social Science')).toBe('social_science');
      expect(mapExcelSubjectToId('சமூக அறிவியல்')).toBe('social_science');
    });
  });

  describe('mapExcelPaperToId', () => {
    it('should map Paper I', () => {
      expect(mapExcelPaperToId('Paper I')).toBe('PAPER_I');
      expect(mapExcelPaperToId('Paper 1')).toBe('PAPER_I');
      expect(mapExcelPaperToId('தாள் I')).toBe('PAPER_I');
    });

    it('should map Paper II Math/Science', () => {
      expect(mapExcelPaperToId('Paper II Mathematics Science')).toBe('PAPER_II_MATH_SCI');
      expect(mapExcelPaperToId('Paper II Maths')).toBe('PAPER_II_MATH_SCI');
    });

    it('should map Paper II Social Science', () => {
      expect(mapExcelPaperToId('Paper II Social Science')).toBe('PAPER_II_SOC_SCI');
    });
  });

  describe('mapAnswerToIndex', () => {
    it('should map A to 0', () => expect(mapAnswerToIndex('A')).toBe(0));
    it('should map B to 1', () => expect(mapAnswerToIndex('B')).toBe(1));
    it('should map C to 2', () => expect(mapAnswerToIndex('C')).toBe(2));
    it('should map D to 3', () => expect(mapAnswerToIndex('D')).toBe(3));
    it('should handle lowercase', () => expect(mapAnswerToIndex('a')).toBe(0));
    it('should handle whitespace', () => expect(mapAnswerToIndex(' C ')).toBe(2));
  });

  describe('classifyDifficulty', () => {
    it('should classify short questions as Easy', () => {
      expect(classifyDifficulty({ questionEn: 'Short question?', difficulty: '' })).toBe('Easy');
    });

    it('should classify long questions as Hard', () => {
      const longQ = 'A'.repeat(160);
      expect(classifyDifficulty({ questionEn: longQ, difficulty: '' })).toBe('Hard');
    });

    it('should use provided difficulty when available', () => {
      expect(classifyDifficulty({ questionEn: 'Any question', difficulty: 'Hard' })).toBe('Hard');
      expect(classifyDifficulty({ questionEn: 'Any question', difficulty: 'எளிது' })).toBe('Easy');
    });
  });

  describe('classifyQuestionType', () => {
    it('should classify factual questions', () => {
      expect(classifyQuestionType({ questionEn: 'Which of the following was the first...' })).toBe('factual');
    });

    it('should classify application questions', () => {
      expect(classifyQuestionType({ questionEn: 'Calculate the area of...' })).toBe('application');
    });

    it('should classify pedagogy questions', () => {
      expect(classifyQuestionType({ questionEn: 'Which teaching method is best for...' })).toBe('pedagogy');
    });

    it('should default to conceptual', () => {
      expect(classifyQuestionType({ questionEn: 'What is the concept of...' })).toBe('conceptual');
    });
  });

  describe('SCERT Syllabus Structure', () => {
    it('should have all 5 main subjects for Paper I', () => {
      const ids = PAPER_I_SYLLABUS.map(u => u.id);
      expect(ids).toContain('cdp');
      expect(ids).toContain('tamil');
      expect(ids).toContain('english');
      expect(ids).toContain('maths');
      expect(ids).toContain('evs');
    });

    it('should have topics with Tamil translations', () => {
      PAPER_I_SYLLABUS.forEach(subject => {
        expect(subject.nameTa).toBeTruthy();
        subject.units.forEach(unit => {
          expect(unit.nameTa).toBeTruthy();
          unit.topics.forEach(topic => {
            expect(topic.nameTa).toBeTruthy();
            expect(topic.keywordEn.length).toBeGreaterThan(0);
            expect(topic.keywordTa.length).toBeGreaterThan(0);
          });
        });
      });
    });

    it('should have unique topic IDs across all units', () => {
      const allIds = new Set<string>();
      PAPER_I_SYLLABUS.forEach(subject =>
        subject.units.forEach(unit =>
          unit.topics.forEach(topic => {
            expect(allIds.has(topic.id)).toBe(false);
            allIds.add(topic.id);
          })
        )
      );
    });
  });

  describe('Official TRB Syllabus Data', () => {
    it('should have 10 total subjects (5 Paper I + 5 Paper II)', () => {
      expect(ALL_SYLLABUS_SUBJECTS.length).toBe(10);
      expect(PAPER_I_SUBJECTS.length).toBe(5);
      expect(PAPER_II_SUBJECTS.length).toBe(5);
    });

    it('should cover all required subjects for Paper I', () => {
      const ids = PAPER_I_SUBJECTS.map(s => s.id);
      expect(ids).toContain('cdp');
      expect(ids).toContain('tamil');
      expect(ids).toContain('english');
      expect(ids).toContain('maths');
      expect(ids).toContain('evs');
    });

    it('should cover all required subjects for Paper II', () => {
      const ids = PAPER_II_SUBJECTS.map(s => s.id);
      expect(ids).toContain('cdp');
      expect(ids).toContain('tamil');
      expect(ids).toContain('english');
      expect(ids).toContain('maths_science');
      expect(ids).toContain('social_science');
    });

    it('should return correct stats', () => {
      const stats = getSyllabusStats();
      expect(stats.totalSubjects).toBe(10);
      expect(stats.totalUnits).toBeGreaterThan(20);
      expect(stats.totalTopics).toBeGreaterThan(80);
    });

    it('should have valid syllabus references in all topics', () => {
      ALL_SYLLABUS_SUBJECTS.forEach(subject => {
        expect(subject.id).toBeTruthy();
        expect(subject.nameEn).toBeTruthy();
        expect(subject.nameTa).toBeTruthy();
        expect(['PAPER_I', 'PAPER_II', 'BOTH']).toContain(subject.paper);
        expect(subject.units.length).toBeGreaterThan(0);

        subject.units.forEach(unit => {
          expect(unit.id).toBeTruthy();
          expect(unit.nameEn).toBeTruthy();
          expect(unit.nameTa).toBeTruthy();
          expect(unit.topics.length).toBeGreaterThan(0);

          unit.topics.forEach(topic => {
            expect(topic.id).toBeTruthy();
            expect(topic.nameEn).toBeTruthy();
            expect(topic.nameTa).toBeTruthy();
            expect(topic.keywordEn.length).toBeGreaterThanOrEqual(2);
            expect(topic.keywordTa.length).toBeGreaterThanOrEqual(2);
          });
        });
      });
    });

    it('should get all topics for Paper I via helper', () => {
      const topics = getAllTopicsForPaper('PAPER_I');
      expect(topics.length).toBeGreaterThan(50);
      // All should have keywordEn
      topics.forEach(t => {
        expect(t.keywordEn.length).toBeGreaterThan(0);
      });
    });

    it('should get all topics for Paper II via helper', () => {
      const topics = getAllTopicsForPaper('PAPER_II');
      expect(topics.length).toBeGreaterThan(30);
    });
  });

  describe('classifyTopicFromSyllabus', () => {
    it('should classify a Piaget question to CDP Paper I', () => {
      const result = classifyTopicFromSyllabus(
        'Piaget described four stages of cognitive development. Which stage is characterized by symbolic thinking?',
        'PAPER_I',
        'Child Development',
      );
      expect(result).not.toBeNull();
      expect(result!.subjectId).toBe('cdp');
      expect(result!.topicNameEn).toContain('Physical Growth');
      expect(result!.confidence).toBeGreaterThan(0);
      expect(result!.matchedKeywords.length).toBeGreaterThan(0);
    });

    it('should classify a Tamil grammar question', () => {
      const result = classifyTopicFromSyllabus(
        'தமிழ் இலக்கணத்தில் சந்தி விதிகள் என்றால் என்ன?',
        'PAPER_I',
        'Tamil',
      );
      expect(result).not.toBeNull();
      expect(result!.subjectId).toBe('tamil');
    });

    it('should classify a Mathematics question', () => {
      const result = classifyTopicFromSyllabus(
        'Find the perimeter of a rectangle with length 10 cm and breadth 5 cm',
        'PAPER_I',
        'Mathematics',
      );
      expect(result).not.toBeNull();
      expect(result!.subjectId).toBe('maths');
    });

    it('should return null for empty text', () => {
      expect(classifyTopicFromSyllabus('', 'PAPER_I')).toBeNull();
      expect(classifyTopicFromSyllabus('   ', 'PAPER_I')).toBeNull();
    });

    it('should classify a Paper II Science question', () => {
      const result = classifyTopicFromSyllabus(
        'Newton\'s third law states that every action has an equal and opposite reaction',
        'PAPER_II',
        'Science',
      );
      expect(result).not.toBeNull();
      expect(result!.subjectId).toBe('maths_science');
    });

    it('should classify a Social Science history question', () => {
      const result = classifyTopicFromSyllabus(
        'The Indus Valley civilization was centered around Harappa and Mohenjo-daro',
        'PAPER_II',
        'Social Science',
      );
      expect(result).not.toBeNull();
      expect(result!.subjectId).toBe('social_science');
    });
  });

  describe('convertExcelRowToQuestion with auto-classification', () => {
    const baseRow: ExcelQuestionRow = {
      sno: 1,
      paper: 'Paper I',
      subject: 'Child Development & Pedagogy',
      unit: '',
      chapter: '',
      topic: '',
      year: 2022,
      questionNo: '1',
      questionEn: 'Piaget described four stages of cognitive development. Which stage is characterized by symbolic thinking?',
      questionTa: '',
      optionAEn: 'Sensorimotor',
      optionATa: '',
      optionBEn: 'Preoperational',
      optionBTa: '',
      optionCEn: 'Concrete operational',
      optionCTa: '',
      optionDEn: 'Formal operational',
      optionDTa: '',
      correctAnswer: 'B',
    };

    it('should auto-classify topic when not explicitly provided', () => {
      const result = convertExcelRowToQuestion(baseRow, 0);
      expect(result.subject).toBe('cdp');
      expect(result._classification).not.toBeNull();
      expect(result._classification.topicId).toBeTruthy();
      expect(result._classification.confidence).toBeGreaterThan(0);
    });

    it('should use explicit topic when provided', () => {
      const row = { ...baseRow, topic: 'My Custom Topic' };
      const result = convertExcelRowToQuestion(row, 0);
      expect(result.topic).toBe('My Custom Topic');
    });

    it('should preserve source metadata', () => {
      const result = convertExcelRowToQuestion(baseRow, 0);
      expect(result.source).toContain('2022');
      expect(result.source).toContain('Paper I');
      expect(result.year).toBe(2022);
    });

    it('should fallback Tamil to English when not provided', () => {
      const result = convertExcelRowToQuestion(baseRow, 0);
      expect(result.questionTa).toBe(result.questionEn);
    });
  });
});
