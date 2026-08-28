// Generates runnable SQL from scripts/sampleQuestionsData.ts for import into the
// Supabase SQL Editor.
//
// Outputs:
//   scripts/insert_sample_questions.sql  — question_papers upserts + questions
//                                          inserts + question_topics mapping
//   scripts/erase_sample_questions.sql  — DELETE WHERE id LIKE 'q_sample_%'
//
// Run: npx tsx scripts/importQuestions.ts

import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { SAMPLE_QUESTIONS, SampleQuestionRow } from './sampleQuestionsData';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ---------------------------------------------------------------------------
// SQL escaping
// ---------------------------------------------------------------------------
function sqlString(value: string): string {
  // Escape single quotes by doubling them; strip NUL chars.
  return "'" + value.replace(/'/g, "''").replace(/\u0000/g, '') + "'";
}

// Take the FK-required paper_id per (year, paper_type).
function paperIdFor(row: SampleQuestionRow): string {
  return `smp_${row.year}_${row.paper}`;
}

// ---------------------------------------------------------------------------
// Aggregate papers
// ---------------------------------------------------------------------------
const papers = new Map<string, { year: number; paperType: string; count: number }>();
for (const row of SAMPLE_QUESTIONS) {
  const pid = paperIdFor(row);
  const existing = papers.get(pid);
  if (existing) {
    existing.count += 1;
  } else {
    papers.set(pid, { year: row.year, paperType: row.paper, count: 1 });
  }
}

const lines: string[] = [];
lines.push('-- ============================================================');
lines.push('-- TNTET Personal Coach - Sample Question Import');
lines.push(`-- Generated: ${new Date().toISOString()}`);
lines.push(`-- ${SAMPLE_QUESTIONS.length} questions across ${papers.size} papers`);
lines.push('-- Run in the Supabase SQL Editor (public schema).');
lines.push('-- ============================================================');
lines.push('');

// --- 1. question_papers upserts -------------------------------------------
lines.push('-- 1) question_papers (upsert by id)');
lines.push('INSERT INTO public.question_papers (id, year, paper_type, shift, source, total_questions) VALUES');
const paperValues: string[] = [];
for (const [pid, p] of papers) {
  paperValues.push(`  (${sqlString(pid)}, ${p.year}, ${sqlString(p.paperType)}, NULL, ${sqlString('TRB TNTET Sample')}, ${p.count})`);
}
lines.push(paperValues.join(',\n') + '\nON CONFLICT (id) DO UPDATE SET year = EXCLUDED.year, paper_type = EXCLUDED.paper_type, total_questions = EXCLUDED.total_questions;');
lines.push('');

// --- 2. questions inserts --------------------------------------------------
lines.push('-- 2) questions (upsert by id)');
lines.push('INSERT INTO public.questions (');
lines.push('  id, paper_id, subject_id, topic_id, sno, question_no,');
lines.push('  question_en, question_ta,');
lines.push('  option_a_en, option_a_ta, option_b_en, option_b_ta,');
lines.push('  option_c_en, option_c_ta, option_d_en, option_d_ta,');
lines.push('  correct_option, difficulty, question_type,');
lines.push('  explanation_en, explanation_ta,');
lines.push('  concept_summary_en, concept_summary_ta, syllabus_ref,');
lines.push('  year, is_active');
lines.push(') VALUES');

const qValues: string[] = [];
const topicLines: string[] = [];
SAMPLE_QUESTIONS.forEach((row, i) => {
  const sno = i + 1;
  const qid = `q_sample_${String(sno).padStart(3, '0')}`;
  const pid = paperIdFor(row);

  qValues.push(
    [
      `  (`,
      `    ${sqlString(qid)},`,
      `    ${sqlString(pid)},`,
      `    ${sqlString(row.subjectId)},`,
      `    ${sqlString(row.topicId)},`,
      `    ${sno},`,
      `    ${sqlString(row.questionNo)},`,
      `    ${sqlString(row.questionEn)},`,
      `    ${sqlString(row.questionTa)},`,
      `    ${sqlString(row.optionsEn[0])}, ${sqlString(row.optionsTa[0])},`,
      `    ${sqlString(row.optionsEn[1])}, ${sqlString(row.optionsTa[1])},`,
      `    ${sqlString(row.optionsEn[2])}, ${sqlString(row.optionsTa[2])},`,
      `    ${sqlString(row.optionsEn[3])}, ${sqlString(row.optionsTa[3])},`,
      `    ${row.correctIndex},`,
      `    ${sqlString(row.difficulty)},`,
      `    ${sqlString(row.questionType)},`,
      `    ${sqlString(row.explanationEn)},`,
      `    ${sqlString(row.explanationTa)},`,
      `    NULL, NULL,`,
      `    ${sqlString('TRB TNTET Official Sample')},`,
      `    ${row.year},`,
      `    true`,
      `  )`,
    ].join('\n'),
  );

  topicLines.push(`  (${sqlString(qid)}, ${sqlString(row.topicId)}, true, 1.00)`);
});

lines.push(qValues.join(',\n'));
lines.push('');
lines.push('ON CONFLICT (id) DO UPDATE SET');
lines.push('  paper_id = EXCLUDED.paper_id,');
lines.push('  subject_id = EXCLUDED.subject_id,');
lines.push('  topic_id = EXCLUDED.topic_id,');
lines.push('  question_en = EXCLUDED.question_en,');
lines.push('  question_ta = EXCLUDED.question_ta,');
lines.push('  correct_option = EXCLUDED.correct_option,');
lines.push('  difficulty = EXCLUDED.difficulty,');
lines.push('  question_type = EXCLUDED.question_type,');
lines.push('  year = EXCLUDED.year,');
lines.push('  is_active = EXCLUDED.is_active;');
lines.push('');

// --- 3. question_topics mapping -------------------------------------------
lines.push('-- 3) question_topics mapping (primary topic link per question)');
lines.push('INSERT INTO public.question_topics (question_id, topic_id, is_primary, relevance_score) VALUES');
lines.push(topicLines.join(',\n'));
lines.push('ON CONFLICT (question_id, topic_id) DO UPDATE SET is_primary = EXCLUDED.is_primary, relevance_score = EXCLUDED.relevance_score;');
lines.push('');
lines.push('-- DONE');

// ---------------------------------------------------------------------------
// Erase script
// ---------------------------------------------------------------------------
const eraseLines: string[] = [];
eraseLines.push('-- Erases all sample questions and their mappings (id LIKE q_sample_%).');
eraseLines.push('-- question_topics rows cascade on question DELETE (FK ON DELETE CASCADE).');
eraseLines.push("DELETE FROM public.questions WHERE id LIKE 'q_sample_%';");
eraseLines.push('');

// ---------------------------------------------------------------------------
// Write output files
// ---------------------------------------------------------------------------
const insertPath = join(__dirname, 'insert_sample_questions.sql');
const erasePath = join(__dirname, 'erase_sample_questions.sql');

mkdirSync(__dirname, { recursive: true });
writeFileSync(insertPath, lines.join('\n'), 'utf8');
writeFileSync(erasePath, eraseLines.join('\n'), 'utf8');

const charCount = lines.join('\n').length;
console.log(`Wrote ${insertPath} (${charCount} chars, ${SAMPLE_QUESTIONS.length} questions)`);
console.log(`Wrote ${erasePath}`);
console.log(`Paper groups: ${[...papers.entries()].map(([id, p]) => `${id} (${p.count})`).join(', ')}`);
