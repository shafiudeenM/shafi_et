import { Question, LanguageMode } from '../types';

export interface AITutorExplanationResponse {
  success: boolean;
  data?: {
    conceptExplanation: string;
    distractorAnalysis: string;
    trbKeyRule: string;
    threeCheckQuestions: {
      question: string;
      options: string[];
      correctIndex: number;
      shortExplanation: string;
    }[];
  };
  explanation?: any;
  pedagogicalTip?: string;
  error?: string;
}

export async function fetchAITutorExplanation(
  question: Question,
  selectedOptionText: string,
  correctOptionText: string,
  languageMode: LanguageMode
): Promise<AITutorExplanationResponse> {
  try {
    const res = await fetch('/api/tutor/explain', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question: {
          text: languageMode === 'tamil' ? question.questionTa : question.questionEn,
          options: languageMode === 'tamil' ? question.optionsTa : question.optionsEn,
        },
        selectedOption: selectedOptionText,
        correctOption: correctOptionText,
        subject: question.subject,
        topic: question.topic,
        languageMode,
      }),
    });

    if (!res.ok) {
      throw new Error(`HTTP error ${res.status}`);
    }

    return await res.json();
  } catch (err: any) {
    console.error('Failed to fetch AI tutor explanation:', err);
    return {
      success: true,
      explanation: languageMode === 'tamil' 
        ? question.explanationTa 
        : question.explanationEn,
      pedagogicalTip: languageMode === 'tamil'
        ? question.conceptSummaryTa
        : question.conceptSummaryEn,
      data: {
        conceptExplanation: languageMode === 'tamil' ? question.explanationTa : question.explanationEn,
        distractorAnalysis: languageMode === 'tamil' 
          ? `தேர்ந்தெடுக்கப்பட்ட விடை ஒரு பொதுவான குழப்பமாகும். சரியான விடை: ${correctOptionText}`
          : `The chosen option is a common trap. Accurate concept: ${correctOptionText}`,
        trbKeyRule: languageMode === 'tamil' ? question.conceptSummaryTa : question.conceptSummaryEn,
        threeCheckQuestions: [
          {
            question: languageMode === 'tamil' ? `${question.topic} - இதன் முக்கிய கருத்து என்ன?` : `Core rule of ${question.topic}:`,
            options: languageMode === 'tamil' ? question.optionsTa : question.optionsEn,
            correctIndex: question.correctOptionIndex,
            shortExplanation: languageMode === 'tamil' ? question.explanationTa : question.explanationEn,
          }
        ]
      }
    };
  }
}

export async function getTutorExplanation(topic: string, languageMode: LanguageMode): Promise<{ success: boolean; explanation?: any }> {
  try {
    const res = await fetch('/api/tutor/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: `Explain key TNTET exam points for topic: ${topic}. Give summary in Tamil and English with mnemonic memory hack.`,
        context: { topic },
        languageMode,
      }),
    });

    if (!res.ok) throw new Error('API error');
    const data = await res.json();
    return {
      success: true,
      explanation: {
        title: topic,
        conceptTamil: data.reply || `${topic} - SCERT பாடநூல் கருத்துக்கள்`,
        conceptEnglish: `Key TNTET Pedagogical and Subject Core for ${topic}`,
        memoryTip: languageMode === 'tamil' ? 'முக்கிய சொற்களை நினைவு அட்டவணை வடிவில் பயிற்சி செய்க.' : 'Focus on keywords and core definitions.',
      },
    };
  } catch (err) {
    return {
      success: true,
      explanation: {
        title: topic,
        conceptTamil: `${topic}: தமிழ்நாடு ஆசிரியர் தேர்வு வாரிய (TRB) வழிகாட்டுதல் படி, அடிப்படைக் கோட்பாடுகளை புரிந்து கொள்வது அவசியமாகும்.`,
        conceptEnglish: `${topic}: Grounded in SCERT standards with emphasis on clear conceptual distinction.`,
        memoryTip: 'Link theoretical concepts to classroom teaching examples.',
      },
    };
  }
}

export async function askTutorChat(
  messages: { role: string; content: string }[],
  topic: string,
  languageMode: LanguageMode
): Promise<string> {
  try {
    const latestUserMsg = messages[messages.length - 1]?.content || '';
    const res = await fetch('/api/tutor/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: latestUserMsg,
        context: { topic },
        languageMode,
      }),
    });

    if (!res.ok) throw new Error('Chat failed');
    const data = await res.json();
    return data.reply || (languageMode === 'tamil' ? 'புரிந்தது. மேலும் கேட்கலாம்.' : 'Got it. Feel free to ask more.');
  } catch (err) {
    return languageMode === 'tamil'
      ? 'TNTET தேர்வில் இக்கருத்து அடிக்கடி கேட்கப்படுகிறது. மாதிரி வினாக்களை கவனமாக பயிற்சி செய்யவும்.'
      : 'This concept is frequently tested in TNTET. Practice related PYQs to solidify understanding.';
  }
}

export async function sendAITutorChatMessage(
  message: string,
  context: { paper: string; subject?: string; topic?: string; weakTopic?: string },
  languageMode: LanguageMode
): Promise<{ success: boolean; reply: string }> {
  try {
    const res = await fetch('/api/tutor/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, context, languageMode }),
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err: any) {
    console.error('Chat error:', err);
    return {
      success: true,
      reply: languageMode === 'tamil'
        ? 'TNTET பாடத்திட்டத்திற்குரிய முக்கிய கருத்துக்களை தொடர்ச்சியாக திருப்புதல் செய்யுங்கள். குறிப்பிட்ட வினாக்களை பயிற்சி செய்ய தயங்காதீர்கள்!'
        : 'Keep revising SCERT high-yield topics. Let me know any specific formula or pedagogical concept you would like to clarify!'
    };
  }
}

export async function fetchDiagnosticPrescription(
  results: any,
  paper: string,
  languageMode: LanguageMode
): Promise<string> {
  try {
    const res = await fetch('/api/diagnose/prescribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ results, paper, languageMode }),
    });
    if (!res.ok) throw new Error('API error');
    const data = await res.json();
    return data.prescription || '';
  } catch {
    return languageMode === 'tamil'
      ? 'குறை கண்டறி தேர்வு முடிவுகளின்படி, பலவீனமான பகுதிகளில் தினசரி 35 நிமிட பயிற்சி மேற்கொள்ளவும்.'
      : 'Follow the generated daily session plan to close identified concept gaps.';
  }
}
