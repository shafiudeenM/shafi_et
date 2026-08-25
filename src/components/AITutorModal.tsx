import React, { useState, useEffect, useRef } from 'react';
import { LanguageMode } from '../types';
import { askTutorChat, getTutorExplanation } from '../services/tutorApi';
import { 
  Brain, 
  Sparkles, 
  Send, 
  X, 
  BookOpen, 
  AlertTriangle, 
  CheckCircle, 
  Loader2,
  Volume2,
  RotateCcw
} from 'lucide-react';
import Markdown from 'react-markdown';

interface AITutorModalProps {
  isOpen: boolean;
  onClose: () => void;
  topicName?: string;
  languageMode: LanguageMode;
}

interface Message {
  role: 'user' | 'model';
  content: string;
}

export const AITutorModal: React.FC<AITutorModalProps> = ({
  isOpen,
  onClose,
  topicName = 'Piaget vs Vygotsky Cognitive Development',
  languageMode,
}) => {
  const isTamil = languageMode === 'tamil';

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [structuredExplanation, setStructuredExplanation] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && topicName) {
      loadInitialTopic(topicName);
    }
  }, [isOpen, topicName]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const loadInitialTopic = async (topic: string) => {
    setIsLoading(true);
    setStructuredExplanation(null);
    setMessages([]);

    try {
      const response = await getTutorExplanation(topic, languageMode);
      if (response && response.explanation) {
        setStructuredExplanation(response.explanation);
        setMessages([
          {
            role: 'model',
            content: isTamil
              ? `வணக்கம்! **${topic}** தலைப்பில் உங்களுக்கு என்ன சந்தேகம் இருந்தாலும் தயங்காமல் கேளுங்கள். SCERT பாடநூல் அடிப்படையில் தமிழில் எளிய உதாரணங்களுடன் விளக்குகிறேன்.`
              : `Hello! I am your TNTET AI Coach for **${topic}**. Ask me any doubt or concept clarification in Tamil, English, or Tanglish.`,
          },
        ]);
      }
    } catch (err) {
      console.error(err);
      setMessages([
        {
          role: 'model',
          content: isTamil
            ? `வணக்கம்! **${topic}** தலைப்பில் உங்கள் சந்தேகங்களை கேளுங்கள்.`
            : `Hello! Ask any question about **${topic}**.`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMsg = inputText.trim();
    setInputText('');
    const newMessages: Message[] = [...messages, { role: 'user', content: userMsg }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const reply = await askTutorChat(
        newMessages.map((m) => ({ role: m.role, content: m.content })),
        topicName,
        languageMode
      );
      setMessages([...newMessages, { role: 'model', content: reply }]);
    } catch (error) {
      setMessages([
        ...newMessages,
        {
          role: 'model',
          content: isTamil
            ? 'மன்னிக்கவும், தகவல் தொடர்பில் பிழை ஏற்பட்டது. தயவுசெய்து மீண்டும் முயற்சிக்கவும்.'
            : 'Sorry, unable to get response. Please try again.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#0a0a0a]/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5">
      <div className="bg-[#121212] border border-[#262626] rounded-2xl max-w-3xl w-full h-[88vh] max-h-[750px] shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#262626] bg-[#181818] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#c5a059]/15 text-[#c5a059] border border-[#c5a059]/30">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-serif font-bold text-white">
                  {isTamil ? 'தமிழ் AI தனிப்பயிற்சி ஆசிரியர்' : 'Tamil-First AI TNTET Tutor'}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#c5a059]/15 text-[#c5a059] border border-[#c5a059]/30">
                  SCERT Grounded
                </span>
              </div>
              <p className="text-xs text-[#a3a3a3] font-medium truncate max-w-md">
                {topicName}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#a3a3a3] hover:text-white hover:bg-[#262626] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 text-xs sm:text-sm">
          {/* Structured Concept Card if available */}
          {structuredExplanation && (
            <div className="p-4 rounded-xl bg-[#181818] border border-[#262626] space-y-3">
              <div className="flex items-center gap-2 font-bold text-[#c5a059]">
                <Sparkles className="w-4 h-4 text-[#c5a059]" />
                <span>{structuredExplanation.title}</span>
              </div>

              <div className="text-[#d4d4d4] leading-relaxed font-medium space-y-2">
                <div className="markdown-body">
                  <Markdown>{structuredExplanation.conceptTamil}</Markdown>
                </div>
                <p className="text-[#a3a3a3] italic">
                  {structuredExplanation.conceptEnglish}
                </p>
              </div>

              {structuredExplanation.memoryTip && (
                <div className="p-3 rounded-lg bg-[#c5a059]/10 border border-[#c5a059]/30 text-[#c5a059] text-xs font-medium">
                  <strong>{isTamil ? 'நினைவு உத்தி (Memory Hack): ' : 'Memory Mnemonic: '}</strong>
                  {structuredExplanation.memoryTip}
                </div>
              )}
            </div>
          )}

          {/* Chat Messages */}
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.role === 'model' && (
                <div className="w-7 h-7 rounded-lg bg-[#c5a059]/15 text-[#c5a059] border border-[#c5a059]/30 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold font-serif">
                  AI
                </div>
              )}

              <div
                className={`max-w-[82%] p-3.5 rounded-2xl ${
                  m.role === 'user'
                    ? 'bg-[#c5a059] text-[#0a0a0a] font-bold rounded-tr-sm shadow-md'
                    : 'bg-[#181818] border border-[#262626] text-[#d4d4d4] rounded-tl-sm space-y-1.5'
                }`}
              >
                <div className="markdown-body leading-relaxed">
                  <Markdown>{m.content}</Markdown>
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-2 items-center text-[#c5a059] text-xs font-bold pl-2">
              <Loader2 className="w-4 h-4 animate-spin text-[#c5a059]" />
              <span>{isTamil ? 'AI ஆசிரியர் சிந்திக்கிறார்...' : 'AI Tutor is generating Tamil explanation...'}</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Prompt Input Bar */}
        <div className="p-3 sm:p-4 border-t border-[#262626] bg-[#181818]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={
                isTamil
                  ? 'தமிழில் உங்கள் சந்தேகத்தை தட்டச்சு செய்க... (எ.கா: பியாஜே vs வைகோட்ஸ்கி வித்தியாசம்)'
                  : 'Ask in Tamil or English... (e.g., Explain difference with examples)'
              }
              className="flex-1 px-4 py-3 rounded-xl bg-[#121212] border border-[#262626] text-xs sm:text-sm text-white placeholder-[#737373] focus:outline-none focus:border-[#c5a059]"
            />

            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              className="p-3 rounded-xl bg-[#c5a059] hover:bg-[#d4b068] text-[#0a0a0a] font-bold disabled:opacity-30 transition shadow-lg shadow-[#c5a059]/20 shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
