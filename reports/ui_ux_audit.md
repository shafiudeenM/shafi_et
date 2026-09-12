# UI/UX Programmatic Audit


## landing-desktop (vw=1440, scrollH=3811)

No console errors.
**Issue counts:** FONT=1, CONTRAST=4, EMPTY=1
- **[FONT]** font-size < 10px (9px) `span.hidden.sm:inline-block` "Syllabus Aligned" @(263,53) 84x16 font=9px
- **[CONTRAST]** contrast 1.06:1 0,0,0,1 on 10,10,10,0.95 `span` "Get Started" @(1256,60) 64x16 font=12px
- **[CONTRAST]** contrast 1.06:1 0,0,0,0 on 10,10,10,1 `span.text-transparent.bg-clip-text` "Clear Daily Plan" @(80,256) 351x64 font=48px
- **[CONTRAST]** contrast 1.06:1 0,0,0,1 on 10,10,10,1 `span` "Start Free 15-Min Diagnostic Test" @(104,548) 219x20 font=14px
- **[CONTRAST]** contrast 1.06:1 0,0,0,1 on 10,10,10,1 `span` "Create Free Candidate Account" @(501,3439) 203x20 font=14px
- **[EMPTY]** empty box 700x350 `div.absolute.top-1/4` "" @(370,79) 700x350 font=16px

## landing-mobile (vw=390, scrollH=6331)

No console errors.
**Issue counts:** OVERFLOW=10, CLIP=1, TAP=5, CONTRAST=4, EMPTY=1
- **[OVERFLOW]** element extends beyond viewport (right=547 vw=390) `div.flex.items-center` "இருமொழிதமிழ்ENSign InGet Started" @(171,63) 376x46 font=16px
- **[OVERFLOW]** element extends beyond viewport (right=547 vw=390) `button.px-4.py-1.5` "Get Started" @(454,64) 93x44 font=12px
- **[OVERFLOW]** element extends beyond viewport (right=545 vw=390) `div.absolute.top-1/4` "" @(-155,241) 700x350 font=16px
- **[OVERFLOW]** element extends beyond viewport (right=531 vw=390) `span` "Get Started" @(485,70) 45x32 font=12px
- **[OVERFLOW]** element extends beyond viewport (right=479 vw=390) `svg` "" @(470,79) 10x14 font=12px
- **[OVERFLOW]** element extends beyond viewport (right=478 vw=390) `path` "" @(478,82) 0x2 font=12px
- **[OVERFLOW]** element extends beyond viewport (right=472 vw=390) `circle` "" @(470,88) 2x2 font=12px
- **[OVERFLOW]** element extends beyond viewport (right=444 vw=390) `button.px-3.py-1.5` "Sign In" @(394,63) 50x46 font=12px
- **[CLIP]** content clipped in container (scrollW=545 clientW=390, scrollH=1167 clientH=1167) `section.relative.pt-12` "Built around the SCERT Samacheer Kalvi syllabusPre" @(0,124) 390x1167 font=16px
- **[TAP]** tap target 84x25 `button.px-2.py-1` "இருமொழி" @(174,74) 84x25 font=11px
- **[TAP]** tap target 49x25 `button.px-2.py-1` "தமிழ்" @(258,74) 49x25 font=11px
- **[TAP]** tap target 30x25 `button.px-2.py-1` "EN" @(307,74) 30x25 font=11px
- **[TAP]** tap target 34x34 `button.p-2.rounded-lg` "" @(350,69) 34x34 font=16px
- **[TAP]** tap target 266x36 `button.w-full.py-2.5` "Set This Goal in Coach →" @(62,1951) 266x36 font=12px
- **[CONTRAST]** contrast 1.06:1 0,0,0,1 on 10,10,10,0.95 `span` "Get Started" @(485,70) 45x32 font=12px
- **[CONTRAST]** contrast 1.06:1 0,0,0,0 on 10,10,10,1 `span.text-transparent.bg-clip-text` "Clear Daily Plan" @(132,258) 219x40 font=30px
- **[CONTRAST]** contrast 1.06:1 0,0,0,1 on 10,10,10,1 `span` "Start Free 15-Min Diagnostic Test" @(74,572) 219x20 font=14px
- **[CONTRAST]** contrast 1.06:1 0,0,0,1 on 10,10,10,1 `span` "Create Free Candidate Account" @(82,5727) 203x20 font=14px
- **[EMPTY]** empty box 700x350 `div.absolute.top-1/4` "" @(-155,241) 700x350 font=16px

## dashboard-desktop (vw=1440, scrollH=918)

No console errors.
**Issue counts:** CLIP=1, FONT=4
- **[CLIP]** content clipped in container (scrollW=1300 clientW=1280, scrollH=40 clientH=40) `div.max-w-7xl.mx-auto` "DashboardDaily Workout35mPYQ VaultFlashcardsQuesti" @(80,57) 1280x40 font=16px
- **[FONT]** font-size < 10px (9px) `span.text-[9px].uppercase` "SCERT 2026" @(262,18) 68x20 font=9px
- **[FONT]** font-size < 10px (8px) `div.text-[8px].text-white/40` "15m" @(855,354) 97x12 font=8px
- **[FONT]** font-size < 10px (8px) `div.text-[8px].text-white/40` "19m" @(972,354) 97x12 font=8px
- **[FONT]** font-size < 10px (8px) `span.text-[8px].font-semibold` "Readiness" @(161,621) 45x12 font=8px

## dailyplan-desktop (vw=1440, scrollH=1037)

No console errors.
**Issue counts:** CLIP=2, FONT=1, EMPTY=1
- **[CLIP]** content clipped in container (scrollW=1300 clientW=1280, scrollH=40 clientH=40) `div.max-w-7xl.mx-auto` "DashboardDaily Workout35mPYQ VaultFlashcardsQuesti" @(80,57) 1280x40 font=16px
- **[CLIP]** content clipped in container (scrollW=974 clientW=894, scrollH=304 clientH=269) `div.bg-[#121212].border` "45 Min Daily Session12 Sept 2026Piaget & Vygotsky " @(272,130) 896x271 font=16px
- **[FONT]** font-size < 10px (9px) `span.text-[9px].uppercase` "SCERT 2026" @(262,18) 68x20 font=9px
- **[EMPTY]** empty box 384x384 `div.absolute.top-0` "" @(863,51) 384x384 font=16px

## practice-desktop (vw=1440, scrollH=1006)

No console errors.
**Issue counts:** CLIP=11, FONT=1, CONTRAST=13
- **[CLIP]** content clipped in container (scrollW=1300 clientW=1280, scrollH=40 clientH=40) `div.max-w-7xl.mx-auto` "DashboardDaily Workout35mPYQ VaultFlashcardsQuesti" @(80,57) 1280x40 font=16px
- **[CLIP]** content clipped in container (scrollW=347 clientW=347, scrollH=796 clientH=480) `div.space-y-2.max-h-[480px]` "Q.1Conservation Concept (பொருண்மை மாறாக் கொள்கை)TR" @(960,321) 347x480 font=16px
- **[CLIP]** content clipped in container (scrollW=358 clientW=226, scrollH=16 clientH=16) `span.truncate` "Conservation Concept (பொருண்மை மாறாக் கொள்கை)" @(997,334) 226x16 font=12px
- **[CLIP]** content clipped in container (scrollW=362 clientW=226, scrollH=16 clientH=16) `span.truncate` "Zone of Proximal Development (அண்மை வளர்ச்சி மண்டல" @(997,401) 226x16 font=12px
- **[CLIP]** content clipped in container (scrollW=275 clientW=226, scrollH=16 clientH=16) `span.truncate` "Division of Fractions (பின்னங்களின் வகுத்தல்)" @(997,468) 226x16 font=12px
- **[CLIP]** content clipped in container (scrollW=309 clientW=240, scrollH=16 clientH=16) `span.truncate` "Perimeter of a Semicircle (அரைவட்டத்தின் சுற்றளவு)" @(997,535) 240x16 font=12px
- **[CLIP]** content clipped in container (scrollW=264 clientW=226, scrollH=16 clientH=16) `span.truncate` "Third Conditional (Had + V3 -> Would have + V3)" @(997,669) 226x16 font=12px
- **[CLIP]** content clipped in container (scrollW=365 clientW=244, scrollH=16 clientH=16) `span.truncate` "Diagnostic Test Purpose (குறை கண்டறி சோதனை நோக்கம்" @(997,803) 244x16 font=12px
- **[CLIP]** content clipped in container (scrollW=311 clientW=219, scrollH=16 clientH=16) `span.truncate` "HCF of Fractions = HCF(Numerators) / LCM(Denominat" @(1004,937) 219x16 font=12px
- **[CLIP]** content clipped in container (scrollW=324 clientW=219, scrollH=16 clientH=16) `span.truncate` "Passive Voice for Orders/Imperatives (Let + object" @(1004,1004) 219x16 font=12px
- **[CLIP]** content clipped in container (scrollW=371 clientW=219, scrollH=16 clientH=16) `span.truncate` "Good Boy / Nice Girl Orientation (நல்ல பையன்/பெண் " @(1004,1071) 219x16 font=12px
- **[FONT]** font-size < 10px (9px) `span.text-[9px].uppercase` "SCERT 2026" @(262,18) 68x20 font=9px
- **[CONTRAST]** contrast 3.95:1 115,115,115,1 on 18,18,18,1 `span.text-xs.text-[#737373]` "SCERT Educational Psychology, Unit 2 - Piaget Cogn" @(141,871) 369x16 font=12px
- **[CONTRAST]** contrast 3.95:1 115,115,115,1 on 18,18,18,1 `div.text-[10px].text-[#737373]` "TRB TNTET 2022 Paper I Q.14" @(973,352) 251x15 font=10px
- **[CONTRAST]** contrast 3.74:1 115,115,115,1 on 24,24,24,1 `div.text-[10px].text-[#737373]` "TRB TNTET 2019 Paper I Q.8" @(973,419) 251x15 font=10px
- **[CONTRAST]** contrast 3.74:1 115,115,115,1 on 24,24,24,1 `div.text-[10px].text-[#737373]` "TRB TNTET 2022 Paper I Q.68" @(973,486) 251x15 font=10px
- **[CONTRAST]** contrast 3.74:1 115,115,115,1 on 24,24,24,1 `div.text-[10px].text-[#737373]` "TRB TNTET 2019 Paper I Q.82" @(973,553) 265x15 font=10px
- **[CONTRAST]** contrast 3.74:1 115,115,115,1 on 24,24,24,1 `div.text-[10px].text-[#737373]` "TRB TNTET 2022 Paper I Q.38" @(973,620) 258x15 font=10px
- **[CONTRAST]** contrast 3.74:1 115,115,115,1 on 24,24,24,1 `div.text-[10px].text-[#737373]` "TRB TNTET 2022 Paper I Q.52" @(973,687) 251x15 font=10px
- **[CONTRAST]** contrast 3.74:1 115,115,115,1 on 24,24,24,1 `div.text-[10px].text-[#737373]` "TRB TNTET 2019 Paper I Q.112" @(973,754) 233x15 font=10px
- **[CONTRAST]** contrast 3.74:1 115,115,115,1 on 24,24,24,1 `div.text-[10px].text-[#737373]` "TRB TNTET July 2026 Shift 1 Q.22" @(973,821) 269x15 font=10px
- **[CONTRAST]** contrast 3.74:1 115,115,115,1 on 24,24,24,1 `div.text-[10px].text-[#737373]` "TRB TNTET 2022 Paper I Q.28" @(973,888) 190x15 font=10px
- **[CONTRAST]** contrast 3.74:1 115,115,115,1 on 24,24,24,1 `div.text-[10px].text-[#737373]` "TRB TNTET 2017 Paper I Q.74" @(973,955) 251x15 font=10px
- **[CONTRAST]** contrast 3.74:1 115,115,115,1 on 24,24,24,1 `div.text-[10px].text-[#737373]` "TRB TNTET July 2026 Shift 2 Q.44" @(973,1022) 251x15 font=10px
- **[CONTRAST]** contrast 3.74:1 115,115,115,1 on 24,24,24,1 `div.text-[10px].text-[#737373]` "TRB TNTET 2022 Paper I Q.19" @(973,1089) 251x15 font=10px

## simulator-desktop (vw=1440, scrollH=900)

No console errors.
**Issue counts:** CLIP=2, FONT=1, EMPTY=1
- **[CLIP]** content clipped in container (scrollW=1300 clientW=1280, scrollH=40 clientH=40) `div.max-w-7xl.mx-auto` "DashboardDaily Workout35mPYQ VaultFlashcardsQuesti" @(80,57) 1280x40 font=16px
- **[CLIP]** content clipped in container (scrollW=974 clientW=894, scrollH=472 clientH=472) `div.bg-[#121212].border` "Official TNTET Exam SimulatorReplicating official " @(272,130) 896x474 font=16px
- **[FONT]** font-size < 10px (9px) `span.text-[9px].uppercase` "SCERT 2026" @(262,18) 68x20 font=9px
- **[EMPTY]** empty box 320x320 `div.absolute.top-0` "" @(927,51) 320x320 font=16px

## dashboard-mobile (vw=390, scrollH=1703)

No console errors.
**Issue counts:** OVERFLOW=25, CLIP=1, FONT=4, TAP=15
- **[OVERFLOW]** element extends beyond viewport (right=732 vw=390) `div.flex.items-center` "Paper II (Math & Sci)Paper I (Classes 1–5 Primary)" @(182,8) 550x62 font=16px
- **[OVERFLOW]** element extends beyond viewport (right=732 vw=390) `div.relative` "KKavitha S." @(615,24) 117x30 font=16px
- **[OVERFLOW]** element extends beyond viewport (right=732 vw=390) `div.flex.items-center` "HomePractice150Q TestVaultMore" @(0,1510) 732x67 font=16px
- **[OVERFLOW]** element extends beyond viewport (right=724 vw=390) `button.flex.flex-col` "More" @(581,1519) 143x53 font=16px
- **[OVERFLOW]** element extends beyond viewport (right=721 vw=390) `svg` "" @(709,33) 12x12 font=12px
- **[OVERFLOW]** element extends beyond viewport (right=718 vw=390) `path` "" @(712,38) 6x3 font=12px
- **[OVERFLOW]** element extends beyond viewport (right=701 vw=390) `span.max-w-[70px].sm:max-w-[100px]` "Kavitha S." @(652,32) 49x15 font=11px
- **[OVERFLOW]** element extends beyond viewport (right=666 vw=390) `div.p-1.rounded-lg` "" @(638,1523) 28x28 font=16px
- **[OVERFLOW]** element extends beyond viewport (right=664 vw=390) `span.text-[10px].font-semibold` "More" @(641,1553) 23x15 font=10px
- **[OVERFLOW]** element extends beyond viewport (right=662 vw=390) `svg` "" @(642,1527) 20x20 font=16px
- **[OVERFLOW]** element extends beyond viewport (right=659 vw=390) `circle` "" @(657,1536) 2x2 font=16px
- **[OVERFLOW]** element extends beyond viewport (right=653 vw=390) `circle` "" @(652,1536) 2x2 font=16px
- **[OVERFLOW]** element extends beyond viewport (right=647 vw=390) `circle` "" @(646,1536) 2x2 font=16px
- **[OVERFLOW]** element extends beyond viewport (right=644 vw=390) `div.w-5.h-5` "K" @(624,29) 20x20 font=10px
- **[OVERFLOW]** element extends beyond viewport (right=607 vw=390) `button.flex.items-center` "PDF Report" @(571,25) 36x28 font=12px
- **[OVERFLOW]** element extends beyond viewport (right=596 vw=390) `svg` "" @(582,32) 14x14 font=12px
- **[OVERFLOW]** element extends beyond viewport (right=594 vw=390) `path` "" @(585,33) 9x12 font=12px
- **[OVERFLOW]** element extends beyond viewport (right=592 vw=390) `path` "" @(587,40) 5x0 font=12px
- **[OVERFLOW]** element extends beyond viewport (right=588 vw=390) `path` "" @(587,37) 1x0 font=12px
- **[OVERFLOW]** element extends beyond viewport (right=582 vw=390) `button.px-3.5.py-2` "Priority Remediation1" @(392,653) 190x32 font=12px
- **[OVERFLOW]** element extends beyond viewport (right=581 vw=390) `button.flex.flex-col` "Vault" @(438,1519) 143x53 font=16px
- **[OVERFLOW]** element extends beyond viewport (right=568 vw=390) `span.text-[10px].px-1.5` "1" @(548,661) 20x15 font=10px
- **[CLIP]** content clipped in container (scrollW=563 clientW=352, scrollH=32 clientH=32) `div.flex.items-center` "Today's Focus & ReadinessPerformance AnalyticsPrio" @(19,653) 352x32 font=16px
- **[FONT]** font-size < 10px (9px) `span.text-[9px].uppercase` "SCERT 2026" @(123,23) 47x33 font=9px
- **[FONT]** font-size < 10px (8px) `div.text-[8px].text-white/40` "15m" @(36,590) 65x12 font=8px
- **[FONT]** font-size < 10px (8px) `div.text-[8px].text-white/40` "19m" @(121,590) 65x12 font=8px
- **[FONT]** font-size < 10px (8px) `span.text-[8px].font-semibold` "Readiness" @(61,857) 45x12 font=8px
- **[TAP]** tap target 52x24 `button.px-2.py-1` "தமிழ்" @(268,27) 52x24 font=12px

---

## Post-Fix Verification (2026-09-12)

All four approved fix groups implemented and re-tested against the live build:

| View | Before | After |
| :--- | :--- | :--- |
| Landing (390px) | horizontal overflow to `scrollW=547` | `scrollW=390` — no overflow |
| Dashboard (390px) | header + fixed bottom nav rendered 732px wide | `scrollW=390` — no overflow |
| Desktop tab bar (1280px) | 13 tabs clipped (`scrollW=1300` vs `1280`) | 11 tabs, `scrollW=1280` — fits exactly |

**Changes made**
1. **Mobile overflow** — `Navbar.tsx`: desktop-only control cluster now `hidden md:flex`; brand badge/subtitle hidden on mobile; new `md:hidden` secondary strip (language toggle, daily-plan tracker, Sync/OMR, PDF, Install). `LandingPage.tsx`: same single-row → primary row + `md:hidden` strip for language switcher & Sign In; responsive logo + `min-w-0` brand.
2. **Decluttered tabs** — removed `admin` tab from `Navbar.tsx` navItems (11 tabs, fits 1280px); Admin still reachable via the user-menu "Super Admin Console" entry and a new tile in `MobileMoreSheet.tsx`.
3. **Font & contrast** — raised 8px labels to 10px (`DailyPlanProgressTracker`, `DashboardView`, `StreakDisplay`); brightened secondary grey `#737373 → #8f8f8f` across 9 components (contrast on `#181818` cards: 3.74:1 → ~5.4:1).
4. **Tap targets** — language-toggle buttons bumped `py-1 → py-1.5` (~31px), landing theme toggle `p-2 → p-2.5`, Sign In / Get Started `py-1.5 → py-2` (~40px).

`tsc --noEmit` clean, `npm run build` clean. Screenshots: `shots/*-after.png`.
- **[TAP]** tap target 33x24 `button.px-2.py-1` "BIL" @(320,27) 33x24 font=12px
- **[TAP]** tap target 40x24 `button.px-2.py-1` "ENG" @(352,27) 40x24 font=12px
