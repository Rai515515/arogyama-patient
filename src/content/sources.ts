/**
 * Every medical or programme fact in Arogyama points to one of these.
 * Rule: nothing reaches a patient screen unless it traces to a source here.
 * Checked 18 Oct 2026.
 */
export interface Source {
  id: string;
  name: string;
  publisher: string;
  year: string;
  url: string;
}

export const SOURCES = {
  nis: {
    id: 'nis',
    name: 'National Immunization Schedule',
    publisher: 'MoHFW, Government of India',
    year: 'current',
    url: 'https://www.mohfw.gov.in/sites/default/files/National%20Immunization%20Schedule.pdf',
  },
  pibVaccines: {
    id: 'pibVaccines',
    name: 'Celebrating the Power of Vaccines',
    publisher: 'PIB Research Unit',
    year: 'Mar 2026',
    url: 'https://static.pib.gov.in/WriteReadData/specificdocs/documents/2026/mar/doc2026320830601.pdf',
  },
  pibPmsma: {
    id: 'pibPmsma',
    name: 'PMSMA completes 10 years',
    publisher: 'PIB Research Unit',
    year: 'Jun 2026',
    url: 'https://static.pib.gov.in/WriteReadData/specificdocs/documents/2026/jun/doc202668887301.pdf',
  },
  whoPreeclampsia: {
    id: 'whoPreeclampsia',
    name: 'Pre-eclampsia fact sheet',
    publisher: 'World Health Organization',
    year: 'Oct 2026',
    url: 'https://www.who.int/news-room/fact-sheets/detail/pre-eclampsia',
  },
  niceNg133: {
    id: 'niceNg133',
    name: 'Hypertension in pregnancy (NG133): follow-up and postnatal review',
    publisher: 'NICE',
    year: '2019, updated 2023',
    url: 'https://www.nice.org.uk/guidance/ng133/resources/followup-care-and-postnatal-review-pdf-8720711397',
  },
  acogUrgent: {
    id: 'acogUrgent',
    name: 'Elevated blood pressure in pregnancy and postpartum — urgent care guide',
    publisher: 'ACOG / Urgent Care Association',
    year: '2023',
    url: 'https://urgentcareassociation.org/wp-content/uploads/ACOG_Elevated-BP-Guideline_UC_FINAL_SECURED.pdf',
  },
  whoPnc: {
    id: 'whoPnc',
    name: 'WHO recommendations on maternal and newborn care for a positive postnatal experience',
    publisher: 'World Health Organization',
    year: '2022',
    url: 'https://www.who.int/news/item/30-03-2022-who-urges-quality-care-for-women-and-newborns-in-critical-first-weeks-after-childbirth',
  },
  whoBreastfeeding: {
    id: 'whoBreastfeeding',
    name: '10 facts on breastfeeding',
    publisher: 'World Health Organization (via SUN Movement)',
    year: '2017',
    url: 'https://scalingupnutrition.org/news/10-facts-breastfeeding-world-health-organisation',
  },
  figoFirstHour: {
    id: 'figoFirstHour',
    name: 'Breastfeeding recommended within the first hour of life',
    publisher: 'FIGO',
    year: '2023',
    url: 'https://www.figo.org/sites/default/files/2023-07/FIGO%20Statement_breastfeeding%20recommended%20within%20first%20hour%20of%20life_2023.pdf',
  },
  nfhs5Bf: {
    id: 'nfhs5Bf',
    name: 'NFHS-5 (2019–21) breastfeeding indicators',
    publisher: 'IndiaSpend data report',
    year: 'Aug 2023',
    url: 'https://www.isignal.in/data-viz/6-in-10-newborns-continue-to-face-delayed-breastfeeding-in-india-871885',
  },
  teleManas: {
    id: 'teleManas',
    name: 'Tele-MANAS national tele-mental health programme',
    publisher: 'MoHFW, Government of India',
    year: 'current',
    url: 'https://telemanas.mohfw.gov.in/home',
  },
  epds: {
    id: 'epds',
    name: 'Detection of postnatal depression: development of the 10-item Edinburgh Postnatal Depression Scale',
    publisher: 'Cox JL, Holden JM, Sagovsky R. British Journal of Psychiatry, vol. 150',
    year: '1987',
    url: 'https://nj.gov/health/fhs/maternalchild/documents/PPD-Edinburgh-Scale.pdf',
  },
  ppdIndia: {
    id: 'ppdIndia',
    name: 'Postpartum depression in India: a systematic review and meta-analysis',
    publisher: 'Upadhyay et al., Bulletin of the World Health Organization',
    year: '2017',
    url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC5689195/',
  },
  ppiucdIndia: {
    id: 'ppiucdIndia',
    name: 'Safety, efficacy and expulsion of post-placental and intra-caesarean IUCD (PPIUCD)',
    publisher: 'Mishra S., Journal of Obstetrics and Gynaecology of India',
    year: '2014',
    url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC4199427',
  },
  amb: {
    id: 'amb',
    name: 'Anemia Mukt Bharat',
    publisher: 'MoHFW, Government of India',
    year: 'current',
    url: 'https://en.vikaspedia.in/viewcontent/health/health-campaigns/anemia-mukt-bharat?lgn=en',
  },
  nhsrcPostpartum: {
    id: 'nhsrcPostpartum',
    name: 'Complications during the postpartum period (ASHA module)',
    publisher: 'NHSRC, MoHFW',
    year: '2021',
    url: 'https://qps.nhsrcindia.org/sites/default/files/2021-05/Complications%20During%20Post%20Partum%20Period%20English.pdf',
  },
  whl181: {
    id: 'whl181',
    name: 'Women Helpline 181',
    publisher: 'Ministry of Women and Child Development',
    year: 'current',
    url: 'https://www.myscheme.gov.in/schemes/whl-181',
  },
} satisfies Record<string, Source>;

export type SourceId = keyof typeof SOURCES;
