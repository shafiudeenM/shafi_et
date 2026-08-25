import React, { useState } from 'react';
import { 
  UserProfile, 
  ReadinessScoreBreakdown, 
  TopicMastery, 
  MistakeQueueItem,
  LanguageMode,
  Question,
  PaperType
} from '../types';
import { googleWorkspaceService } from '../services/googleWorkspaceService';
import { googleAuthService } from '../services/googleAuthService';
import { generateTRBOMRSheetPDF } from '../services/omrGeneratorService';
import { 
  Calendar, 
  FileSpreadsheet, 
  Printer, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  ExternalLink, 
  Loader2, 
  Sparkles, 
  X,
  FileDown,
  Download,
  CalendarCheck,
  ShieldCheck
} from 'lucide-react';

interface IntegrationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  readiness: ReadinessScoreBreakdown;
  topicMasteries: TopicMastery[];
  mistakeQueue: MistakeQueueItem[];
  questions?: Question[];
  languageMode: LanguageMode;
}

export const IntegrationsModal: React.FC<IntegrationsModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  readiness,
  topicMasteries,
  mistakeQueue,
  questions = [],
  languageMode,
}) => {
  const isTamil = languageMode === 'tamil';

  // Integration sub-tabs: 'calendar' | 'sheets' | 'omr'
  const [activeIntegration, setActiveIntegration] = useState<'calendar' | 'sheets' | 'omr'>('calendar');

  // Google Calendar state
  const [calendarSlot, setCalendarSlot] = useState<'morning' | 'evening' | 'custom'>('evening');
  const [customTime, setCustomTime] = useState<string>('19:30');
  const [recurrenceDays, setRecurrenceDays] = useState<number>(14);
  const [isCalendarLoading, setIsCalendarLoading] = useState<boolean>(false);
  const [calendarSuccess, setCalendarSuccess] = useState<{ count: number; url: string } | null>(null);
  const [calendarError, setCalendarError] = useState<string | null>(null);

  // Google Sheets state
  const [isSheetsLoading, setIsSheetsLoading] = useState<boolean>(false);
  const [sheetsSuccess, setSheetsSuccess] = useState<{ url: string; count: number; name: string } | null>(null);
  const [sheetsError, setSheetsError] = useState<string | null>(null);

  // OMR Sheet state
  const [includeBooklet, setIncludeBooklet] = useState<boolean>(true);
  const [omrCandidateName, setOmrCandidateName] = useState<string>(userProfile.name || '');
  const [omrRollNo, setOmrRollNo] = useState<string>('TNTET-2026-' + Math.floor(100000 + Math.random() * 900000));
  const [isOMRGenerating, setIsOMRGenerating] = useState<boolean>(false);

  if (!isOpen) return null;

  // 1. Handle Calendar Scheduling
  const handleScheduleCalendar = async () => {
    setIsCalendarLoading(true);
    setCalendarError(null);
    setCalendarSuccess(null);

    try {
      const result = await googleWorkspaceService.scheduleStudyCalendar({
        studyMinutes: userProfile.dailyStudyMinutes || 35,
        timeSlot: calendarSlot,
        customTime,
        recurrenceDays,
        examDate: userProfile.targetExamDate || '2026-10-18',
        topicTitle: readiness.primaryBottlenecksEn[0] || 'High-Yield SCERT Core',
        isTamil,
      });

      setCalendarSuccess({ count: result.count, url: result.calendarUrl });
    } catch (err: any) {
      console.error('Google Calendar error:', err);
      setCalendarError(err.message || 'Failed to schedule Calendar events. Please allow popup permissions.');
    } finally {
      setIsCalendarLoading(false);
    }
  };

  // 2. Handle Google Sheets Progress Export
  const handleSyncToSheets = async () => {
    setIsSheetsLoading(true);
    setSheetsError(null);
    setSheetsSuccess(null);

    try {
      const result = await googleWorkspaceService.syncToGoogleSheets({
        userProfile,
        readiness,
        topicMasteries,
        mistakeQueue,
      });

      setSheetsSuccess({
        url: result.spreadsheetUrl,
        count: result.rowsUpdated,
        name: result.sheetName,
      });
    } catch (err: any) {
      console.error('Google Sheets error:', err);
      setSheetsError(err.message || 'Failed to export to Google Sheets. Please verify account permissions.');
    } finally {
      setIsSheetsLoading(false);
    }
  };

  // 3. Handle Printable OMR Sheet Download
  const handleGenerateOMR = () => {
    setIsOMRGenerating(true);
    try {
      // Filter questions matching current paper
      const targetQuestions = questions.filter(q => q.paper === userProfile.selectedPaper).slice(0, 30);

      generateTRBOMRSheetPDF({
        paper: userProfile.selectedPaper,
        candidateName: omrCandidateName,
        rollNumber: omrRollNo,
        totalQuestions: 150,
        questions: includeBooklet ? (targetQuestions.length > 0 ? targetQuestions : questions.slice(0, 30)) : [],
        includeQuestionBooklet: includeBooklet,
        languageMode,
      });
    } catch (e) {
      console.error('OMR generation error:', e);
    } finally {
      setIsOMRGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#121212] border border-[#2a2a2a] w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden text-white my-8 animate-fadeIn">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-[#181818] to-[#121212]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#c5a059]/20 border border-[#c5a059]/40 flex items-center justify-center text-[#c5a059]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-base text-white">
                {isTamil ? 'பயனுள்ள ஒருங்கிணைப்புகள் & ஆஃப்லைன் கருவிகள்' : 'Candidate Integrations & Offline Tools'}
              </h2>
              <p className="text-[11px] text-white/50">
                {isTamil ? 'கூகுள் காலண்டர், கூகுள் ஷீட்ஸ் & அச்சிடக்கூடிய TRB OMR விடைத்தாள்' : 'Google Calendar, Google Sheets & Printable 150Q OMR Practice'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Integration Selector Tabs */}
        <div className="grid grid-cols-3 border-b border-white/10 bg-[#0a0a0a]">
          <button
            onClick={() => setActiveIntegration('calendar')}
            className={`py-3 px-3 text-xs font-semibold flex items-center justify-center gap-2 border-b-2 transition ${
              activeIntegration === 'calendar'
                ? 'border-[#c5a059] text-[#c5a059] bg-white/[0.03]'
                : 'border-transparent text-white/60 hover:text-white'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>{isTamil ? '1. கூகுள் காலண்டர்' : '1. Google Calendar'}</span>
          </button>

          <button
            onClick={() => setActiveIntegration('sheets')}
            className={`py-3 px-3 text-xs font-semibold flex items-center justify-center gap-2 border-b-2 transition ${
              activeIntegration === 'sheets'
                ? 'border-[#c5a059] text-[#c5a059] bg-white/[0.03]'
                : 'border-transparent text-white/60 hover:text-white'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>{isTamil ? '2. கூகுள் ஷீட்ஸ்' : '2. Google Sheets'}</span>
          </button>

          <button
            onClick={() => setActiveIntegration('omr')}
            className={`py-3 px-3 text-xs font-semibold flex items-center justify-center gap-2 border-b-2 transition ${
              activeIntegration === 'omr'
                ? 'border-[#c5a059] text-[#c5a059] bg-white/[0.03]'
                : 'border-transparent text-white/60 hover:text-white'
            }`}
          >
            <Printer className="w-4 h-4" />
            <span>{isTamil ? '3. OMR விடைத்தாள்' : '3. Printable OMR'}</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 space-y-5">
          {/* TAB 1: GOOGLE CALENDAR */}
          {activeIntegration === 'calendar' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-md bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 mt-0.5">
                    <CalendarCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white">
                      {isTamil ? 'தினசரி 35 நிமிட பயிற்சி நினைவூட்டல்' : 'Automated Daily Study Reminders'}
                    </h3>
                    <p className="text-[11px] text-white/60 mt-0.5 leading-relaxed">
                      {isTamil
                        ? 'உங்கள் தனிப்பட்ட Google Calendar கணக்கில் தினசரி படிப்பு நேரம் மற்றும் அதிகாரப்பூர்வ TRB தேர்வு மைல்கற்களை தானாக அட்டவணைப்படுத்துங்கள்.'
                        : 'Sync daily 35-minute study sessions, topic prescriptions, and your target exam milestone into your Google Calendar.'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="text-[11px] font-medium text-white/70 block mb-1.5">
                      {isTamil ? 'விருப்பமான படிப்பு நேரம்:' : 'Preferred Study Slot:'}
                    </label>
                    <select
                      value={calendarSlot}
                      onChange={(e) => setCalendarSlot(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-lg bg-[#1a1a1a] border border-[#333] text-xs text-white focus:outline-none focus:border-[#c5a059]"
                    >
                      <option value="evening">{isTamil ? 'மாலை (7:30 PM - 8:05 PM)' : 'Evening (7:30 PM – 8:05 PM)'}</option>
                      <option value="morning">{isTamil ? 'காலை (6:00 AM - 6:35 AM)' : 'Early Morning (6:00 AM – 6:35 AM)'}</option>
                      <option value="custom">{isTamil ? 'தனிப்பயன் நேரம் (Custom)' : 'Custom Time'}</option>
                    </select>
                  </div>

                  {calendarSlot === 'custom' ? (
                    <div>
                      <label className="text-[11px] font-medium text-white/70 block mb-1.5">
                        {isTamil ? 'நேரத்தை தேர்ந்தெடுக்கவும்:' : 'Specify Time:'}
                      </label>
                      <input
                        type="time"
                        value={customTime}
                        onChange={(e) => setCustomTime(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-[#1a1a1a] border border-[#333] text-xs text-white focus:outline-none focus:border-[#c5a059]"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="text-[11px] font-medium text-white/70 block mb-1.5">
                        {isTamil ? 'அட்டவணை காலம்:' : 'Schedule Duration:'}
                      </label>
                      <select
                        value={recurrenceDays}
                        onChange={(e) => setRecurrenceDays(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-lg bg-[#1a1a1a] border border-[#333] text-xs text-white focus:outline-none focus:border-[#c5a059]"
                      >
                        <option value={7}>{isTamil ? 'அடுத்த 7 நாட்கள்' : 'Next 7 Days'}</option>
                        <option value={14}>{isTamil ? 'அடுத்த 14 நாட்கள் (பரிந்துரைக்கப்பட்டது)' : 'Next 14 Days (Recommended)'}</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>

              {/* Status messages */}
              {calendarError && (
                <div className="p-3 rounded-lg bg-red-950/40 border border-red-800/40 text-red-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{calendarError}</span>
                </div>
              )}

              {calendarSuccess && (
                <div className="p-3.5 rounded-lg bg-emerald-950/40 border border-emerald-700/50 text-emerald-300 text-xs space-y-2">
                  <div className="flex items-center gap-2 font-bold">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                    <span>{isTamil ? `${calendarSuccess.count} காலண்டர் நிகழ்வுகள் வெற்றிகரமாக சேர்க்கப்பட்டன!` : `${calendarSuccess.count} study sessions successfully scheduled!`}</span>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-emerald-400/80">
                      {isTamil ? 'உங்கள் கூகுள் காலண்டரில் பார்க்கவும்:' : 'View in Google Calendar:'}
                    </span>
                    <a
                      href={calendarSuccess.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 rounded bg-emerald-700 hover:bg-emerald-600 text-black text-[11px] font-bold inline-flex items-center gap-1.5 transition"
                    >
                      <span>Open Calendar</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              )}

              <button
                onClick={handleScheduleCalendar}
                disabled={isCalendarLoading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#c5a059] to-[#9b7b37] hover:from-[#d8b46d] hover:to-[#ae8b3e] text-black font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#c5a059]/10 transition disabled:opacity-50"
              >
                {isCalendarLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{isTamil ? 'காலண்டருடன் இணைக்கிறது...' : 'Authorizing & Syncing Calendar...'}</span>
                  </>
                ) : (
                  <>
                    <Calendar className="w-4 h-4" />
                    <span>{isTamil ? 'Google Calendar-ல் அட்டவணைப்படுத்துக' : 'Schedule in Google Calendar'}</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* TAB 2: GOOGLE SHEETS */}
          {activeIntegration === 'sheets' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-md bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mt-0.5">
                    <FileSpreadsheet className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white">
                      {isTamil ? 'முழுமையான முன்னேற்ற அறிக்கையை கூகுள் ஷீட்ஸில் ஏற்றுமதி செய்க' : 'Continuous Google Sheets Progress Audit'}
                    </h3>
                    <p className="text-[11px] text-white/60 mt-0.5 leading-relaxed">
                      {isTamil
                        ? '3 விரிவான தாள்கள் (Executive Summary, Topic Mastery Breakdown, Mistake Revision Queue) கொண்ட புதிய Google Spreadsheet உருவாக்கப்படும்.'
                        : 'Generates a live multi-tab Google Sheet tracking Executive Scores, SCERT Topic Masteries, and Spaced Mistake Queue entries.'}
                    </p>
                  </div>
                </div>

                <div className="bg-[#181818] p-3 rounded-lg border border-white/5 space-y-1.5 text-[11px]">
                  <div className="flex items-center justify-between text-white/80">
                    <span>📊 Executive Readiness Audit:</span>
                    <span className="font-bold text-[#c5a059]">{readiness.projectedMarks}/150 Marks</span>
                  </div>
                  <div className="flex items-center justify-between text-white/80">
                    <span>📚 SCERT Topics Tracked:</span>
                    <span className="font-bold text-white">{topicMasteries.length} Units</span>
                  </div>
                  <div className="flex items-center justify-between text-white/80">
                    <span>⚠️ Active Mistake Queue Items:</span>
                    <span className="font-bold text-amber-400">{mistakeQueue.filter(m => !m.isResolved).length} Questions</span>
                  </div>
                </div>
              </div>

              {/* Sheets feedback */}
              {sheetsError && (
                <div className="p-3 rounded-lg bg-red-950/40 border border-red-800/40 text-red-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{sheetsError}</span>
                </div>
              )}

              {sheetsSuccess && (
                <div className="p-3.5 rounded-lg bg-emerald-950/40 border border-emerald-700/50 text-emerald-300 text-xs space-y-2">
                  <div className="flex items-center gap-2 font-bold">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                    <span>{isTamil ? 'கூகுள் ஷீட்ஸ் அறிக்கை தயாராக உள்ளது!' : 'Google Spreadsheet successfully created!'}</span>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-emerald-400/80 truncate max-w-[260px]">
                      {sheetsSuccess.name}
                    </span>
                    <a
                      href={sheetsSuccess.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-black text-[11px] font-bold inline-flex items-center gap-1.5 transition shrink-0"
                    >
                      <span>Open Spreadsheet</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              )}

              <button
                onClick={handleSyncToSheets}
                disabled={isSheetsLoading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20 transition disabled:opacity-50"
              >
                {isSheetsLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{isTamil ? 'கூகுள் ஷீட்ஸ் உருவாக்குகிறது...' : 'Creating & Exporting Spreadsheet...'}</span>
                  </>
                ) : (
                  <>
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>{isTamil ? 'Google Sheets-ல் ஏற்றுமதி செய்க' : 'Export & Sync to Google Sheets'}</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* TAB 3: PRINTABLE OMR SHEET */}
          {activeIntegration === 'omr' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-md bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-[#c5a059] mt-0.5">
                    <Printer className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white">
                      {isTamil ? 'அசல் TRB மாதிரி 150-வினா OMR விடைத்தாள்' : 'Authentic 150-Question TRB OMR Answer Sheet (A4 PDF)'}
                    </h3>
                    <p className="text-[11px] text-white/60 mt-0.5 leading-relaxed">
                      {isTamil
                        ? 'உண்மையான தேர்வு சூழலை உணர பேனா-தாள் முறையில் பயிற்சி செய்யக்கூடிய அச்சிடத்தக்க OMR விடைத்தாள் மற்றும் மாதிரி வினாத்தாள்.'
                        : 'Practice offline pen-and-paper bubble filling under authentic 150-minute exam conditions with standard bubble spacing.'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="text-[11px] font-medium text-white/70 block mb-1">
                      {isTamil ? 'தேர்வர் பெயர் (Candidate Name):' : 'Candidate Name:'}
                    </label>
                    <input
                      type="text"
                      value={omrCandidateName}
                      onChange={(e) => setOmrCandidateName(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-[#1a1a1a] border border-[#333] text-xs text-white focus:outline-none focus:border-[#c5a059]"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-white/70 block mb-1">
                      {isTamil ? 'பதிவு எண் (Roll Number):' : 'Roll / Reg Number:'}
                    </label>
                    <input
                      type="text"
                      value={omrRollNo}
                      onChange={(e) => setOmrRollNo(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-[#1a1a1a] border border-[#333] text-xs text-white focus:outline-none focus:border-[#c5a059]"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <label className="flex items-center gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={includeBooklet}
                      onChange={(e) => setIncludeBooklet(e.target.checked)}
                      className="w-4 h-4 accent-[#c5a059] rounded"
                    />
                    <span className="text-xs text-white/80">
                      {isTamil
                        ? 'OMR உடன் SCERT மாதிரி வினாத்தாள் பக்கங்களையும் இணைக்கவும்'
                        : 'Append Printable SCERT Practice Question Booklet pages'}
                    </span>
                  </label>
                </div>
              </div>

              <button
                onClick={handleGenerateOMR}
                disabled={isOMRGenerating}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#c5a059] to-[#9b7b37] hover:from-[#d8b46d] hover:to-[#ae8b3e] text-black font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#c5a059]/10 transition disabled:opacity-50"
              >
                {isOMRGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{isTamil ? 'PDF உருவாக்குகிறது...' : 'Generating Printable PDF...'}</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>{isTamil ? '150Q OMR விடைத்தாள் PDF பதிவிறக்குக' : 'Download Printable 150Q OMR Sheet (PDF)'}</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-white/10 bg-[#0e0e0e] flex items-center justify-between text-[11px] text-white/40">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>{isTamil ? 'பாதுகாப்பான கூகுள் அங்கீகாரம் (Secure OAuth 2.0)' : 'Client-side Secure Google OAuth 2.0'}</span>
          </div>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white transition"
          >
            {isTamil ? 'மூடுக' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
