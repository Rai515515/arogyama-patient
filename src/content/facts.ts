import type { LText } from '../i18n';
import type { SourceId } from './sources';

/**
 * Small, sourced pieces of information that appear all over the app
 * (load screen, between list items, notifications) instead of being locked
 * inside long articles. One fact = one idea, max ~25 words.
 *
 * kind:  'fact'       — clinical / programme fact, always sourced
 *        'news'       — dated programme update ("what's new"), always sourced
 *        'motivation' — encouragement, no medical claim, no source needed
 */

export type StageTag = 'T1' | 'T2' | 'T3' | 'PP';
export type FactTopic = 'vaccine' | 'bp' | 'breastfeeding' | 'ppiucd' | 'mind' | 'safety' | 'scheme' | 'nutrition' | 'postnatal' | 'motivation';

export interface Fact {
  id: string;
  kind: 'fact' | 'news' | 'motivation';
  topic: FactTopic;
  stages: StageTag[] | 'ALL';
  text: LText;
  source?: SourceId;
  /** Learn article to open for more */
  learn?: string;
  /** For news items: the date the event happened, shown next to it */
  date?: string;
}

const ALL = 'ALL' as const;
const PREG: StageTag[] = ['T1', 'T2', 'T3'];

export const FACTS: Fact[] = [
  // ---- Vaccines ------------------------------------------------------------
  {
    id: 'v-td',
    kind: 'fact',
    topic: 'vaccine',
    stages: PREG,
    source: 'nis',
    learn: 'vaccines',
    text: {
      en: 'Td vaccine protects you and your newborn from tetanus. The second dose comes 4 weeks after the first.',
      ta: 'Td தடுப்பூசி உங்களையும் பிறக்கும் குழந்தையையும் டெட்டனஸிலிருந்து காக்கிறது. முதல் டோஸுக்கு 4 வாரங்கள் கழித்து இரண்டாவது டோஸ்.',
      hi: 'Td टीका आपको और आपके नवजात को टिटनेस से बचाता है। दूसरी खुराक पहली के 4 हफ़्ते बाद लगती है।',
    },
  },
  {
    id: 'v-td36',
    kind: 'fact',
    topic: 'vaccine',
    stages: ['T2', 'T3'],
    source: 'nis',
    learn: 'vaccines',
    text: {
      en: 'Aim for your Td dose before 36 weeks. If you have missed it, it should still be given.',
      ta: '36 வாரங்களுக்குள் Td தடுப்பூசி போட்டுக்கொள்ளுங்கள். தவறியிருந்தாலும், பிறகும் போட வேண்டும்.',
      hi: 'Td की खुराक 36 हफ़्ते से पहले लगवाएँ। छूट गई हो, तब भी लगवानी चाहिए।',
    },
  },
  {
    id: 'v-birth',
    kind: 'fact',
    topic: 'vaccine',
    stages: ['T3', 'PP'],
    source: 'nis',
    learn: 'vaccines',
    text: {
      en: "Your baby's first vaccines are given at birth: BCG, OPV-0 and Hepatitis B — Hepatitis B within 24 hours.",
      ta: 'பிறந்தவுடன் குழந்தைக்கு முதல் தடுப்பூசிகள்: BCG, OPV-0, ஹெபடைடிஸ் B — ஹெபடைடிஸ் B 24 மணி நேரத்துக்குள்.',
      hi: 'जन्म के समय बच्चे के पहले टीके: BCG, OPV-0 और हेपेटाइटिस B — हेपेटाइटिस B 24 घंटे के अंदर।',
    },
  },
  {
    id: 'v-6wk',
    kind: 'fact',
    topic: 'vaccine',
    stages: ['PP'],
    source: 'pibVaccines',
    learn: 'vaccines',
    text: {
      en: 'At 6 weeks your baby gets OPV, Pentavalent, Rotavirus, IPV and PCV under the national programme.',
      ta: '6 வாரத்தில் தேசிய திட்டத்தின் கீழ் OPV, பென்டாவேலன்ட், ரோட்டாவைரஸ், IPV, PCV தடுப்பூசிகள்.',
      hi: '6 हफ़्ते पर राष्ट्रीय कार्यक्रम के तहत बच्चे को OPV, पेंटावैलेंट, रोटावायरस, IPV और PCV लगते हैं।',
    },
  },
  {
    id: 'n-td-kasauli',
    kind: 'news',
    topic: 'vaccine',
    stages: ALL,
    source: 'pibVaccines',
    date: '2026-02-21',
    learn: 'vaccines',
    text: {
      en: 'India launched its own Td vaccine, made at CRI Kasauli, on 21 February 2026.',
      ta: 'கசௌலி CRI-யில் தயாரான இந்தியாவின் சொந்த Td தடுப்பூசி 21 பிப்ரவரி 2026 அன்று அறிமுகமானது.',
      hi: 'भारत ने CRI कसौली में बना अपना Td टीका 21 फ़रवरी 2026 को लॉन्च किया।',
    },
  },
  {
    id: 'n-hpv',
    kind: 'news',
    topic: 'vaccine',
    stages: ALL,
    source: 'pibVaccines',
    date: '2026-02-28',
    text: {
      en: 'A nationwide HPV vaccine campaign for 14-year-old girls began on 28 February 2026 to prevent cervical cancer.',
      ta: 'கர்ப்பப்பை வாய்ப் புற்றுநோயைத் தடுக்க 14 வயதுச் சிறுமிகளுக்கான நாடு தழுவிய HPV தடுப்பூசி இயக்கம் 28 பிப்ரவரி 2026 அன்று தொடங்கியது.',
      hi: 'सर्वाइकल कैंसर से बचाव के लिए 14 साल की लड़कियों का देशव्यापी HPV टीकाकरण अभियान 28 फ़रवरी 2026 को शुरू हुआ।',
    },
  },

  // ---- Blood pressure ------------------------------------------------------
  {
    id: 'b-140',
    kind: 'fact',
    topic: 'bp',
    stages: ALL,
    source: 'whoPreeclampsia',
    learn: 'bp',
    text: {
      en: 'BP of 140/90 or more is high in pregnancy. Many women feel nothing — only a check shows it.',
      ta: 'கர்ப்பத்தில் 140/90 அல்லது அதற்கு மேல் இருந்தால் BP அதிகம். பலருக்கு எந்த அறிகுறியும் இருக்காது — பரிசோதனையில் மட்டுமே தெரியும்.',
      hi: 'गर्भावस्था में 140/90 या उससे ज़्यादा BP हाई है। कई महिलाओं को कुछ महसूस नहीं होता — जाँच से ही पता चलता है।',
    },
  },
  {
    id: 'b-after',
    kind: 'fact',
    topic: 'bp',
    stages: ['T3', 'PP'],
    source: 'whoPreeclampsia',
    learn: 'bp',
    text: {
      en: 'High BP can appear even after delivery. Severe headache or blurred vision after birth needs a hospital the same day.',
      ta: 'பிரசவத்துக்குப் பிறகும் BP உயரலாம். கடுமையான தலைவலி அல்லது பார்வை மங்கல் இருந்தால் அன்றே மருத்துவமனைக்குச் செல்லுங்கள்.',
      hi: 'डिलीवरी के बाद भी BP बढ़ सकता है। तेज़ सिरदर्द या धुंधला दिखे तो उसी दिन अस्पताल जाएँ।',
    },
  },
  {
    id: 'b-day35',
    kind: 'fact',
    topic: 'bp',
    stages: ['PP'],
    source: 'niceNg133',
    learn: 'bp',
    text: {
      en: 'Every new mother should have her BP checked at least once, 3 to 5 days after birth.',
      ta: 'ஒவ்வொரு புதிய தாயும் பிரசவத்துக்கு 3 முதல் 5 நாட்களுக்குள் குறைந்தது ஒருமுறை BP பார்க்க வேண்டும்.',
      hi: 'हर नई माँ का BP डिलीवरी के 3 से 5 दिन के बीच कम से कम एक बार जाँचा जाना चाहिए।',
    },
  },
  {
    id: 'b-goal',
    kind: 'fact',
    topic: 'bp',
    stages: ['PP'],
    source: 'niceNg133',
    learn: 'bp',
    text: {
      en: 'After delivery, the BP goal is below 140/90.',
      ta: 'பிரசவத்துக்குப் பின் BP 140/90-க்குக் கீழ் இருக்க வேண்டும்.',
      hi: 'डिलीवरी के बाद BP का लक्ष्य 140/90 से कम है।',
    },
  },
  {
    id: 'n-who-16',
    kind: 'news',
    topic: 'bp',
    stages: ALL,
    source: 'whoPreeclampsia',
    date: '2026-10-06',
    learn: 'bp',
    text: {
      en: 'High-BP disorders of pregnancy cause about 16% of maternal deaths worldwide.',
      ta: 'உலக அளவில் தாய் இறப்புகளில் சுமார் 16% கர்ப்பகால உயர் BP நோய்களால் ஏற்படுகின்றன.',
      hi: 'दुनिया भर में लगभग 16% मातृ मृत्यु गर्भावस्था के हाई BP विकारों से होती हैं।',
    },
  },
  {
    id: 'b-signs',
    kind: 'fact',
    topic: 'bp',
    stages: ['T2', 'T3', 'PP'],
    source: 'whoPreeclampsia',
    learn: 'warning',
    text: {
      en: 'Warning signs of pre-eclampsia: severe headache, blurred vision, pain below the ribs, swelling of face and hands.',
      ta: 'முன்-எக்லாம்ப்சியா எச்சரிக்கை அறிகுறிகள்: கடுமையான தலைவலி, பார்வை மங்கல், விலா எலும்புக்குக் கீழ் வலி, முகம்-கை வீக்கம்.',
      hi: 'प्री-एक्लेम्पसिया के चेतावनी लक्षण: तेज़ सिरदर्द, धुंधला दिखना, पसलियों के नीचे दर्द, चेहरे और हाथों पर सूजन।',
    },
  },

  // ---- Breastfeeding -------------------------------------------------------
  {
    id: 'f-hour',
    kind: 'fact',
    topic: 'breastfeeding',
    stages: ['T2', 'T3', 'PP'],
    source: 'figoFirstHour',
    learn: 'breastfeeding',
    text: {
      en: "Breastfeed within the first hour after birth. The first yellow milk (colostrum) is your baby's first protection.",
      ta: 'பிறந்த முதல் ஒரு மணி நேரத்துக்குள் தாய்ப்பால் கொடுங்கள். முதல் மஞ்சள் பால் (சீம்பால்) குழந்தையின் முதல் பாதுகாப்பு.',
      hi: 'जन्म के पहले घंटे में स्तनपान शुरू करें। पहला पीला दूध (कोलोस्ट्रम) बच्चे की पहली सुरक्षा है।',
    },
  },
  {
    id: 'f-only',
    kind: 'fact',
    topic: 'breastfeeding',
    stages: ['T3', 'PP'],
    source: 'whoBreastfeeding',
    learn: 'breastfeeding',
    text: {
      en: 'Only breast milk for the first 6 months — no water, honey or other drinks.',
      ta: 'முதல் 6 மாதங்கள் தாய்ப்பால் மட்டும் — தண்ணீர், தேன், சர்க்கரைத் தண்ணீர் எதுவும் வேண்டாம்.',
      hi: 'पहले 6 महीने सिर्फ़ माँ का दूध — पानी, शहद या घुट्टी नहीं।',
    },
  },
  {
    id: 'f-41',
    kind: 'fact',
    topic: 'breastfeeding',
    stages: ALL,
    source: 'nfhs5Bf',
    learn: 'breastfeeding',
    text: {
      en: 'In India only 41% of babies are breastfed in the first hour (NFHS-5). You can make yours one of them.',
      ta: 'இந்தியாவில் 41% குழந்தைகளுக்கு மட்டுமே முதல் ஒரு மணி நேரத்தில் தாய்ப்பால் கிடைக்கிறது (NFHS-5). உங்கள் குழந்தையும் அவர்களில் ஒன்றாகட்டும்.',
      hi: 'भारत में सिर्फ़ 41% बच्चों को पहले घंटे में माँ का दूध मिलता है (NFHS-5)। आपका बच्चा उनमें से एक हो।',
    },
  },
  {
    id: 'f-mother',
    kind: 'fact',
    topic: 'breastfeeding',
    stages: ['T3', 'PP'],
    source: 'whoBreastfeeding',
    learn: 'breastfeeding',
    text: {
      en: "Breastfeeding lowers the mother's risk of breast cancer, ovarian cancer and type 2 diabetes.",
      ta: 'தாய்ப்பால் கொடுப்பது தாய்க்கு மார்பகப் புற்றுநோய், சினைப்பைப் புற்றுநோய், டைப் 2 நீரிழிவு அபாயத்தைக் குறைக்கிறது.',
      hi: 'स्तनपान से माँ में स्तन कैंसर, अंडाशय कैंसर और टाइप 2 डायबिटीज़ का ख़तरा घटता है।',
    },
  },
  {
    id: 'f-antibody',
    kind: 'fact',
    topic: 'breastfeeding',
    stages: ['T3', 'PP'],
    source: 'whoBreastfeeding',
    learn: 'breastfeeding',
    text: {
      en: 'Antibodies in breast milk protect against diarrhoea and pneumonia, the two leading killers of young children.',
      ta: 'தாய்ப்பாலில் உள்ள எதிர்ப்பொருட்கள் வயிற்றுப்போக்கு, நிமோனியாவிலிருந்து காக்கின்றன — குழந்தை இறப்புக்கான இரண்டு முக்கியக் காரணங்கள்.',
      hi: 'माँ के दूध की एंटीबॉडी दस्त और निमोनिया से बचाती हैं — छोटे बच्चों की मौत के दो सबसे बड़े कारण।',
    },
  },
  {
    id: 'f-csec',
    kind: 'fact',
    topic: 'breastfeeding',
    stages: ['T3'],
    source: 'figoFirstHour',
    learn: 'breastfeeding',
    text: {
      en: 'After a caesarean you can still start breastfeeding early. Ask the staff to help you.',
      ta: 'சிசேரியனுக்குப் பிறகும் சீக்கிரமே தாய்ப்பால் தொடங்கலாம். ஊழியர்களிடம் உதவி கேளுங்கள்.',
      hi: 'सिज़ेरियन के बाद भी जल्दी स्तनपान शुरू कर सकती हैं। स्टाफ़ से मदद माँगें।',
    },
  },
  {
    id: 'f-engorged',
    kind: 'fact',
    topic: 'breastfeeding',
    stages: ['PP'],
    source: 'nhsrcPostpartum',
    learn: 'breastfeeding',
    text: {
      en: 'Hard, painful breasts? Keep feeding with a good latch and use a warm compress. See a doctor if fever starts.',
      ta: 'மார்பகம் கடினமாக, வலியாக உள்ளதா? சரியான முறையில் தொடர்ந்து பால் கொடுங்கள், வெதுவெதுப்பான ஒத்தடம் கொடுங்கள். காய்ச்சல் வந்தால் மருத்துவரைப் பாருங்கள்.',
      hi: 'स्तन सख़्त और दर्द भरे हैं? सही पकड़ के साथ दूध पिलाती रहें, गुनगुनी सिकाई करें। बुख़ार हो तो डॉक्टर को दिखाएँ।',
    },
  },
  {
    id: 'f-rise',
    kind: 'news',
    topic: 'breastfeeding',
    stages: ALL,
    source: 'nfhs5Bf',
    date: '2023-08-04',
    learn: 'breastfeeding',
    text: {
      en: 'Exclusive breastfeeding in India rose from 55% to 64% between NFHS-4 and NFHS-5.',
      ta: 'இந்தியாவில் தாய்ப்பால் மட்டும் கொடுப்பது NFHS-4 முதல் NFHS-5 வரை 55%-இலிருந்து 64% ஆக உயர்ந்தது.',
      hi: 'भारत में सिर्फ़ स्तनपान की दर NFHS-4 से NFHS-5 के बीच 55% से बढ़कर 64% हुई।',
    },
  },

  // ---- PPIUCD --------------------------------------------------------------
  {
    id: 'p-10min',
    kind: 'fact',
    topic: 'ppiucd',
    stages: ['T2', 'T3'],
    source: 'ppiucdIndia',
    learn: 'ppiucd',
    text: {
      en: 'A Copper-T can be placed within 10 minutes of the placenta coming out, while you are still in the labour room.',
      ta: 'நஞ்சுக்கொடி வெளியான 10 நிமிடங்களுக்குள், நீங்கள் பிரசவ அறையில் இருக்கும்போதே, காப்பர்-T பொருத்தலாம்.',
      hi: 'आँवल (प्लेसेंटा) निकलने के 10 मिनट के अंदर, लेबर रूम में ही कॉपर-T लगाया जा सकता है।',
    },
  },
  {
    id: 'p-48h',
    kind: 'fact',
    topic: 'ppiucd',
    stages: ['T3', 'PP'],
    source: 'ppiucdIndia',
    learn: 'ppiucd',
    text: {
      en: 'A postpartum Copper-T can also be placed within 48 hours of delivery, or from 6 weeks after.',
      ta: 'பிரசவத்துக்குப் பின் 48 மணி நேரத்துக்குள், அல்லது 6 வாரங்களுக்குப் பிறகும் காப்பர்-T பொருத்தலாம்.',
      hi: 'कॉपर-T डिलीवरी के 48 घंटे के अंदर, या 6 हफ़्ते बाद भी लगाया जा सकता है।',
    },
  },
  {
    id: 'p-81',
    kind: 'fact',
    topic: 'ppiucd',
    stages: ['T3'],
    source: 'ppiucdIndia',
    learn: 'ppiucd',
    text: {
      en: 'In an Indian study, 81% of women who chose a postpartum Copper-T were still using it at follow-up.',
      ta: 'ஓர் இந்திய ஆய்வில், பிரசவத்துக்குப் பின் காப்பர்-T தேர்ந்தெடுத்த பெண்களில் 81% பேர் பின்தொடர்தலின்போதும் அதைப் பயன்படுத்தினர்.',
      hi: 'एक भारतीय अध्ययन में, डिलीवरी के बाद कॉपर-T चुनने वाली 81% महिलाएँ फ़ॉलो-अप तक उसका इस्तेमाल कर रही थीं।',
    },
  },
  {
    id: 'p-choice',
    kind: 'fact',
    topic: 'ppiucd',
    stages: ['T3'],
    source: 'ppiucdIndia',
    learn: 'ppiucd',
    text: {
      en: 'The choice is yours. In one study, half the women who said no to PPIUCD did so because family refused. Ask your questions privately.',
      ta: 'முடிவு உங்களுடையது. ஓர் ஆய்வில், PPIUCD வேண்டாம் என்றவர்களில் பாதிப் பேர் குடும்பம் மறுத்ததால் அப்படிச் சொன்னார்கள். உங்கள் கேள்விகளைத் தனியாகக் கேளுங்கள்.',
      hi: 'फ़ैसला आपका है। एक अध्ययन में PPIUCD को मना करने वाली आधी महिलाओं ने परिवार के मना करने पर ऐसा किया। अपने सवाल अकेले में पूछें।',
    },
  },
  {
    id: 'p-followup',
    kind: 'fact',
    topic: 'ppiucd',
    stages: ['PP'],
    source: 'ppiucdIndia',
    learn: 'ppiucd',
    text: {
      en: 'The first check after a Copper-T is at about 6 weeks. Come earlier for fever, foul discharge, belly pain, or if you think it came out.',
      ta: 'காப்பர்-T பொருத்திய பின் முதல் பரிசோதனை சுமார் 6 வாரத்தில். காய்ச்சல், துர்நாற்றமுள்ள வெள்ளைப்படுதல், வயிற்று வலி இருந்தாலோ, அது வெளியே வந்ததாகத் தோன்றினாலோ முன்பே வாருங்கள்.',
      hi: 'कॉपर-T के बाद पहली जाँच लगभग 6 हफ़्ते पर होती है। बुख़ार, बदबूदार स्राव, पेट दर्द हो या लगे कि यह निकल गया है, तो पहले आएँ।',
    },
  },

  // ---- Mind & safety ---------------------------------------------------------
  {
    id: 'm-1in5',
    kind: 'fact',
    topic: 'mind',
    stages: ALL,
    source: 'ppdIndia',
    learn: 'mind',
    text: {
      en: 'About 1 in 5 mothers in India has depression after delivery. It is common, treatable, and not your fault.',
      ta: 'இந்தியாவில் ஏறக்குறைய 5-இல் 1 தாய்க்குப் பிரசவத்துக்குப் பின் மனச்சோர்வு வருகிறது. இது பொதுவானது, குணப்படுத்தக்கூடியது, உங்கள் தவறு அல்ல.',
      hi: 'भारत में लगभग हर 5 में से 1 माँ को डिलीवरी के बाद डिप्रेशन होता है। यह आम है, इलाज संभव है, और इसमें आपकी कोई ग़लती नहीं।',
    },
  },
  {
    id: 'm-telemanas',
    kind: 'fact',
    topic: 'mind',
    stages: ALL,
    source: 'teleManas',
    learn: 'mind',
    text: {
      en: 'Tele-MANAS gives free mental-health support, 24x7. Call 14416.',
      ta: 'டெலி-மனஸ் இலவச மனநல ஆதரவை 24 மணி நேரமும் வழங்குகிறது. 14416-ஐ அழையுங்கள்.',
      hi: 'टेली-मानस 24x7 मुफ़्त मानसिक स्वास्थ्य सहायता देता है। 14416 पर कॉल करें।',
    },
  },
  {
    id: 'm-who',
    kind: 'fact',
    topic: 'mind',
    stages: ['T3', 'PP'],
    source: 'whoPnc',
    learn: 'mind',
    text: {
      en: 'WHO recommends that every new mother is checked for depression and anxiety after birth.',
      ta: 'ஒவ்வொரு புதிய தாய்க்கும் பிரசவத்துக்குப் பின் மனச்சோர்வு, பதட்டம் பரிசோதிக்க வேண்டும் என WHO பரிந்துரைக்கிறது.',
      hi: 'WHO की सलाह है कि हर नई माँ की डिलीवरी के बाद डिप्रेशन और बेचैनी की जाँच हो।',
    },
  },
  {
    id: 'm-week',
    kind: 'fact',
    topic: 'mind',
    stages: ['PP'],
    source: 'nhsrcPostpartum',
    learn: 'mind',
    text: {
      en: "Mood changes that don't get better in about a week should be shown to a doctor.",
      ta: 'ஒரு வாரத்தில் சரியாகாத மனநிலை மாற்றங்களை மருத்துவரிடம் சொல்லுங்கள்.',
      hi: 'मूड के बदलाव लगभग एक हफ़्ते में ठीक न हों तो डॉक्टर को बताएँ।',
    },
  },
  {
    id: 's-181',
    kind: 'fact',
    topic: 'safety',
    stages: ALL,
    source: 'whl181',
    learn: 'couple',
    text: {
      en: 'Feeling unsafe at home? Women Helpline 181 is free.',
      ta: 'வீட்டில் பாதுகாப்பற்றதாக உணர்கிறீர்களா? பெண்கள் உதவி எண் 181 இலவசம்.',
      hi: 'घर में असुरक्षित महसूस करती हैं? महिला हेल्पलाइन 181 मुफ़्त है।',
    },
  },

  // ---- Schemes / current events -------------------------------------------
  {
    id: 's-pmsma9',
    kind: 'fact',
    topic: 'scheme',
    stages: ['T1', 'T2', 'T3'],
    source: 'pibPmsma',
    learn: 'schemes',
    text: {
      en: 'Free antenatal check-up on the 9th of every month at government facilities (PMSMA): tests, scan and medicines.',
      ta: 'ஒவ்வொரு மாதமும் 9-ஆம் தேதி அரசு மருத்துவமனைகளில் இலவச கர்ப்பகாலப் பரிசோதனை (PMSMA): பரிசோதனைகள், ஸ்கேன், மருந்துகள்.',
      hi: 'हर महीने की 9 तारीख़ को सरकारी अस्पतालों में मुफ़्त प्रसवपूर्व जाँच (PMSMA): टेस्ट, स्कैन और दवाइयाँ।',
    },
  },
  {
    id: 'n-pmsma10',
    kind: 'news',
    topic: 'scheme',
    stages: ALL,
    source: 'pibPmsma',
    date: '2026-06-09',
    learn: 'schemes',
    text: {
      en: 'PMSMA turned 10 on 9 June 2026. More than 7.5 crore pregnant women have been checked under it.',
      ta: 'PMSMA 9 ஜூன் 2026 அன்று 10 ஆண்டுகளை நிறைவு செய்தது. 7.5 கோடிக்கும் மேற்பட்ட கர்ப்பிணிகள் இதன் கீழ் பரிசோதிக்கப்பட்டுள்ளனர்.',
      hi: 'PMSMA ने 9 जून 2026 को 10 साल पूरे किए। इसके तहत 7.5 करोड़ से ज़्यादा गर्भवती महिलाओं की जाँच हुई है।',
    },
  },
  {
    id: 'n-mmr',
    kind: 'news',
    topic: 'scheme',
    stages: ALL,
    source: 'pibPmsma',
    date: '2026-06-09',
    learn: 'schemes',
    text: {
      en: "India's maternal deaths fell from 130 to 87 per lakh live births between 2014–16 and 2022–24.",
      ta: 'இந்தியாவில் தாய் இறப்பு விகிதம் 2014–16 முதல் 2022–24 வரை லட்சம் பிறப்புகளுக்கு 130-இலிருந்து 87 ஆகக் குறைந்தது.',
      hi: 'भारत में मातृ मृत्यु दर 2014–16 से 2022–24 के बीच प्रति लाख जीवित जन्म 130 से घटकर 87 हुई।',
    },
  },
  {
    id: 's-epmsma',
    kind: 'fact',
    topic: 'scheme',
    stages: ['T2', 'T3'],
    source: 'pibPmsma',
    learn: 'schemes',
    text: {
      en: 'High-risk pregnancy? Extended PMSMA gives extra check-ups and SMS alerts until a safe delivery.',
      ta: 'அதிக அபாயக் கர்ப்பமா? விரிவாக்கப்பட்ட PMSMA பாதுகாப்பான பிரசவம் வரை கூடுதல் பரிசோதனைகளும் SMS நினைவூட்டல்களும் தருகிறது.',
      hi: 'हाई-रिस्क गर्भावस्था? विस्तारित PMSMA सुरक्षित डिलीवरी तक अतिरिक्त जाँच और SMS अलर्ट देता है।',
    },
  },
  {
    id: 's-jsy',
    kind: 'fact',
    topic: 'scheme',
    stages: PREG,
    source: 'pibPmsma',
    learn: 'schemes',
    text: {
      en: 'JSY and JSSK support free, safe delivery and newborn care in government hospitals.',
      ta: 'JSY, JSSK திட்டங்கள் அரசு மருத்துவமனைகளில் இலவசப் பாதுகாப்பான பிரசவத்துக்கும் பச்சிளம் குழந்தைப் பராமரிப்புக்கும் உதவுகின்றன.',
      hi: 'JSY और JSSK सरकारी अस्पतालों में मुफ़्त, सुरक्षित डिलीवरी और नवजात देखभाल में मदद करते हैं।',
    },
  },

  // ---- Nutrition / postnatal ----------------------------------------------
  {
    id: 'nu-ifa',
    kind: 'fact',
    topic: 'nutrition',
    stages: ['T2', 'T3'],
    source: 'amb',
    text: {
      en: 'One IFA tablet a day: 180 days in pregnancy, then 180 days after delivery.',
      ta: 'தினமும் ஒரு IFA மாத்திரை: கர்ப்பத்தில் 180 நாட்கள், பிரசவத்துக்குப் பின் இன்னும் 180 நாட்கள்.',
      hi: 'रोज़ एक IFA गोली: गर्भावस्था में 180 दिन, फिर डिलीवरी के बाद 180 दिन।',
    },
  },
  {
    id: 'nu-ifa-pp',
    kind: 'fact',
    topic: 'nutrition',
    stages: ['PP'],
    source: 'amb',
    text: {
      en: "Don't stop the iron tablet after delivery. It continues for 180 days.",
      ta: 'பிரசவத்துக்குப் பின் இரும்புச்சத்து மாத்திரையை நிறுத்தாதீர்கள். அது 180 நாட்கள் தொடரும்.',
      hi: 'डिलीवरी के बाद आयरन की गोली बंद न करें। यह 180 दिन चलती है।',
    },
  },
  {
    id: 'c-3visits',
    kind: 'fact',
    topic: 'postnatal',
    stages: ['T3', 'PP'],
    source: 'whoPnc',
    learn: 'postnatal',
    text: {
      en: 'WHO advises at least 3 check-ups after birth: at 2–3 days, 1–2 weeks and 6 weeks.',
      ta: 'பிரசவத்துக்குப் பின் குறைந்தது 3 பரிசோதனைகள் வேண்டும் என WHO அறிவுறுத்துகிறது: 2–3 நாள், 1–2 வாரம், 6 வாரம்.',
      hi: 'WHO की सलाह: डिलीवरी के बाद कम से कम 3 जाँच — 2–3 दिन, 1–2 हफ़्ते और 6 हफ़्ते पर।',
    },
  },
  {
    id: 'c-pads',
    kind: 'fact',
    topic: 'postnatal',
    stages: ['PP'],
    source: 'nhsrcPostpartum',
    learn: 'warning',
    text: {
      en: 'Soaking more than 5 pads a day after delivery is heavy bleeding. Go to hospital.',
      ta: 'பிரசவத்துக்குப் பின் நாளுக்கு 5-க்கும் மேற்பட்ட பேட்கள் நனைந்தால் அது அதிக இரத்தப்போக்கு. மருத்துவமனைக்குச் செல்லுங்கள்.',
      hi: 'डिलीवरी के बाद दिन में 5 से ज़्यादा पैड भीगें तो यह ज़्यादा ख़ून बहना है। अस्पताल जाएँ।',
    },
  },
  {
    id: 'c-infection',
    kind: 'fact',
    topic: 'postnatal',
    stages: ['PP'],
    source: 'nhsrcPostpartum',
    learn: 'warning',
    text: {
      en: 'Foul-smelling discharge with fever after delivery can be an infection. Get checked the same day.',
      ta: 'பிரசவத்துக்குப் பின் காய்ச்சலுடன் துர்நாற்ற வெள்ளைப்படுதல் தொற்றாக இருக்கலாம். அன்றே பரிசோதித்துக்கொள்ளுங்கள்.',
      hi: 'डिलीवरी के बाद बुख़ार के साथ बदबूदार स्राव संक्रमण हो सकता है। उसी दिन जाँच कराएँ।',
    },
  },

  // ---- Motivation (no medical claims) -----------------------------------------
  {
    id: 'mo-steps',
    kind: 'motivation',
    topic: 'motivation',
    stages: ALL,
    text: {
      en: "Small steps every day add up. You're doing this well.",
      ta: 'தினமும் சிறிய அடிகள் பெரிய மாற்றமாகும். நீங்கள் நன்றாகச் செய்கிறீர்கள்.',
      hi: 'रोज़ के छोटे कदम मिलकर बड़ा बदलाव लाते हैं। आप अच्छा कर रही हैं।',
    },
  },
  {
    id: 'mo-help',
    kind: 'motivation',
    topic: 'motivation',
    stages: ALL,
    text: {
      en: 'Asking for help is strength, not weakness.',
      ta: 'உதவி கேட்பது பலவீனம் அல்ல, பலம்.',
      hi: 'मदद माँगना कमज़ोरी नहीं, हिम्मत है।',
    },
  },
  {
    id: 'mo-you',
    kind: 'motivation',
    topic: 'motivation',
    stages: ALL,
    text: {
      en: "Your health matters as much as your baby's.",
      ta: 'உங்கள் உடல்நலமும் குழந்தையின் உடல்நலம் அளவுக்கே முக்கியம்.',
      hi: 'आपकी सेहत भी उतनी ही ज़रूरी है जितनी बच्चे की।',
    },
  },
  {
    id: 'mo-two',
    kind: 'motivation',
    topic: 'motivation',
    stages: PREG,
    text: {
      en: 'Every tablet you take today is care for two.',
      ta: 'இன்று நீங்கள் எடுக்கும் ஒவ்வொரு மாத்திரையும் இருவருக்கான அக்கறை.',
      hi: 'आज ली गई हर गोली दो ज़िंदगियों की देखभाल है।',
    },
  },
  {
    id: 'mo-rest',
    kind: 'motivation',
    topic: 'motivation',
    stages: ['PP'],
    text: {
      en: 'Rest when your baby sleeps. The housework can wait.',
      ta: 'குழந்தை தூங்கும்போது நீங்களும் ஓய்வெடுங்கள். வீட்டு வேலை காத்திருக்கலாம்.',
      hi: 'जब बच्चा सोए, आप भी आराम करें। घर का काम इंतज़ार कर सकता है।',
    },
  },
  {
    id: 'mo-alone',
    kind: 'motivation',
    topic: 'motivation',
    stages: ALL,
    text: {
      en: 'You are not alone. Millions of mothers are walking this path with you.',
      ta: 'நீங்கள் தனியாக இல்லை. லட்சக்கணக்கான தாய்மார்கள் உங்களுடன் இந்தப் பாதையில் நடக்கிறார்கள்.',
      hi: 'आप अकेली नहीं हैं। लाखों माँएँ आपके साथ इस राह पर हैं।',
    },
  },
];

export function factsForStage(stage: StageTag, opts: { kinds?: Fact['kind'][]; topic?: FactTopic } = {}): Fact[] {
  return FACTS.filter(
    (f) =>
      (f.stages === 'ALL' || f.stages.includes(stage)) &&
      (!opts.kinds || opts.kinds.includes(f.kind)) &&
      (!opts.topic || f.topic === opts.topic),
  );
}

/** Small string hash so a "random" pick is stable for a given place on a given day. */
function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/**
 * Pick a fact for a slot. `slot` is the place in the UI ("home-2", "care-1");
 * the same slot shows the same fact for a whole day, different slots and days
 * show different facts — so it feels random without flickering on re-render.
 */
export function factForSlot(stage: StageTag, slot: string, opts: { kinds?: Fact['kind'][]; topic?: FactTopic; day?: string } = {}): Fact {
  const pool = factsForStage(stage, opts);
  const list = pool.length ? pool : FACTS;
  const day = opts.day ?? new Date().toISOString().slice(0, 10);
  return list[hash(`${slot}|${day}`) % list.length];
}

/** Truly random pick (used by the load screen so each open feels new). */
export function randomFact(stage: StageTag, kinds: Fact['kind'][] = ['fact', 'news']): Fact {
  const pool = factsForStage(stage, { kinds });
  return pool[Math.floor(Math.random() * pool.length)];
}
