import type { LText } from '../i18n';
import type { SourceId } from './sources';

/**
 * Short "Learn" pages. Kept deliberately small — the same facts also appear as
 * chips around the app, so nobody has to open these to see what matters.
 */
export interface Article {
  id: string;
  title: LText;
  summary: LText;
  points: LText[];
  sources: SourceId[];
  urgent?: boolean;
  sensitive?: boolean;
}

const L = (en: string, ta: string, hi: string): LText => ({ en, ta, hi });

export const ARTICLES: Article[] = [
  {
    id: 'warning',
    urgent: true,
    title: L('Signs that need a hospital now', 'உடனே மருத்துவமனை செல்ல வேண்டிய அறிகுறிகள்', 'इन लक्षणों में तुरंत अस्पताल जाएँ'),
    summary: L('Do not wait for a reminder. Call 108 for an ambulance.', 'நினைவூட்டலுக்குக் காத்திருக்காதீர்கள். ஆம்புலன்ஸுக்கு 108 அழையுங்கள்.', 'रिमाइंडर का इंतज़ार न करें। एम्बुलेंस के लिए 108 पर कॉल करें।'),
    points: [
      L(
        'In pregnancy: bleeding, severe headache, blurred vision, fits, severe belly pain, baby moving less, water leaking, high fever.',
        'கர்ப்பத்தில்: இரத்தப்போக்கு, கடுமையான தலைவலி, பார்வை மங்கல், வலிப்பு, கடுமையான வயிற்று வலி, குழந்தை அசைவு குறைதல், நீர் கசிதல், அதிக காய்ச்சல்.',
        'गर्भावस्था में: ख़ून आना, तेज़ सिरदर्द, धुंधला दिखना, दौरे, पेट में तेज़ दर्द, बच्चे का कम हिलना, पानी रिसना, तेज़ बुख़ार।',
      ),
      L(
        'After delivery: soaking more than 5 pads a day, foul discharge with fever, fits, severe headache or blurred vision, a hot painful breast with fever.',
        'பிரசவத்துக்குப் பின்: நாளுக்கு 5-க்கும் மேற்பட்ட பேட்கள் நனைதல், காய்ச்சலுடன் துர்நாற்ற வெள்ளைப்படுதல், வலிப்பு, கடுமையான தலைவலி அல்லது பார்வை மங்கல், காய்ச்சலுடன் சூடான வலிக்கும் மார்பகம்.',
        'डिलीवरी के बाद: दिन में 5 से ज़्यादा पैड भीगना, बुख़ार के साथ बदबूदार स्राव, दौरे, तेज़ सिरदर्द या धुंधला दिखना, बुख़ार के साथ गर्म और दर्द भरा स्तन।',
      ),
      L(
        'BP of 160/110 or more is an emergency, even if you feel fine.',
        'BP 160/110 அல்லது அதற்கு மேல் இருந்தால், நன்றாக உணர்ந்தாலும் அது அவசர நிலை.',
        'BP 160/110 या उससे ज़्यादा हो तो यह इमरजेंसी है, भले आप ठीक महसूस करें।',
      ),
      L('This app does not diagnose. When in doubt, go and get checked.', 'இந்த செயலி நோயறிதல் செய்யாது. சந்தேகம் இருந்தால் சென்று பரிசோதியுங்கள்.', 'यह ऐप बीमारी नहीं पहचानता। शक हो तो जाकर जाँच कराएँ।'),
    ],
    sources: ['whoPreeclampsia', 'nhsrcPostpartum', 'acogUrgent'],
  },
  {
    id: 'bp',
    title: L('Blood pressure in the 40 days after birth', 'பிரசவத்துக்குப் பின் 40 நாட்களில் BP', 'डिलीवरी के बाद 40 दिनों में BP'),
    summary: L(
      'The traditional 40 days of rest are also the weeks when high BP can return.',
      'பாரம்பரிய 40 நாள் ஓய்வுக் காலத்திலேயே உயர் BP மீண்டும் வரலாம்.',
      'आराम के पारंपरिक 40 दिन वही हफ़्ते हैं जब हाई BP लौट सकता है।',
    ),
    points: [
      L('High BP and pre-eclampsia can start or get worse after delivery.', 'உயர் BP-யும் முன்-எக்லாம்ப்சியாவும் பிரசவத்துக்குப் பின் தொடங்கலாம் அல்லது மோசமாகலாம்.', 'हाई BP और प्री-एक्लेम्पसिया डिलीवरी के बाद शुरू हो सकते हैं या बढ़ सकते हैं।'),
      L('Check BP at least once between day 3 and day 5. If you had high BP in pregnancy, you need more checks.', '3-ஆம் நாள் முதல் 5-ஆம் நாளுக்குள் குறைந்தது ஒருமுறை BP பாருங்கள். கர்ப்பத்தில் உயர் BP இருந்தால் கூடுதல் பரிசோதனைகள் தேவை.', 'तीसरे से पाँचवें दिन के बीच कम से कम एक बार BP जाँचें। गर्भावस्था में हाई BP था तो और जाँच ज़रूरी हैं।'),
      L('Goal: below 140/90.', 'இலக்கு: 140/90-க்குக் கீழ்.', 'लक्ष्य: 140/90 से कम।'),
      L('140/90 or above: tell your doctor or health centre today.', '140/90 அல்லது அதற்கு மேல்: இன்றே மருத்துவர் அல்லது சுகாதார நிலையத்திடம் சொல்லுங்கள்.', '140/90 या ज़्यादा: आज ही डॉक्टर या स्वास्थ्य केंद्र को बताएँ।'),
      L('160/110 or above, or headache, blurred vision, pain below the ribs, fits: go to hospital now. Call 108.', '160/110 அல்லது அதற்கு மேல், அல்லது தலைவலி, பார்வை மங்கல், விலா எலும்புக்குக் கீழ் வலி, வலிப்பு: உடனே மருத்துவமனை. 108 அழையுங்கள்.', '160/110 या ज़्यादा, या सिरदर्द, धुंधला दिखना, पसलियों के नीचे दर्द, दौरे: अभी अस्पताल जाएँ। 108 पर कॉल करें।'),
      L('Take BP medicine exactly as prescribed. Do not stop it on your own.', 'BP மருந்தைச் சொன்னபடியே எடுங்கள். நீங்களாக நிறுத்தாதீர்கள்.', 'BP की दवा बिल्कुल बताए अनुसार लें। अपने आप बंद न करें।'),
      L('See your doctor 6 to 8 weeks after birth for a BP review.', 'பிரசவத்துக்கு 6 முதல் 8 வாரங்களில் BP மறுபரிசோதனைக்கு மருத்துவரைப் பாருங்கள்.', 'डिलीवरी के 6 से 8 हफ़्ते पर BP की समीक्षा के लिए डॉक्टर से मिलें।'),
    ],
    sources: ['niceNg133', 'whoPreeclampsia', 'acogUrgent'],
  },
  {
    id: 'vaccines',
    title: L('Vaccines for you and your baby', 'உங்களுக்கும் குழந்தைக்கும் தடுப்பூசிகள்', 'आपके और बच्चे के टीके'),
    summary: L('All vaccines in the national schedule are free at government centres.', 'தேசிய அட்டவணையில் உள்ள அனைத்துத் தடுப்பூசிகளும் அரசு மையங்களில் இலவசம்.', 'राष्ट्रीय सूची के सभी टीके सरकारी केंद्रों पर मुफ़्त हैं।'),
    points: [
      L('You: Td-1 early in pregnancy, Td-2 four weeks later — or one booster if you had 2 doses in a pregnancy in the last 3 years.', 'நீங்கள்: கர்ப்பத் தொடக்கத்தில் Td-1, 4 வாரம் கழித்து Td-2 — கடந்த 3 ஆண்டுகளில் ஒரு கர்ப்பத்தில் 2 டோஸ் போட்டிருந்தால் ஒரு பூஸ்டர் மட்டும்.', 'आप: गर्भावस्था की शुरुआत में Td-1, चार हफ़्ते बाद Td-2 — या पिछले 3 साल में किसी गर्भावस्था में 2 खुराक ली हों तो एक बूस्टर।'),
      L('Baby at birth: BCG, OPV-0, Hepatitis B (within 24 hours).', 'பிறந்தவுடன்: BCG, OPV-0, ஹெபடைடிஸ் B (24 மணி நேரத்துக்குள்).', 'जन्म पर: BCG, OPV-0, हेपेटाइटिस B (24 घंटे के अंदर)।'),
      L('6, 10 and 14 weeks: OPV, Pentavalent, Rotavirus; IPV and PCV at 6 and 14 weeks.', '6, 10, 14 வாரங்கள்: OPV, பென்டாவேலன்ட், ரோட்டாவைரஸ்; 6, 14 வாரங்களில் IPV, PCV.', '6, 10 और 14 हफ़्ते: OPV, पेंटावैलेंट, रोटावायरस; 6 और 14 हफ़्ते पर IPV और PCV।'),
      L('9–12 months: MR, PCV booster, Vitamin A (and JE in some districts).', '9–12 மாதம்: MR, PCV பூஸ்டர், வைட்டமின் A (சில மாவட்டங்களில் JE).', '9–12 महीने: MR, PCV बूस्टर, विटामिन A (कुछ ज़िलों में JE)।'),
      L('16–24 months: MR-2, DPT booster, OPV booster.', '16–24 மாதம்: MR-2, DPT பூஸ்டர், OPV பூஸ்டர்.', '16–24 महीने: MR-2, DPT बूस्टर, OPV बूस्टर।'),
      L('Bring your vaccination card to every visit.', 'ஒவ்வொரு முறையும் தடுப்பூசி அட்டையைக் கொண்டு வாருங்கள்.', 'हर बार टीकाकरण कार्ड साथ लाएँ।'),
    ],
    sources: ['nis', 'pibVaccines'],
  },
  {
    id: 'breastfeeding',
    title: L('Getting ready to breastfeed', 'தாய்ப்பால் கொடுக்கத் தயாராகுதல்', 'स्तनपान की तैयारी'),
    summary: L('Decide now, before labour, so the first hour goes your way.', 'பிரசவத்துக்கு முன்பே முடிவு செய்யுங்கள், அப்போதுதான் முதல் மணி நேரம் சரியாக நடக்கும்.', 'अभी, डिलीवरी से पहले तय करें, ताकि पहला घंटा आपके हिसाब से हो।'),
    points: [
      L('Start within the first hour after birth. Skin-to-skin contact helps.', 'பிறந்த முதல் ஒரு மணி நேரத்துக்குள் தொடங்குங்கள். தோலோடு தோல் தொடுதல் உதவும்.', 'जन्म के पहले घंटे में शुरू करें। त्वचा से त्वचा का संपर्क मदद करता है।'),
      L('Colostrum, the first thick yellow milk, is not dirty. It is exactly what your baby needs.', 'முதல் அடர்ந்த மஞ்சள் பால் (சீம்பால்) அசுத்தம் அல்ல. குழந்தைக்குத் தேவையானது அதுவே.', 'पहला गाढ़ा पीला दूध (कोलोस्ट्रम) गंदा नहीं है। बच्चे को ठीक यही चाहिए।'),
      L('Only breast milk for 6 months, whenever the baby wants.', '6 மாதங்கள் தாய்ப்பால் மட்டும், குழந்தை கேட்கும்போதெல்லாம்.', '6 महीने सिर्फ़ माँ का दूध, जब भी बच्चा चाहे।'),
      L('Ask the nurse to check that your baby is attached and positioned well.', 'குழந்தை சரியாகப் பிடித்து, சரியான நிலையில் இருக்கிறதா என செவிலியரிடம் பார்க்கச் சொல்லுங்கள்.', 'नर्स से जाँच कराएँ कि बच्चा सही से पकड़ रहा है और सही स्थिति में है।'),
      L('After a caesarean, ask for help to start early.', 'சிசேரியனுக்குப் பின், சீக்கிரம் தொடங்க உதவி கேளுங்கள்.', 'सिज़ेरियन के बाद जल्दी शुरू करने के लिए मदद माँगें।'),
      L('From 6 months add soft home food and keep breastfeeding to 2 years or more.', '6 மாதத்திலிருந்து மென்மையான வீட்டு உணவு சேர்த்து, 2 ஆண்டுகள் அல்லது அதற்கு மேல் தாய்ப்பால் தொடருங்கள்.', '6 महीने से नरम घर का खाना जोड़ें और 2 साल या उससे ज़्यादा स्तनपान जारी रखें।'),
      L('Hard, painful breasts: keep feeding, use a warm compress, see a doctor if fever starts.', 'மார்பகம் கடினமாக, வலியாக இருந்தால்: தொடர்ந்து பால் கொடுங்கள், வெதுவெதுப்பான ஒத்தடம், காய்ச்சல் வந்தால் மருத்துவர்.', 'स्तन सख़्त और दर्द भरे हों: दूध पिलाती रहें, गुनगुनी सिकाई करें, बुख़ार हो तो डॉक्टर।'),
    ],
    sources: ['figoFirstHour', 'whoBreastfeeding', 'whoPnc', 'nhsrcPostpartum'],
  },
  {
    id: 'ppiucd',
    sensitive: true,
    title: L('Copper-T after delivery (PPIUCD)', 'பிரசவத்துக்குப் பின் காப்பர்-T (PPIUCD)', 'डिलीवरी के बाद कॉपर-T (PPIUCD)'),
    summary: L('A spacing method you can decide on before labour. Your choice, made privately.', 'பிரசவத்துக்கு முன்பே முடிவு செய்யக்கூடிய இடைவெளி முறை. உங்கள் தேர்வு, தனிப்பட்ட முறையில்.', 'बच्चों में अंतर का तरीका, जिसे डिलीवरी से पहले तय कर सकती हैं। आपका चुनाव, निजी रूप से।'),
    points: [
      L('A Copper-T can be placed within 10 minutes of the placenta, during a caesarean, or within 48 hours of delivery.', 'நஞ்சுக்கொடி வெளியான 10 நிமிடங்களுக்குள், சிசேரியனின்போது, அல்லது பிரசவத்துக்கு 48 மணி நேரத்துக்குள் காப்பர்-T பொருத்தலாம்.', 'कॉपर-T आँवल निकलने के 10 मिनट में, सिज़ेरियन के दौरान, या डिलीवरी के 48 घंटे के अंदर लगाया जा सकता है।'),
      L('It is reversible. It can be removed whenever you want another pregnancy.', 'இதை நீக்கலாம். இன்னொரு கர்ப்பம் வேண்டும்போது அகற்றிவிடலாம்.', 'इसे हटाया जा सकता है। जब दूसरा बच्चा चाहें, निकलवा सकती हैं।'),
      L('Some women have more bleeding at first. In an Indian study about 9 in 100 slipped out, mostly in the first month.', 'சிலருக்கு ஆரம்பத்தில் அதிக இரத்தப்போக்கு இருக்கலாம். ஓர் இந்திய ஆய்வில் 100-இல் சுமார் 9 வெளியே வந்தன, பெரும்பாலும் முதல் மாதத்தில்.', 'कुछ महिलाओं को शुरू में ज़्यादा ख़ून आता है। एक भारतीय अध्ययन में 100 में से लगभग 9 निकल गए, ज़्यादातर पहले महीने में।'),
      L('Your doctor checks if it is right for you — for example, not after fever in labour or heavy bleeding after birth.', 'இது உங்களுக்கு ஏற்றதா என மருத்துவர் பார்ப்பார் — உதாரணமாக, பிரசவ நேரக் காய்ச்சல் அல்லது பிரசவத்துக்குப் பின் அதிக இரத்தப்போக்கு இருந்தால் பொருத்த மாட்டார்கள்.', 'डॉक्टर जाँचेंगे कि यह आपके लिए ठीक है या नहीं — जैसे लेबर में बुख़ार या डिलीवरी के बाद ज़्यादा ख़ून आने पर नहीं लगाते।'),
      L('First check at about 6 weeks. Come earlier for fever, foul discharge, belly pain, or if it seems to have come out.', 'முதல் பரிசோதனை சுமார் 6 வாரத்தில். காய்ச்சல், துர்நாற்ற வெள்ளைப்படுதல், வயிற்று வலி, அல்லது வெளியே வந்ததாகத் தோன்றினால் முன்பே வாருங்கள்.', 'पहली जाँच लगभग 6 हफ़्ते पर। बुख़ार, बदबूदार स्राव, पेट दर्द हो या लगे कि निकल गया है तो पहले आएँ।'),
      L('You can record your decision privately in this app and change it anytime.', 'உங்கள் முடிவை இந்த செயலியில் தனிப்பட்ட முறையில் பதிவு செய்து, எப்போது வேண்டுமானாலும் மாற்றலாம்.', 'आप अपना फ़ैसला इस ऐप में निजी रूप से दर्ज कर सकती हैं और कभी भी बदल सकती हैं।'),
    ],
    sources: ['ppiucdIndia'],
  },
  {
    id: 'mind',
    sensitive: true,
    title: L('Your mind matters too', 'உங்கள் மனநலமும் முக்கியம்', 'आपका मन भी मायने रखता है'),
    summary: L('Low mood after birth is common and treatable. Help is free and private.', 'பிரசவத்துக்குப் பின் மனச்சோர்வு பொதுவானது, குணப்படுத்தக்கூடியது. உதவி இலவசம், ரகசியமானது.', 'डिलीवरी के बाद उदासी आम है और इसका इलाज है। मदद मुफ़्त और निजी है।'),
    points: [
      L('About 1 in 5 mothers in India has depression after delivery.', 'இந்தியாவில் ஏறக்குறைய 5-இல் 1 தாய்க்குப் பிரசவத்துக்குப் பின் மனச்சோர்வு வருகிறது.', 'भारत में लगभग हर 5 में से 1 माँ को डिलीवरी के बाद डिप्रेशन होता है।'),
      L("Mood changes that don't get better in about a week should be shown to a doctor.", 'ஒரு வாரத்தில் சரியாகாத மனநிலை மாற்றங்களை மருத்துவரிடம் சொல்லுங்கள்.', 'मूड के बदलाव लगभग एक हफ़्ते में ठीक न हों तो डॉक्टर को बताएँ।'),
      L('The 10-question mood check (EPDS) helps you and your doctor see how you are. It is not a diagnosis.', '10 கேள்வி மனநிலைச் சோதனை (EPDS) நீங்கள் எப்படி இருக்கிறீர்கள் என உங்களுக்கும் மருத்துவருக்கும் காட்டும். இது நோயறிதல் அல்ல.', '10 सवालों की मूड जाँच (EPDS) आपको और डॉक्टर को आपका हाल समझने में मदद करती है। यह बीमारी की पहचान नहीं है।'),
      L('Tele-MANAS: call 14416, free, 24x7, in your language.', 'டெலி-மனஸ்: 14416 அழையுங்கள், இலவசம், 24 மணி நேரமும், உங்கள் மொழியில்.', 'टेली-मानस: 14416 पर कॉल करें, मुफ़्त, 24x7, आपकी भाषा में।'),
      L('If you ever think of harming yourself, call 14416 now or go to the nearest hospital.', 'உங்களைக் காயப்படுத்திக்கொள்ளும் எண்ணம் வந்தால், இப்போதே 14416 அழையுங்கள் அல்லது அருகிலுள்ள மருத்துவமனைக்குச் செல்லுங்கள்.', 'अगर कभी ख़ुद को नुकसान पहुँचाने का ख़याल आए, तो अभी 14416 पर कॉल करें या नज़दीकी अस्पताल जाएँ।'),
      L('Family can help: share night feeds and housework, and let her sleep.', 'குடும்பம் உதவலாம்: இரவுப் பால் கொடுத்தலிலும் வீட்டு வேலையிலும் பங்கெடுத்து, அவரைத் தூங்க விடுங்கள்.', 'परिवार मदद कर सकता है: रात की देखभाल और घर के काम बाँटें, और उसे सोने दें।'),
    ],
    sources: ['ppdIndia', 'nhsrcPostpartum', 'epds', 'teleManas', 'whoPnc'],
  },
  {
    id: 'couple',
    sensitive: true,
    title: L('Couple counselling', 'தம்பதியர் ஆலோசனை', 'दंपति परामर्श'),
    summary: L('A space for both of you to plan together. It does not mean something is wrong.', 'நீங்கள் இருவரும் சேர்ந்து திட்டமிடும் இடம். ஏதோ தவறு என்று அர்த்தமில்லை.', 'आप दोनों के साथ मिलकर योजना बनाने की जगह। इसका मतलब यह नहीं कि कुछ ग़लत है।'),
    points: [
      L('A new baby changes sleep, money, roles and family expectations for both partners.', 'புதிய குழந்தை இருவரின் தூக்கம், பணம், பொறுப்புகள், குடும்ப எதிர்பார்ப்புகளை மாற்றுகிறது.', 'नया बच्चा दोनों की नींद, पैसे, ज़िम्मेदारियाँ और परिवार की उम्मीदें बदल देता है।'),
      L('Counselling can help you talk about these, and about decisions like spacing the next child.', 'இவற்றைப் பற்றியும், அடுத்த குழந்தைக்கான இடைவெளி போன்ற முடிவுகளைப் பற்றியும் பேச ஆலோசனை உதவும்.', 'परामर्श इन बातों पर और अगले बच्चे में अंतर जैसे फ़ैसलों पर बात करने में मदद करता है।'),
      L('You can request a session here. It does not show on your home screen.', 'இங்கே அமர்வைக் கோரலாம். அது முகப்புத் திரையில் தெரியாது.', 'आप यहाँ सत्र का अनुरोध कर सकती हैं। यह होम स्क्रीन पर नहीं दिखता।'),
      L('If you feel unsafe at home, Women Helpline 181 is free.', 'வீட்டில் பாதுகாப்பற்றதாக உணர்ந்தால், பெண்கள் உதவி எண் 181 இலவசம்.', 'घर में असुरक्षित महसूस करें तो महिला हेल्पलाइन 181 मुफ़्त है।'),
    ],
    sources: ['whl181'],
  },
  {
    id: 'postnatal',
    title: L('Check-ups after birth', 'பிரசவத்துக்குப் பின் பரிசோதனைகள்', 'डिलीवरी के बाद की जाँच'),
    summary: L('Most problems after birth happen in the first weeks. These visits catch them.', 'பிரசவத்துக்குப் பின் பெரும்பாலான பிரச்சனைகள் முதல் வாரங்களில் வருகின்றன. இந்தப் பரிசோதனைகள் அவற்றைக் கண்டுபிடிக்கும்.', 'डिलीवरी के बाद ज़्यादातर दिक्कतें पहले हफ़्तों में होती हैं। ये जाँच उन्हें पकड़ती हैं।'),
    points: [
      L('Stay at the facility for at least 24 hours after birth.', 'பிரசவத்துக்குப் பின் குறைந்தது 24 மணி நேரம் மருத்துவமனையில் இருங்கள்.', 'डिलीवरी के बाद कम से कम 24 घंटे अस्पताल में रहें।'),
      L('Then at least 3 check-ups: at 2–3 days, 1–2 weeks and 6 weeks.', 'பிறகு குறைந்தது 3 பரிசோதனைகள்: 2–3 நாள், 1–2 வாரம், 6 வாரம்.', 'फिर कम से कम 3 जाँच: 2–3 दिन, 1–2 हफ़्ते और 6 हफ़्ते पर।'),
      L('Each visit can include BP, mood, breastfeeding help and contraception advice.', 'ஒவ்வொரு பரிசோதனையிலும் BP, மனநிலை, தாய்ப்பால் உதவி, கருத்தடை ஆலோசனை இருக்கலாம்.', 'हर जाँच में BP, मूड, स्तनपान में मदद और गर्भनिरोध की सलाह हो सकती है।'),
      L('Keep taking one IFA tablet a day for 180 days after delivery.', 'பிரசவத்துக்குப் பின் 180 நாட்கள் தினமும் ஒரு IFA மாத்திரை தொடருங்கள்.', 'डिलीवरी के बाद 180 दिन रोज़ एक IFA गोली लेती रहें।'),
    ],
    sources: ['whoPnc', 'amb'],
  },
  {
    id: 'schemes',
    title: L('Free government support', 'இலவச அரசு உதவிகள்', 'मुफ़्त सरकारी सहायता'),
    summary: L('What you are entitled to, checked against PIB, June 2026.', 'உங்களுக்கு உரிமையானவை, PIB ஜூன் 2026 உடன் சரிபார்க்கப்பட்டது.', 'आपके हक़ की सुविधाएँ, PIB जून 2026 से जाँची गईं।'),
    points: [
      L('PMSMA: free antenatal check-up on the 9th of every month — tests, scan, medicines and counselling.', 'PMSMA: ஒவ்வொரு மாதமும் 9-ஆம் தேதி இலவசக் கர்ப்பகாலப் பரிசோதனை — பரிசோதனைகள், ஸ்கேன், மருந்துகள், ஆலோசனை.', 'PMSMA: हर महीने की 9 तारीख़ को मुफ़्त प्रसवपूर्व जाँच — टेस्ट, स्कैन, दवाइयाँ और परामर्श।'),
      L('Extended PMSMA: extra check-ups and SMS alerts for high-risk pregnancies until delivery.', 'விரிவாக்கப்பட்ட PMSMA: அதிக அபாயக் கர்ப்பங்களுக்குப் பிரசவம் வரை கூடுதல் பரிசோதனைகள், SMS நினைவூட்டல்கள்.', 'विस्तारित PMSMA: हाई-रिस्क गर्भावस्था में डिलीवरी तक अतिरिक्त जाँच और SMS अलर्ट।'),
      L('JSY: support for delivering in a hospital.', 'JSY: மருத்துவமனையில் பிரசவிக்க உதவி.', 'JSY: अस्पताल में डिलीवरी के लिए सहायता।'),
      L('JSSK: free care for pregnant women and newborns in government hospitals.', 'JSSK: அரசு மருத்துவமனைகளில் கர்ப்பிணிகளுக்கும் பச்சிளம் குழந்தைகளுக்கும் இலவசச் சிகிச்சை.', 'JSSK: सरकारी अस्पतालों में गर्भवती महिलाओं और नवजातों का मुफ़्त इलाज।'),
    ],
    sources: ['pibPmsma'],
  },
];

export function articleById(id: string): Article | undefined {
  return ARTICLES.find((a) => a.id === id);
}
