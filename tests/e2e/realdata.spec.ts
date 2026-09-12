import { test, expect } from '@playwright/test';

interface SeedOpts {
  interactions: unknown[];
  topicIds?: Record<string, { masteryPercent: number; totalAttempted: number; correctCount: number }>;
  diagnosticDone?: boolean;
}

const GUEST_AUTH = {
  id: 'user_guest_e2e',
  email: 'guest.e2e@local.dev',
  name: 'E2E Guest',
  role: 'candidate',
  provider: 'local',
  avatarUrl: '',
  createdAt: new Date().toISOString(),
  lastLoginAt: new Date().toISOString(),
  targetPaper: 'PAPER_I',
  category: 'OC_GENERAL',
  dailyMinutes: 30,
  isVerified: true,
} as const;

async function seedUser(page: import('@playwright/test').Page, opts: SeedOpts) {
  const { interactions, topicIds = {}, diagnosticDone = false } = opts;
  await page.goto('/');
  await page.evaluate(
    async ({ interactions, topicIds, diagnosticDone, guestAuth }) => {
      const keys = [
        'tntet_auth_current_user',
        'tntet_topic_masteries',
        'tntet_interactions',
        'tntet_diagnostic_done',
        'tntet_mistakes',
        'tntet_paper',
        'tntet_lang',
        'tntet_category',
      ];
      keys.forEach((k) => localStorage.removeItem(k));

      localStorage.setItem('tntet_auth_current_user', JSON.stringify(guestAuth));
      localStorage.setItem('tntet_interactions', JSON.stringify(interactions));

      const { EMPTY_TOPIC_MASTERIES } = (await import('/src/data/tntetData.ts')) as {
        EMPTY_TOPIC_MASTERIES: {
          topicId: string;
          masteryPercent: number;
          status: string;
          totalAttempted: number;
          correctCount: number;
          avgTimePerQuestionSec: number;
          lastPracticedAt: number;
        }[];
      };

      const seeds = EMPTY_TOPIC_MASTERIES.map((t) => {
        const seed = topicIds[t.topicId];
        if (!seed) return t;
        return {
          ...t,
          masteryPercent: seed.masteryPercent,
          status: seed.masteryPercent >= 70 ? 'exam_ready' : seed.masteryPercent >= 40 ? 'developing' : 'weak',
          totalAttempted: seed.totalAttempted,
          correctCount: seed.correctCount,
          avgTimePerQuestionSec: 40 + seed.masteryPercent,
          lastPracticedAt: Date.now() - 86400000,
        };
      });
      localStorage.setItem('tntet_topic_masteries', JSON.stringify(seeds));
      localStorage.setItem('tntet_diagnostic_done', diagnosticDone ? '1' : '0');
      localStorage.setItem('tntet_paper', 'PAPER_I');
      localStorage.setItem('tntet_lang', 'english');
      localStorage.setItem('tntet_category', 'OC_GENERAL');
    },
    { interactions, topicIds, diagnosticDone, guestAuth: GUEST_AUTH }
  );

  await page.reload();
}

async function expandDashboard(page: import('@playwright/test').Page) {
  await page.getByRole('button', { name: /Expand All/ }).click();
}

test('brand-new user (stale diagnostic flag, zero data) still lands on onboarding dashboard', async ({ page }) => {
  await seedUser(page, { interactions: [], diagnosticDone: true });

  await expect(page.locator('#btn-onboarding-diagnostic')).toBeVisible({ timeout: 15000 });

  await expect(page.getByText('Cognitive Exam Traps')).toHaveCount(0);
  await expect(page.getByText('Est. Marks:')).toHaveCount(0);
  await expect(page.getByText('Your real progress trajectory appears here')).toHaveCount(0);
  await expect(page.getByText(/Scores based on your real results/)).toHaveCount(0);
});

test('diagnostic-only user sees real numbers, untouched subjects and honest empty trajectory', async ({ page }) => {
  const now = Date.now();
  const interactions = [
    { id: 'i1', questionId: 'q_seed_1', selectedOptionIndex: 2, isCorrect: false, timeSpentSec: 45, confidence: 'low', detectedErrorType: 'knowledge_gap', timestamp: now - 3600e3, testContext: 'diagnostic' },
    { id: 'i2', questionId: 'q_seed_2', selectedOptionIndex: 1, isCorrect: true, timeSpentSec: 30, confidence: 'medium', timestamp: now - 3500e3, testContext: 'diagnostic' },
    { id: 'i3', questionId: 'q_seed_3', selectedOptionIndex: 0, isCorrect: false, timeSpentSec: 40, confidence: 'low', detectedErrorType: 'knowledge_gap', timestamp: now - 3400e3, testContext: 'diagnostic' },
    { id: 'i4', questionId: 'q_seed_4', selectedOptionIndex: 3, isCorrect: true, timeSpentSec: 25, confidence: 'high', timestamp: now - 3300e3, testContext: 'diagnostic' },
  ];

  await seedUser(page, {
    interactions,
    topicIds: {
      cdp_piaget_vygotsky: { masteryPercent: 45, totalAttempted: 3, correctCount: 1 },
      maths_fractions_decimals: { masteryPercent: 20, totalAttempted: 1, correctCount: 0 },
    },
    diagnosticDone: true,
  });

  await expandDashboard(page);

  await expect(page.getByText('Cognitive Exam Traps')).toBeVisible({ timeout: 15000 });
  await expect(page.getByText(/Scores based on your real results across 4 questions in 2 topics/)).toBeVisible();

  await expect(page.getByText('Untouched', { exact: true }).first()).toBeVisible();

  await expect(page.getByText('Your real progress trajectory appears here')).toBeVisible();
  await expect(page.getByText(/at least 2 different days/)).toBeVisible();

  await expect(page.getByText('Knowledge Gap', { exact: true })).toBeVisible();
  await expect(page.getByText('2×', { exact: true })).toBeVisible();
  await expect(page.getByText(/Time Allocation Pitfall/)).toHaveCount(0);
});

test('two practice days render a real daily-accuracy trajectory chart', async ({ page }) => {
  const day1 = Date.now() - 86400000;
  const day2 = Date.now();
  const interactions = [
    { id: 'i1', questionId: 'q_seed_1', selectedOptionIndex: 1, isCorrect: true, timeSpentSec: 30, confidence: 'medium', timestamp: day1 + 1000, testContext: 'daily_practice' },
    { id: 'i2', questionId: 'q_seed_2', selectedOptionIndex: 0, isCorrect: false, timeSpentSec: 35, confidence: 'low', timestamp: day1 + 2000, testContext: 'daily_practice' },
    { id: 'i3', questionId: 'q_seed_3', selectedOptionIndex: 2, isCorrect: true, timeSpentSec: 28, confidence: 'high', timestamp: day2 + 1000, testContext: 'daily_practice' },
    { id: 'i4', questionId: 'q_seed_4', selectedOptionIndex: 3, isCorrect: true, timeSpentSec: 22, confidence: 'high', timestamp: day2 + 2000, testContext: 'daily_practice' },
  ];

  await seedUser(page, {
    interactions,
    topicIds: {
      cdp_piaget_vygotsky: { masteryPercent: 45, totalAttempted: 2, correctCount: 1 },
      maths_fractions_decimals: { masteryPercent: 20, totalAttempted: 1, correctCount: 0 },
    },
    diagnosticDone: true,
  });

  await expandDashboard(page);

  await expect(page.getByText('Cognitive Exam Traps')).toBeVisible({ timeout: 15000 });
  await expect(page.getByText('Your real progress trajectory appears here')).toHaveCount(0);
  await expect(page.locator('.recharts-wrapper svg').first()).toBeVisible();
});