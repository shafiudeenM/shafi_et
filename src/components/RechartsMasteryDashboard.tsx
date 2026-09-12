import React, { useState } from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  BarChart, 
  Bar, 
  Cell, 
  RadarChart, 
  Radar, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis,
  Legend
} from 'recharts';
import { TopicMastery, ReadinessScoreBreakdown, LanguageMode, UserInteraction } from '../types';
import { TrendingUp, BarChart2, Activity, Layers, LineChart } from 'lucide-react';

interface RechartsMasteryDashboardProps {
  topicMasteries: TopicMastery[];
  readiness: ReadinessScoreBreakdown;
  languageMode: LanguageMode;
  userInteractions?: UserInteraction[];
}

export const RechartsMasteryDashboard: React.FC<RechartsMasteryDashboardProps> = ({
  topicMasteries,
  readiness,
  languageMode,
  userInteractions = [],
}) => {
  const isTamil = languageMode === 'tamil';
  const [chartView, setChartView] = useState<'timeline' | 'topics' | 'radar'>('timeline');

  // Real trajectory: accuracy per practice day, bucketed from actual interactions.
  const dailyMap = new Map<number, { day: string; correct: number; total: number }>();
  for (const entry of userInteractions) {
    const d = new Date(entry.timestamp);
    const dayKey = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    const label = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    const bucket = dailyMap.get(dayKey) || { day: label, correct: 0, total: 0 };
    bucket.total += 1;
    if (entry.isCorrect) bucket.correct += 1;
    dailyMap.set(dayKey, bucket);
  }
  const trajectoryData = [...dailyMap.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([, v]) => ({
      day: v.day,
      accuracy: v.total > 0 ? Math.round((v.correct / v.total) * 100) : 0,
      attempts: v.total,
    }));
  const hasTrajectory = trajectoryData.length >= 2;
  const totalPracticedDays = dailyMap.size;

  // Topic Performance Data for Bar Chart
  const topicData = topicMasteries.slice(0, 8).map((t) => ({
    name: isTamil ? t.topicNameTa : t.topicNameEn.slice(0, 16),
    fullName: isTamil ? t.topicNameTa : t.topicNameEn,
    mastery: t.masteryPercent,
    subject: t.subjectId.toUpperCase(),
  }));

  // Radar chart data for subjects
  const radarData = readiness.subjectScores.map((s) => ({
    subject: isTamil ? s.subjectNameTa : s.subjectNameEn,
    mastery: s.masteryPercent,
    target: 80,
    fullMark: 100,
  }));

  return (
    <div className="bg-[#121212] border border-white/10 rounded-xl p-5 sm:p-6 shadow-xl space-y-4">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#c5a059]/10 border border-[#c5a059]/30 flex items-center justify-center text-[#c5a059]">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">
              {isTamil ? 'செயல்திறன் & தேர்ச்சி வரைபடங்கள்' : 'Mastery & Trajectory Analytics'}
            </h3>
            <p className="text-[11px] text-white/50">
              {isTamil ? 'முன்னேற்றம், பலவீனப் பகுதிகள் மற்றும் பாட ஒப்பீடு' : 'Track score trajectory and syllabus benchmarks'}
            </p>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center bg-white/[0.04] p-1 rounded-lg border border-white/10 text-xs self-start sm:self-auto">
          <button
            onClick={() => setChartView('timeline')}
            className={`px-3 py-1.5 rounded-md font-medium transition flex items-center gap-1.5 ${
              chartView === 'timeline'
                ? 'bg-[#c5a059] text-black font-semibold shadow'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>{isTamil ? 'காலவரிசை' : 'Trajectory'}</span>
          </button>

          <button
            onClick={() => setChartView('topics')}
            className={`px-3 py-1.5 rounded-md font-medium transition flex items-center gap-1.5 ${
              chartView === 'topics'
                ? 'bg-[#c5a059] text-black font-semibold shadow'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>{isTamil ? 'பாடப்பிரிவு' : 'Topics'}</span>
          </button>

          <button
            onClick={() => setChartView('radar')}
            className={`px-3 py-1.5 rounded-md font-medium transition flex items-center gap-1.5 ${
              chartView === 'radar'
                ? 'bg-[#c5a059] text-black font-semibold shadow'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{isTamil ? 'பாட ஒப்பீடு' : 'Subject Radar'}</span>
          </button>
        </div>
      </div>

      {/* Chart Canvas Area */}
      <div className="h-64 w-full pt-1">
        {chartView === 'timeline' && hasTrajectory && (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trajectoryData} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorAccuracy" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
              <XAxis dataKey="day" stroke="#737373" fontSize={11} tickLine={false} />
              <YAxis stroke="#737373" fontSize={11} domain={[0, 100]} tickLine={false} unit="%" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#171717',
                  borderColor: '#333333',
                  borderRadius: '8px',
                  color: '#ffffff',
                  fontSize: '12px',
                }}
                formatter={(value: any, name: any, item: any) => [
                  `${value}%`,
                  `${name} (${item?.payload?.attempts ?? 0} Q answered)`,
                ]}
              />
              <Legend verticalAlign="top" height={32} wrapperStyle={{ fontSize: '11px', color: '#a3a3a3' }} />
              <Area
                type="monotone"
                dataKey="accuracy"
                name={isTamil ? 'தினசரி துல்லியம் (%)' : 'Daily Accuracy (%)'}
                stroke="#10b981"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorAccuracy)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}

        {chartView === 'timeline' && !hasTrajectory && (
          <div className="h-full w-full flex flex-col items-center justify-center text-center px-6">
            <div className="w-12 h-12 rounded-full bg-white/[0.04] border border-white/10 flex items-center justify-center text-emerald-400 mb-3">
              <LineChart className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-white">
              {isTamil ? 'உண்மையான முன்னேற்ற வரைபடம் இங்கே தோன்றும்' : 'Your real progress trajectory appears here'}
            </p>
            <p className="text-xs text-white/50 mt-1 max-w-sm leading-relaxed">
              {isTamil
                ? `${
                    userInteractions.length === 0
                      ? 'ஒரு தினசரி பயிற்சியை முடித்தவுடன், ஒவ்வொரு நாளும் உங்கள் சரியான விடை விகிதமும் முயற்சிகளும் இங்கே வரம்பிடப்படும்.'
                      : 'தினமும் குறைந்தது 2 நாட்களாவது பயிற்சி செய்யுங்கள், பின்னர் உங்கள் தினசரி துல்லியப் போக்கு இங்கே தோன்றும்.'
                  }`
                : `${
                    userInteractions.length === 0
                      ? 'After you finish your first daily workout, each practice day is plotted here with your real accuracy and question count.'
                      : 'Answer practice sets on at least 2 different days and your real daily accuracy trend will appear here.'
                  }`}
            </p>
            {totalPracticedDays === 0 && (
              <p className="text-[10px] uppercase tracking-wider text-white/30 mt-3">
                {isTamil ? 'எந்த தரவுகளும் இதுவரை இல்லை' : 'No practice data recorded yet'}
              </p>
            )}
          </div>
        )}

        {chartView === 'topics' && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topicData} margin={{ top: 10, right: 15, left: -20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
              <XAxis 
                dataKey="name" 
                stroke="#737373" 
                fontSize={10} 
                tickLine={false}
                interval={0}
                angle={-15}
                textAnchor="end"
              />
              <YAxis stroke="#737373" fontSize={11} domain={[0, 100]} tickLine={false} unit="%" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#171717',
                  borderColor: '#333333',
                  borderRadius: '8px',
                  color: '#ffffff',
                  fontSize: '12px',
                }}
                formatter={(value: any) => [`${value}% Mastery`, 'Mastery']}
                labelFormatter={(_, payload) => payload?.[0]?.payload?.fullName || ''}
              />
              <Bar dataKey="mastery" radius={[4, 4, 0, 0]}>
                {topicData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.mastery >= 75 ? '#10b981' : entry.mastery >= 55 ? '#c5a059' : '#f43f5e'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}

        {chartView === 'radar' && (
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
              <PolarGrid stroke="#333333" />
              <PolarAngleAxis dataKey="subject" stroke="#a3a3a3" fontSize={11} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#525252" fontSize={9} />
              <Radar
                name={isTamil ? 'தற்போதைய தேர்ச்சி' : 'Current Mastery'}
                dataKey="mastery"
                stroke="#c5a059"
                fill="#c5a059"
                fillOpacity={0.35}
              />
              <Radar
                name={isTamil ? 'இலக்கு (80%)' : 'Exam Target (80%)'}
                dataKey="target"
                stroke="#10b981"
                fill="#10b981"
                fillOpacity={0.05}
                strokeDasharray="4 4"
              />
              <Legend wrapperStyle={{ fontSize: '11px', color: '#a3a3a3' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#171717',
                  borderColor: '#333333',
                  borderRadius: '8px',
                  color: '#ffffff',
                  fontSize: '12px',
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Legend / Status summary */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/[0.06] text-xs text-white/50">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-white/80">{isTamil ? 'தேர்வுக்கு தயார் (≥75%)' : 'Exam Ready (≥75%)'}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#c5a059]" />
            <span className="text-white/80">{isTamil ? 'வளர்ச்சி நிலை (55-74%)' : 'Developing (55-74%)'}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-400" />
            <span className="text-white/80">{isTamil ? 'கவனம் தேவை (<55%)' : 'Needs Review (<55%)'}</span>
          </span>
        </div>

        <span className="text-white/40">
          {topicMasteries.length} {isTamil ? 'பாடத் தலைப்புகள் பகுப்பாய்வு செய்யப்பட்டது' : 'SCERT sub-topics mapped'}
        </span>
      </div>
    </div>
  );
};
