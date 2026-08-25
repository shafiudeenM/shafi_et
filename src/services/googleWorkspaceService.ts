// Integration Service for Google Calendar & Google Sheets
import { googleAuthService } from './googleAuthService';
import { 
  UserProfile, 
  ReadinessScoreBreakdown, 
  TopicMastery, 
  MistakeQueueItem,
  DailySessionPlan 
} from '../types';

export interface CalendarEventScheduleOptions {
  studyMinutes: number;
  timeSlot: 'morning' | 'evening' | 'custom';
  customTime?: string; // '06:00' or '19:30'
  recurrenceDays: number; // e.g. 7 or 30 days
  examDate?: string;
  topicTitle?: string;
  isTamil?: boolean;
}

export interface SheetsSyncResult {
  spreadsheetUrl: string;
  spreadsheetId: string;
  sheetName: string;
  rowsUpdated: number;
}

export const googleWorkspaceService = {
  /**
   * Schedule Daily TNTET 35-Min Workout & Exam Milestones in Google Calendar
   */
  async scheduleStudyCalendar(options: CalendarEventScheduleOptions): Promise<{ count: number; calendarUrl: string }> {
    const token = await googleAuthService.requestAccessToken();

    const timeHour = options.timeSlot === 'morning' ? 6 : options.timeSlot === 'evening' ? 19 : parseInt(options.customTime?.split(':')[0] || '19');
    const timeMinute = options.timeSlot === 'morning' || options.timeSlot === 'evening' ? 30 : parseInt(options.customTime?.split(':')[1] || '0');

    const createdEvents: any[] = [];
    const today = new Date();

    // 1. Create Daily Study Schedule Events
    for (let dayOffset = 0; dayOffset < Math.min(options.recurrenceDays, 14); dayOffset++) {
      const eventDate = new Date();
      eventDate.setDate(today.getDate() + dayOffset);
      eventDate.setHours(timeHour, timeMinute, 0, 0);

      const endDate = new Date(eventDate.getTime() + options.studyMinutes * 60 * 1000);

      const title = options.isTamil 
        ? `🎯 TNTET ${options.studyMinutes} நிமிட தினசரி பயிற்சி (${options.topicTitle || 'SCERT பாடப்பிரிவு'})`
        : `🎯 TNTET Daily ${options.studyMinutes}m Workout: ${options.topicTitle || 'SCERT Targeted Drill'}`;

      const description = options.isTamil
        ? `TNTET ஆசிரியர் தகுதித் தேர்வுக்கான தினசரி பயிற்சி அமர்வு.\n\n• 15 நிமிடம்: பலவீனமான பாடக் கருத்துக்கள்\n• 12 நிமிடம்: மாதிரி வினா வங்கி பயிற்சி\n• 8 நிமிடம்: முந்தைய பிழை திருப்புதல் (Mistake Queue)\n\nதொடங்குங்கள்: https://ais-pre-mts7sumo4f5tfw2c3kmwte-145112698637.asia-southeast1.run.app`
        : `TNTET Teacher Eligibility Test Daily Preparation Block.\n\n• 15m: Weak Concept Refresher\n• 12m: Targeted Question Bank Practice\n• 8m: Spaced Mistake Queue Revision\n\nLaunch App: https://ais-pre-mts7sumo4f5tfw2c3kmwte-145112698637.asia-southeast1.run.app`;

      const eventPayload = {
        summary: title,
        description,
        start: {
          dateTime: eventDate.toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata',
        },
        end: {
          dateTime: endDate.toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata',
        },
        colorId: '5', // Yellow / Gold tone in Google Calendar
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'popup', minutes: 15 },
            { method: 'popup', minutes: 5 },
          ],
        },
      };

      const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventPayload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error?.message || `Failed to create Calendar event: ${res.statusText}`);
      }

      const data = await res.json();
      createdEvents.push(data);
    }

    // 2. Schedule Exam Date Milestone if provided
    if (options.examDate) {
      try {
        const examDay = new Date(options.examDate);
        examDay.setHours(9, 30, 0, 0);
        const examEnd = new Date(examDay.getTime() + 180 * 60 * 1000);

        const examEventPayload = {
          summary: options.isTamil ? '🏛️ TNTET ஆசிரியர் தகுதித் தேர்வு 2026 (Official TRB Exam)' : '🏛️ TNTET Official Examination (TRB Tamil Nadu)',
          description: 'Official TRB TNTET Examination Date. 150 Questions, 150 Minutes.\nReporting Time: 08:30 AM.',
          start: {
            dateTime: examDay.toISOString(),
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata',
          },
          end: {
            dateTime: examEnd.toISOString(),
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata',
          },
          colorId: '11', // Red highlight
          reminders: {
            useDefault: false,
            overrides: [
              { method: 'popup', minutes: 1440 }, // 1 day before
              { method: 'popup', minutes: 120 },
            ],
          },
        };

        await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(examEventPayload),
        });
      } catch (e) {
        console.warn('Exam milestone calendar event skipped:', e);
      }
    }

    return {
      count: createdEvents.length,
      calendarUrl: 'https://calendar.google.com/calendar/r',
    };
  },

  /**
   * Sync Candidate Progress, Scores & Mistake Queue to Google Sheets
   */
  async syncToGoogleSheets(data: {
    userProfile: UserProfile;
    readiness: ReadinessScoreBreakdown;
    topicMasteries: TopicMastery[];
    mistakeQueue: MistakeQueueItem[];
  }): Promise<SheetsSyncResult> {
    const token = await googleAuthService.requestAccessToken();

    const timestampStr = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    const title = `TNTET Coach Progress - ${data.userProfile.name} (${timestampStr})`;

    // 1. Create a fresh Google Spreadsheet
    const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        properties: {
          title,
        },
        sheets: [
          { properties: { title: 'Executive Summary' } },
          { properties: { title: 'Topic Mastery Breakdown' } },
          { properties: { title: 'Mistake Revision Queue' } },
        ],
      }),
    });

    if (!createRes.ok) {
      const err = await createRes.json().catch(() => ({}));
      throw new Error(err.error?.message || `Failed to create Google Sheet: ${createRes.statusText}`);
    }

    const createdSheet = await createRes.json();
    const spreadsheetId = createdSheet.spreadsheetId;
    const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

    // 2. Prepare Sheet 1: Executive Summary Rows
    const summaryRows = [
      ['TNTET PERSONAL COACH 2026 - OFFICIAL PERFORMANCE AUDIT'],
      ['Generated On', new Date().toLocaleString('en-IN')],
      ['Candidate Name', data.userProfile.name],
      ['Target Paper', data.userProfile.selectedPaper],
      ['Reservation Category', data.userProfile.category === 'OC_GENERAL' ? 'OC / General (90 Marks Benchmark)' : 'BC / MBC / SC / ST (82 Marks Benchmark)'],
      ['Daily Study Calibration', `${data.userProfile.dailyStudyMinutes} Minutes / Day`],
      ['Active Streak', `${data.userProfile.streakDays} Days`],
      ['Target Exam Date', data.userProfile.targetExamDate || '2026-10-18'],
      [],
      ['CORE READINESS BENCHMARKS'],
      ['Metric', 'Score / Rating', 'Status'],
      ['Overall Readiness', `${data.readiness.overallScore}%`, data.readiness.isQualifyingProjected ? 'On-Track to Qualify' : 'Below Cutoff Margin'],
      ['Concept Knowledge', `${data.readiness.knowledgeScore}%`, data.readiness.knowledgeScore >= 70 ? 'Strong' : 'Needs Review'],
      ['Accuracy Rate', `${data.readiness.accuracyScore}%`, data.readiness.accuracyScore >= 75 ? 'Optimal' : 'Distractor Vulnerability'],
      ['Pacing & Speed', `${data.readiness.speedScore}%`, 'Target: <60s per question'],
      ['Projected Marks', `${data.readiness.projectedMarks} / 150`, data.readiness.isQualifyingProjected ? `+${data.readiness.marginAboveCutoff} over cutoff` : `${data.readiness.marginAboveCutoff} below cutoff`],
      ['Qualifying Cutoff', `${data.readiness.qualifyingThreshold} / 150`, data.userProfile.category === 'OC_GENERAL' ? '60% Standard' : '55% Standard'],
    ];

    // 3. Prepare Sheet 2: Topic Mastery Rows
    const topicRows = [
      ['Subject', 'Topic Name (English)', 'Topic Name (Tamil)', 'Mastery %', 'Attempted', 'Correct', 'Readiness Status', 'Dominant Error'],
      ...data.topicMasteries.map(t => [
        t.subjectId.toUpperCase(),
        t.topicNameEn,
        t.topicNameTa,
        `${t.masteryPercent}%`,
        t.totalAttempted,
        t.correctCount,
        t.status.toUpperCase(),
        t.dominantErrorType || 'None'
      ])
    ];

    // 4. Prepare Sheet 3: Mistake Queue Rows
    const mistakeRows = [
      ['Question ID', 'Subject', 'Topic', 'Question Text', 'Correct Answer', 'Your Selected Option', 'Error Classification', 'Retest Count', 'Status'],
      ...data.mistakeQueue.map(m => [
        m.id,
        m.question.subject.toUpperCase(),
        m.question.topic,
        m.question.questionEn,
        m.question.optionsEn[m.question.correctOptionIndex],
        m.question.optionsEn[m.lastInteraction.selectedOptionIndex] || 'Skipped',
        m.lastInteraction.detectedErrorType || 'knowledge_gap',
        m.retestCount,
        m.isResolved ? 'Resolved' : 'Pending Spaced Revision'
      ])
    ];

    // 5. Populate Data via Batch Update Values
    const updateRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        valueInputOption: 'USER_ENTERED',
        data: [
          {
            range: "'Executive Summary'!A1",
            values: summaryRows,
          },
          {
            range: "'Topic Mastery Breakdown'!A1",
            values: topicRows,
          },
          {
            range: "'Mistake Revision Queue'!A1",
            values: mistakeRows,
          },
        ],
      }),
    });

    if (!updateRes.ok) {
      console.warn('Batch write partial failure:', await updateRes.text());
    }

    return {
      spreadsheetUrl,
      spreadsheetId,
      sheetName: title,
      rowsUpdated: summaryRows.length + topicRows.length + mistakeRows.length,
    };
  }
};
