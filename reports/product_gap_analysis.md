# TNTET Personal Coach: Product Value & Gap Analysis
> **Goal**: Transform `shafi_et` into an indispensable, high-impact, real problem-solving product for Tamil Nadu Teacher Eligibility Test (TNTET Paper I & Paper II) aspirants.

---

## Profile of a TNTET Aspirant in Tamil Nadu
To build a truly helpful product, we must design for the real candidate:
- **Who they are**: B.Ed / D.El.Ed graduates, working private school teachers, homemakers, or rural candidates balancing work, family, and preparation.
- **Their primary medium**: Tamil (80%+ candidates prepare in Tamil or Bilingual mode).
- **Their biggest struggles**:
  1. **CDP (Child Development & Pedagogy)**: Tricky psychological scenarios (Piaget, Kohlberg, Vygotsky) with confusing distractor options.
  2. **Tamil Grammar**: High weightage (15+ marks) on complex grammar rules (punitrai vidigal, analigal, yaappilakanam).
  3. **SCERT Textbook Scope**: TNTET strictly questions content from Std 6-10 Tamil Nadu State Board (Samacheer Kalvi) textbooks.
  4. **Time Management & Panic**: Completing 150 questions in 180 minutes without bubbling/selecting wrong distractors.
  5. **Study Consistency**: Limited study window (30 to 45 minutes per day).

---

## 1. WHAT IS EXTRA (Clutter / Bloat to Remove)

These features add unnecessary complexity without helping the candidate clear the exam:

| Extra Feature | Why it is Extra / Distracting | Action Needed |
| :--- | :--- | :--- |
| **Enterprise Cloud Integrations (`IntegrationsModal.tsx`)** | Aspirants do not need Google Workspace, Google Drive automated sync, or Google Calendar API connections to study for TNTET. It confuses non-tech-savvy rural users. | **REMOVE** or hide completely under an advanced sub-menu. |
| **Admin Dashboard in Candidate UI (`AdminDashboardView.tsx`)** | Exposing raw candidate analytics, JSON question editors, and telemetry to candidates creates navigation noise. | **REMOVE** from candidate navbar. Keep strictly on a separate protected `/admin` route. |
| **Static Non-SCERT Flashcards (`FlashcardsDeckView.tsx`)** | Generic flashcards without direct Std 6-10 textbook chapter linkages are rarely remembered by candidates. | **REPLACE** with SCERT Textbook Chapter Line-by-Line Cards. |
| **Generic Persona Flags** | Persona flags (`working_candidate`, `repeat_aspirant`) currently only alter minor text labels rather than changing test question difficulty or scheduling. | **SIMPLIFY** to Paper selection (Paper I vs Paper II Math/Sci vs Paper II Soc Sci) and Category. |
| **Firebase Applet Config in Source** | API keys and OAuth client IDs committed to repository are a security risk. | **REMOVE** and use environment variables. |
| **Fabricated Testimonials on Landing Page** | Hardcoded review data with generic names and Unsplash photos are not credible. | **REMOVE** or replace with real beta tester feedback once available. |
| **Mobile Export Modal (Capacitor APK)** | Premature mobile export workflow before core features are complete and tested. | **HIDE** until mobile build pipeline is production-ready. |

---

## 2. WHAT NEED TO BE REMOVED (Immediate Cleanup)

1. **Remove Google Workspace / Calendar / Drive Sync Modal**: Replace with simple local offline download / PDF export.
2. **Remove Admin Tab from Candidate Navigation**: Clean up top navbar (`Navbar.tsx`) so candidate focuses only on preparation.
3. **Remove Mock AI Responses that lack SCERT references**: Upgrade fallback responses to quote actual Tamil Nadu SCERT textbook std/chapter rules.
4. **Remove Firebase Config from Source Control**: Move `firebase-applet-config.json` values to `.env` files.
5. **Remove Hardcoded Cohort Data**: Replace `INITIAL_COHORT_DATA` in `adminService.ts` with real Supabase queries.

---

## 3. WHAT IS MISSING (Critical Gaps in Current Product)

To become the #1 TNTET prep app in Tamil Nadu, the following critical features are missing:

| Missing Essential Feature | Why Aspirants Desperately Need It |
| :--- | :--- |
| **1. Full 150-Question Exam Simulator** | Currently hardcoded to 30-question demo. Candidates need the full 180-minute TRB simulation to build stamina. |
| **2. SCERT Std 6-10 Textbook Chapter Wise Selector** | Candidates study by classes (6-aam vaguppu ariviyal, 8-aam vaguppu tamil). They need to test specific textbook chapters line-by-line. |
| **3. Tamil Grammar Specialist Module** | 15-20 marks in Tamil Paper depend on grammar (punitrai, ilakkanak kurippu, pagupada uruppilakkanam). A dedicated drill section is essential. |
| **4. Audio / Voice Explanations in Tamil** | Homemakers and commuting teachers cannot look at screens for hours. Audio summaries of key CDP & Tamil concepts double their study time. |
| **5. Subject-wise Mark Budgeting Calculator** | Show candidates exactly how to reach their target score (e.g. for BC candidate needing 82 marks: 22 in CDP + 25 in Tamil + 20 in Eng + 15 in Math = 82). |
| **6. Official TRB 2026 Notification Syllabus Progress Heatmap** | Visual checklist showing what percentage of official TRB syllabus units are marked "Exam Ready". |
| **7. Proper Authentication System** | Current auth is localStorage-only with no password hashing. Need Supabase Auth or Firebase Auth. |
| **8. Spaced Repetition System (SRS)** | Current mistake queue has no intelligent scheduling. Need SRS with expanding intervals. |
| **9. React Error Boundaries** | App crashes are unrecoverable. Need ErrorBoundary components. |
| **10. Automated Test Suite** | Zero automated tests. Need Vitest for core algorithms. |

---

## 4. WHAT NEED TO BE ADDED (High Impact Feature Enhancements)

### Phase 1: Critical Fixes (Week 1-2)
1. **Fix 150Q Simulator**: Change `ExamSimulatorView.tsx:48` from `Array.from({ length: 30 })` to full question set with 180-minute timer.
2. **Expand Question Bank**: Add 500+ questions to `tntetData.ts` covering all SCERT Std 6-10 chapters.
3. **Fix Auth Security**: Remove auto-provisioning, implement proper password hashing or Supabase Auth.
4. **Fix RLS Policies**: Update `supabase_schema.sql` from `USING (true)` to `auth.uid() = user_id`.
5. **Remove Exposed Secrets**: Move Firebase config and API keys to environment variables.

### Phase 2: Core Features (Week 3-4)
6. **SCERT Chapter Selector**: Add class/chapter metadata to questions, build filter UI in PracticeView.
7. **Tamil Grammar Module**: Dedicated grammar drill section with 100+ grammar-specific questions.
8. **Mark Budget Calculator**: Interactive calculator showing subject-wise targets for OC (90M) vs BC/MBC/SC/ST (82M).
9. **Text-to-Speech**: Add `window.speechSynthesis` with Tamil `ta-IN` voice in AITutorModal.
10. **Streak Tracker**: Implement daily streak logic based on `lastLoginAt` comparisons.

### Phase 3: Growth & Retention (Week 5-8)
11. **Spaced Repetition**: Implement proper SRS algorithm for mistake queue.
12. **PWA Push Notifications**: Browser push notifications for daily study reminders.
13. **Leaderboard**: Anonymous cohort ranking from Supabase simulation_history.
14. **Error Boundaries**: Add React ErrorBoundary wrapper.
15. **Vitest Tests**: Unit tests for recommendationEngine, dbSyncService, authService.

---

## 5. File-by-File Action Items

| File | Priority | Action |
| :--- | :--- | :--- |
| `ExamSimulatorView.tsx` | CRITICAL | Fix 30Q to 150Q, add timer confirmation, fix answer change counts |
| `supabase_schema.sql` | CRITICAL | Fix RLS policies to use auth.uid() |
| `firebase-applet-config.json` | CRITICAL | Remove from source, move to env vars |
| `authService.ts` | HIGH | Remove auto-provisioning, add password hashing |
| `package.json` | HIGH | Fix name to "tntet-personal-coach", fix dependency placement |
| `server.ts` | HIGH | Extract model to env, add rate limiting, fix AI cache to LRU |
| `tntetData.ts` | HIGH | Expand from ~20 to 500+ questions |
| `flashcardsData.ts` | MEDIUM | Expand from ~10 to 100+ flashcards |
| `App.tsx` | MEDIUM | Refactor to Zustand state management |
| `Navbar.tsx` | MEDIUM | Remove admin tab from candidate nav |
| `AITutorModal.tsx` | MEDIUM | Add conversation persistence, TTS button |
| `DashboardView.tsx` | LOW | Add lazy loading for sub-components |
| `LandingPage.tsx` | LOW | Remove fabricated testimonials or mark as "beta feedback" |

---

## Summary Comparison

| Metric | Current App | Proposed Upgraded App |
| :--- | :--- | :--- |
| **Target Alignment** | Generic Exam Prep | 100% TNTET SCERT Std 6-10 Aligned |
| **Question Bank** | ~20 questions | 500+ questions across all chapters |
| **Exam Simulator** | 30-question demo | Full 150-question TRB simulation |
| **Tamil Language Depth** | Bilingual Text | Bilingual Text + Tamil Audio Explanations + Tamil Grammar Engine |
| **UI Complexity** | Overloaded (Admin + Cloud Sync) | Streamlined, Candidate-Centric, Low-Distraction |
| **Authentication** | localStorage-only fake auth | Supabase Auth with email verification |
| **Security** | Open RLS, exposed API keys | Proper RLS, env-based secrets |
| **Retention Tool** | Basic Local Storage | Spaced Revision Queue + Daily SCERT Micro-Goals + Push Notifications |
| **Testing** | Zero automated tests | Vitest + Playwright coverage |

---

*Report generated on 2026-08-26 for TNTET Personal Coach (`shafi_et`)*
