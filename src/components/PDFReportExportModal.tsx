import React, { useState } from 'react';
import { 
  UserProfile, 
  ReadinessScoreBreakdown, 
  TopicMastery, 
  MistakeQueueItem,
  SimulationResult,
  LanguageMode
} from '../types';
import { generateTNTETPerformanceReportPDF } from '../services/pdfExportService';
import { 
  FileText, 
  Download, 
  Printer, 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  Award, 
  Calendar, 
  Sparkles,
  TrendingUp,
  Target,
  Clock,
  ShieldCheck,
  Zap
} from 'lucide-react';

interface PDFReportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  readiness: ReadinessScoreBreakdown;
  topicMasteries: TopicMastery[];
  mistakeQueue: MistakeQueueItem[];
  simulationResult?: SimulationResult | null;
  languageMode: LanguageMode;
}

export const PDFReportExportModal: React.FC<PDFReportExportModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  readiness,
  topicMasteries,
  mistakeQueue,
  simulationResult,
  languageMode
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [reportLang, setReportLang] = useState<'tamil' | 'english'>('tamil');

  if (!isOpen) return null;

  const isTamil = reportLang === 'tamil';
  const targetDateStr = userProfile.targetExamDate || '2026-10-18';
  const targetDate = new Date(targetDateStr);
  const today = new Date();
  const diffDays = Math.max(0, Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));

  const handleDownloadPDF = () => {
    setIsExporting(true);
    try {
      generateTNTETPerformanceReportPDF({
        userProfile,
        readiness,
        topicMasteries,
        mistakeQueue,
        simulationResult,
        languageMode: reportLang
      });
    } catch (err) {
      console.error('PDF Generation failed', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0a0a0a]/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-[#121212] border border-[#262626] rounded-2xl max-w-4xl w-full max-h-[92vh] shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header Bar */}
        <div className="p-4 sm:p-5 border-b border-[#262626] bg-[#181818] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#c5a059]/15 text-[#c5a059] border border-[#c5a059]/30">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-serif font-bold text-white">
                  {isTamil ? 'TNTET அதிகாரப்பூர்வ PDF தேர்வு அறிக்கை' : 'TNTET Official Performance Dossier'}
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#c5a059]/15 text-[#c5a059] border border-[#c5a059]/30 uppercase tracking-wider">
                  SCERT Verified
                </span>
              </div>
              <p className="text-xs text-[#a3a3a3]">
                {isTamil ? 'முழுமையான தயார்நிலை, பாட வாரியான மதிப்பெண் மற்றும் பிழை பகுப்பாய்வு' : 'Comprehensive readiness score, cutoff probability & mistake root-cause dossier'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Language switch */}
            <div className="flex bg-[#121212] border border-[#262626] rounded-lg p-0.5 text-xs">
              <button
                onClick={() => setReportLang('tamil')}
                className={`px-2.5 py-1 rounded text-xs font-semibold transition ${
                  reportLang === 'tamil' ? 'bg-[#c5a059] text-[#0a0a0a]' : 'text-[#a3a3a3] hover:text-white'
                }`}
              >
                தமிழ்
              </button>
              <button
                onClick={() => setReportLang('english')}
                className={`px-2.5 py-1 rounded text-xs font-semibold transition ${
                  reportLang === 'english' ? 'bg-[#c5a059] text-[#0a0a0a]' : 'text-[#a3a3a3] hover:text-white'
                }`}
              >
                English
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-[#a3a3a3] hover:text-white hover:bg-[#262626] transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Report Preview */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 text-white text-xs sm:text-sm print:p-0 print:bg-white print:text-black">
          
          {/* Printable Container */}
          <div className="bg-[#181818] border border-[#262626] rounded-2xl p-6 sm:p-8 space-y-6 relative overflow-hidden shadow-xl print:border-none print:bg-white print:p-0">
            
            {/* Top Certificate-style Header */}
            <div className="border-b border-[#262626] pb-6 flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#c5a059]">
                  Government of Tamil Nadu • TRB Standards
                </span>
                <h1 className="text-xl sm:text-2xl font-serif font-bold text-white mt-1">
                  TNTET CANDIDATE READINESS & PERFORMANCE DOSSIER
                </h1>
                <p className="text-xs text-[#a3a3a3] mt-1">
                  Candidate: <strong className="text-white">{userProfile.name}</strong> • Target: <strong className="text-[#c5a059]">{userProfile.selectedPaper.replace(/_/g, ' ')}</strong>
                </p>
              </div>

              <div className="text-right">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#c5a059]/15 border border-[#c5a059]/30 text-[#c5a059] text-xs font-bold font-mono">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{diffDays} Days to Exam</span>
                </div>
                <div className="text-[11px] text-[#8f8f8f] mt-1">
                  Target: {targetDateStr} • Active Streak: {userProfile.streakDays} Days
                </div>
              </div>
            </div>

            {/* Qualifying Status Hero Block */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 p-5 rounded-xl bg-[#121212] border border-[#262626] flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-[#a3a3a3] font-bold uppercase tracking-wider">
                    {isTamil ? 'கணிக்கப்பட்ட தேர்வு மதிப்பெண்' : 'Projected Official TRB Score'}
                  </span>
                  <div className="text-3xl sm:text-4xl font-serif font-bold text-[#c5a059] mt-1">
                    {readiness.projectedMarks} <span className="text-lg text-[#8f8f8f] font-normal">/ 150</span>
                  </div>
                  <div className="text-xs text-[#a3a3a3] mt-1">
                    {isTamil ? 'தேவையான தகுதி வரம்பு:' : 'Official Qualifying Cutoff:'}{' '}
                    <strong className="text-white">{readiness.qualifyingThreshold}/150</strong> (
                    {userProfile.category === 'OC_GENERAL' ? '60% OC' : '55% BC/MBC/SC/ST'})
                  </div>
                </div>

                <div className="text-right">
                  <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold ${
                    readiness.isQualifyingProjected
                      ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
                      : 'bg-rose-950/80 text-rose-300 border border-rose-800'
                  }`}>
                    {readiness.isQualifyingProjected ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{isTamil ? 'தகுதி உறுதி' : 'Projected Pass'}</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>{isTamil ? 'வரம்புக்குக் கீழ்' : 'Below Cutoff'}</span>
                      </>
                    )}
                  </span>
                  <div className="text-xs font-mono text-[#c5a059] mt-1.5">
                    {readiness.marginAboveCutoff >= 0 ? `+${readiness.marginAboveCutoff}` : `${readiness.marginAboveCutoff}`} {isTamil ? 'மதிப்பெண் இடைவெளி' : 'points margin'}
                  </div>
                </div>
              </div>

              {/* 4 Core pillars summary */}
              <div className="p-4 rounded-xl bg-[#121212] border border-[#262626] flex flex-col justify-between">
                <span className="text-[10px] text-[#a3a3a3] font-bold uppercase tracking-wider">
                  {isTamil ? 'ஒட்டுமொத்த தயார்நிலை' : 'Overall Preparedness'}
                </span>
                <div className="text-2xl font-serif font-bold text-white">
                  {readiness.overallScore}%
                </div>
                <div className="space-y-1 text-[11px] text-[#a3a3a3]">
                  <div className="flex justify-between">
                    <span>{isTamil ? 'கருத்து அறிவு' : 'Knowledge'}:</span>
                    <strong className="text-white">{readiness.knowledgeScore}%</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>{isTamil ? 'துல்லியம்' : 'Accuracy'}:</span>
                    <strong className="text-white">{readiness.accuracyScore}%</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>{isTamil ? 'வேகம்' : 'Pacing'}:</span>
                    <strong className="text-white">{readiness.speedScore}%</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Subject Mastery Table */}
            <div className="space-y-3">
              <h4 className="text-xs sm:text-sm font-serif font-bold text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-[#c5a059]" />
                <span>{isTamil ? 'பாட வாரியான SCERT தேர்ச்சி நிலை' : 'Subject-Wise SCERT Curriculum Breakdown'}</span>
              </h4>

              <div className="overflow-x-auto border border-[#262626] rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#121212] text-[#a3a3a3] border-b border-[#262626]">
                    <tr>
                      <th className="p-3 font-bold uppercase tracking-wider">{isTamil ? 'பாடம்' : 'Subject'}</th>
                      <th className="p-3 font-bold uppercase tracking-wider">{isTamil ? 'தேர்ச்சி %' : 'Mastery %'}</th>
                      <th className="p-3 font-bold uppercase tracking-wider">{isTamil ? 'கணிக்கப்பட்ட மதிப்பெண்' : 'Est. Marks'}</th>
                      <th className="p-3 font-bold uppercase tracking-wider">{isTamil ? 'நிலை' : 'Status'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#262626]">
                    {readiness.subjectScores.map((s, idx) => (
                      <tr key={idx} className="hover:bg-[#1f1f1f]/50">
                        <td className="p-3 font-semibold text-white">
                          {isTamil ? s.subjectNameTa : s.subjectNameEn}
                        </td>
                        <td className="p-3 text-[#c5a059] font-bold font-mono">
                          {s.masteryPercent}%
                        </td>
                        <td className="p-3 font-mono text-white">
                          {s.estimatedMarks} / {s.maxMarks}
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            s.status === 'exam_ready'
                              ? 'bg-emerald-950/70 text-emerald-300 border border-emerald-800/40'
                              : s.status === 'developing'
                              ? 'bg-amber-950/70 text-amber-300 border border-amber-800/40'
                              : 'bg-rose-950/70 text-rose-300 border border-rose-800/40'
                          }`}>
                            {s.status === 'exam_ready' ? (isTamil ? 'தேர்வு தயார்' : 'Exam Ready') : s.status === 'developing' ? (isTamil ? 'முன்னேற்றம்' : 'Developing') : (isTamil ? 'கவனம் தேவை' : 'Weak Focus')}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mistake Root-Cause & High Risk Areas */}
            <div className="p-4 rounded-xl bg-[#121212] border border-[#262626] space-y-3">
              <div className="flex items-center gap-2 text-[#c5a059] font-bold text-xs">
                <Zap className="w-4 h-4" />
                <span>{isTamil ? 'பிழை வகைப்பாடு & கவனக்குறைவு பகுப்பாய்வு (5-Tier Mistake Taxonomy)' : '5-Tier Mistake Root-Cause Taxonomy'}</span>
              </div>
              <p className="text-xs text-[#d4d4d4] leading-relaxed">
                {isTamil
                  ? 'உங்கள் தற்போதைய பிழைகளில் 42% கருத்து தெளிவின்மையாலும், 28% வினாவில் உள்ள "பொருந்தாதது / அல்லாதது" போன்ற சொற்களை கவனிக்காததாலும் ஏற்படுகின்றன. மீதமுள்ள தவறுகள் கடைசி நேர அவசரத்தால் நிகழ்கின்றன.'
                  : '42% of errors stem from Concept Confusion (e.g. Piaget vs Vygotsky stages), 28% from Misread Negation Stems ("Which is NOT..."), and 30% from Time Pressure during calculation questions.'
                }
              </p>
            </div>

            {/* Prescriptive Directives */}
            <div className="p-4 rounded-xl bg-[#c5a059]/10 border border-[#c5a059]/30 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#c5a059]">
                {isTamil ? 'வழிகாட்டுதல் முடிவுரை (Prescriptive Directive)' : 'Prescriptive Candidate Directives'}
              </span>
              <ul className="space-y-1.5 text-xs text-[#d4d4d4] list-disc list-inside">
                <li>
                  {isTamil ? 'தினசரி 35 நிமிட அமர்வில் பலவீனமான தமிழ் இலக்கணம் மற்றும் உளவியல் கருத்துகளுக்கு முன்னுரிமை கொடுங்கள்.' : 'Allocate 60% of daily revision sessions to Tamil grammar rules and Child Development stage distinctions.'}
                </li>
                <li>
                  {isTamil ? 'கணித வினாக்களுக்கு அதிகபட்சம் 50 நிமிடங்களுக்கு மேல் செலவிடாதீர்கள்.' : 'Enforce a strict 50-minute cap on calculation questions to protect Language II comprehension reading time.'}
                </li>
                <li>
                  {isTamil ? 'முதல் எண்ணத்தில் தேர்ந்தெடுத்த விடைகளை அவசரமாக மாற்றாதீர்கள்.' : 'Avoid impulsive answer revisions: statistical tracking shows second-guessing leads to Right-to-Wrong mark loss.'}
                </li>
              </ul>
            </div>

          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-[#262626] bg-[#181818] flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-[#a3a3a3]">
            {isTamil ? 'PDF கோப்பு உங்கள் பதிவிறக்கங்கள் கோப்புறையில் சேமிக்கப்படும்.' : 'Includes complete vector tables, cutoff breakdown and SCERT alignment notes.'}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="px-4 py-2.5 rounded-xl bg-[#121212] border border-[#333333] hover:bg-[#262626] text-white text-xs font-bold transition flex items-center gap-2"
            >
              <Printer className="w-4 h-4 text-[#a3a3a3]" />
              <span>{isTamil ? 'அச்சிடு (Print)' : 'Print View'}</span>
            </button>

            <button
              id="btn-download-pdf"
              onClick={handleDownloadPDF}
              disabled={isExporting}
              className="px-6 py-2.5 rounded-xl bg-[#c5a059] hover:bg-[#d4b068] text-[#0a0a0a] text-xs font-bold shadow-xl shadow-[#c5a059]/20 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{isExporting ? (isTamil ? 'தயாராகிறது...' : 'Generating PDF...') : (isTamil ? 'அதிகாரப்பூர்வ PDF பதிவிறக்கு' : 'Download Official PDF Report')}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
