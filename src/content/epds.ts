import type { LText } from '../i18n';

/**
 * Edinburgh Postnatal Depression Scale (EPDS)
 * Source: Cox, J.L., Holden, J.M., and Sagovsky, R. 1987. Detection of postnatal
 * depression: Development of the 10-item Edinburgh Postnatal Depression Scale.
 * British Journal of Psychiatry 150:782-786. Reproduced without further
 * permission as allowed, with this citation.
 *
 * NOTE: The Tamil and Hindi wording below is Arogyama's own translation for
 * this demo. Validated Tamil and Hindi EPDS versions exist and must replace
 * these before real clinical use.
 *
 * Scoring: 0–30. ≥10 suggests possible depression (screen, not diagnosis).
 * Item 10 (self-harm) > 0 needs immediate further assessment.
 */

export interface EpdsItem {
  q: LText;
  /** options in display order with their scores */
  options: { label: LText; score: number }[];
}

const L = (en: string, ta: string, hi: string): LText => ({ en, ta, hi });

export const EPDS_INTRO = L(
  'As you are pregnant or have recently had a baby, we would like to know how you are feeling. Choose the answer that comes closest to how you have felt in the past 7 days, not just today.',
  'நீங்கள் கர்ப்பமாக இருப்பதால் அல்லது சமீபத்தில் குழந்தை பெற்றதால், நீங்கள் எப்படி உணர்கிறீர்கள் என அறிய விரும்புகிறோம். இன்று மட்டுமல்ல, கடந்த 7 நாட்களில் நீங்கள் உணர்ந்ததற்கு மிக நெருக்கமான பதிலைத் தேர்ந்தெடுங்கள்.',
  'क्योंकि आप गर्भवती हैं या हाल ही में आपका बच्चा हुआ है, हम जानना चाहते हैं कि आप कैसा महसूस कर रही हैं। सिर्फ़ आज नहीं, पिछले 7 दिनों में आपने जैसा महसूस किया, उसके सबसे क़रीब वाला जवाब चुनें।',
);

const o = (en: string, ta: string, hi: string, score: number) => ({ label: L(en, ta, hi), score });

export const EPDS_ITEMS: EpdsItem[] = [
  {
    q: L('I have been able to laugh and see the funny side of things', 'என்னால் சிரிக்கவும் விஷயங்களின் வேடிக்கையான பக்கத்தைப் பார்க்கவும் முடிந்தது', 'मैं हँस पाई और चीज़ों का मज़ेदार पहलू देख पाई'),
    options: [
      o('As much as I always could', 'எப்போதும் போலவே', 'हमेशा जितना', 0),
      o('Not quite so much now', 'இப்போது அவ்வளவாக இல்லை', 'अब उतना नहीं', 1),
      o('Definitely not so much now', 'நிச்சயமாக அவ்வளவாக இல்லை', 'निश्चित रूप से अब उतना नहीं', 2),
      o('Not at all', 'இல்லவே இல்லை', 'बिल्कुल नहीं', 3),
    ],
  },
  {
    q: L('I have looked forward with enjoyment to things', 'விஷயங்களை மகிழ்ச்சியுடன் எதிர்நோக்கினேன்', 'मैं ख़ुशी से चीज़ों का इंतज़ार करती रही'),
    options: [
      o('As much as I ever did', 'எப்போதும் போலவே', 'हमेशा जितना', 0),
      o('Rather less than I used to', 'முன்பைவிடச் சற்றுக் குறைவாக', 'पहले से कुछ कम', 1),
      o('Definitely less than I used to', 'நிச்சயமாக முன்பைவிடக் குறைவாக', 'निश्चित रूप से पहले से कम', 2),
      o('Hardly at all', 'அரிதாகவே', 'शायद ही कभी', 3),
    ],
  },
  {
    q: L('I have blamed myself unnecessarily when things went wrong', 'தவறு நடந்தபோது தேவையில்லாமல் என்னையே குற்றம் சாட்டினேன்', 'कुछ ग़लत होने पर मैंने बेवजह ख़ुद को दोष दिया'),
    options: [
      o('Yes, most of the time', 'ஆம், பெரும்பாலான நேரம்', 'हाँ, ज़्यादातर समय', 3),
      o('Yes, some of the time', 'ஆம், சில நேரம்', 'हाँ, कभी-कभी', 2),
      o('Not very often', 'அடிக்கடி இல்லை', 'बहुत बार नहीं', 1),
      o('No, never', 'இல்லை, ஒருபோதும் இல்லை', 'नहीं, कभी नहीं', 0),
    ],
  },
  {
    q: L('I have been anxious or worried for no good reason', 'நல்ல காரணமின்றி பதட்டமாக அல்லது கவலையாக இருந்தேன்', 'मैं बिना किसी ठोस वजह के बेचैन या चिंतित रही'),
    options: [
      o('No, not at all', 'இல்லை, இல்லவே இல்லை', 'नहीं, बिल्कुल नहीं', 0),
      o('Hardly ever', 'அரிதாக', 'शायद ही कभी', 1),
      o('Yes, sometimes', 'ஆம், சில நேரம்', 'हाँ, कभी-कभी', 2),
      o('Yes, very often', 'ஆம், மிக அடிக்கடி', 'हाँ, बहुत बार', 3),
    ],
  },
  {
    q: L('I have felt scared or panicky for no very good reason', 'பெரிய காரணமின்றி பயமாக அல்லது பீதியாக உணர்ந்தேன்', 'मुझे बिना ख़ास वजह के डर या घबराहट हुई'),
    options: [
      o('Yes, quite a lot', 'ஆம், நிறைய', 'हाँ, काफ़ी ज़्यादा', 3),
      o('Yes, sometimes', 'ஆம், சில நேரம்', 'हाँ, कभी-कभी', 2),
      o('No, not much', 'இல்லை, அதிகம் இல்லை', 'नहीं, ज़्यादा नहीं', 1),
      o('No, not at all', 'இல்லை, இல்லவே இல்லை', 'नहीं, बिल्कुल नहीं', 0),
    ],
  },
  {
    q: L('Things have been getting on top of me', 'விஷயங்கள் என்னால் சமாளிக்க முடியாத அளவுக்கு அழுத்தின', 'चीज़ें मुझ पर हावी होती रहीं'),
    options: [
      o("Yes, most of the time I haven't been able to cope at all", 'ஆம், பெரும்பாலான நேரம் என்னால் சமாளிக்கவே முடியவில்லை', 'हाँ, ज़्यादातर समय मैं बिल्कुल नहीं सँभाल पाई', 3),
      o("Yes, sometimes I haven't been coping as well as usual", 'ஆம், சில நேரம் வழக்கம் போல் சமாளிக்க முடியவில்லை', 'हाँ, कभी-कभी मैं हमेशा की तरह नहीं सँभाल पाई', 2),
      o('No, most of the time I have coped quite well', 'இல்லை, பெரும்பாலான நேரம் நன்றாகச் சமாளித்தேன்', 'नहीं, ज़्यादातर समय मैंने ठीक से सँभाला', 1),
      o('No, I have been coping as well as ever', 'இல்லை, எப்போதும் போல் நன்றாகச் சமாளிக்கிறேன்', 'नहीं, मैं हमेशा की तरह सँभाल रही हूँ', 0),
    ],
  },
  {
    q: L('I have been so unhappy that I have had difficulty sleeping', 'மகிழ்ச்சியின்மையால் தூங்குவதில் சிரமப்பட்டேன்', 'मैं इतनी दुखी रही कि सोने में दिक़्क़त हुई'),
    options: [
      o('Yes, most of the time', 'ஆம், பெரும்பாலான நேரம்', 'हाँ, ज़्यादातर समय', 3),
      o('Yes, sometimes', 'ஆம், சில நேரம்', 'हाँ, कभी-कभी', 2),
      o('Not very often', 'அடிக்கடி இல்லை', 'बहुत बार नहीं', 1),
      o('No, not at all', 'இல்லை, இல்லவே இல்லை', 'नहीं, बिल्कुल नहीं', 0),
    ],
  },
  {
    q: L('I have felt sad or miserable', 'சோகமாக அல்லது துயரமாக உணர்ந்தேன்', 'मैं उदास या दुखी महसूस करती रही'),
    options: [
      o('Yes, most of the time', 'ஆம், பெரும்பாலான நேரம்', 'हाँ, ज़्यादातर समय', 3),
      o('Yes, quite often', 'ஆம், அடிக்கடி', 'हाँ, अक्सर', 2),
      o('Not very often', 'அடிக்கடி இல்லை', 'बहुत बार नहीं', 1),
      o('No, not at all', 'இல்லை, இல்லவே இல்லை', 'नहीं, बिल्कुल नहीं', 0),
    ],
  },
  {
    q: L('I have been so unhappy that I have been crying', 'மகிழ்ச்சியின்மையால் அழுதேன்', 'मैं इतनी दुखी रही कि रोती रही'),
    options: [
      o('Yes, most of the time', 'ஆம், பெரும்பாலான நேரம்', 'हाँ, ज़्यादातर समय', 3),
      o('Yes, quite often', 'ஆம், அடிக்கடி', 'हाँ, अक्सर', 2),
      o('Only occasionally', 'எப்போதாவது மட்டும்', 'बस कभी-कभार', 1),
      o('No, never', 'இல்லை, ஒருபோதும் இல்லை', 'नहीं, कभी नहीं', 0),
    ],
  },
  {
    q: L('The thought of harming myself has occurred to me', 'என்னை நானே காயப்படுத்திக்கொள்ளும் எண்ணம் வந்தது', 'ख़ुद को नुकसान पहुँचाने का ख़याल मेरे मन में आया'),
    options: [
      o('Yes, quite often', 'ஆம், அடிக்கடி', 'हाँ, अक्सर', 3),
      o('Sometimes', 'சில நேரம்', 'कभी-कभी', 2),
      o('Hardly ever', 'அரிதாக', 'शायद ही कभी', 1),
      o('Never', 'ஒருபோதும் இல்லை', 'कभी नहीं', 0),
    ],
  },
];

export const EPDS_CUTOFF = 10;

export type EpdsBand = 'low' | 'possible' | 'urgent';

export function epdsBand(score: number, item10: number): EpdsBand {
  if (item10 > 0) return 'urgent';
  if (score >= EPDS_CUTOFF) return 'possible';
  return 'low';
}
