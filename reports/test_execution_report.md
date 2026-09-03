# TNTET Personal Coach - Feature-Level Test Execution & Regression Report

**Date:** September 3, 2026 (updated)  
**Framework:** Vitest v4.1.11  
**Execution Pool:** `threads` (Windows verified)  
**Environment:** `jsdom` + Node.js  
**Total Duration:** 52.22s  

---

## 1. Test Execution Summary

| Metric | Status / Value |
| :--- | :--- |
| **Total Test Suites** | **11 passed (11)** |
| **Total Individual Tests** | **186 passed (186)** |
| **Failed Tests** | **0 (0%)** |
| **Success Rate** | **100%** |
| **TypeScript Strictness** | Clean (`tsc --noEmit` — 0 errors) |
| **Production Build** | Clean (`npm run build` — 0 errors) |

---

## 2. Feature-Level Test Suite Breakdown

### 🎯 Feature 1: TRB 150-Question Exam Simulator (`ExamSimulator.test.ts` — 7 tests)
| Test Case | Description | Result |
| :--- | :--- | :---: |
| `should have enough questions for 150Q simulation` | Validates non-empty question bank availability for Paper I & II | ✅ PASS |
| `should have questions with required fields` | Checks presence of bilingual text, options, and correct answers | ✅ PASS |
| `should have valid subject IDs` | Validates alignment with SCERT core subjects | ✅ PASS |
| `should use 150 questions for full simulation` | Verifies `FULL_EXAM_QUESTIONS = 150` configuration | ✅ PASS |
| `should have 180 minutes timer` | Verifies `FULL_EXAM_TIME_SECONDS = 10800` countdown timer | ✅ PASS |
| `should have correct qualifying cutoffs` | Validates OC 90/150 (60%) and BC/MBC/SC/ST 82/150 (55%) | ✅ PASS |
| `should cycle through questions when bank is smaller` | Validates fallback modulo indexing during question bank growth | ✅ PASS |

---

### 🧠 Feature 2: Spaced Repetition Flashcard System (`srsService.test.ts` — 28 tests)
| Test Case | Description | Result |
| :--- | :--- | :---: |
| `should reset interval on failed review` | Verifies Quality < 3 resets interval to 1 day | ✅ PASS |
| `should set interval to 1 day on first success` | Verifies initial SM-2 review interval | ✅ PASS |
| `should set interval to 3 days on second success` | Verifies secondary interval growth step | ✅ PASS |
| `should multiply by ease factor` | Validates Ease Factor (EF) multiplier on consecutive successes | ✅ PASS |
| `should decrease ease factor on difficult reviews` | Reduces EF when review quality is rated hard | ✅ PASS |
| `should increase ease factor on easy reviews` | Increases EF when review quality is rated easy | ✅ PASS |
| `should cap ease factor at MAX_EASE_FACTOR` | Enforces EF cap at 3.0 | ✅ PASS |
| `should not go below MIN_EASE_FACTOR` | Enforces EF minimum floor at 1.3 | ✅ PASS |
| `should cap interval at 180 days` | Enforces maximum flashcard review interval at 180 days | ✅ PASS |
| `should return 0 for quick wrong answer` | Quality rating calculation for fast incorrect responses | ✅ PASS |
| `should return 1 for moderate-time wrong answer` | Quality rating calculation for moderate incorrect responses | ✅ PASS |
| `should return 2 for slow wrong answer` | Quality rating calculation for slow incorrect responses | ✅ PASS |
| `should return 5 for fast, confident, correct answer` | Quality rating calculation for fast correct responses | ✅ PASS |
| `should return 4 for reasonable-time correct answer` | Quality rating calculation for standard correct responses | ✅ PASS |
| `should return 3 for slow correct answer` | Quality rating calculation for slow correct responses | ✅ PASS |
| `should create an SRS item with correct defaults` | Flashcard creation default state verification | ✅ PASS |
| `should update interval after successful review` | Flashcard interval update verification | ✅ PASS |
| `should reset after failed review` | Flashcard failure reset verification | ✅ PASS |
| `should mark as graduated when interval >= 30 days` | Flashcard graduation logic verification | ✅ PASS |
| `should track streak correctly` | Consecutive correct review streak calculation | ✅ PASS |
| `should break streak on failed review` | Streak reset on review failure | ✅ PASS |
| `should return items due for review` | Review queue queueing logic | ✅ PASS |
| `should exclude graduated items` | Filters out graduated items from daily queue | ✅ PASS |
| `should respect maxItems limit` | Enforces candidate daily study limit | ✅ PASS |
| `should calculate correct stats` | SRS deck analytics calculation | ✅ PASS |
| `should return zeros for empty items` | Empty deck stats handling | ✅ PASS |
| `should calculate 40% of time divided by 2 min` | Dynamic SRS capacity formula calculation | ✅ PASS |
| `should return at least 0 for very short time` | Edge-case zero handling for short study slots | ✅ PASS |

---

### 📊 Feature 3: Mark Budget & Qualifying Cutoff Engine (`markBudgetService.test.ts` — 13 tests)
| Test Case | Description | Result |
| :--- | :--- | :---: |
| `should return 90 for OC category` | Validates General / OC qualifying threshold (90 marks) | ✅ PASS |
| `should return 82 for BC category` | Validates BC/MBC/SC/ST qualifying threshold (82 marks) | ✅ PASS |
| `should return correct percentage for OC` | Validates 60% requirement calculation | ✅ PASS |
| `should return correct percentage for BC` | Validates 54.67% requirement calculation | ✅ PASS |
| `should return 5 subjects for Paper I` | Paper I subject allocation (CDP, Tamil, Eng, Math, EVS) | ✅ PASS |
| `should return 4 subjects for Paper II Math/Science` | Paper II Math/Sci allocation | ✅ PASS |
| `should return 4 subjects for Paper II Social Science` | Paper II Social Sci allocation | ✅ PASS |
| `should generate valid budget plan` | Generates candidate mark distribution strategy | ✅ PASS |
| `should calculate target score from qualifying score` | Computes recommended target buffer (+5 marks) | ✅ PASS |
| `should classify focus priority for low mastery` | Categorizes low mastery topics under "Focus" | ✅ PASS |
| `should classify maintain priority for medium mastery` | Categorizes medium mastery topics under "Maintain" | ✅ PASS |
| `should classify relax priority for high mastery` | Categorizes high mastery topics under "Consolidate" | ✅ PASS |
| `should return correct color for priorities` | Validates visual badge indicator color mappings | ✅ PASS |

---

### 🔥 Feature 4: Daily Streak & Milestone Tracker (`streakService.test.ts` — 18 tests)
| Test Case | Description | Result |
| :--- | :--- | :---: |
| `should return today as YYYY-MM-DD` | Date string formatting verification | ✅ PASS |
| `should return yesterday as YYYY-MM-DD` | Previous day date string formatting | ✅ PASS |
| `should calculate days between two dates` | Date difference utility verification | ✅ PASS |
| `should return 0 for same dates` | Zero day difference verification | ✅ PASS |
| `should be symmetric` | Symmetric date math verification | ✅ PASS |
| `should return null for streak of 0` | Milestone check for zero streak | ✅ PASS |
| `should return first milestone for streak of 1` | Milestone check for 1-day streak | ✅ PASS |
| `should return highest achieved milestone` | Milestone check for multi-day streak | ✅ PASS |
| `should return last milestone for very high streak` | Milestone check for 100+ day streak | ✅ PASS |
| `should return first milestone for streak of 0` | Next milestone progression for 0 days | ✅ PASS |
| `should return next milestone after current` | Next milestone progression for active streak | ✅ PASS |
| `should return null when all milestones achieved` | Max milestone achievement check | ✅ PASS |
| `should return excellent for meeting weekly goal` | Streak health evaluation for active study | ✅ PASS |
| `should return critical for low weekly actual` | Streak health evaluation for missed sessions | ✅ PASS |
| `should have milestones in ascending order` | Milestone threshold order validation | ✅ PASS |
| `should have all required fields` | Milestone metadata structure validation | ✅ PASS |
| `should record study session date` | Persists session date into streak array | ✅ PASS |
| `should seed streak from historical study dates` | Hydrates streak state from Supabase log history | ✅ PASS |

---

### 🔐 Feature 5: Security, RLS & Supabase Schema (`supabase_schema.test.ts` — 29 tests)
| Test Case | Description | Result |
| :--- | :--- | :---: |
| `should enable RLS on all tables` | Row Level Security enabled across all Postgres tables | ✅ PASS |
| `should NOT have permissive USING (true)` | Prevents unauthorized global access policies | ✅ PASS |
| `should use auth.uid() for user isolation` | Isolates candidate profiles, mistakes, and mastery data | ✅ PASS |
| `should have separate policies per operation` | Explicit SELECT, INSERT, UPDATE, DELETE permissions | ✅ PASS |
| `should have user_profiles table with required columns` | User profile schema validation | ✅ PASS |
| `should have foreign key constraints` | Cascading deletes and referential integrity | ✅ PASS |
| `should have proper indexes` | B-tree index coverage on paper_id, subject_id, user_id | ✅ PASS |
| *(22 additional schema tests)* | Foreign key CASCADE, TIMESTAMPTZ columns, defaults | ✅ PASS |

---

### 🤖 Feature 6: Server API, Rate Limiter & AI Cache (`serverLogic.test.ts` — 9 tests)
| Test Case | Description | Result |
| :--- | :--- | :---: |
| `should allow requests within rate limit` | Allows requests under 30 req/min limit | ✅ PASS |
| `should block requests exceeding rate limit` | Rejects 31st request with 429 Too Many Requests | ✅ PASS |
| `should reset rate limit after window expires` | Resets request counter after 1-minute window | ✅ PASS |
| `should track different IPs independently` | Enforces rate limits per client IP address | ✅ PASS |
| `should cache and retrieve responses` | Returns cached AI responses for duplicate queries | ✅ PASS |
| `should return null for cache miss` | Returns null on un-cached query | ✅ PASS |
| `should evict oldest entries when cache is full` | Evicts LRU entries when cache hits 5,000 limit | ✅ PASS |
| `should expire entries after TTL` | Invalidates cached responses after 24 hours | ✅ PASS |
| `should implement LRU by moving accessed items` | Refreshes cache access timestamp on read | ✅ PASS |

---

### 👤 Feature 7: Candidate Auth & Session Manager (`authService.test.ts` — 11 tests)
| Test Case | Description | Result |
| :--- | :--- | :---: |
| `should register a new user successfully` | Creates candidate account with initial state | ✅ PASS |
| `should prevent duplicate email registration` | Blocks registration with existing email | ✅ PASS |
| `should normalize email to lowercase` | Normalizes emails before storing | ✅ PASS |
| `should login existing user successfully` | Authenticates candidate with valid credentials | ✅ PASS |
| `should throw error for non-existent user` | Removes auto-provisioning security vulnerability | ✅ PASS |
| `should normalize email before login check` | Case-insensitive email lookup during login | ✅ PASS |
| `should persist user session in localStorage` | LocalStorage session persistence | ✅ PASS |
| `should return current user after login` | `getCurrentUser()` returns active profile | ✅ PASS |
| `should clear session on logout` | Wipes active session tokens on logout | ✅ PASS |
| `should update user profile successfully` | Profile preferences update verification | ✅ PASS |
| `should notify listeners on state changes` | Subscription listener callback notification | ✅ PASS |

---

### 📚 Feature 8: SCERT Question Bank & Import Schema (`questionBankSchema.test.ts` — 43 tests)
| Test Case | Description | Result |
| :--- | :--- | :---: |
| `should map CDP / Tamil / English / Maths / EVS / Science variations` | Subject ID normalization (15 tests) | ✅ PASS |
| `should map Paper I & II exam streams` | Paper type classification (6 tests) | ✅ PASS |
| `should map option letters (A, B, C, D) to zero-based indices (0, 1, 2, 3)` | Option index mapping (8 tests) | ✅ PASS |
| `should classify question difficulty & pedagogy types` | Heuristic difficulty and taxonomy tagging (8 tests) | ✅ PASS |
| `should validate syllabus topic IDs & bilingual translations` | SCERT unit and topic structure validation (6 tests) | ✅ PASS |

---

### 🔄 Feature 9: Cloud Data Hydration (`hydrateService.test.ts` — 11 tests)
| Test Case | Description | Result |
| :--- | :--- | :---: |
| `dbTopicMasteryToApp` / `dbMistakeQueueToApp` conversions | Supabase PostgreSQL to App state mapping | ✅ PASS |
| `mergeMasteries` / `mergeMistakeQueue` | LocalStorage + Supabase conflict resolution | ✅ PASS |
| `studyDatesFromDailyLogs` | Historical log date extraction for streak hydration | ✅ PASS |

---

### ⚡ Feature 10: Question Bank Live Service (`questionBankService.test.ts` — 9 tests)
| Test Case | Description | Result |
| :--- | :--- | :---: |
| `dbQuestionToApp` mapping | Runtime Supabase question conversion | ✅ PASS |
| `initQuestionBank` / `useQuestionBank` | Dynamic static + cloud question merging | ✅ PASS |
| Fallback handling for missing/malformed questions | Error handling & log warning verification | ✅ PASS |

---

### 📦 Feature 11: Package & Dependencies Audit (`package.test.ts` — 8 tests)
| Test Case | Description | Result |
| :--- | :--- | :---: |
| Package structure, module type, private flag, scripts | Package configuration verification | ✅ PASS |

---

## 3. Launch Readiness — What the Tests DON'T Cover

> [!IMPORTANT]
> The 186/186 test pass rate confirms **code correctness**. It does NOT mean the app is launch-ready. The following blockers exist outside of unit test scope.

### 🔴 Blocker: Not Deployed

| Issue | Impact | Status |
| :--- | :--- | :---: |
| **No live URL** — app runs only on `localhost:3000` | Users cannot access the app. This is the #1 blocker. | ❌ Blocked |
| **Render service not created** — `render.yaml` exists but no service is provisioned on Render dashboard | Deploy requires GitHub login to create the web service | ❌ Blocked |

### 🟠 Configuration Gaps (Fixed Sept 3, 2026)

| Issue | Impact | Resolution |
| :--- | :--- | :---: |
| **`VITE_API_URL` missing from config files** — code referenced it but `.env`, `.env.example`, and `render.yaml` did not define it | Mobile Capacitor builds could not route AI requests to server | ✅ Fixed |
| **CORS headers missing on Express server** — mobile webview requests blocked by browser engine | AI tutor unusable on Android/iOS | ✅ Fixed |
| **`vite/client` types missing from `tsconfig.json`** — `import.meta.env` caused TS2339 error | TypeScript compilation failure | ✅ Fixed |

### 🟡 Content & Product Gaps

| Issue | Impact | Status |
| :--- | :--- | :---: |
| **Only ~100 questions seeded** vs. 1,500 target | Exam simulator reuses questions; not credible for real candidates | ⚠️ Pending |
| **No Android `.apk` / `.aab` built** | Mobile app not available on Play Store | ⚠️ Pending |
| **OpenRouter API key exposed in chat history** | Key `sk-or-v1-5095...` should be rotated on [openrouter.ai/keys](https://openrouter.ai/keys) before production | ⚠️ Action Required |
| **No error tracking (Sentry / LogRocket)** | Production crashes will go undetected | ⚠️ Pending |

### 🟢 What IS Verified & Ship-Ready (Code Layer)

| Area | Evidence |
| :--- | :--- |
| All 11 service/component test suites | 186/186 tests pass |
| TypeScript strict mode | `tsc --noEmit` — 0 errors |
| Production bundle | `npm run build` — 0 errors, 2,771 modules |
| AI backend (OpenRouter) | Server-side proxy with rate limiting and fallback |
| Supabase schema + RLS | 29 schema tests pass, policies applied |
| Mobile API routing | `VITE_API_URL` + `getEndpointUrl()` helper in `tutorApi.ts` |
| CORS for mobile | Express middleware added to `server.ts` |
| Config documentation | `VITE_API_URL` in `.env`, `.env.example`, `render.yaml` |

---

*Report updated on September 3, 2026. Blockers section added to distinguish code-complete from launch-complete.*

