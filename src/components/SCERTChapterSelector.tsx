import React, { useState, useMemo } from 'react';
import { ChevronRight, ChevronDown, BookOpen, CheckCircle2, Circle, Filter } from 'lucide-react';
import { PaperType, LanguageMode, SubjectId } from '../types';
import { PAPER_I_SYLLABUS, PAPER_II_SYLLABUS, SCERTUnit, SCERTChapter, SCERTTopic } from '../data/questionBankSchema';
import { SUBJECT_METADATA } from '../data/tntetData';
import { useQuestionBank } from '../services/questionBankService';

interface SCERTChapterSelectorProps {
  selectedPaper: PaperType;
  languageMode: LanguageMode;
  onSelectTopics: (topicIds: string[]) => void;
  selectedTopicIds: string[];
}

export const SCERTChapterSelector: React.FC<SCERTChapterSelectorProps> = ({
  selectedPaper,
  languageMode,
  onSelectTopics,
  selectedTopicIds,
}) => {
  const isTamil = languageMode === 'tamil';
  const questions = useQuestionBank();
  const [expandedUnits, setExpandedUnits] = useState<Set<string>>(new Set());
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set());
  const [filterSubject, setFilterSubject] = useState<SubjectId | 'all'>('all');

  // Get relevant units based on selected paper
  const relevantUnits = useMemo(() => {
    if (selectedPaper === 'PAPER_I') {
      return PAPER_I_SYLLABUS;
    }
    if (selectedPaper === 'PAPER_II_MATH_SCI') {
      return PAPER_II_SYLLABUS.filter(s => ['cdp', 'tamil', 'english', 'maths_science'].includes(s.id));
    }
    // PAPER_II_SOC_SCI
    return PAPER_II_SYLLABUS.filter(s => ['cdp', 'tamil', 'english', 'social_science'].includes(s.id));
  }, [selectedPaper]);

  // Count questions per topic from the live question bank
  const questionCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    questions.forEach(q => {
      counts[q.topicId] = (counts[q.topicId] || 0) + 1;
    });
    return counts;
  }, [questions]);

  const toggleUnit = (unitId: string) => {
    setExpandedUnits(prev => {
      const next = new Set(prev);
      if (next.has(unitId)) next.delete(unitId);
      else next.add(unitId);
      return next;
    });
  };

  const toggleChapter = (chapterId: string) => {
    setExpandedChapters(prev => {
      const next = new Set(prev);
      if (next.has(chapterId)) next.delete(chapterId);
      else next.add(chapterId);
      return next;
    });
  };

  const toggleTopic = (topicId: string) => {
    const newSelected = [...selectedTopicIds];
    const idx = newSelected.indexOf(topicId);
    if (idx >= 0) {
      newSelected.splice(idx, 1);
    } else {
      newSelected.push(topicId);
    }
    onSelectTopics(newSelected);
  };

  const selectAllInChapter = (chapter: SCERTChapter) => {
    const topicIds = chapter.topics.map(t => t.id);
    const allSelected = topicIds.every(id => selectedTopicIds.includes(id));

    if (allSelected) {
      onSelectTopics(selectedTopicIds.filter(id => !topicIds.includes(id)));
    } else {
      const newSelected = [...selectedTopicIds.filter(id => !topicIds.includes(id)), ...topicIds];
      onSelectTopics(newSelected);
    }
  };

  const selectAllInUnit = (unit: SCERTUnit) => {
    const allTopicIds = unit.units.flatMap(u => u.topics.map(t => t.id));
    const allSelected = allTopicIds.every(id => selectedTopicIds.includes(id));

    if (allSelected) {
      onSelectTopics(selectedTopicIds.filter(id => !allTopicIds.includes(id)));
    } else {
      onSelectTopics([...selectedTopicIds.filter(id => !allTopicIds.includes(id)), ...allTopicIds]);
    }
  };

  return (
    <div className="bg-[#121212] border border-[#262626] rounded-2xl p-5 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#262626]">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-[#c5a059]" />
          <h3 className="text-sm font-serif font-bold text-white">
            {isTamil ? 'SCERT பாடத்திட்ட தேர்வு' : 'SCERT Chapter Selector'}
          </h3>
        </div>
        <span className="text-[10px] text-[#a3a3a3] font-bold uppercase tracking-wider">
          {selectedTopicIds.length} {isTamil ? 'தேர்ந்தெடுக்கப்பட்டது' : 'selected'}
        </span>
      </div>

      {/* Subject Filter */}
      <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1">
        <Filter className="w-3.5 h-3.5 text-[#a3a3a3] shrink-0" />
        <button
          onClick={() => setFilterSubject('all')}
          className={`px-3 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap transition ${
            filterSubject === 'all'
              ? 'bg-[#c5a059] text-[#0a0a0a]'
              : 'bg-[#181818] text-[#a3a3a3] border border-[#262626] hover:text-white'
          }`}
        >
          {isTamil ? 'அனைத்தும்' : 'All'}
        </button>
        {relevantUnits.map(unit => {
          const meta = SUBJECT_METADATA[unit.id as SubjectId];
          if (!meta) return null;
          return (
            <button
              key={unit.id}
              onClick={() => setFilterSubject(filterSubject === unit.id ? 'all' : unit.id as SubjectId)}
              className={`px-3 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap transition ${
                filterSubject === unit.id
                  ? 'text-white border-2'
                  : 'bg-[#181818] text-[#a3a3a3] border border-[#262626] hover:text-white'
              }`}
              style={filterSubject === unit.id ? { borderColor: meta.color, backgroundColor: `${meta.color}20` } : {}}
            >
              {isTamil ? meta.nameTa : meta.nameEn}
            </button>
          );
        })}
      </div>

      {/* SCERT Unit → Chapter → Topic Tree */}
      <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
        {relevantUnits
          .filter(unit => filterSubject === 'all' || unit.id === filterSubject)
          .map(unit => {
            const meta = SUBJECT_METADATA[unit.id as SubjectId];
            const isExpanded = expandedUnits.has(unit.id);
            const allTopicIds = unit.units.flatMap(u => u.topics.map(t => t.id));
            const selectedCount = allTopicIds.filter(id => selectedTopicIds.includes(id)).length;
            const totalCount = allTopicIds.length;

            return (
              <div key={unit.id} className="border border-[#262626] rounded-xl overflow-hidden">
                {/* Unit Header */}
                <button
                  onClick={() => toggleUnit(unit.id)}
                  className="w-full flex items-center justify-between p-3 bg-[#181818] hover:bg-[#1f1f1f] transition"
                >
                  <div className="flex items-center gap-2">
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-[#a3a3a3]" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-[#a3a3a3]" />
                    )}
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: meta?.color }} />
                    <span className="text-xs font-bold text-white text-left">
                      {isTamil ? meta?.nameTa : meta?.nameEn}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-[#a3a3a3]">
                      {selectedCount}/{totalCount}
                    </span>
                    <button
                      onClick={(e) => { e.stopPropagation(); selectAllInUnit(unit); }}
                      className="px-2 py-0.5 rounded text-[9px] font-bold bg-[#c5a059]/15 text-[#c5a059] hover:bg-[#c5a059]/25 transition"
                    >
                      {selectedCount === totalCount ? (isTamil ? 'நீக்கு' : 'Clear') : (isTamil ? 'அனைத்தும்' : 'All')}
                    </button>
                  </div>
                </button>

                {/* Chapters */}
                {isExpanded && (
                  <div className="p-2 space-y-1 bg-[#0a0a0a]">
                    {unit.units.map(chapter => {
                      const isChapExpanded = expandedChapters.has(chapter.id);
                      const chapTopicIds = chapter.topics.map(t => t.id);
                      const chapSelected = chapTopicIds.filter(id => selectedTopicIds.includes(id)).length;

                      return (
                        <div key={chapter.id} className="rounded-lg overflow-hidden">
                          {/* Chapter Header */}
                          <button
                            onClick={() => toggleChapter(chapter.id)}
                            className="w-full flex items-center justify-between px-3 py-2 hover:bg-[#181818] transition rounded-lg"
                          >
                            <div className="flex items-center gap-2">
                              {isChapExpanded ? (
                                <ChevronDown className="w-3 h-3 text-[#8f8f8f]" />
                              ) : (
                                <ChevronRight className="w-3 h-3 text-[#8f8f8f]" />
                              )}
                              <span className="text-[11px] font-semibold text-[#d4d4d4] text-left">
                                {isTamil ? chapter.nameTa : chapter.nameEn}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={(e) => { e.stopPropagation(); selectAllInChapter(chapter); }}
                                className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#181818] text-[#a3a3a3] hover:text-white transition"
                              >
                                {chapSelected === chapTopicIds.length ? (isTamil ? 'நீக்கு' : 'CLR') : (isTamil ? 'அனைத்தும்' : 'ALL')}
                              </button>
                            </div>
                          </button>

                          {/* Topics */}
                          {isChapExpanded && (
                            <div className="pl-4 pr-2 pb-1 space-y-0.5">
                              {chapter.topics.map(topic => {
                                const isSelected = selectedTopicIds.includes(topic.id);
                                const qCount = questionCounts[topic.id] || 0;

                                return (
                                  <button
                                    key={topic.id}
                                    onClick={() => toggleTopic(topic.id)}
                                    className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left transition ${
                                      isSelected
                                        ? 'bg-[#c5a059]/10 border border-[#c5a059]/40'
                                        : 'hover:bg-[#181818] border border-transparent'
                                    }`}
                                  >
                                    {isSelected ? (
                                      <CheckCircle2 className="w-3.5 h-3.5 text-[#c5a059] shrink-0" />
                                    ) : (
                                      <Circle className="w-3.5 h-3.5 text-[#525252] shrink-0" />
                                    )}
                                    <div className="flex-1 min-w-0">
                                      <span className={`text-[10px] font-semibold block truncate ${isSelected ? 'text-[#c5a059]' : 'text-[#d4d4d4]'}`}>
                                        {isTamil ? topic.nameTa : topic.nameEn}
                                      </span>
                                    </div>
                                    {qCount > 0 && (
                                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${
                                        isSelected ? 'bg-[#c5a059]/20 text-[#c5a059]' : 'bg-[#262626] text-[#8f8f8f]'
                                      }`}>
                                        {qCount}Q
                                      </span>
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
      </div>

      {/* Quick Actions */}
      {selectedTopicIds.length > 0 && (
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#262626]">
          <span className="text-[10px] text-[#a3a3a3]">
            {selectedTopicIds.length} {isTamil ? 'தலைப்புகள் தேர்ந்தெடுக்கப்பட்டன' : 'topics selected'}
          </span>
          <button
            onClick={() => onSelectTopics([])}
            className="px-3 py-1 rounded-lg text-[10px] font-bold bg-[#181818] text-[#a3a3a3] border border-[#262626] hover:text-white transition"
          >
            {isTamil ? 'அனைத்தையும் நீக்கு' : 'Clear All'}
          </button>
        </div>
      )}
    </div>
  );
};
