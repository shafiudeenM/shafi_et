// Validates that every subject_id + topic_id used in the sample import exists
// in the seeded syllabus (source: seed_syllabus_topics.sql).
// Run: npx tsx scripts/validate_sample_import.ts

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { SAMPLE_QUESTIONS } from './sampleQuestionsData';

const __dirname = dirname(fileURLToPath(import.meta.url));
const seedBuf = readFileSync(join(__dirname, '..', 'seed_syllabus_topics.sql'));
let seedSql: string;
if (seedBuf[0] === 0xff && seedBuf[1] === 0xfe) {
  seedSql = seedBuf.toString('utf16le', 2);
} else {
  seedSql = seedBuf.toString('utf8');
}

const seedTopics = new Set<string>();
const topicIdRe = /^\s*\(?'([a-zA-Z0-9_]+)',\s*'([a-zA-Z0-9_]+)',/gm;
let m: RegExpExecArray | null;
while ((m = topicIdRe.exec(seedSql))) {
  seedTopics.add(m[1]);
}

const VALID_SUBJECTS = ['cdp', 'tamil', 'english', 'maths', 'evs', 'maths_science', 'social_science'];

const problems: string[] = [];
for (const row of SAMPLE_QUESTIONS) {
  if (!VALID_SUBJECTS.includes(row.subjectId)) {
    problems.push(`Unknown subject_id '${row.subjectId}' on topic '${row.topicId}'`);
  }
  if (!seedTopics.has(row.topicId)) {
    problems.push(`Unknown topic_id '${row.topicId}' (not in seed_syllabus_topics.sql)`);
  }
}

console.log(`SAMPLE_QUESTIONS: ${SAMPLE_QUESTIONS.length} rows`);
console.log(`Seed has ${seedTopics.size} topics`);

if (problems.length > 0) {
  console.error(`\nINVALID (${problems.length}):`);
  for (const p of problems) console.error(' - ' + p);
  process.exit(1);
} else {
  console.log('\nAll subject_ids and topic_ids are valid against the seeded syllabus. OK.');
}
