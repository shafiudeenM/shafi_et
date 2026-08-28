# Deep Analysis Report: TNTET Personal Coach

## Executive Summary

**TNTET Personal Coach** (`shafi_et`) is an offline-first, AI-augmented, multi-platform exam preparation and diagnostic system tailored specifically for candidates taking the **Tamil Nadu Teacher Eligibility Test (TNTET Paper I & Paper II)** conducted by the Teachers Recruitment Board (TRB), Tamil Nadu.

The application combines state-of-the-art web technology (**React 19, TypeScript 5.8, Vite 6, TailwindCSS 4**) with server-side AI reasoning powered by **Google Gemini 3.7 Flash**, local storage persistence, **Supabase PostgreSQL synchronization**, and native mobile capabilities via **Capacitor 8**.

| Metric / Dimension | Status / Details |
| :--- | :--- |
| **Project Type** | Offline-first, AI-augmented Web PWA + Capacitor Mobile App |
| **Target Exam** | Tamil Nadu TRB TNTET Paper I & Paper II (CDP, Tamil, English, Math, Sci, Social Sci) |
| **Dependencies** | Declared in `package.json`, locked in `bun.lock` (run `bun install` / `npm install` prior to build) |
| **Primary Stack** | React 19, TypeScript 5.8, Vite 6, TailwindCSS 4, Express, Capacitor 8 |
| **AI Integration** | Google Gemini 3.7 Flash API via `server.ts` with 24-hr response caching |
| **Database & Sync** | Supabase PostgreSQL + LocalStorage primary with 4-second debounced sync |

---

## System Architecture & Architecture Diagram

```mermaid
flowchart TD
    subgraph Client Layer [Web PWA & Capacitor Mobile App]
        UI[React 19 Frontend SPA]
        LocalStore[(LocalStorage / State)]
        PWA[Service Worker / Cache]
        Capacitor[Capacitor 8 Plugins - Haptics, StatusBar, App]
    end

    subgraph Service Layer
        RecEngine[Recommendation Engine]
        SyncService[DB Sync Service - 4s Debounced]
        TutorClient[AI Tutor API Client]
        AuthService[Auth & Persona Service]
    end

    subgraph Backend Layer [Node.js / Express Server]
        Express[Express API Server :3000]
        AICache[24-Hour In-Memory AI Cache - Max 5k]
        Gemini[Google Gemini 3.7 Flash API]
    end

    subgraph Database Layer [Supabase Cloud]
        PostgreSQL[(Supabase PostgreSQL Database)]
    end

    UI --> LocalStore
    UI --> RecEngine
    UI --> SyncService
    UI --> TutorClient
    UI --> Capacitor
    PWA --> UI

    TutorClient --> Express
    Express --> AICache
    AICache -->|Cache Miss| Gemini

    SyncService -->|Debounced Upsert| PostgreSQL
```

---

## Technology Stack Breakdown

| Layer | Technology | Key Features & Version |
| :--- | :--- | :--- |
| **Frontend Framework** | React 19 + TypeScript 5.8 | High-performance functional components, full type safety |
| **Build System** | Vite 6 + `@tailwindcss/vite` 4 | Instant HMR, bundled SSR fallback, CSS optimization |
| **Backend Runtime** | Node.js + Express 4 + `tsx` | Lightweight REST API + Vite SPA middleware server (`server.ts`) |
| **AI Integration** | `@google/genai` (Gemini 3.7 Flash) | Server-side API key handling, 24-hr query cache, structured JSON mode |
| **Database & Cloud Sync**| Supabase JS SDK + PostgreSQL | Remote persistence, RLS policies, debounced bulk sync (`dbSyncService.ts`) |
| **Mobile Integration** | Capacitor 8 (Android & iOS) | Native Haptics, Status Bar, Splash Screen, Hardware Back Button handling |
| **PWA & Offline** | Web Service Worker (`pwaService.ts`) | Install prompt interception, network state monitoring, local-first storage |
| **PDF & Reports** | `jspdf` + `jspdf-autotable` | Client-side score report generation, OMR printable sheet export |
| **Visualization** | Recharts 3 + Motion | Interactive mastery charts, dynamic progress dashboards |

---

## Core Functional Modules & Feature Analysis

### 1. TRB 150-Question Exam Simulator
- **Standard Alignment**: Exact mirror of TRB TNTET official exam rules (150 questions, 180-minute timer, no negative marking).
- **Cutoff Qualification Rules**:
  - **OC / General**: 90 / 150 marks (60%)
  - **BC / MBC / SC / ST**: 82 / 150 marks (55%)
- **Answer-Change Analytics**: Tracks candidate behavior during tests (recording transitions from Wrong to Right, Right to Wrong, and Wrong to Wrong) to measure candidate doubt and over-thinking.
- **Current Issue**: Only runs 30-question demo mode instead of full 150-question simulation. `ExamSimulatorView.tsx:48` hardcodes `Array.from({ length: 30 })` instead of using full question bank.

### 2. Four-Dimensional Candidate Readiness Algorithm
Implemented in `recommendationEngine.ts`:
- **Readiness Score** = 0.35 x Knowledge + 0.30 x Accuracy + 0.20 x Speed + 0.15 x Consistency
- **Knowledge Score**: Mean mastery percentage across all SCERT subjects.
- **Accuracy Score**: Calculated over recent 30 question interactions.
- **Speed Score**: Evaluates optimal answer time (ideal range: 30-55s per question).
- **Consistency Score**: Evaluates stability across practice sessions.

### 3. Adaptive 35-40 Minute Daily Plan Generator
- Auto-selects the candidate's lowest-scoring subject/topic.
- Scales 4 distinct study blocks dynamically according to candidate availability:
  1. **Learn Block**: Core SCERT definitions, formulas, and TRB trap warnings.
  2. **Practice Block**: Targeted 15-question set.
  3. **Review Block**: Revision of up to 3 active items from the mistake queue.
  4. **Quick Check Block**: 5-question speed test (80% pass threshold).

### 4. 5-Tier Mistake Categorization & Spaced Revision Queue
Automatically tags candidate errors based on response time, confidence level, and distractor option profiles:
1. `knowledge_gap`: Low confidence + slow response (>65s).
2. `concept_confusion`: Moderate time + low confidence.
3. `misread_question`: Fast response (<15s) with high confidence.
4. `careless_error`: Fast response (<15s) with low confidence.
5. `time_pressure`: Over-thinking and delayed choices (>65s).

### 5. Server-Side AI Tutor Engine (Gemini 3.7 Flash)
- Implemented via endpoints in `server.ts`:
  - `/api/tutor/explain`: Generates structured JSON containing `conceptExplanation`, `distractorAnalysis`, `trbKeyRule`, and `threeCheckQuestions`.
  - `/api/tutor/chat`: Interactive Tamil-first / English syllabus assistant.
  - `/api/diagnose/prescribe`: 2-sentence diagnostic prescription.
- **Response Caching**: In-memory `Map` cache (24-hour TTL, max 5,000 items) to guarantee zero latency and zero repeated API cost for common queries.
- **Resilient Fallback**: If `GEMINI_API_KEY` is absent or the API fails, the backend seamlessly responds with pre-compiled pedagogical rules without throwing errors to the user.

---

## Database Schema & Data Integrity Analysis

Defined in `supabase_schema.sql`:

```sql
user_profiles        (id, name, selected_paper, language_mode, category, daily_study_minutes, ...)
topic_masteries      (id, user_id, topic_id, subject_id, mastery_score, questions_attempted, ...)
mistake_queue        (id, user_id, question_id, subject_id, mistake_tag, review_count, is_resolved, ...)
simulation_history   (id, user_id, score, total_questions, time_spent_seconds, is_qualified, answer_changes, ...)
```

### Sync Strategy (`dbSyncService.ts`):
- **Local-First**: App operates 100% offline using `LocalStorage`.
- **4-Second Debounce Buffer**: Coalesces frequent updates (`debouncedSyncTopicMasteries`, `debouncedSyncMistakeQueue`) to prevent database thrashing during rapid quiz sessions.

---

## Key Strengths & Architectural Highlights

1. **Bilingual Excellence**: Authentic Tamil educational terminology aligned with official SCERT Tamil Nadu textbooks paired alongside English.
2. **Robust Offline Capability**: Complete operationality without internet connectivity.
3. **Optimized AI Infrastructure**: Server-side caching prevents duplicate API calls, reducing cost to $0 for repeated queries.
4. **Comprehensive Mobile Support**: Capacitor 8 native configuration ensures ready-to-deploy Android/iOS builds with native status bar, splash screen, and haptics support.
5. **Google Workspace Integration**: Full OAuth2 flow for Google Calendar study scheduling and Google Sheets progress sync.
6. **OMR Sheet Generator**: Printable 150-question TRB-style OMR answer sheet with optional test booklet export.
7. **Admin Dashboard**: Real-time cohort analytics, hardest distractor identification, system telemetry, and live announcement banner management.

---

## Identified Vulnerabilities, Risks & Recommendations

| Category | Risk / Issue | Mitigation / Actionable Recommendation |
| :--- | :--- | :--- |
| **Dependencies** | Local `node_modules` directory is not yet populated. | Run `bun install` (or `npm install`) to resolve all lockfile dependencies (`bun.lock`). |
| **Security & RLS** | Supabase policies currently use `ALLOW PUBLIC READ/WRITE` (`USING (true)`). | Update RLS policies in `supabase_schema.sql` to enforce `auth.uid() = user_id` once Supabase Auth is fully configured. |
| **User Identity** | Anonymous candidates rely on `localStorage.getItem('tntet_user_id')`. Clearing browser cache creates a new ID. | Encourage candidates to link email/Google OAuth using `authService.ts` to bind historical cloud data permanently. |
| **AI Model String** | Hardcoded model `gemini-3.7-flash` in `server.ts`. | Extract model string to `process.env.GEMINI_MODEL || 'gemini-3.7-flash'` for flexibility. |
| **Testing Coverage** | Absence of automated unit/integration test suites (e.g., Vitest/Playwright). | Add Vitest testing suite for core algorithms (`recommendationEngine.ts` and `dbSyncService.ts`). |
| **Firebase Config Exposure** | `firebase-applet-config.json` contains API keys and OAuth client IDs committed to source. | Move Firebase config to environment variables or a protected config service. |
| **Auth Security** | `authService.ts` stores passwords in localStorage with no hashing, auto-provisions accounts on login attempt without password validation. | Implement proper password hashing or use Supabase Auth / Firebase Auth for real authentication. |
| **AI Cache Memory Leak** | In-memory cache in `server.ts` grows unbounded until 5000 entries, then only evicts oldest by insertion order, not by access frequency. | Implement LRU eviction strategy instead of FIFO insertion-order eviction. |
| **Gemini API Key Fallback** | When `GEMINI_API_KEY` is not set, the code uses `'dummy-key'` which will fail silently. | Validate API key presence at startup and log a clear warning. Consider graceful degradation messaging. |
| **Package Name** | `package.json` has `"name": "react-example"` - a placeholder. | Rename to `"tntet-personal-coach"` for clarity. |

---

## What to ADD (High-Impact Features)

### Priority 1: Core Value Enhancement

| Feature | Rationale | Implementation Complexity |
| :--- | :--- | :--- |
| **Full 150-Question Exam Simulator** | Currently hardcoded to 30-question demo. Candidates need the full 180-minute simulation experience. | Medium - Extend `ExamSimulatorView.tsx` to load full `ALL_QUESTIONS` filtered by paper type with proper section timing. |
| **SCERT Std 6-10 Chapter-wise Question Selector** | Candidates study by specific textbook chapters. Add class/chapter filtering in PracticeView and PYQVaultView. | Medium - Add chapter metadata to `Question` type, build filter UI in `PracticeView.tsx`. |
| **Tamil Grammar (Tamil Ilakkanam) Specialist Module** | 15-20 marks depend on Tamil grammar rules. A dedicated grammar drill section is essential. | Low - Add Tamil grammar-specific flashcards, practice sets, and mnemonics. |
| **Subject-wise Mark Budget Calculator** | Show candidates exactly how to reach their target score (e.g., 22 in CDP + 25 in Tamil = 82 for BC). | Low - Add calculator component using existing `readiness.subjectScores` data. |
| **Streak & Study Consistency Tracker** | Track daily study streaks, display in dashboard, reward consistency. Currently `streakDays` is always 0. | Low - Implement streak logic in `authService.ts` based on `lastLoginAt` comparisons. |
| **Official TRB Syllabus Progress Heatmap** | Visual checklist showing what percentage of official TRB syllabus units are marked "Exam Ready". | Medium - Build heatmap component using `SUBJECT_METADATA` and `INITIAL_TOPIC_MASTERIES`. |
| **Text-to-Speech (Tamil Audio Explanations)** | Add `window.speechSynthesis` with Tamil `ta-IN` voice in `AITutorModal.tsx` for hands-free learning. | Low - Add `speechSynthesis.speak()` call on explanation text. |

### Priority 2: Retention & Engagement

| Feature | Rationale | Implementation Complexity |
| :--- | :--- | :--- |
| **Spaced Repetition System (SRS)** | Upgrade mistake queue from simple retest to proper SRS with exponential interval scheduling. | Medium - Implement interval calculation in `recommendationEngine.ts` using `scheduledForSpacedRevision`. |
| **Daily Push Notifications (PWA)** | Browser push notifications for daily study reminders. Currently only passive display. | Low - Use `Notification API` + Service Worker push registration. |
| **Leaderboard / Community Ranking** | Show anonymous cohort ranking to build competitive motivation among candidates. | Low - Query `simulation_history` from Supabase, rank by `score`. |
| **WhatsApp/SMS Integration** | Daily 3-question PDF / WhatsApp alerts for rural candidates who rely on WhatsApp over email. | High - Integrate Twilio API or WhatsApp Business API. |
| **Dark/Light Theme Per-Section** | The theme toggle exists but CSS variables for light mode are incomplete across all components. | Low - Complete light mode CSS variables in `index.css`. |

### Priority 3: Technical Improvements

| Feature | Rationale | Implementation Complexity |
| :--- | :--- | :--- |
| **Vitest Test Suite** | No automated tests exist. Add unit tests for `recommendationEngine.ts`, `dbSyncService.ts`, `authService.ts`. | Medium |
| **Proper Supabase Auth** | Replace localStorage-based auth with Supabase Auth for real user identity management. | High |
| **Rate Limiting on AI Endpoints** | No rate limiting on `/api/tutor/*` endpoints. Implement per-user daily limits. | Low - Use in-memory counter with `aiTutorSettings.rateLimitPerUserDay`. |
| **Error Boundary Components** | No React Error Boundaries exist. App crashes are unrecoverable. | Low - Add `ErrorBoundary.tsx` wrapper in `App.tsx`. |
| **Loading Skeleton States** | All data-fetching views show no skeleton loading states, causing layout shift. | Medium |
| **SEO Meta Tags** | Missing Open Graph images, structured data markup for Google search visibility. | Low |
| **Analytics Integration** | No user behavior analytics (e.g., Google Analytics, Mixpanel) to track feature usage and drop-offs. | Medium |

---

## What to REMOVE (Cleanup & Simplification)

| Item | File | Reason for Removal |
| :--- | :--- | :--- |
| **Google Workspace Modal from Candidate UI** | `IntegrationsModal.tsx`, `Navbar.tsx` | Aspirants do not need Google Calendar/Sheets sync. It confuses non-tech-savvy rural users. Move to advanced admin-only section. |
| **Admin Console from Candidate Navbar** | `Navbar.tsx:107` | Exposing `admin` tab in candidate navigation is unnecessary noise. Remove from `navItems` array. |
| **Firebase Applet Config from Source** | `firebase-applet-config.json` | Contains hardcoded API keys (`AIzaSyArST_gxkJQtpi-kCRTyajrJE3L-m0bFrA`). Remove from repo, use env vars. |
| **Mock Seed Users with Hardcoded Data** | `authService.ts:22-51` | Seed users (Kavitha, Anand) with hardcoded Unsplash avatar URLs are unrealistic. Replace with empty registry. |
| **Auto-Provisioning on Login** | `authService.ts:159-177` | Automatically creating accounts on login attempt without password check is a security anti-pattern. |
| **Hardcoded Cohort Data in Admin** | `adminService.ts:40-132` | Static mock cohort data (`INITIAL_COHORT_DATA`) should be fetched from Supabase in production. |
| **System Telemetry Hardcoded Values** | `adminService.ts:288-298` | `activeUsersNow: 247`, `p95LatencyMs: 8.4`, `cacheHitRatio: 99.4` are fake metrics. Calculate or remove. |
| **Placeholder Package Name** | `package.json:2` | `"name": "react-example"` should be changed to `"tntet-personal-coach"`. |
| **Unused Persona Type** | `types.ts:5` | `CandidatePersona` type is defined but never meaningfully used to alter behavior. Remove or implement. |

---

## What to FIX (Bugs & Issues)

| Issue | File:Line | Description | Fix |
| :--- | :--- | :--- | :--- |
| **Simulator runs only 30 questions** | `ExamSimulatorView.tsx:48` | `Array.from({ length: 30 })` should be 150 for full simulation. | Change to `ALL_QUESTIONS.filter(q => q.paper === selectedPaper).slice(0, 150)` and adjust timer to 180 minutes. |
| **Timer auto-submits without confirmation** | `ExamSimulatorView.tsx:72` | Timer reaches 0 and auto-submits with no `window.confirm()` dialog. | Add confirmation prompt before submission. |
| **`confirm()` never used for submit** | `ExamSimulatorView.tsx:114` | `handleSubmitExam` fires immediately. Exam submission should always ask "Are you sure?". | Add `window.confirm()` guard. |
| **Social Science subject has 60 marks but no 30-mark questions** | `types.ts:28` | `social_science` has `totalOfficialMarks: 60` but should be split into subjects or treated as combined. | Clarify in scoring logic. |
| **Answer change count hardcoded initial values** | `ExamSimulatorView.tsx:61` | `rightToWrong: 1, wrongToRight: 3` are hardcoded initial values that inflate results. | Initialize both to `0`. |
| **`mobile-web-app-capable` meta tag wrong value** | `index.html:13` | Should be `content="yes"` (already correct, but `mobile-web-app-capable` is deprecated). | Use `apple-mobile-web-app-capable` instead (already present). |
| **Service Worker precache list incomplete** | `sw.js:5-12` | Only caches static assets, not JS/CSS bundles. PWA installability may fail on Lighthouse. | Add Vite build output files to `STATIC_ASSETS` or use `vite-plugin-pwa`. |
| **`vite` listed in both `dependencies` and `devDependencies`** | `package.json:42,53` | `vite` appears in both sections. | Remove from `dependencies`, keep only in `devDependencies`. |
| **`dotenv` as production dependency** | `package.json:32` | `dotenv` is only needed in development. | Move to `devDependencies`. |
| **Memory leak: `masteryTimer` never cleared on unmount** | `dbSyncService.ts:80-81` | Debounce timers are never cleared when the service is destroyed. | Add cleanup method. |
| **`aiResponseCache` FIFO eviction, not LRU** | `server.ts:50-53` | Cache evicts oldest entry by insertion order, not by access frequency. Frequently accessed old entries are evicted while new unused entries remain. | Implement LRU with access-time tracking. |
| **Missing error handling in `handleSubmitExam`** | `ExamSimulatorView.tsx:114-125` | No try-catch around confetti or completion callback. | Wrap in try-catch with fallback. |
| **`generateDailyPlan` ignores actual mistake queue** | `recommendationEngine.ts:235-270` | The `mistakesOrQuestions` parameter is used to extract IDs but only sliced to 3. The plan does not intelligently select which mistakes to review. | Implement smart mistake selection based on recency, error type, and retest count. |
| **Bookmark creates fake `MistakeQueueItem`** | `App.tsx:380-405` | Bookmarked questions are added as mistake queue items with `isCorrect: false` and `detectedErrorType: 'knowledge_gap'`, which pollutes mistake analytics. | Create a separate bookmarks collection or mark as `isBookmarked`. |
| **Announcement banner reads from localStorage inline** | `App.tsx:505-527` | `JSON.parse(localStorage.getItem('tntet_admin_app_config'))` is called on every render, causing performance issues. | Cache in state or use `useMemo`. |

---

## What to CHANGE (Improvements & Refactoring)

| Area | Current State | Recommended Change |
| :--- | :--- | :--- |
| **Package Name** | `"name": "react-example"` | Change to `"tntet-personal-coach"` |
| **Auth Flow** | localStorage-only with no password hashing | Migrate to Supabase Auth with email verification |
| **AI Model Config** | Hardcoded `gemini-3.7-flash` in `server.ts:120,184` | Extract to `process.env.GEMINI_MODEL` |
| **Error Boundary** | None exists | Add `React.ErrorBoundary` wrapper around main App |
| **Data Fetching Pattern** | Multiple `useEffect` hooks for localStorage persistence | Consolidate into a custom `useLocalStorage` hook or use a state management library (Zustand/Jotai) |
| **Question Count** | Only ~20 questions in `ALL_QUESTIONS` | Expand to 500+ questions covering all SCERT Std 6-10 chapters |
| **Theme System** | Partially implemented light mode | Complete light mode CSS variables for all components |
| **Responsive Design** | Good but some components break at 320px | Audit all components for Samsung Galaxy A series screens |
| **Accessibility** | No ARIA labels, no keyboard navigation in quiz | Add `aria-label`, `role`, keyboard shortcuts for exam simulator |
| **Error Messages** | Generic English fallback messages | Add Tamil-first error messages for all error states |
| **`server.ts` Port** | Hardcoded `3000` | Use `process.env.PORT || 3000` |
| **Build Script** | `esbuild server.ts --bundle` for production | Consider using `tsx` for consistent dev/prod behavior |

---

## File-by-File Critical Review

| File | Lines | Key Issues |
| :--- | :--- | :--- |
| `App.tsx` | 692 | Massive component with 30+ useState hooks. Needs state management refactor (Zustand recommended). |
| `server.ts` | 256 | AI cache uses FIFO instead of LRU. No rate limiting. No request validation middleware. |
| `authService.ts` | 266 | No password hashing. Auto-provisions users on login. Seed data with Unsplash URLs. |
| `dbSyncService.ts` | 258 | Debounce timers are class-level but never cleaned up. No retry logic for failed syncs. |
| `recommendationEngine.ts` | 329 | Daily plan generator is deterministic but not adaptive to candidate progress over time. |
| `ExamSimulatorView.tsx` | 491 | Hardcoded 30 questions. Timer auto-submits without confirmation. Answer change counts start non-zero. |
| `LandingPage.tsx` | 878 | Very long but well-structured. Testimonials are fabricated (no real user data). |
| `DashboardView.tsx` | 670 | Well-designed but could benefit from lazy loading of sub-components. |
| `AITutorModal.tsx` | 249 | No conversation history persistence. Chat resets on every open. |
| `supabase_schema.sql` | 85 | RLS policies are completely open (`USING (true)`). Major security concern. |
| `firebase-applet-config.json` | 11 | Contains production API keys in source code. Critical security issue. |
| `sw.js` | 157 | Good offline support but missing cache versioning strategy for updates. |
| `tntetData.ts` | 781 | Only ~20 questions. Needs 500+ questions for a meaningful practice experience. |
| `flashcardsData.ts` | 248 | Only ~10 flashcards. Needs 100+ cards for each subject. |
| `pyqData.ts` | 430 | Good PYQ metadata but questions reference `ALL_QUESTIONS` which is too small. |

---

## Mermaid Summary: Product Enhancement Roadmap

```mermaid
graph TD
    A[TNTET Personal Coach - Enhancement Roadmap] --> B[Phase 1: Critical Fixes]
    A --> C[Phase 2: Core Features]
    A --> D[Phase 3: Growth & Retention]

    B --> B1[Fix 150Q Simulator]
    B --> B2[Fix Auth Security]
    B --> B3[Fix RLS Policies]
    B --> B4[Expand Question Bank to 500+]
    B --> B5[Remove Firebase Config from Source]

    C --> C1[SCERT Chapter-wise Selector]
    C --> C2[Tamil Grammar Specialist Module]
    C --> C3[Mark Budget Calculator]
    C --> C4[Text-to-Speech Tamil Audio]
    C --> C5[Streak & Consistency Tracker]

    D --> D1[Spaced Repetition System]
    D --> D2[PWA Push Notifications]
    D --> D3[Leaderboard & Community]
    D --> D4[WhatsApp Bot Integration]
    D --> D5[Vitest Test Suite]
```

---

## Summary Comparison

| Metric | Current App | Proposed Upgraded App |
| :--- | :--- | :--- |
| **Target Alignment** | Generic Exam Prep | 100% TNTET SCERT Std 6-10 Aligned |
| **Question Bank** | ~20 questions | 500+ questions across all chapters |
| **Exam Simulator** | 30-question demo | Full 150-question TRB simulation |
| **Tamil Language Depth** | Bilingual Text | Bilingual Text + Tamil Audio + Tamil Grammar Engine |
| **UI Complexity** | Overloaded (Admin + Cloud Sync) | Streamlined, Candidate-Centric, Low-Distraction |
| **Authentication** | localStorage-only with fake passwords | Supabase Auth with email verification |
| **Security** | Open RLS, exposed API keys | Proper RLS, env-based secrets |
| **Testing** | Zero automated tests | Vitest + Playwright coverage |
| **Retention Tool** | Basic Local Storage | Spaced Revision Queue + Daily SCERT Micro-Goals + Push Notifications |
| **Accessibility** | Minimal | Full ARIA + Keyboard Navigation |

---

*Report generated on 2026-08-26 for TNTET Personal Coach (`shafi_et`) by deep analysis of all 66 source files.*
