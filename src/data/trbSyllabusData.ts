// Official TRB TNTET Syllabus Data
// Extracted from: TNTET_Complete_Syllabus_All_Subjects.txt (15,951 lines)
// Source: Tamil Nadu Teacher Recruitment Board (TRB) official syllabus
// Organized by Paper → Subject → Unit → Topic with bilingual keywords

export interface SyllabusTopic {
  id: string;
  nameEn: string;
  nameTa: string;
  keywordEn: string[];
  keywordTa: string[];
}

export interface SyllabusUnit {
  id: string;
  nameEn: string;
  nameTa: string;
  topics: SyllabusTopic[];
}

export interface SyllabusSubject {
  id: string;
  nameEn: string;
  nameTa: string;
  paper: 'PAPER_I' | 'PAPER_II' | 'BOTH';
  ageGroup: string;
  units: SyllabusUnit[];
}

// ============================================================================
// PAPER I — Classes 1 to 5 (Age 6-11)
// ============================================================================

const CDP_PAPER_I: SyllabusSubject = {
  id: 'cdp',
  nameEn: 'Child Development & Pedagogy',
  nameTa: 'குழந்தை வளர்ச்சியும் கற்பித்தல் முறைகளும்',
  paper: 'PAPER_I',
  ageGroup: '6-11',
  units: [
    {
      id: 'cdp_child_dev',
      nameEn: 'Part A: Child Development',
      nameTa: 'பகுதி அ: குழந்தை வளர்ச்சி',
      topics: [
        {
          id: 'cdp_physical_growth',
          nameEn: 'Physical Growth & Development at Primary Level',
          nameTa: 'தொடக்கக் கல்வியின் தொடக்கத்தில் குழந்தைகளின் உடல் வளர்ச்சி',
          keywordEn: ['physical growth', 'motor development', 'neurons', 'symbolic thinking', 'sensory motor', 'pre operational', 'language development', 'home environment', 'cognitive development', 'identity status'],
          keywordTa: ['உடல் வளர்ச்சி', 'நரம்பு', 'சின்ன சிந்தனை', 'உணர்வு மோட்டார்', 'முன்செயல்', 'மொழி வளர்ச்சி', 'வீட்டுச் சூழல்', 'அறிவுசார் வளர்ச்சி'],
        },
        {
          id: 'cdp_social_emotional',
          nameEn: 'Social & Emotional Development at Primary Level',
          nameTa: 'தொடக்கக் கல்வியின் தொடக்கத்தில் சமூக மற்றும் உணர்வு வளர்ச்சி',
          keywordEn: ['self concept', 'social awareness', 'sibling relationship', 'peer relationship', 'play', 'self awareness', 'cultural influence', 'erickson', 'psycho social', 'emotional development', 'affection', 'sympathy', 'laughter', 'anger', 'sadness', 'fear', 'parent child', 'emotion and health'],
          keywordTa: ['தன்னிலை உணர்வு', 'சமூக விழிப்புணர்வு', 'சகோதர உறவு', 'சம வயதினர் உறவு', 'விளையாட்டு', 'சுய விழிப்புணர்வு', 'கலாச்சார தாக்கம்', 'எரிக்சன்', 'உணர்வு வளர்ச்சி'],
        },
        {
          id: 'cdp_physical_intellectual_6_10',
          nameEn: 'Physical & Intellectual Development (6-10 Years)',
          nameTa: 'உடல் & அறிவுசார் வளர்ச்சி (6-10 வயது)',
          keywordEn: ['growth cycles', 'body proportions', 'attention', 'concentration', 'selective attention', 'memory strategies', 'processing speed', 'thinking skills', 'cognitive development', 'concrete operational', 'piaget tasks', 'intelligence', 'intelligence tests', 'creativity'],
          keywordTa: ['வளர்ச்சி சுழற்சிகள்', 'உடல் விகிதங்கள்', 'கவனம்', 'செறிவு', 'நினைவாற்றல்', 'சிந்தனை திறன்கள்', 'குறிப்பிட்ட நிலை', 'அறிவுத் திறன்', 'படைப்பாற்றல்'],
        },
        {
          id: 'cdp_social_emotional_6_10',
          nameEn: 'Social & Emotional Development (6-10 Years)',
          nameTa: 'சமூக & உணர்வு வளர்ச்சி (6-10 வயது)',
          keywordEn: ['social development', 'friendships', 'peer grouping', 'schooling effects', 'emotional patterns', 'maturation', 'learning', 'emotional balance', 'media impact'],
          keywordTa: ['சமூக வளர்ச்சி', 'நட்பு', 'சம குழு', 'பள்ளிக் கல்வி', 'உணர்வு முறைகள்', 'பக்குவம்', 'கற்றல்', 'ஊடக தாக்கம்'],
        },
        {
          id: 'cdp_moral_dev',
          nameEn: 'Moral Development (6-10 Years)',
          nameTa: 'நெறிமுறை வளர்ச்சி (6-10 வயது)',
          keywordEn: ['moral development', 'honesty', 'generosity', 'heroes', 'ideals', 'discipline', 'media influence', 'moral training'],
          keywordTa: ['நெறிமுறை வளர்ச்சி', 'நேர்மை', 'பெருந்தன்மை', 'வீரர்கள்', 'ஒழுக்கம்', 'ஊடக தாக்கம்'],
        },
      ],
    },
    {
      id: 'cdp_learning',
      nameEn: 'Part B: Learning',
      nameTa: 'பகுதி ஆ: கற்றல்',
      topics: [
        {
          id: 'cdp_learning_nature',
          nameEn: 'Nature of Learning',
          nameTa: 'கற்றலின் இயல்பு',
          keywordEn: ['learning', 'dynamic process', 'language learning', 'learning habits', 'diverse situations', 'interactions'],
          keywordTa: ['கற்றல்', 'மாறும் செயல்முறை', 'மொழி கற்றல்', 'கற்றல் பழக்கம்', 'தொடர்புகள்'],
        },
        {
          id: 'cdp_learning_types',
          nameEn: 'Types, Levels & Approaches to Learning',
          nameTa: 'கற்றலின் வகைகள், நிலைகள் & அணுகுமுறைகள்',
          keywordEn: ['types of learning', 'learning hierarchy', 'signal learning', 'stimulus response', 'motor chain', 'verbal chain', 'multiple discrimination', 'concept learning', 'problem solving', 'learning levels', 'behaviourist', 'cognitivist', 'constructivist'],
          keywordTa: ['கற்றல் வகைகள்', 'கற்றல் படிநிலை', 'சிக்னல் கற்றல்', 'தூண்டல் பதில்', 'மோட்டார் சங்கிலி', 'கருத்து கற்றல்', 'நடத்தைவாதி', 'அறிவார்ந்தவாதி', 'கட்டமைப்பாளர்'],
        },
        {
          id: 'cdp_concepts',
          nameEn: 'Concepts and Constructs',
          nameTa: 'கருத்துகள் & கட்டமைப்புகள்',
          keywordEn: ['concept formation', 'materials', 'activities', 'scheme', 'mental representations', 'concept mapping', 'external reality', 'peer exposure', 'media exposure'],
          keywordTa: ['கருத்து உருவாக்கம்', 'பொருட்கள்', 'செயல்பாடுகள்', 'மன பிரதிநிதித்துவம்', 'கருத்து வரைபடம்'],
        },
        {
          id: 'cdp_learning_factors',
          nameEn: 'Factors Contributing to Learning',
          nameTa: 'கற்றலுக்கு பங்களிக்கும் காரணிகள்',
          keywordEn: ['personal factors', 'psychological factors', 'social factors', 'emotional factors', 'school factors', 'learning style', 'teaching strategies', 'teaching learning process', 'teacher personality'],
          keywordTa: ['தனிப்பட்ட காரணிகள்', 'உளவியல் காரணிகள்', 'சமூக காரணிகள்', 'கற்றல் பாணி', 'கற்பித்தல் உத்திகள்'],
        },
        {
          id: 'cdp_constructivist',
          nameEn: 'Constructivist Approach to Learning',
          nameTa: 'கட்டமைப்பு கற்றல் அணுகுமுறை',
          keywordEn: ['constructivist', 'construct meaning', 'personal construction', 'social construction', 'learning to learn', 'zpd', 'zone of proximal development', 'social activity'],
          keywordTa: ['கட்டமைப்பு', 'பொருள் உருவாக்கம்', 'சமூக கட்டமைப்பு', 'கற்றல் கற்றல்', 'அருகிலுள்ள வளர்ச்சி மண்டலம்'],
        },
        {
          id: 'cdp_learning_knowledge',
          nameEn: 'Learning and Knowledge',
          nameTa: 'கற்றல் & அறிவு',
          keywordEn: ['active learner', 'creative activities', 'children voices', 'school knowledge', 'right to learn', 'physical security', 'emotional security', 'conceptual development', 'cognitive readiness', 'recreating knowledge'],
          keywordTa: ['செயல்முறை கற்போர்', 'படைப்பு செயல்பாடுகள்', 'பள்ளி அறிவு', 'கற்கும் உரிமை', 'கருத்து வளர்ச்சி'],
        },
      ],
    },
    {
      id: 'cdp_pedagogy',
      nameEn: 'Part C: Pedagogy',
      nameTa: 'பகுதி இ: கற்பித்தல் முறை',
      topics: [
        {
          id: 'cdp_inclusive',
          nameEn: 'Inclusive Education & Special Needs',
          nameTa: 'உள்ளடக்கிய கல்வி & சிறப்புத் தேவைகள்',
          keywordEn: ['inclusive education', 'mainstreaming', 'integration', 'disability', 'handicap', 'learning disabilities', 'giftedness', 'cwsn', 'special needs', 'early intervention'],
          keywordTa: ['உள்ளடக்கிய கல்வி', 'முதன்மை', 'ஒருங்கிணைப்பு', 'குறைபாடு', 'கற்றல் குறைபாடுகள்', 'சிறப்புத் தேவைகள்'],
        },
        {
          id: 'cdp_child_rights',
          nameEn: 'Child Rights & Education',
          nameTa: 'குழந்தை உரிமைகள் & கல்வி',
          keywordEn: ['child rights', 'right to education', 'unicef', 'crc', 'save children', 'poverty', 'gender bias', 'empowerment'],
          keywordTa: ['குழந்தை உரிமைகள்', 'கல்வி உரிமை', 'யுனிசெப்', 'வறுமை', 'பாலின பாகுபாடு', 'மேம்படுத்தல்'],
        },
        {
          id: 'cdp_gender',
          nameEn: 'Gender as a Social Construct',
          nameTa: 'சமூகக் கட்டமைப்பாக பாலினம்',
          keywordEn: ['gender', 'social construct', 'gender bias', 'gender equality', 'stereotypes', 'gender sensitive', 'empowerment'],
          keywordTa: ['பாலினம்', 'சமூகக் கட்டமைப்பு', 'பாலின பாகுபாடு', 'பாலின சமத்துவம்', 'வேட்டைவாதம்'],
        },
        {
          id: 'cdp_evaluation',
          nameEn: 'Evaluation & Assessment',
          nameTa: 'மதிப்பீடு & தேர்வு',
          keywordEn: ['evaluation', 'assessment', 'continuous', 'comprehensive', 'formative', 'summative', 'portfolio', 'rubrics', 'grading'],
          keywordTa: ['மதிப்பீடு', 'தொடர்ச்சியான', 'விரிவான', 'வடிவமைப்பு', 'சுருக்கம்', 'தர வரிசை'],
        },
        {
          id: 'cdp_tid',
          nameEn: 'Teacher Identity & Development',
          nameTa: 'ஆசிரியர் அடையாளம் & வளர்ச்சி',
          keywordEn: ['teacher identity', 'professional development', 'teacher role', 'teacher qualities', 'reflective practice', 'mentoring'],
          keywordTa: ['ஆசிரியர் அடையாளம்', 'தொழில்முறை வளர்ச்சி', 'ஆசிரியர் பங்கு', 'சிந்தனை நடைமுறை'],
        },
      ],
    },
  ],
};

const TAMIL_PAPER_I: SyllabusSubject = {
  id: 'tamil',
  nameEn: 'Language I — Tamil',
  nameTa: 'மொழி I — தமிழ்',
  paper: 'PAPER_I',
  ageGroup: '6-11',
  units: [
    {
      id: 'tamil_listening',
      nameEn: 'Listening Comprehension',
      nameTa: 'கேட்டுணர் புரிதல்',
      topics: [
        {
          id: 'tamil_listen_rhymes',
          nameEn: 'Listening to Rhymes & Poems',
          nameTa: 'பாடல்கள் & கவிதைகள் கேட்டல்',
          keywordEn: ['rhymes', 'poems', 'songs', 'listening', 'recitation', 'comprehension', 'response'],
          keywordTa: ['பாடல்கள்', 'கவிதைகள்', 'கேட்டல்', 'ஒப்பித்தல்', 'புரிதல்'],
        },
        {
          id: 'tamil_listen_stories',
          nameEn: 'Listening to Stories & Folktales',
          nameTa: 'கதைகள் & நாட்டுப்புறக் கதைகள் கேட்டல்',
          keywordEn: ['stories', 'folktales', 'narration', 'comprehension', 'sequence', 'characters', 'moral'],
          keywordTa: ['கதைகள்', 'நாட்டுப்புறக் கதைகள்', 'விவரணை', 'புரிதல்', 'வரிசை', 'பாத்திரங்கள்'],
        },
        {
          id: 'tamil_listen_instructions',
          nameEn: 'Following Instructions & Directions',
          nameTa: 'வழிகாட்டுதல்கள் & சுட்டுதல்கள் பின்பற்றுதல்',
          keywordEn: ['instructions', 'directions', 'classroom', 'commands', 'classroom language'],
          keywordTa: ['வழிகாட்டுதல்கள்', 'சுட்டுதல்கள்', 'வகுப்பறை', 'உத்தரவுகள்'],
        },
      ],
    },
    {
      id: 'tamil_speaking',
      nameEn: 'Speaking Skills',
      nameTa: 'பேச்சுத் திறன்',
      topics: [
        {
          id: 'tamil_speak_rhymes',
          nameEn: 'Singing Rhymes & Songs',
          nameTa: 'பாடல்கள் & பாடல்கள் பாடுதல்',
          keywordEn: ['singing', 'rhymes', 'songs', 'recitation', 'actions', 'pronunciation'],
          keywordTa: ['பாடுதல்', 'பாடல்கள்', 'ஒப்பித்தல்', 'உச்சரிப்பு'],
        },
        {
          id: 'tamil_speak_conversation',
          nameEn: 'Conversation & Communication',
          nameTa: 'உரையாடல் & தொடர்பு',
          keywordEn: ['conversation', 'communication', 'expressing needs', 'feelings', 'requests', 'greetings', 'introduction'],
          keywordTa: ['உரையாடல்', 'தொடர்பு', 'தேவைகள்', 'உணர்வுகள்', 'கோரிக்கைகள்', 'வாழ்த்துகள்'],
        },
        {
          id: 'tamil_speak_narration',
          nameEn: 'Narration & Description',
          nameTa: 'விவரணை & விளக்கம்',
          keywordEn: ['narration', 'description', 'picture talk', 'story telling', 'sequence', 'events'],
          keywordTa: ['விவரணை', 'படம் பேச்சு', 'கதை சொல்லல்', 'வரிசை', 'நிகழ்வுகள்'],
        },
      ],
    },
    {
      id: 'tamil_reading',
      nameEn: 'Reading Skills',
      nameTa: 'வாசிப்புத் திறன்',
      topics: [
        {
          id: 'tamil_read_letters',
          nameEn: 'Letter Recognition & Phonics',
          nameTa: 'எழுத்து அறிதல் & ஒலியியல்',
          keywordEn: ['letters', 'phonics', 'recognition', 'sounds', 'alphabet', 'vowels', 'consonants'],
          keywordTa: ['எழுத்துகள்', 'ஒலியியல்', 'அறிதல்', 'ஒலிகள்', 'எழுத்து மாலை', 'உயிர்', 'மெய்'],
        },
        {
          id: 'tamil_read_words',
          nameEn: 'Reading Words & Sentences',
          nameTa: 'சொற்கள் & வாக்கியங்கள் வாசித்தல்',
          keywordEn: ['reading', 'words', 'sentences', 'fluency', 'comprehension', 'passage'],
          keywordTa: ['வாசித்தல்', 'சொற்கள்', 'வாக்கியங்கள்', 'சரளம்', 'புரிதல்'],
        },
        {
          id: 'tamil_read_text',
          nameEn: 'Reading Comprehension of Text',
          nameTa: 'பாடப்பகுதி வாசிப்பு புரிதல்',
          keywordEn: ['text comprehension', 'passage', 'questions', 'inference', 'main idea', 'detail', 'vocabulary context'],
          keywordTa: ['பாடப்பகுதி', 'புரிதல்', 'கேள்விகள்', 'ஊகம்', 'முதன்மை கருத்து'],
        },
      ],
    },
    {
      id: 'tamil_writing',
      nameEn: 'Writing Skills',
      nameTa: 'எழுதுதல் திறன்',
      topics: [
        {
          id: 'tamil_write_letters',
          nameEn: 'Letter & Word Writing',
          nameTa: 'எழுத்து & சொல் எழுதுதல்',
          keywordEn: ['writing', 'letters', 'words', 'tracing', 'copying', 'spelling', 'handwriting'],
          keywordTa: ['எழுதுதல்', 'எழுத்துகள்', 'சொற்கள்', 'தடம்', 'நகலெடுப்பு', 'எழுத்துப்பிழை'],
        },
        {
          id: 'tamil_write_sentences',
          nameEn: 'Sentence & Passage Writing',
          nameTa: 'வாக்கியம் & பத்தி எழுதுதல்',
          keywordEn: ['sentences', 'passage', 'creative writing', 'letter writing', 'grammar', 'punctuation'],
          keywordTa: ['வாக்கியங்கள்', 'பத்தி', 'படைப்பு எழுதுதல்', 'கடிதம்', 'இலக்கணம்', 'நிறுத்தற்குறி'],
        },
      ],
    },
    {
      id: 'tamil_vocabulary',
      nameEn: 'Vocabulary & Language Functions',
      nameTa: 'சொல்வளம் & மொழி செயல்பாடுகள்',
      topics: [
        {
          id: 'tamil_vocab_building',
          nameEn: 'Vocabulary Building',
          nameTa: 'சொல்வளம் வளர்த்தல்',
          keywordEn: ['vocabulary', 'synonyms', 'antonyms', 'word meanings', 'dictionary', 'context clues', 'word games'],
          keywordTa: ['சொல்வளம்', 'ஒத்த சொற்கள்', 'எதிர்ச் சொற்கள்', 'சொல் பொருள்', 'அகராதி'],
        },
        {
          id: 'tamil_grammar',
          nameEn: 'Tamil Grammar (Ilakkanam)',
          nameTa: 'தமிழ் இலக்கணம்',
          keywordEn: ['grammar', 'ilakkanam', 'noun', 'verb', 'adjective', 'tense', 'singular plural', 'sandhi', 'kol', 'payirchi'],
          keywordTa: ['இலக்கணம்', 'பெயர்', 'வினை', 'உரிசொல்', 'காலம்', 'ஒன்று பல', 'சந்தி', 'கோல்', 'பயிற்சி'],
        },
        {
          id: 'tamil_language_functions',
          nameEn: 'Language Functions',
          nameTa: 'மொழி செயல்பாடுகள்',
          keywordEn: ['role play', 'dramatization', 'presentation', 'show and tell', 'discussion', 'debate'],
          keywordTa: ['பாத்திரம்', 'நாடகம்', 'காட்சிப்படுத்தல்', 'விவாதம்'],
        },
      ],
    },
  ],
};

const ENGLISH_PAPER_I: SyllabusSubject = {
  id: 'english',
  nameEn: 'Language II — English',
  nameTa: 'மொழி II — ஆங்கிலம்',
  paper: 'PAPER_I',
  ageGroup: '6-11',
  units: [
    {
      id: 'eng_listening',
      nameEn: 'Listening Skills',
      nameTa: 'கேட்டுணர் திறன்',
      topics: [
        {
          id: 'eng_listen_rhymes',
          nameEn: 'Listening to Rhymes & Songs',
          nameTa: 'பாடல்கள் & பாடல்கள் கேட்டல்',
          keywordEn: ['rhymes', 'nursery rhymes', 'jingles', 'songs', 'tune', 'response', 'actions'],
          keywordTa: ['பாடல்கள்', 'பாடல்கள் கேட்டல்', 'இசை', 'பதில்', 'செயல்கள்'],
        },
        {
          id: 'eng_listen_stories',
          nameEn: 'Listening to Stories & Instructions',
          nameTa: 'கதைகள் & வழிகாட்டுதல்கள் கேட்டல்',
          keywordEn: ['stories', 'folktales', 'instructions', 'directions', 'comprehension', 'questions'],
          keywordTa: ['கதைகள்', 'நாட்டுப்புறக் கதைகள்', 'வழிகாட்டுதல்கள்', 'புரிதல்', 'கேள்விகள்'],
        },
      ],
    },
    {
      id: 'eng_speaking',
      nameEn: 'Speaking Skills',
      nameTa: 'பேச்சுத் திறன்',
      topics: [
        {
          id: 'eng_speak_communication',
          nameEn: 'Communication & Conversation',
          nameTa: 'தொடர்பு & உரையாடல்',
          keywordEn: ['communication', 'conversation', 'expressing needs', 'feelings', 'requests', 'greetings', 'introduction'],
          keywordTa: ['தொடர்பு', 'உரையாடல்', 'தேவைகள்', 'உணர்வுகள்', 'கோரிக்கைகள்', 'வாழ்த்துகள்'],
        },
        {
          id: 'eng_speak_fluency',
          nameEn: 'Speaking Fluently & Presentation',
          nameTa: 'சரளமாக பேசுதல் & காட்சிப்படுத்தல்',
          keywordEn: ['fluency', 'presentation', 'show and tell', 'picture talk', 'role play', 'pronunciation'],
          keywordTa: ['சரளம்', 'காட்சிப்படுத்தல்', 'படம் பேச்சு', 'பாத்திரம்', 'உச்சரிப்பு'],
        },
      ],
    },
    {
      id: 'eng_reading',
      nameEn: 'Reading Skills',
      nameTa: 'வாசிப்புத் திறன்',
      topics: [
        {
          id: 'eng_read_phonics',
          nameEn: 'Letter Recognition & Phonics',
          nameTa: 'எழுத்து அறிதல் & ஒலியியல்',
          keywordEn: ['letters', 'phonics', 'sounds', 'alphabet', 'blending', 'digraphs', 'rhyming words'],
          keywordTa: ['எழுத்துகள்', 'ஒலியியல்', 'ஒலிகள்', 'எழுத்து மாலை', 'ஒத்திசைவு'],
        },
        {
          id: 'eng_read_comprehension',
          nameEn: 'Reading Comprehension',
          nameTa: 'வாசிப்பு புரிதல்',
          keywordEn: ['reading', 'comprehension', 'passage', 'questions', 'inference', 'main idea', 'skimming', 'scanning'],
          keywordTa: ['வாசிப்பு', 'புரிதல்', 'பத்தி', 'கேள்விகள்', 'ஊகம்', 'முதன்மை கருத்து'],
        },
      ],
    },
    {
      id: 'eng_writing',
      nameEn: 'Writing Skills',
      nameTa: 'எழுதுதல் திறன்',
      topics: [
        {
          id: 'eng_write_words',
          nameEn: 'Word & Sentence Writing',
          nameTa: 'சொல் & வாக்கியம் எழுதுதல்',
          keywordEn: ['writing', 'words', 'sentences', 'spelling', 'dictation', 'copying', 'handwriting'],
          keywordTa: ['எழுதுதல்', 'சொற்கள்', 'வாக்கியங்கள்', 'எழுத்துப்பிழை', 'நகலெடுப்பு'],
        },
        {
          id: 'eng_write_grammar',
          nameEn: 'Grammar in Writing',
          nameTa: 'எழுத்தில் இலக்கணம்',
          keywordEn: ['grammar', 'nouns', 'verbs', 'adjectives', 'articles', 'prepositions', 'tenses', 'punctuation', 'singular plural'],
          keywordTa: ['இலக்கணம்', 'பெயர்', 'வினை', 'உரிசொல்', 'நிறுத்தற்குறி', 'ஒன்று பல'],
        },
      ],
    },
  ],
};

const MATHS_PAPER_I: SyllabusSubject = {
  id: 'maths',
  nameEn: 'Mathematics',
  nameTa: 'கணிதம்',
  paper: 'PAPER_I',
  ageGroup: '6-11',
  units: [
    {
      id: 'maths_shapes',
      nameEn: 'Shapes & Figures',
      nameTa: 'வடிவங்கள் & உருவங்கள்',
      topics: [
        {
          id: 'maths_2d_shapes',
          nameEn: '2D Shapes & Spatial Understanding',
          nameTa: '2D வடிவங்கள் & இட புரிதல்',
          keywordEn: ['shapes', 'square', 'circle', 'triangle', 'rectangle', 'oval', '2D', '3D', 'spatial orientation', 'edges', 'corners', 'faces', 'cuboid', 'cylinder', 'cone', 'sphere'],
          keywordTa: ['வடிவங்கள்', 'சதுரம்', 'வட்டம்', 'முக்கோணம்', 'செவ்வகம்', 'நீள்வட்டம்', 'இட புரிதல்', 'முகங்கள்', 'கோணங்கள்'],
        },
        {
          id: 'maths_symmetry',
          nameEn: 'Symmetry & Patterns',
          nameTa: 'சமச்சீர் & வடிவங்கள்',
          keywordEn: ['symmetry', 'patterns', 'mirror image', 'line symmetry', 'rotational symmetry', 'geometric patterns'],
          keywordTa: ['சமச்சீர்', 'வடிவங்கள்', 'கண்ணாடி பிம்பம்', 'கோட்டு சமச்சீர்', 'சுழற்சி சமச்சீர்'],
        },
      ],
    },
    {
      id: 'maths_numbers',
      nameEn: 'Numbers & Operations',
      nameTa: 'எண்கள் & செயல்கள்',
      topics: [
        {
          id: 'maths_number_concept',
          nameEn: 'Number Concept & Place Value',
          nameTa: 'எண் கருத்து & இடமதிப்பு',
          keywordEn: ['numbers', 'place value', 'tens', 'ones', 'hundreds', 'zero', 'counting', 'comparison', 'ascending', 'descending', 'predecessor', 'successor', 'odd', 'even'],
          keywordTa: ['எண்கள்', 'இடமதிப்பு', 'பத்துகள்', 'ஒன்றுகள்', 'நூறுகள்', 'சுழற்சி', 'ஒப்பீடு', 'ஏறுவரிசை', 'இறங்குவரிசை', 'ஒற்றை', 'இரட்டை'],
        },
        {
          id: 'maths_addition_subtraction',
          nameEn: 'Addition & Subtraction',
          nameTa: 'கூட்டல் & கழித்தல்',
          keywordEn: ['addition', 'subtraction', 'carry', 'borrow', 'regrouping', 'mental math', 'word problems', 'sum', 'difference'],
          keywordTa: ['கூட்டல்', 'கழித்தல்', 'கடன்', 'மறு குழு', 'மன கணக்கு', 'சொல் கணக்கு'],
        },
        {
          id: 'maths_multiplication',
          nameEn: 'Multiplication & Division',
          nameTa: 'பெருக்கல் & வகுத்தல்',
          keywordEn: ['multiplication', 'division', 'factors', 'multiples', 'tables', 'quotient', 'remainder', 'product', 'divisor'],
          keywordTa: ['பெருக்கல்', 'வகுத்தல்', 'காரணிகள்', 'பெருக்கங்கள்', 'அட்டவணை', 'மீதம்', 'கனம்'],
        },
        {
          id: 'maths_fractions',
          nameEn: 'Fractions & Decimals',
          nameTa: 'பின்னங்கள் & தசம பின்னங்கள்',
          keywordEn: ['fractions', 'decimals', 'numerator', 'denominator', 'proper', 'improper', 'mixed', 'percentage'],
          keywordTa: ['பின்னங்கள்', 'தசம பின்னங்கள்', 'மேல் எண்', 'கீழ் எண்', 'சரியான', 'சரியற்ற', 'கலப்பு', 'சதவிகிதம்'],
        },
      ],
    },
    {
      id: 'maths_measurements',
      nameEn: 'Measurements',
      nameTa: 'அளவீடுகள்',
      topics: [
        {
          id: 'maths_length_weight',
          nameEn: 'Length, Weight & Volume',
          nameTa: 'நீளம், எடை & கன அளவு',
          keywordEn: ['length', 'weight', 'volume', 'measurement', 'standard units', 'non standard', 'cm', 'm', 'km', 'kg', 'g', 'litre', 'ml'],
          keywordTa: ['நீளம்', 'எடை', 'கன அளவு', 'அளவீடு', 'நிலையான அலகுகள்', 'செமீ', 'மீ', 'கிமீ', 'கிகி', 'கிராம்', 'லிட்டர்'],
        },
        {
          id: 'maths_time',
          nameEn: 'Time & Calendar',
          nameTa: 'நேரம் & நாட்காட்டி',
          keywordEn: ['time', 'calendar', 'clock', 'hours', 'minutes', 'days', 'weeks', 'months', 'year', 'am', 'pm', 'duration'],
          keywordTa: ['நேரம்', 'நாட்காட்டி', 'மணி', 'நிமிடம்', 'நாட்கள்', 'வாரங்கள்', 'மாதங்கள்', 'ஆண்டு'],
        },
        {
          id: 'maths_money',
          nameEn: 'Money & Currency',
          nameTa: 'பணம் & நாணயம்',
          keywordEn: ['money', 'currency', 'coins', 'notes', 'addition', 'subtraction', 'change', 'total'],
          keywordTa: ['பணம்', 'நாணயம்', 'நாணயங்கள்', 'தாள்கள்', 'கூட்டல்', 'கழித்தல்', 'மாற்றம்', 'மொத்தம்'],
        },
      ],
    },
    {
      id: 'maths_patterns_data',
      nameEn: 'Patterns & Data Handling',
      nameTa: 'வடிவங்கள் & தரவு கையாளுதல்',
      topics: [
        {
          id: 'maths_patterns',
          nameEn: 'Patterns in Numbers & Shapes',
          nameTa: 'எண்கள் & வடிவங்களில் வடிவங்கள்',
          keywordEn: ['patterns', 'number patterns', 'shape patterns', 'growing patterns', 'repeating patterns', 'skip counting'],
          keywordTa: ['வடிவங்கள்', 'எண் வடிவங்கள்', 'வடிவ வடிவங்கள்', 'வளரும் வடிவங்கள்'],
        },
        {
          id: 'maths_data',
          nameEn: 'Data Handling & Graphs',
          nameTa: 'தரவு கையாளுதல் & வரைபடங்கள்',
          keywordEn: ['data handling', 'graphs', 'charts', 'tally marks', 'pictograph', 'bar graph', 'survey', 'collection', 'organization'],
          keywordTa: ['தரவு கையாளுதல்', 'வரைபடங்கள்', 'அட்டவணை', 'குறியீடுகள்', 'பட வரைபடம்', 'ஆய்வு'],
        },
      ],
    },
  ],
};

const EVS_PAPER_I: SyllabusSubject = {
  id: 'evs',
  nameEn: 'Environmental Studies',
  nameTa: 'சுற்றுச்சூழல் பாடம்',
  paper: 'PAPER_I',
  ageGroup: '6-11',
  units: [
    {
      id: 'evs_plants',
      nameEn: 'Plants',
      nameTa: 'தாவரங்கள்',
      topics: [
        {
          id: 'evs_plant_parts',
          nameEn: 'Parts of Plants & Their Functions',
          nameTa: 'தாவரங்களின் பாகங்கள் & அவற்றின் செயல்பாடுகள்',
          keywordEn: ['plants', 'parts', 'roots', 'stems', 'leaves', 'flowers', 'fruits', 'seeds', 'germination', 'life cycle', 'photosynthesis', 'pollination', 'dispersal'],
          keywordTa: ['தாவரங்கள்', 'பாகங்கள்', 'வேர்கள்', 'தண்டுகள்', 'இலைகள்', 'பூக்கள்', 'கனிகள்', 'விதைகள்', 'முளைத்தல்', 'வாழ்க்கை சுழற்சி'],
        },
        {
          id: 'evs_plant_types',
          nameEn: 'Types of Plants',
          nameTa: 'தாவர வகைகள்',
          keywordEn: ['trees', 'shrubs', 'herbs', 'grasses', 'climbers', 'creepers', 'water plants', 'sacred trees', 'medicinal plants', 'timber'],
          keywordTa: ['மரங்கள்', 'புதர்கள்', 'பூச்சிகள்', 'புற்கள்', 'ஏறும் தாவரங்கள்', 'நீர் தாவரங்கள்', 'மருத்துவ தாவரங்கள்'],
        },
      ],
    },
    {
      id: 'evs_animals',
      nameEn: 'Animals & Birds',
      nameTa: 'விலங்குகள் & பறவைகள்',
      topics: [
        {
          id: 'evs_animal_habitat',
          nameEn: 'Animal Habitats & Classification',
          nameTa: 'விலங்கு வாழிடங்கள் & வகைப்படுத்தல்',
          keywordEn: ['animals', 'birds', 'insects', 'habitat', 'land', 'air', 'water', 'herbivore', 'carnivore', 'omnivore', 'mammals', 'camouflage', 'sanctuaries'],
          keywordTa: ['விலங்குகள்', 'பறவைகள்', 'பூச்சிகள்', 'வாழிடம்', 'நிலம்', 'காற்று', 'நீர்', 'தாவர உண்ணி', 'மாமிச உண்ணி', 'எல்லா உண்ணி'],
        },
        {
          id: 'evs_small_creatures',
          nameEn: 'Small Creatures & Life Cycles',
          nameTa: 'சிறிய உயிரினங்கள் & வாழ்க்கை சுழற்சிகள்',
          keywordEn: ['butterfly', 'bee', 'ant', 'life cycle', 'cocoon', 'pupa', 'nocturnal', 'spider', 'worm'],
          keywordTa: ['பட்டாம்பூச்சி', 'தேனீ', 'எறும்பு', 'வாழ்க்கை சுழற்சி', 'கூடு', 'இரவு நேர பூச்சிகள்'],
        },
      ],
    },
    {
      id: 'evs_nature',
      nameEn: 'Nature — Day/Night, Water, Air',
      nameTa: 'இயற்கை — பகல்/இரவு, நீர், காற்று',
      topics: [
        {
          id: 'evs_day_night',
          nameEn: 'Day & Night, Earth, Moon, Sun',
          nameTa: 'பகல் & இரவு, பூமி, நிலவு, சூரியன்',
          keywordEn: ['day', 'night', 'earth', 'moon', 'sun', 'stars', 'phases of moon', 'eclipse', 'seasons', 'solar system', 'planets', 'space'],
          keywordTa: ['பகல்', 'இரவு', 'பூமி', 'நிலவு', 'சூரியன்', 'நட்சத்திரங்கள்', 'நிலவு நிலைகள்', 'கிரகணம்', 'பருவங்கள்', 'சூரிய குடும்பம்'],
        },
        {
          id: 'evs_water',
          nameEn: 'Water — Sources, Uses, Conservation',
          nameTa: 'நீர் — ஆதாரங்கள், பயன்பாடுகள், பாதுகாப்பு',
          keywordEn: ['water', 'sources', 'river', 'lake', 'rain', 'groundwater', 'pollution', 'conservation', 'harvesting', 'potable water', 'water borne diseases'],
          keywordTa: ['நீர்', 'ஆதாரங்கள்', 'ஆறு', 'ஏரி', 'மழை', 'நிலத்தடி நீர்', 'மாசுபாடு', 'பாதுகாப்பு', 'மழை நீர் சேகரிப்பு'],
        },
        {
          id: 'evs_air',
          nameEn: 'Air — Properties & Uses',
          nameTa: 'காற்று — பண்புகள் & பயன்பாடுகள்',
          keywordEn: ['air', 'atmosphere', 'wind', 'gases', 'oxygen', 'carbon dioxide', 'pollution', 'breathing', 'properties of air'],
          keywordTa: ['காற்று', 'வளிமண்டலம்', 'காற்று', 'வாயுக்கள்', 'ஆக்சிஜன்', 'கார்பன் டை ஆக்சைடு', 'மாசுபாடு', 'சுவாசம்'],
        },
      ],
    },
    {
      id: 'evs_food_body',
      nameEn: 'Food, Body & Health',
      nameTa: 'உணவு, உடல் & ஆரோக்கியம்',
      topics: [
        {
          id: 'evs_food',
          nameEn: 'Food — Types, Sources, Nutrition',
          nameTa: 'உணவு — வகைகள், ஆதாரங்கள், ஊட்டச்சத்து',
          keywordEn: ['food', 'cereals', 'pulses', 'vegetables', 'fruits', 'dairy', 'spices', 'balanced diet', 'nutrients', 'food groups', 'preservation', 'hygiene', 'cooking'],
          keywordTa: ['உணவு', 'தானியங்கள்', 'பருப்புகள்', 'காய்கறிகள்', 'பழங்கள்', 'பால்', 'சமச்சீர் உணவு', 'ஊட்டச்சத்து', 'பாதுகாப்பு', 'சமையல்'],
        },
        {
          id: 'evs_body',
          nameEn: 'Human Body & Sense Organs',
          nameTa: 'மனித உடல் & புலன் உறுப்புகள்',
          keywordEn: ['body', 'sense organs', 'eyes', 'ears', 'nose', 'tongue', 'skin', 'bones', 'muscles', 'brain', 'digestion', 'internal organs'],
          keywordTa: ['உடல்', 'புலன் உறுப்புகள்', 'கண்கள்', 'காதுகள்', 'மூக்கு', 'நாக்கு', 'தோல்', 'எலும்புகள்', 'தசைகள்', 'மூளை', 'செரிமானம்'],
        },
        {
          id: 'evs_health',
          nameEn: 'Health, Hygiene & Safety',
          nameTa: 'ஆரோக்கியம், சுகாதாரம் & பாதுகாப்பு',
          keywordEn: ['health', 'hygiene', 'exercise', 'disease', 'prevention', 'safety', 'first aid', 'cleanliness', 'toilets', 'health centers'],
          keywordTa: ['ஆரோக்கியம்', 'சுகாதாரம்', 'உடற்பயிற்சி', 'நோய்', 'தடுப்பு', 'பாதுகாப்பு', 'முதலுதவி', 'சுத்தம்', 'கழிப்பறை'],
        },
      ],
    },
    {
      id: 'evs_matter_work',
      nameEn: 'Matter, Materials & Work',
      nameTa: 'பொருள், பொருட்கள் & வேலை',
      topics: [
        {
          id: 'evs_matter',
          nameEn: 'States of Matter & Materials',
          nameTa: 'பொருளின் நிலைகள் & பொருட்கள்',
          keywordEn: ['matter', 'solid', 'liquid', 'gas', 'states', 'properties', 'materials', 'natural resources', 'wood', 'stone', 'clay', 'metals'],
          keywordTa: ['பொருள்', 'திண்மம்', 'திரவம்', 'வாயு', 'நிலைகள்', 'பண்புகள்', 'இயற்கை வளங்கள்', 'மரம்', 'கல்', 'மண்', 'உலோகங்கள்'],
        },
        {
          id: 'evs_energy',
          nameEn: 'Energy, Force & Work',
          nameTa: 'ஆற்றல், விசை & வேலை',
          keywordEn: ['energy', 'force', 'work', 'push', 'pull', 'renewable', 'non renewable', 'fossil fuels', 'solar', 'wind energy', 'conservation'],
          keywordTa: ['ஆற்றல்', 'விசை', 'வேலை', 'தள்ளு', 'இழு', 'புதுப்பிக்கத்தக்க', 'மீள்திருத்தம்', 'சூரிய ஆற்றல்', 'காற்று ஆற்றல்'],
        },
        {
          id: 'evs_innovations',
          nameEn: 'Science in Everyday Life & Innovations',
          nameTa: 'அன்றாட வாழ்வில் அறிவியல் & கண்டுபிடிப்புகள்',
          keywordEn: ['science', 'innovations', 'inventions', 'toys', 'telephone', 'computer', 'printing', 'scientist', 'biography'],
          keywordTa: ['அறிவியல்', 'கண்டுபிடிப்புகள்', 'விளையாட்டுகள்', 'தொலைபேசி', 'கணினி', 'அச்சு', 'விஞ்ஞானி'],
        },
      ],
    },
    {
      id: 'evs_social',
      nameEn: 'Social Science — History, Geography, Civics',
      nameTa: 'சமூக அறிவியல் — வரலாறு, புவியியல், குடிமக்கள்',
      topics: [
        {
          id: 'evs_family_community',
          nameEn: 'Family, Neighbourhood & Community',
          nameTa: 'குடும்பம், அக்கம் & சமூகம்',
          keywordEn: ['family', 'neighbourhood', 'community', 'school', 'roles', 'helpers', 'public services', 'transport', 'directions', 'traffic rules'],
          keywordTa: ['குடும்பம்', 'அக்கம்', 'சமூகம்', 'பள்ளி', 'பங்குகள்', '�தவியாளர்கள்', 'பொது சேவைகள்', 'போக்குவரத்து', 'திசைகள்', 'போக்குவரத்து விதிகள்'],
        },
        {
          id: 'evs_tamilnadu',
          nameEn: 'Tamil Nadu — Geography, Culture, History',
          nameTa: 'தமிழ்நாடு — புவியியல், கலாச்சாரம், வரலாறு',
          keywordEn: ['tamil nadu', 'districts', 'rivers', 'hills', 'flora', 'fauna', 'birds', 'culture', 'folk arts', 'crafts', 'forts', 'sangam age', 'chera', 'chola', 'pandya'],
          keywordTa: ['தமிழ்நாடு', 'மாவட்டங்கள்', 'ஆறுகள்', 'மலைகள்', 'தாவரங்கள்', 'விலங்குகள்', 'பறவைகள்', 'கலாச்சாரம்', 'நாட்டுப்புற கலைகள்', 'கோட்டைகள்', 'சங்க காலம்'],
        },
        {
          id: 'evs_india',
          nameEn: 'India — Geography, Freedom, Government',
          nameTa: 'இந்தியா — புவியியல், சுதந்திரம், அரசு',
          keywordEn: ['india', 'physical features', 'rivers', 'mountains', 'states', 'union territories', 'national symbols', 'freedom struggle', 'independence', 'government', 'parliament', 'judiciary', 'panchayat', 'rights', 'duties'],
          keywordTa: ['இந்தியா', 'இயற்கை அம்சங்கள்', 'ஆறுகள்', 'மலைகள்', 'மாநிலங்கள்', 'தேசிய சின்னங்கள்', 'சுதந்திர போராட்டம்', 'சுதந்திரம்', 'அரசு', 'நாடாளுமன்றம்', 'உரிமைகள்', '�டமைகள்'],
        },
      ],
    },
  ],
};

// ============================================================================
// PAPER II — Classes 6 to 8 (Age 11-14)
// ============================================================================

const CDP_PAPER_II: SyllabusSubject = {
  id: 'cdp',
  nameEn: 'Child Development & Pedagogy',
  nameTa: 'குழந்தை வளர்ச்சியும் கற்பித்தல் முறைகளும்',
  paper: 'PAPER_II',
  ageGroup: '11-14',
  units: [
    {
      id: 'cdp_p2_edu_psych',
      nameEn: 'Nature of Educational Psychology',
      nameTa: 'கல்வியியல் உளவியலின் இயல்பு',
      topics: [
        {
          id: 'cdp_p2_intro',
          nameEn: 'Introduction to Educational Psychology',
          nameTa: 'கல்வியியல் உளவியல் அறிமுகம்',
          keywordEn: ['psychology', 'educational psychology', 'definition', 'nature', 'scope', 'methods', 'branches', 'learner', 'learning process', 'teacher'],
          keywordTa: ['உளவியல்', 'கல்வியியல் உளவியல்', 'வரையறை', 'இயல்பு', 'நோக்கம்', 'முறைகள்', 'கிளைகள்', 'கற்போர்', 'ஆசிரியர்'],
        },
      ],
    },
    {
      id: 'cdp_p2_growth',
      nameEn: 'Human Growth & Development',
      nameTa: 'மனித வளர்ச்சி & உருவாக்கம்',
      topics: [
        {
          id: 'cdp_p2_growth_dev',
          nameEn: 'Growth, Development & Maturation',
          nameTa: 'வளர்ச்சி, உருவாக்கம் & பக்குவம்',
          keywordEn: ['growth', 'development', 'maturation', 'nurture', 'nature', 'dimensions', 'physical', 'cognitive', 'emotional', 'social', 'moral', 'phases', 'infancy', 'childhood', 'adolescence', 'development tasks'],
          keywordTa: ['வளர்ச்சி', 'உருவாக்கம்', 'பக்குவம்', 'வளர்ப்பு', 'இயல்பு', 'பரிமாணங்கள்', 'உடல்', 'அறிவுசார்', 'உணர்வு', 'சமூக', 'நெறிமுறை', 'குழந்தைப் பருவம்', 'இளமைப் பருவம்'],
        },
      ],
    },
    {
      id: 'cdp_p2_cognitive',
      nameEn: 'Cognitive Development',
      nameTa: 'அறிவுசார் வளர்ச்சி',
      topics: [
        {
          id: 'cdp_p2_attention',
          nameEn: 'Attention & Perception',
          nameTa: 'கவனம் & உணர்வு',
          keywordEn: ['attention', 'kinds of attention', 'inattention', 'distraction', 'division of attention', 'span', 'sensation', 'perception', 'perceptual errors', 'concept formation'],
          keywordTa: ['கவனம்', 'கவன வகைகள்', 'கவனக் குறைவு', 'திசை திருப்பம்', 'உணர்வு', 'உணர்வு பிழைகள்', 'கருத்து உருவாக்கம்'],
        },
        {
          id: 'cdp_p2_piaget_bruner',
          nameEn: "Piaget's & Bruner's Theories",
          nameTa: 'பியாஜே & புரூனர் கோட்பாடுகள்',
          keywordEn: ['piaget', 'stages', 'sensorimotor', 'preoperational', 'concrete', 'formal', 'bruner', 'enactive', 'iconic', 'symbolic', 'concept maps', 'imagery'],
          keywordTa: ['பியாஜே', 'நிலைகள்', 'உணர்வு மோட்டார்', 'முன்செயல்', 'குறிப்பிட்ட', 'முறையான', 'புரூனர்', 'கருத்து வரைபடங்கள்'],
        },
        {
          id: 'cdp_p2_thinking',
          nameEn: 'Language, Thinking & Problem Solving',
          nameTa: 'மொழி, சிந்தனை & சிக்கல் தீர்வு',
          keywordEn: ['language', 'thinking', 'reasoning', 'problem solving', 'convergent', 'divergent', 'creativity', 'intelligence'],
          keywordTa: ['மொழி', 'சிந்தனை', 'காரண காரியம்', 'சிக்கல் தீர்வு', 'ஒருங்கொத்தல்', 'வேறுபடுத்தல்', 'படைப்பாற்றல்', 'அறிவுத் திறன்'],
        },
      ],
    },
    {
      id: 'cdp_p2_social_emotional',
      nameEn: 'Social, Emotional & Moral Development',
      nameTa: 'சமூக, உணர்வு & நெறிமுறை வளர்ச்சி',
      topics: [
        {
          id: 'cdp_p2_social',
          nameEn: 'Social Development & Erikson',
          nameTa: 'சமூக வளர்ச்சி & எரிக்சன்',
          keywordEn: ['social development', 'factors', 'social maturity', 'erikson', 'stages', 'emotional development', 'emotional intelligence', 'positive emotions', 'negative emotions', 'emotional control'],
          keywordTa: ['சமூக வளர்ச்சி', 'காரணிகள்', 'சமூக பக்குவம்', 'எரிக்சன்', 'நிலைகள்', 'உணர்வு வளர்ச்சி', 'உணர்வு நுண்ணறிவு'],
        },
        {
          id: 'cdp_p2_kohlberg',
          nameEn: "Kohlberg's Moral Development",
          nameTa: 'கோல்பெர்க்கின் நெறிமுறை வளர்ச்சி',
          keywordEn: ['kohlberg', 'moral development', 'preconventional', 'conventional', 'postconventional', 'levels', 'stages'],
          keywordTa: ['கோல்பெர்க்', 'நெறிமுறை வளர்ச்சி', 'முன்மரபு', 'மரபு', 'பின்மரபு', 'நிலைகள்'],
        },
      ],
    },
    {
      id: 'cdp_p2_learning',
      nameEn: 'Learning',
      nameTa: 'கற்றல்',
      topics: [
        {
          id: 'cdp_p2_learning_theories',
          nameEn: 'Theories of Learning',
          nameTa: 'கற்றல் கோட்பாடுகள்',
          keywordEn: ['learning', 'individual differences', 'learning curves', 'pavlov', 'skinner', 'classical conditioning', 'operant conditioning', 'thorndike', 'trial and error', 'kohler', 'insight', 'gagne', 'transfer of learning', 'imitation', 'levels of learning'],
          keywordTa: ['கற்றல்', 'தனிப்பட்ட வேறுபாடுகள்', 'கற்றல் வளைவுகள்', 'பவ்லோவ்', 'ஸ்கின்னர்', 'நிபந்தனை கற்றல்', 'தோர்ண்டைக்', 'சோதனை பிழை', 'கோலர்', 'ஊகம்', 'காஞ்சே'],
        },
        {
          id: 'cdp_p2_memory',
          nameEn: 'Remembering & Forgetting',
          nameTa: 'நினைவு & மறதி',
          keywordEn: ['memory', 'forgetting', 'curve of forgetting', 'short term', 'long term', 'sensory memory', 'encoding', 'retrieval', 'mnemonics'],
          keywordTa: ['நினைவு', 'மறதி', 'மறதி வளைவு', 'குறுகிய கால', 'நீண்ட கால', 'உணர் நினைவு', 'குறியாக்கம்', 'மீட்டெடுப்பு'],
        },
      ],
    },
    {
      id: 'cdp_p2_intelligence',
      nameEn: 'Intelligence & Creativity',
      nameTa: 'அறிவுத் திறன் & படைப்பாற்றல்',
      topics: [
        {
          id: 'cdp_p2_intelligence',
          nameEn: 'Nature of Intelligence & Theories',
          nameTa: 'அறிவுத் திறனின் இயல்பு & கோட்பாடுகள்',
          keywordEn: ['intelligence', 'distribution', 'single factor', 'two factor', 'multifactor', 'guilford', 'structure of intellect', 'gardner', 'multiple intelligence', 'constancy of IQ', 'assessment', 'intelligence tests'],
          keywordTa: ['அறிவுத் திறன்', 'விநியோகம்', 'ஒற்றை காரணி', 'இரட்டை காரணி', 'கில்ஃபோர்டு', 'கார்ட்னர்', 'பன்முக அறிவுத் திறன்', 'IQ', 'மதிப்பீடு'],
        },
        {
          id: 'cdp_p2_creativity',
          nameEn: 'Creativity & Thinking',
          nameTa: 'படைப்பாற்றல் & சிந்தனை',
          keywordEn: ['creativity', 'creative process', 'creativity and intelligence', 'convergent thinking', 'divergent thinking', 'promotion of creativity'],
          keywordTa: ['படைப்பாற்றல்', 'படைப்பு செயல்முறை', 'ஒருங்கொத்தல் சிந்தனை', 'வேறுபடுத்தல் சிந்தனை'],
        },
      ],
    },
    {
      id: 'cdp_p2_motivation',
      nameEn: 'Motivation & Group Dynamics',
      nameTa: 'ஊக்கம் & குழு இயக்கவியல்',
      topics: [
        {
          id: 'cdp_p2_motivation',
          nameEn: 'Motivation & Learning',
          nameTa: 'ஊக்கம் & கற்றல்',
          keywordEn: ['motivation', 'motives', 'maslow', 'hierarchy of needs', 'rewards', 'punishments', 'level of aspiration', 'achievement motivation', 'classroom motivation'],
          keywordTa: ['ஊக்கம்', 'ஊக்கங்கள்', 'மாஸ்லோ', 'தேவைகள் படிநிலை', 'பரிசுகள்', 'தண்டனைகள்', 'சாதனை ஊக்கம்'],
        },
        {
          id: 'cdp_p2_group',
          nameEn: 'Competition, Cooperation & Leadership',
          nameTa: 'போட்டி, ஒத்துழைப்பு & தலைமை',
          keywordEn: ['competition', 'cooperation', 'leadership', 'leadership traits', 'leadership styles', 'classroom climate', 'group dynamics'],
          keywordTa: ['போட்டி', 'ஒத்துழைப்பு', 'தலைமை', 'தலைமை பண்புகள்', 'தலைமை பாணிகள்', 'வகுப்பு சூழல்'],
        },
      ],
    },
    {
      id: 'cdp_p2_personality',
      nameEn: 'Personality & Assessment',
      nameTa: 'ஆளுமை & மதிப்பீடு',
      topics: [
        {
          id: 'cdp_p2_personality',
          nameEn: 'Theories of Personality',
          nameTa: 'ஆளுமை கோட்பாடுகள்',
          keywordEn: ['personality', 'type theory', 'trait theory', 'psychoanalytic', 'freud', 'assessment', 'projective', 'non projective', 'aptitude', 'attitude', 'interest', 'integrated personality'],
          keywordTa: ['ஆளுமை', 'வகை கோட்பாடு', 'பண்பு கோட்பாடு', 'மனப்பகுப்பு', 'ஃப்ராய்டு', 'மதிப்பீடு', 'திட்டமிடப்பட்ட', 'திறன்', 'மனப்பான்மை', 'ஆர்வம்'],
        },
      ],
    },
    {
      id: 'cdp_p2_mental_health',
      nameEn: 'Mental Health & Hygiene',
      nameTa: 'மன ஆரோக்கியம் & சுகாதாரம்',
      topics: [
        {
          id: 'cdp_p2_mental_health',
          nameEn: 'Mental Health, Adjustment & Defence Mechanisms',
          nameTa: 'மன ஆரோக்கியம், சரிசெய்தல் & பாதுகாப்பு வழிமுறைகள்',
          keywordEn: ['mental health', 'conflict', 'frustration', 'adjustment', 'maladjustment', 'defence mechanisms', 'mental illness', 'juvenile delinquency', 'promotion of mental health'],
          keywordTa: ['மன ஆரோக்கியம்', 'முரண்பாடு', 'விரக்தி', 'சரிசெய்தல்', 'தவறான சரிசெய்தல்', 'பாதுகாப்பு வழிமுறைகள்', 'மனநோய்'],
        },
      ],
    },
    {
      id: 'cdp_p2_guidance',
      nameEn: 'Guidance & Counselling',
      nameTa: 'வழிகாட்டுதல் & ஆலோசனை',
      topics: [
        {
          id: 'cdp_p2_guidance',
          nameEn: 'Types of Guidance & Counselling',
          nameTa: 'வழிகாட்டுதல் & ஆலோசனை வகைகள்',
          keywordEn: ['guidance', 'counselling', 'educational', 'vocational', 'personal', 'learning difficulties', 'underachievers', 'gifted', 'individual techniques', 'group techniques'],
          keywordTa: ['வழிகாட்டுதல்', 'ஆலோசனை', 'கல்வி', 'தொழில்', 'தனிப்பட்ட', 'கற்றல் குறைபாடுகள்', 'குறைவான செயல்திறன்', 'சிறப்பு திறன்'],
        },
      ],
    },
  ],
};

const MATHS_SCIENCE_PAPER_II: SyllabusSubject = {
  id: 'maths_science',
  nameEn: 'Mathematics & Science',
  nameTa: 'கணிதம் & அறிவியல்',
  paper: 'PAPER_II',
  ageGroup: '11-14',
  units: [
    {
      id: 'ms_numbers',
      nameEn: 'Number System & Algebra',
      nameTa: 'எண் முறை & இயற்கணிதம்',
      topics: [
        {
          id: 'ms_real_numbers',
          nameEn: 'Real Numbers & Number Systems',
          nameTa: 'மெய்யெண்கள் & எண் முறைகள்',
          keywordEn: ['real numbers', 'natural', 'whole', 'integers', 'rational', 'irrational', 'number line', 'hcf', 'lcm', 'prime', 'composite', 'fractions', 'decimals', 'exponents', 'powers'],
          keywordTa: ['மெய்யெண்கள்', 'இயல் எண்கள்', 'முழு எண்கள்', 'முழுச்சார் எண்கள்', 'கூட்டு விகிதம்', 'மிகை விகிதம்', 'எண் கோடு', 'மீ.ப.வ.'],
        },
        {
          id: 'ms_algebra',
          nameEn: 'Algebra — Expressions & Equations',
          nameTa: 'இயற்கணிதம் — கோவைகள் & சமன்பாடுகள்',
          keywordEn: ['algebra', 'variables', 'expressions', 'equations', 'linear equations', 'simple equations', ' identities', 'factorisation', 'polynomials'],
          keywordTa: ['இயற்கணிதம்', 'மாறிகள்', 'கோவைகள்', 'சமன்பாடுகள்', 'நேரியல் சமன்பாடுகள்', 'அடையாளங்கள்', 'காரணியாக்கல்', 'பல்லுறுப்புகள்'],
        },
      ],
    },
    {
      id: 'ms_geometry',
      nameEn: 'Geometry & Mensuration',
      nameTa: 'வடிவியல் & அளவியல்',
      topics: [
        {
          id: 'ms_lines_angles',
          nameEn: 'Lines, Angles & Triangles',
          nameTa: 'கோடுகள், கோணங்கள் & முக்கோணங்கள்',
          keywordEn: ['lines', 'angles', 'parallel', 'perpendicular', 'transversal', 'triangles', 'congruence', 'similarity', 'pythagoras', 'angle sum', 'exterior angle'],
          keywordTa: ['கோடுகள்', 'கோணங்கள்', 'இணை', 'செங்குத்து', 'குறுக்கிடும்', 'முக்கோணங்கள்', 'சமநிலை', 'ஒப்புமை', 'பிதாகரஸ்', 'கோண கூட்டு'],
        },
        {
          id: 'ms_mensuration',
          nameEn: 'Mensuration — Area, Perimeter, Volume',
          nameTa: 'அளவியல் — பரப்பு, சுற்றளவு, கன அளவு',
          keywordEn: ['area', 'perimeter', 'volume', 'circle', 'cylinder', 'cone', 'sphere', 'cube', 'cuboid', 'formula', 'surface area'],
          keywordTa: ['பரப்பு', 'சுற்றளவு', 'கன அளவு', 'வட்டம்', 'உருளை', 'கூம்பு', 'கோளம்', 'சதுரம்', 'செவ்வகம்', 'சூத்திரம்'],
        },
      ],
    },
    {
      id: 'ms_science',
      nameEn: 'Science',
      nameTa: 'அறிவியல்',
      topics: [
        {
          id: 'ms_matter',
          nameEn: 'Matter — States, Properties, Changes',
          nameTa: 'பொருள் — நிலைகள், பண்புகள், மாற்றங்கள்',
          keywordEn: ['matter', 'solid', 'liquid', 'gas', 'plasma', 'properties', 'mixtures', 'solutions', 'atoms', 'molecules', 'elements', 'compounds', 'chemical changes', 'physical changes', 'density'],
          keywordTa: ['பொருள்', 'திண்மம்', 'திரவம்', 'வாயு', 'பிளாஸ்மா', 'பண்புகள்', 'கலவைகள்', 'கரைசல்கள்', 'அணுக்கள்', 'மூலக்கூறுகள்', 'தனிமங்கள்', '�ேர்மங்கள்'],
        },
        {
          id: 'ms_biology',
          nameEn: 'Living World — Cells, Organisms, Systems',
          nameTa: 'உயிர் உலகம் — செல்கள், உயிரினங்கள், அமைப்புகள்',
          keywordEn: ['cells', 'tissues', 'organs', 'organ systems', 'nutrition', 'digestion', 'circulation', 'respiration', 'excretion', 'reproduction', 'heredity', 'evolution', 'biodiversity', 'ecosystem'],
          keywordTa: ['செல்கள்', 'திசுக்கள்', 'உறுப்புகள்', 'உறுப்பு அமைப்புகள்', 'ஊட்டச்சத்து', 'செரிமானம்', 'சுழற்சி', '�ுவாசம்', 'கழிவு', 'பிறப்பு', 'பரம்பரை', 'உயிர்பல்வகை'],
        },
        {
          id: 'ms_forces',
          nameEn: 'Force, Work, Energy & Simple Machines',
          nameTa: 'விசை, வேலை, ஆற்றல் & எளிய இயந்திரங்கள்',
          keywordEn: ['force', 'work', 'energy', 'power', 'friction', 'gravity', 'simple machines', 'lever', 'pulley', 'inclined plane', 'newton', 'momentum', 'kinetic', 'potential'],
          keywordTa: ['விசை', 'வேலை', 'ஆற்றல்', 'திறன்', 'உராய்வு', 'ஈர்ப்பு', 'எளிய இயந்திரங்கள்', 'குறுக்குவட்டம்', 'சரம்', 'சாய்தளம்', 'நியூட்டன்', 'இயக்க ஆற்றல்', 'நிலை ஆற்றல்'],
        },
        {
          id: 'ms_light_sound',
          nameEn: 'Light, Sound & Electricity',
          nameTa: 'ஒளி, ஒலி & மின்சாரம்',
          keywordEn: ['light', 'reflection', 'refraction', 'lens', 'mirror', 'sound', 'frequency', 'pitch', 'loudness', 'electricity', 'current', 'voltage', 'resistance', 'circuits', 'conductors', 'insulators'],
          keywordTa: ['ஒளி', 'பிரதிபலிப்பு', 'ஒளிவிலகல்', 'லென்ஸ்', 'கண்ணாடி', 'ஒலி', 'அதிர்வெண்', 'சுருதி', ' வலிமை', 'மின்சாரம்', 'மின்னோட்டம்', 'மின்னழுத்தம்', 'மின்தடை', 'சுற்றுகள்'],
        },
      ],
    },
  ],
};

const SOCIAL_SCIENCE_PAPER_II: SyllabusSubject = {
  id: 'social_science',
  nameEn: 'Social Science',
  nameTa: 'சமூக அறிவியல்',
  paper: 'PAPER_II',
  ageGroup: '11-14',
  units: [
    {
      id: 'ss_history',
      nameEn: 'History',
      nameTa: 'வரலாறு',
      topics: [
        {
          id: 'ss_ancient_india',
          nameEn: 'Ancient India — Indus Valley, Vedic Period',
          nameTa: 'பண்டைய இந்தியா — சிந்து சமவெளி, வேத காலம்',
          keywordEn: ['indus valley', 'harappa', 'mohenjo daro', 'vedic period', 'vedas', 'brahmins', 'kshatriyas', 'vaishyas', 'shudras', 'jainism', 'buddhism', 'maurya', 'ashoka'],
          keywordTa: ['சிந்து சமவெளி', 'ஹரப்பா', 'மொகஞ்சதாரோ', 'வேத காலம்', 'வேதங்கள்', 'சமணம்', 'பௌத்தம்', 'மௌரியர்', 'அசோகர்'],
        },
        {
          id: 'ss_medieval_modern',
          nameEn: 'Medieval & Modern India',
          nameTa: 'மத்திய கால & நவீன இந்தியா',
          keywordEn: ['delhi sultanate', 'mughal', 'british', 'colonial', 'freedom struggle', 'gandhi', 'nehru', 'subhash', 'bhagat singh', 'independence', 'partition'],
          keywordTa: ['தில்லி சுல்தானகம்', 'முகலாயர்', 'பிரிட்டிஷ்', 'காலனி', 'சுதந்திர போராட்டம்', 'காந்தி', 'நேரு', 'சுபாஷ்', 'சுதந்திரம்'],
        },
        {
          id: 'ss_tamilnadu_history',
          nameEn: 'Tamil Nadu History — Sangam to Present',
          nameTa: 'தமிழ்நாடு வரலாறு — சங்கம் முதல் தற்போது வரை',
          keywordEn: ['sangam', 'chera', 'chola', 'pandya', 'pallava', 'chola architecture', 'temples', 'bronze', 'tamil literature', 'bhakti movement', 'colonial tamil nadu'],
          keywordTa: ['சங்கம்', 'சேரர்', 'சோழர்', 'பாண்டியர்', 'பல்லவர்', 'கோயில்கள்', 'வெண்கலம்', 'தமிழ் இலக்கியம்', 'பக்தி இயக்கம்'],
        },
      ],
    },
    {
      id: 'ss_geography',
      nameEn: 'Geography',
      nameTa: 'புவியியல்',
      topics: [
        {
          id: 'ss_physio_india',
          nameEn: 'Physical Geography of India',
          nameTa: 'இந்தியாவின் இயற்கை புவியியல்',
          keywordEn: ['physical features', 'mountains', 'plains', 'plateaus', 'rivers', 'lakes', 'climate', 'monsoon', 'soil types', 'forests', 'minerals', 'natural vegetation'],
          keywordTa: ['இயற்கை அம்சங்கள்', 'மலைகள்', 'சமவெளிகள்', 'பீடபூமிகள்', 'ஆறுகள்', 'ஏரிகள்', 'காலநிலை', 'பருவமழை', 'மண் வகைகள்', 'காடுகள்', 'நிலக்கரி'],
        },
        {
          id: 'ss_indian_economy',
          nameEn: 'Indian Economy & Resources',
          nameTa: 'இந்திய பொருளாதாரம் & வளங்கள்',
          keywordEn: ['agriculture', 'irrigation', 'crops', 'industries', 'minerals', 'energy resources', 'transport', 'communication', 'trade', 'poverty', 'population'],
          keywordTa: ['வேளாண்மை', 'நீர்ப்பாசனம்', 'பயிர்கள்', 'தொழிற்சாலைகள்', 'நிலக்கரி', 'ஆற்றல் வளங்கள்', 'போக்குவரத்து', 'தொடர்பு', 'வறுமை', 'மக்கள் தொகை'],
        },
      ],
    },
    {
      id: 'ss_civics',
      nameEn: 'Civics & Political Science',
      nameTa: 'குடிமக்கள் & அரசியல் அறிவியல்',
      topics: [
        {
          id: 'ss_democracy',
          nameEn: 'Indian Democracy & Constitution',
          nameTa: 'இந்திய ஜனநாயகம் & அரசியல் சாசனம்',
          keywordEn: ['democracy', 'constitution', 'fundamental rights', 'fundamental duties', 'directive principles', 'parliament', 'legislature', 'executive', 'judiciary', 'elections', 'voting'],
          keywordTa: ['ஜனநாயகம்', 'அரசியல் சாசனம்', 'அடிப்படை உரிமைகள்', 'அடிப்படை கடமைகள்', 'நாடாளுமன்றம்', 'சட்டமன்றம்', '�ிர்வாகம்', 'நீதித்துறை', 'தேர்தல்'],
        },
        {
          id: 'ss_local_govt',
          nameEn: 'Local Self Government',
          nameTa: 'உள்ளாட்சி அரசு',
          keywordEn: ['panchayat', 'municipality', 'corporation', 'gram sabha', 'local bodies', 'wards', 'development', 'public property'],
          keywordTa: ['பஞ்சாயத்து', 'நகராட்சி', 'மாநகராட்சி', 'கிராம சபா', 'உள்ளாட்சி அமைப்புகள்', 'வளர்ச்சி', 'பொது சொத்து'],
        },
      ],
    },
  ],
};

const TAMIL_PAPER_II: SyllabusSubject = {
  id: 'tamil',
  nameEn: 'Language I — Tamil',
  nameTa: 'மொழி I — தமிழ்',
  paper: 'PAPER_II',
  ageGroup: '11-14',
  units: [
    {
      id: 'tamil_p2_lit',
      nameEn: 'Tamil Literature',
      nameTa: 'தமிழ் இலக்கியம்',
      topics: [
        {
          id: 'tamil_p2_sangam',
          nameEn: 'Sangam Literature & Classical Poetry',
          nameTa: 'சங்க இலக்கியம் & காப்பியங்கள்',
          keywordEn: ['sangam', 'tholkappiyam', 'kuruntokai', 'purananuru', 'silappathikaram', 'manimekalai', 'classical poetry', 'akam', 'puram'],
          keywordTa: ['சங்கம்', 'தொல்காப்பியம்', 'குறுந்தொகை', 'புறநநூறு', 'சிலப்பதிகாரம்', 'மணிமேகலை', 'காப்பியங்கள்'],
        },
        {
          id: 'tamil_p2_bakthi',
          nameEn: 'Bhakti Literature & Saints',
          nameTa: 'பக்தி இலக்கியம் & சிற்றிலக்கியங்கள்',
          keywordEn: ['bhakti', 'nayanars', 'alvars', 'thevaram', 'nalayira divya prabandham', 'thirukkural', 'thiruvempavai', 'manickavasagar'],
          keywordTa: ['பக்தி', 'நாயன்மார்', 'ஆழ்வார்கள்', 'தேவாரம்', 'நாலாயிர திவ்ய பிரபந்தம்', 'திருக்குறள்', 'திருவெம்பாவை'],
        },
      ],
    },
    {
      id: 'tamil_p2_grammar',
      nameEn: 'Tamil Grammar & Linguistics',
      nameTa: 'தமிழ் இலக்கணம் & மொழியியல்',
      topics: [
        {
          id: 'tamil_p2_elakkanam',
          nameEn: 'Ilakkanam — Sandhi, Kol, Payirchi',
          nameTa: 'இலக்கணம் — சந்தி, கோல், பயிற்சி',
          keywordEn: ['ilakkanam', 'sandhi', 'kol', 'payirchi', 'ezhuthu', 'sol', 'porul', 'yappu', 'anishtam', 'peyar', 'vinai', 'uripol'],
          keywordTa: ['இலக்கணம்', 'சந்தி', 'கோல்', 'பயிற்சி', 'எழுத்து', 'சொல்', 'பொருள்', 'யாப்பு', 'அனிச்சம்', 'பெயர்', 'வினை', 'உரிசொல்'],
        },
      ],
    },
  ],
};

const ENGLISH_PAPER_II: SyllabusSubject = {
  id: 'english',
  nameEn: 'Language II — English',
  nameTa: 'மொழி II — ஆங்கிலம்',
  paper: 'PAPER_II',
  ageGroup: '11-14',
  units: [
    {
      id: 'eng_p2_lsrw',
      nameEn: 'Listening, Speaking, Reading & Writing',
      nameTa: 'கேட்டல், பேச்சு, வாசிப்பு & எழுத்து',
      topics: [
        {
          id: 'eng_p2_comprehension',
          nameEn: 'Reading Comprehension & Vocabulary',
          nameTa: 'வாசிப்பு புரிதல் & சொல்வளம்',
          keywordEn: ['comprehension', 'passage', 'inference', 'vocabulary', 'synonyms', 'antonyms', 'idioms', 'phrases', 'context clues', 'dictionary skills'],
          keywordTa: ['புரிதல்', 'பத்தி', 'ஊகம்', 'சொல்வளம்', 'ஒத்த சொற்கள்', 'எதிர்ச் சொற்கள்', 'இடம் பொருள்', 'சொல் தொகுப்பு'],
        },
        {
          id: 'eng_p2_grammar',
          nameEn: 'English Grammar',
          nameTa: 'ஆங்கில இலக்கணம்',
          keywordEn: ['tenses', 'articles', 'prepositions', 'conjunctions', 'active voice', 'passive voice', 'direct speech', 'reported speech', 'conditionals', 'modals', 'subject verb agreement'],
          keywordTa: ['காலங்கள்', 'நிறுத்தற்குறி', 'இணைப்புகள்', 'செயல்முறை', 'பாடம்', 'நிபந்தனை'],
        },
        {
          id: 'eng_p2_writing',
          nameEn: 'Writing Skills — Letters, Essays, Reports',
          nameTa: 'எழுதுதல் திறன் — கடிதங்கள், கட்டுரைகள், அறிக்கைகள்',
          keywordEn: ['letter writing', 'essay', 'report', 'paragraph', 'notice', 'message', 'dialogue', 'story writing', 'creative writing', 'formal', 'informal'],
          keywordTa: ['கடிதம்', 'கட்டுரை', 'அறிக்கை', 'பத்தி', 'அறிவிப்பு', 'செய்தி', 'உரையாடல்', 'கதை எழுத்து'],
        },
      ],
    },
  ],
};

// ============================================================================
// EXPORTS
// ============================================================================

export const ALL_SYLLABUS_SUBJECTS: SyllabusSubject[] = [
  CDP_PAPER_I,
  TAMIL_PAPER_I,
  ENGLISH_PAPER_I,
  MATHS_PAPER_I,
  EVS_PAPER_I,
  CDP_PAPER_II,
  TAMIL_PAPER_II,
  ENGLISH_PAPER_II,
  MATHS_SCIENCE_PAPER_II,
  SOCIAL_SCIENCE_PAPER_II,
];

export const PAPER_I_SUBJECTS = ALL_SYLLABUS_SUBJECTS.filter(s => s.paper === 'PAPER_I' || s.paper === 'BOTH');
export const PAPER_II_SUBJECTS = ALL_SYLLABUS_SUBJECTS.filter(s => s.paper === 'PAPER_II' || s.paper === 'BOTH');

/**
 * Get all topics flat-list for a given paper
 */
export function getAllTopicsForPaper(paper: 'PAPER_I' | 'PAPER_II'): SyllabusTopic[] {
  const subjects = paper === 'PAPER_I' ? PAPER_I_SUBJECTS : PAPER_II_SUBJECTS;
  return subjects.flatMap(s =>
    s.units.flatMap(u => u.topics)
  );
}

/**
 * Count total topics in the syllabus
 */
export function getSyllabusStats() {
  let totalUnits = 0;
  let totalTopics = 0;
  ALL_SYLLABUS_SUBJECTS.forEach(s => {
    totalUnits += s.units.length;
    s.units.forEach(u => { totalTopics += u.topics.length; });
  });
  return {
    totalSubjects: ALL_SYLLABUS_SUBJECTS.length,
    totalUnits,
    totalTopics,
  };
}
