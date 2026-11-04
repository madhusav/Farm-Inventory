import React, { useState, useMemo } from 'react';
import { Farm, Animal, HealthRecord } from '../types';
import { db } from '../services/db';
import { useLanguage } from '../i18n/LanguageContext';
import { 
  X, 
  Search, 
  AlertTriangle, 
  HeartPulse, 
  Activity, 
  ShieldAlert, 
  Stethoscope, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  Info, 
  RotateCcw,
  Sparkles,
  Thermometer,
  Wind,
  Footprints,
  Eye,
  FileText
} from 'lucide-react';

export interface SymptomCheckerModalProps {
  farm: Farm;
  isOpen: boolean;
  onClose: () => void;
  initialAnimalId?: string;
  onAnimalHealthLogged?: (animalId: string) => void;
}

export type SeverityLevel = 'emergency' | 'urgent' | 'manageable';

export interface SymptomItem {
  id: string;
  category: 'general' | 'digestive' | 'respiratory' | 'head_mouth' | 'locomotion' | 'neurological' | 'skin_wool' | 'urinary';
  label: string;
  hindiLabel: string;
  kannadaLabel: string;
  teluguLabel: string;
  tamilLabel: string;
  malayalamLabel: string;
  marathiLabel: string;
  description: string;
  icon: string;
}

export interface ConditionAdvice {
  id: string;
  name: string;
  hindiName: string;
  species: 'Sheep & Goat' | 'Goat' | 'Sheep';
  severity: SeverityLevel;
  matchingSymptomIds: string[];
  description: string;
  immediateFirstAid: string[];
  whatNotToDo: string[];
  whenToCallVet: string[];
  preventiveTips: string[];
}

export const SYMPTOM_DEFINITIONS: SymptomItem[] = [
  // General
  {
    id: 'off_feed',
    category: 'general',
    label: 'Off Feed / Not Eating',
    hindiLabel: 'चारा न खाना / भूख न लगना',
    kannadaLabel: 'ಮೇವು ತಿನ್ನದಿರುವುದು',
    teluguLabel: 'మేత మేయకపోవడం',
    tamilLabel: 'தீவனம் உட்கொள்ளாமை',
    malayalamLabel: 'തീറ്റ തിന്നാതിരിക്കൽ',
    marathiLabel: 'चारा न खाणे / भूक मंदावणे',
    description: 'Refusing concentrate, hay, or grazing; stopped rumination (chewing cud).',
    icon: '🌾'
  },
  {
    id: 'lethargy',
    category: 'general',
    label: 'Dull / Lethargy / Weakness',
    hindiLabel: 'सुस्ती / कमजोरी / सिर झुकाए रहना',
    kannadaLabel: 'ನಿಶ್ಯಕ್ತಿ / ತಲೆ ತಗ್ಗಿಸಿ ನಿಲ್ಲುವುದು',
    teluguLabel: 'నీరసం / తల దించుకుని ఉండటం',
    tamilLabel: 'சோர்வு / தலை தொங்குதல்',
    malayalamLabel: 'ക്ഷീണം / തല താഴ്ത്തി നിൽക്കൽ',
    marathiLabel: 'सुस्ती / अशक्तपणा',
    description: 'Lagging behind flock, drooping ears, isolated standing, unwilling to rise.',
    icon: '😴'
  },
  {
    id: 'fever',
    category: 'general',
    label: 'High Fever / Shivering',
    hindiLabel: 'तेज बुखार / कंपकंपी',
    kannadaLabel: 'ತೀವ್ರ ಜ್ವರ / ನಡುಗುವುದು',
    teluguLabel: 'తీవ్ర జ్వరం / వణుకు',
    tamilLabel: 'அதிக காய்ச்சல் / நடுக்கம்',
    malayalamLabel: 'കടുത്ത പനി / വിറയൽ',
    marathiLabel: 'ताप / थंडी वाजणे',
    description: 'Rectal temp > 39.7°C (103.5°F), warm ear bases, shivering or dry muzzle.',
    icon: '🌡️'
  },
  {
    id: 'down_animal',
    category: 'general',
    label: 'Down / Unable to Stand',
    hindiLabel: 'बैठ जाना / खड़ा न हो पाना',
    kannadaLabel: 'ಮಲಗಿರುವುದು / ಎದ್ದು ನಿಲ್ಲಲಾಗದಿರುವುದು',
    teluguLabel: 'లేవలేకపోవడం / కింద పడిపోవడం',
    tamilLabel: 'எழுந்திருக்க முடியாமல் படுத்திருத்தல்',
    malayalamLabel: 'എഴുന്നേൽക്കാൻ കഴിയാതെ കിടക്കൽ',
    marathiLabel: 'खाली बसणे / उठण्यास असमर्थ',
    description: 'Recumbent, prostrate, limbs weak or paralyzed, struggling to lift head.',
    icon: '🛑'
  },

  // Digestive
  {
    id: 'bloat',
    category: 'digestive',
    label: 'Bloat / Swollen Left Belly',
    hindiLabel: 'पेट फूलना / अफारा (बायां पेट तना हुआ)',
    kannadaLabel: 'ಹೊಟ್ಟೆ ಉಬ್ಬರ (ಎಡಭಾಗ ಊದಿಕೊಳ್ಳುವುದು)',
    teluguLabel: 'కడుపు ఉబ్బరం (ఎడమవైపు పొట్ట)',
    tamilLabel: 'வயிறு உப்பசம் (இடது பக்க வயிறு)',
    malayalamLabel: 'വയറു വീർക്കൽ (ഇടതുവശം)',
    marathiLabel: 'पोट फुगणे / डावी कुस फुगणे',
    description: 'Left flank tightly distended like a drum, restlessness, kicking at belly.',
    icon: '🎈'
  },
  {
    id: 'diarrhea',
    category: 'digestive',
    label: 'Diarrhea / Loose Stools',
    hindiLabel: 'दस्त / पतले बदबूदार गोबर',
    kannadaLabel: 'ಭೇದಿ / ತೆಳುವಾದ ಮಲ',
    teluguLabel: 'విరేచనాలు / పలుచటి మలం',
    tamilLabel: 'வயிற்றுப்போக்கு / துர்நாற்றம்',
    malayalamLabel: 'വയറിളക്കം',
    marathiLabel: 'हगवण / पातळ विष्ठा',
    description: 'Watery, mucous, or dark foul-smelling feces soiling tail and hocks.',
    icon: '💧'
  },
  {
    id: 'teeth_grinding',
    category: 'digestive',
    label: 'Teeth Grinding / Belly Pain',
    hindiLabel: 'दांत पीसना / पेट में दर्द',
    kannadaLabel: 'ಹಲ್ಲು ಕಡಿಯುವುದು / ಹೊಟ್ಟೆ ನೋವು',
    teluguLabel: 'పళ్ళు కొరకడం / కడుపు నొప్పి',
    tamilLabel: 'பல் கடித்தல் / வயிற்று வலி',
    malayalamLabel: 'പല്ല് ഞെരിക്കൽ / വയറുവേദന',
    marathiLabel: 'दात खाणे / पोटदुखी',
    description: 'Audible grinding of teeth, arched back, groaning or looking at flank.',
    icon: '😣'
  },

  // Respiratory
  {
    id: 'cough',
    category: 'respiratory',
    label: 'Coughing / Wheezing',
    hindiLabel: 'खांसी / सीने से आवाज आना',
    kannadaLabel: 'ಕೆಮ್ಮು / ಉಬ್ಬಸ',
    teluguLabel: 'దగ్గు / గురక',
    tamilLabel: 'இருமல் / இரைப்பு',
    malayalamLabel: 'ചുമ / കിതപ്പ്',
    marathiLabel: 'खोकला / धाप लागणे',
    description: 'Hacking persistent cough, wheezing when moving, raspy chest sound.',
    icon: '💨'
  },
  {
    id: 'nasal_discharge',
    category: 'respiratory',
    label: 'Nasal Discharge (Thick / Crusted)',
    hindiLabel: 'नाक से मवाद या गाढ़ा पानी बहना',
    kannadaLabel: 'ಮೂಗಿನಿಂದ ಸ್ರಾವ / ಸಿಂಬಳ',
    teluguLabel: 'ముక్కు నుంచి చీము లేదా నీరు',
    tamilLabel: 'மூக்கிலிருந்து சளி வடிதல்',
    malayalamLabel: 'മൂക്കൊഴുപ്പ്',
    marathiLabel: 'नाकातून स्राव येणे',
    description: 'Yellowish-green thick pus or crusty discharge blocking nostrils.',
    icon: '🤧'
  },
  {
    id: 'labored_breathing',
    category: 'respiratory',
    label: 'Rapid / Labored Panting',
    hindiLabel: 'तेज सांस / मुंह खोलकर हांफना',
    kannadaLabel: 'ವೇಗದ ಉಸಿರಾಟ / ಬಾಯಿ ತೆರೆದು ಉಸಿರಾಡುವುದು',
    teluguLabel: 'వేగంగా శ్వాస / నోరు తెరిచి ఆయాసం',
    tamilLabel: 'வேகமான மூச்சு / வாய் திறந்து மூச்சுவிடுதல்',
    malayalamLabel: 'കിതപ്പോടെ ശ്വാസമെടുക്കൽ',
    marathiLabel: 'तोंड उघडे ठेवून धापा टाकणे',
    description: 'Extended neck, flared nostrils, abdominal heave, open-mouth gasping.',
    icon: '🫁'
  },

  // Head, Mouth & Eyes
  {
    id: 'mouth_sores',
    category: 'head_mouth',
    label: 'Mouth Ulcers / Drooling',
    hindiLabel: 'मुंह में छाले / लार टपकना',
    kannadaLabel: 'ಬಾಯಿಯಲ್ಲಿ ಹುಣ್ಣು / ಜೊಲ್ಲು ಸುರಿಯುವುದು',
    teluguLabel: 'నోటిలో పుండ్లు / లాలాజలం కారడం',
    tamilLabel: 'வாயில் புண்கள் / உமிழ்நீர் வடிதல்',
    malayalamLabel: 'വായിൽ പുണ്ണ് / ഉമിനീരൊഴുക്ക്',
    marathiLabel: 'तोंडात फोड / लाळ गळणे',
    description: 'Scabby crusts on lips, raw tongue ulcers, sticky saliva foaming from mouth.',
    icon: '👄'
  },
  {
    id: 'bottle_jaw',
    category: 'head_mouth',
    label: 'Bottle Jaw (Swelling under Chin)',
    hindiLabel: 'गले के नीचे सूजन (बॉटल जॉ)',
    kannadaLabel: 'ಗಲ್ಲದ ಕೆಳಗೆ ನೀರು ತುಂಬಿದ ಊತ',
    teluguLabel: 'దవడ కింద వాపు (బాటిల్ జా)',
    tamilLabel: 'தாடைக்கு கீழ் நீர் வீக்கம்',
    malayalamLabel: 'താടിയുടെ അടിയിൽ നീർക്കെട്ട്',
    marathiLabel: 'हनुवटीखाली सूज (बॉटल जॉ)',
    description: 'Soft fluid accumulation under the jaw, pitting edema from severe worm anemia.',
    icon: '💧'
  },
  {
    id: 'pale_mucosa',
    category: 'head_mouth',
    label: 'Pale / White Eyelids (Anemia)',
    hindiLabel: 'आंखों के अंदर सफेदी (खून की भारी कमी)',
    kannadaLabel: 'ಕಣ್ಣಿನ ರೆಪ್ಪೆ ಬೆಳ್ಳಗಾಗುವುದು (ರಕ್ತಹೀನತೆ)',
    teluguLabel: 'కనురెప్పల లోపల తెల్లబడటం (రక్తహీనత)',
    tamilLabel: 'கண் இமை வெளுத்தல் (இரத்த சோகை)',
    malayalamLabel: 'കണ്ണിന്റെ ഉള്ളിൽ വിളർച്ച (രക്തക്കുറവ്)',
    marathiLabel: 'डोळ्यांच्या आतील भाग पांढरा पडणे',
    description: 'FAMACHA score 4–5; chalky white or very pale pink inner eye membrane.',
    icon: '👁️'
  },

  // Locomotion
  {
    id: 'limping',
    category: 'locomotion',
    label: 'Limping / Lameness',
    hindiLabel: 'लंगड़ाना / पैर में दर्द',
    kannadaLabel: 'ಕುಂಟುವುದು / ಕಾಲಿನ ನೋವು',
    teluguLabel: 'కుంటి నడక / కాలు నొప్పి',
    tamilLabel: 'நொண்டியடித்தல் / கால் வலி',
    malayalamLabel: 'മുടന്തി നടക്കൽ',
    marathiLabel: 'लंगडणे / पायात वेदना',
    description: 'Favoring one leg, reluctant to walk, grazing on front knees.',
    icon: '🦵'
  },
  {
    id: 'foul_hoof',
    category: 'locomotion',
    label: 'Foul-Smelling / Rotten Hoof',
    hindiLabel: 'खुर में सड़न व बदबू (फुट रॉट)',
    kannadaLabel: 'ಗೊರಸು ಕೊಳೆತ ಮತ್ತು ದುರ್ನಾತ',
    teluguLabel: 'గిట్టలలో చీము & దుర్వాసన',
    tamilLabel: 'குளம்பு அழுகல் மற்றும் துர்நாற்றம்',
    malayalamLabel: 'കുളമ്പുചീയൽ / ദുർഗന്ധം',
    marathiLabel: 'खुरांना दुर्गंधी व सडणे',
    description: 'Interdigital skin raw and moist, detachment of hoof horn, characteristic rotting odor.',
    icon: '🦶'
  },

  // Neurological
  {
    id: 'circling',
    category: 'neurological',
    label: 'Circling / Head Pressing',
    hindiLabel: 'गोल चक्कर काटना / दीवार से सिर दबाना',
    kannadaLabel: 'ವೃತ್ತಾಕಾರವಾಗಿ ತಿರುಗುವುದು / ತಲೆ ಒತ್ತುವುದು',
    teluguLabel: 'గుండ్రంగా తిరగడం / తల అదిమిపెట్టడం',
    tamilLabel: 'வட்டமாக சுற்றுதல் / தலை முட்டுதல்',
    malayalamLabel: 'വട്ടം കറങ്ങൽ / തല അമർത്തിപ്പിടിക്കൽ',
    marathiLabel: 'गोल फेऱ्या मारणे / डोके भिंतीवर टेकवणे',
    description: 'Involuntary walking in circles in one direction, pressing head firmly into walls or fences.',
    icon: '🌀'
  },
  {
    id: 'tremors',
    category: 'neurological',
    label: 'Tremors / Star-Gazing / Spasms',
    hindiLabel: 'कंपकंपी / सिर आसमान की ओर खींचना',
    kannadaLabel: 'ನಡುಕ / ಆಕಾಶದತ್ತ ತಲೆ ಎತ್ತುವುದು',
    teluguLabel: 'వణుకుడు / తల పైకెత్తి చూడటం',
    tamilLabel: 'நடுக்கம் / வானத்தை நோக்குதல்',
    malayalamLabel: 'വിറയൽ / തല മേലോട്ട് പിടിക്കൽ',
    marathiLabel: 'थरथरणे / मान वर ताणणे',
    description: 'Muscle twitching, rigid limbs, head pulled upward or backward towards the spine.',
    icon: '⚡'
  },

  // Skin & Wool
  {
    id: 'wool_loss',
    category: 'skin_wool',
    label: 'Severe Itching / Wool & Hair Loss',
    hindiLabel: 'खुजली / बाल या ऊन का झड़ना (दाद/खाज)',
    kannadaLabel: 'ತುರಿಕೆ / ಉಣ್ಣೆ ಉದುರುವುದು (ಗಜ್ಜು)',
    teluguLabel: 'దురద / ఉన్ని రాలిపోవడం',
    tamilLabel: 'அரிப்பு / ரோமம் உதிர்தல்',
    malayalamLabel: 'ചൊറിച്ചിൽ / രോമം കൊഴിയൽ',
    marathiLabel: 'खाज सुटणे / लोकर गळणे',
    description: 'Rubbing violently against posts and fences, scabby encrusted skin patches, raw bare spots.',
    icon: '🐑'
  },

  // Urinary
  {
    id: 'straining_urine',
    category: 'urinary',
    label: 'Straining to Urinate (Water Belly)',
    hindiLabel: 'पेशाब करने में जोर लगाना / रुकना',
    kannadaLabel: 'ಮೂತ್ರ ವಿಸರ್ಜನೆಗೆ ಕಷ್ಟಪಡುವುದು',
    teluguLabel: 'మూత్రం రాక ఇబ్బంది పడటం',
    tamilLabel: 'சிறுநீர் கழிக்க சிரமப்படுதல்',
    malayalamLabel: 'മൂത്രമൊഴിക്കാൻ ബുദ്ധിമുട്ട്',
    marathiLabel: 'लघवी करताना जोर लावणे',
    description: 'Frequent squatting, pulsing tail, kicking at abdomen, vocalizing in pain (primarily male bucks/rams).',
    icon: '💧'
  }
];

export const CONDITIONS_KNOWLEDGE_BASE: ConditionAdvice[] = [
  {
    id: 'rumen_bloat',
    name: 'Acute Rumen Bloat (Tympanites)',
    hindiName: 'अफारा / पेट में गैस का फुलाव',
    species: 'Sheep & Goat',
    severity: 'emergency',
    matchingSymptomIds: ['bloat', 'off_feed', 'teeth_grinding', 'labored_breathing'],
    description: 'Rapid build-up of frothy or free gas in the rumen after eating wet young clover, lush legumes, or excess crushed grains. Compresses diaphragm and causes suffocation if untreated.',
    immediateFirstAid: [
      'Position animal with FRONT FEET ELEVATED on a slope or mound (relieves pressure on lungs and heart).',
      'Drench immediately with 60–100 mL of standard cooking vegetable oil (peanut, sunflower, or mustard oil) mixed with 1 level teaspoon of baking soda to break foam bubbles.',
      'Place a smooth wooden stick or clean rope bit across the mouth like a bridle (stimulates chewing and triggers natural belching).',
      'Gently massage the left flank in an upward circular motion for 5–10 minutes.',
      'Keep the animal walking gently; do NOT let it lie down or get cast.'
    ],
    whatNotToDo: [
      'NEVER lay the animal down on its side or back (leads to immediate suffocating pressure).',
      'NEVER drench if the animal is convulsing, down, or unable to swallow (can enter lungs).',
      'NEVER stab the rumen with a kitchen knife unless under guided veterinary emergency trocarization.'
    ],
    whenToCallVet: [
      'Belly continues expanding rapidly despite vegetable oil drench within 30 minutes.',
      'Animal opens mouth with blue or purple tongue and cannot breathe.',
      'Animal collapses and cannot stay standing.'
    ],
    preventiveTips: [
      'Always feed dry straw or coarse hay BEFORE turning sheep and goats into lush green pasture.',
      'Gradually introduce grain concentrates over 14 days; avoid sudden starch shocks.'
    ]
  },
  {
    id: 'haemonchosis_worms',
    name: 'Barber’s Pole Worm (Haemonchus Contortus) Anemia',
    hindiName: 'खून चूसने वाले पेट के कीड़े (बॉटल जॉ व भारी कमजोरी)',
    species: 'Sheep & Goat',
    severity: 'urgent',
    matchingSymptomIds: ['bottle_jaw', 'pale_mucosa', 'lethargy', 'off_feed'],
    description: 'Blood-sucking abomasal roundworm that removes up to 0.05 mL blood per worm daily. Causes acute fatal anemia, hypoproteinemia (fluid under jaw), and severe weakness during warm humid weather.',
    immediateFirstAid: [
      'Examine the lower inner eyelid (FAMACHA test). If paper-white or porcelain-pale, handle gently as heart failure can occur from stress.',
      'Administer targeted oral anthelmintic drench (e.g., Levamisole, Closantel, or Ivermectin per veterinarian prescription).',
      'Administer oral iron tonic or Vitamin B-Complex with liver extract to stimulate new red blood cell production.',
      'Move animal to clean, dry, shaded pen. Feed protein-rich green leaves (Subabul/Leucaena, Moringa, Lucerne) and clean concentrate.',
      'Ensure access to clean, cool drinking water fortified with oral electrolytes.'
    ],
    whatNotToDo: [
      'DO NOT chase, run, or roughly handle severely anemic animals (can trigger sudden cardiac arrest).',
      'DO NOT turn back onto wet morning pastures where infective larvae climb grass blades.'
    ],
    whenToCallVet: [
      'Bottle jaw swelling is hard, hot, or animal refuses water completely.',
      'Animal is too weak to lift its head or FAMACHA is completely white without response after 24 hours.'
    ],
    preventiveTips: [
      'Rotational grazing: graze pastures only after morning dew dries; do not graze below 3 inches.',
      'Conduct regular FAMACHA eye eyelid checks every 2 weeks during monsoon.'
    ]
  },
  {
    id: 'pneumonia_ccpp',
    name: 'Pneumonia / CCPP (Pleuropneumonia) / Pasteurellosis',
    hindiName: 'फेफड़ों का निमोनिया / सांस की बीमारी',
    species: 'Sheep & Goat',
    severity: 'urgent',
    matchingSymptomIds: ['cough', 'nasal_discharge', 'labored_breathing', 'fever', 'lethargy'],
    description: 'Bacterial or viral lung infection triggered by sudden weather shifts, cold drafts, overcrowding, or monsoon dampness. Can progress rapidly to consolidated lungs and respiratory failure.',
    immediateFirstAid: [
      'Isolate animal in a warm, dry, well-ventilated quarantine stall completely free from cold drafts and ammonia fumes.',
      'Provide a thick bed of clean dry straw (keeps the chest warm and prevents hypothermia).',
      'Provide warm drinking water mixed with electrolytes or jaggery (prevents dehydration and thins mucus).',
      'Wipe crusted nostrils gently with a clean cloth soaked in warm saline water to clear airways.',
      'Offer tender green fodder or warm bran mash; avoid dry, dusty feed that aggravates coughing.'
    ],
    whatNotToDo: [
      'NEVER wash a shivering or coughing animal with cold water.',
      'DO NOT keep the animal in a closed, unventilated room with accumulating dung gas or ammonia.'
    ],
    whenToCallVet: [
      'Rectal temperature exceeds 40°C (104°F) or breathing is labored with open-mouth panting.',
      'Nasal discharge is bloody or foul-smelling.',
      'Coughing persists beyond 48 hours without improvement.'
    ],
    preventiveTips: [
      'Annual vaccination for CCPP (Goats) and HS / Pasteurellosis before winter and monsoon.',
      'Avoid sudden cold draft exposure during nocturnal temperature drops.'
    ]
  },
  {
    id: 'enterotoxemia_pulpy_kidney',
    name: 'Enterotoxemia (Pulpy Kidney / Overeating Disease)',
    hindiName: 'फिड़किया / आंतों का जहर (एंटेरोटॉक्सीमिया)',
    species: 'Sheep & Goat',
    severity: 'emergency',
    matchingSymptomIds: ['down_animal', 'diarrhea', 'teeth_grinding', 'tremors', 'off_feed'],
    description: 'Clostridium perfringens Type D toxin surge triggered by sudden grain feeding, high milk intake in lambs/kids, or lush grass. Toxins damage blood vessels and brain, often leading to rapid collapse.',
    immediateFirstAid: [
      'IMMEDIATELY STOP ALL GRAIN, concentrates, and rich fodder for the entire flock group.',
      'Drench with activated charcoal (1–2 g/kg body weight in warm water) or kaolin to bind intestinal toxins.',
      'Provide oral electrolyte solution if the animal can swallow.',
      'Place animal in a quiet, dimly lit, softly padded pen to prevent injury during convulsions.',
      'Call veterinarian immediately for emergency Clostridial C&D antitoxin and antibiotic therapy.'
    ],
    whatNotToDo: [
      'NEVER continue feeding concentrates or grains to sick or exposed penmates.',
      'DO NOT force liquids down the throat of an animal that is fitting or non-swallowing.'
    ],
    whenToCallVet: [
      'Sudden death of one healthy lamb/kid in flock.',
      'Animal displays head-back spasms (opisthotonos), paddling legs, or severe watery scours.'
    ],
    preventiveTips: [
      'Annual pre-monsoon ET (Enterotoxemia) vaccination with annual booster.',
      'Always transition feeding changes slowly over a minimum of 10 to 14 days.'
    ]
  },
  {
    id: 'infectious_diarrhea_scours',
    name: 'Infectious Diarrhea (Scours / Coccidiosis / Colibacillosis)',
    hindiName: 'दस्त व पेचिश (खूनी या बदबूदार दस्त)',
    species: 'Sheep & Goat',
    severity: 'urgent',
    matchingSymptomIds: ['diarrhea', 'lethargy', 'off_feed', 'fever'],
    description: 'Acute intestinal infection caused by E. coli, Salmonella, or Coccidia parasites. Rapid fluid and electrolyte loss leads to lethal dehydration and metabolic acidosis, especially in young kids/lambs.',
    immediateFirstAid: [
      'Isolate the sick animal immediately to prevent pen-wide fecal-oral transmission.',
      'Prepare Oral Rehydration Solution (ORS): 1 liter clean warm water + 1 tablespoon sugar/jaggery + 1 teaspoon table salt + 1/2 teaspoon baking soda.',
      'Administer 50–100 mL ORS every 3–4 hours depending on animal size (continue as long as scouring lasts).',
      'Keep animal warm and dry; clean soiled hindquarters with warm antiseptic wash to prevent fly strike.',
      'Provide clean dry grass hay; temporarily suspend heavy milk feeds or rich grains for 12 hours.'
    ],
    whatNotToDo: [
      'DO NOT withhold water; dehydration is the primary cause of death, not the loose stool itself.',
      'DO NOT keep healthy kids/lambs in contaminated soiled bedding.'
    ],
    whenToCallVet: [
      'Stools contain fresh blood, mucus, or shredded intestinal lining.',
      'Sunken eyes and skin pinch on neck does not snap back (severe dehydration >8%).',
      'Animal becomes cold to the touch and cannot stay standing.'
    ],
    preventiveTips: [
      'Ensure every newborn gets adequate colostrum within 2–4 hours of birth.',
      'Routine anticoccidial preventive management (Amprolium or Toltrazuril) at weaning.'
    ]
  },
  {
    id: 'orf_contagious_ecthyma',
    name: 'Contagious Ecthyma (Orf / Sore Mouth / Scabby Mouth)',
    hindiName: 'मुंह के छाले व पपड़ी (चेचक जैसा संक्रामक रोग)',
    species: 'Sheep & Goat',
    severity: 'manageable',
    matchingSymptomIds: ['mouth_sores', 'off_feed'],
    description: 'Parapoxvirus infection producing painful scabby pustules and crusts on the lips, muzzle, and nostrils. Severely hinders grazing and nursing in young stock.',
    immediateFirstAid: [
      'WEAR RUBBER GLOVES! Orf is a zoonotic disease that easily infects human hands causing painful sores.',
      'Isolate infected animals from nursing mothers and young flock members.',
      'Dab mouth crusts gently with mild antiseptic: 1% Potassium Permanganate solution or Povidone-Iodine mixed with glycerin.',
      'Offer soft, highly palatable, non-prickly feed: finely chopped fresh tender grass, warm soaked wheat bran, or mashed gruel.',
      'Ensure easy access to clean, cool drinking water at ground level.'
    ],
    whatNotToDo: [
      'NEVER pull or peel off dry scabs aggressively (causes intense bleeding and delays healing).',
      'DO NOT touch sores with bare hands; wash thoroughly with soap if contact occurs.'
    ],
    whenToCallVet: [
      'Sores spread to mother’s teats and udder (risk of gangrenous mastitis).',
      'Secondary bacterial infection causes maggot infestation or necrotic foul odor.'
    ],
    preventiveTips: [
      'Quarantine newly purchased goats/sheep for 21 days before mixing with resident flock.',
      'Clean and disinfect feeding troughs and waterers with 2% sodium hypochlorite.'
    ]
  },
  {
    id: 'foot_rot_lameness',
    name: 'Foot Rot / Foot Scald (Interdigital Necrobacillosis)',
    hindiName: 'खुर की सड़न (फुट रॉट / खुर का घाव)',
    species: 'Sheep & Goat',
    severity: 'manageable',
    matchingSymptomIds: ['limping', 'foul_hoof'],
    description: 'Synergistic bacterial infection (Dichelobacter nodosus + Fusobacterium necrophorum) of the hoof tissue promoted by damp bedding, muddy pastures, and overgrown hooves.',
    immediateFirstAid: [
      'Carefully clean dirt, mud, and manure from between the claws using clean water and a soft brush.',
      'Carefully trim overgrown, detached horn flaps using clean hoof shears to expose the trapped bacteria to air (do NOT cut into live bleeding tissue).',
      'Apply a topical antiseptic foot spray (Oxytetracycline spray, or 10% Zinc Sulfate / Copper Sulfate solution).',
      'Keep the animal on a clean, completely dry surface (concrete or dry straw) for 1–2 hours after application.',
      'Separate from muddy pastures or standing water puddles.'
    ],
    whatNotToDo: [
      'DO NOT walk infected animals through shared healthy paddocks or wet grass corridors.',
      'DO NOT leave manure-caked hooves uninspected when an animal starts walking on its knees.'
    ],
    whenToCallVet: [
      'Multiple feet are severely decayed and animal refuses to graze or move.',
      'Fly maggots are present inside the hoof cavity or joint is swollen hot.'
    ],
    preventiveTips: [
      'Regular hoof trimming every 8–12 weeks.',
      'Walk flock through a 10% Zinc Sulfate footbath during monsoon season.'
    ]
  },
  {
    id: 'urinary_calculi_water_belly',
    name: 'Urinary Calculi (Water Belly / Urolithiasis)',
    hindiName: 'पेशाब की पथरी / पेशाब रुकना (वॉटर बेली)',
    species: 'Sheep & Goat',
    severity: 'emergency',
    matchingSymptomIds: ['straining_urine', 'teeth_grinding', 'off_feed', 'lethargy'],
    description: 'Mineral stones (calcium/struvite) obstructing the narrow urethral process or sigmoid flexure in male bucks, rams, or castrated wethers on high-grain or low-water diets.',
    immediateFirstAid: [
      'IMMEDIATE VETERINARY EMERGENCY! A blocked bladder will rupture within 24–48 hours without relief.',
      'Immediately remove all grain concentrates, pellets, and high-phosphorus feeds.',
      'Offer clean fresh warm drinking water; ensure unrestricted access.',
      'Have veterinarian or trained personnel inspect the urethral process (the small worm-like appendage at penis tip) to check if a single stone can be snipped off.',
      'Administer oral ammonium chloride (if on hand) per vet direction to acidify urine and break down stones.'
    ],
    whatNotToDo: [
      'DO NOT delay veterinary care hoping the condition passes spontaneously.',
      'DO NOT feed cereal grains (maize, wheat, bajra) without adequate calcium:phosphorus balance (at least 2:1).'
    ],
    whenToCallVet: [
      'Buck/ram strains repeatedly with tail twitching and passes zero drops of urine.',
      'Abdomen becomes soft, swollen, and sloshing with fluid (indicates bladder rupture).'
    ],
    preventiveTips: [
      'Always maintain a 2:1 Calcium to Phosphorus ratio in feeds.',
      'Always provide free-choice loose salt to stimulate high daily water intake.'
    ]
  },
  {
    id: 'pregnancy_toxemia_ketosis',
    name: 'Pregnancy Toxemia (Twin Lamb Disease / Ketosis)',
    hindiName: 'गर्भावस्था का कीटोसिस (कमजोरी व चक्कर आना)',
    species: 'Sheep & Goat',
    severity: 'emergency',
    matchingSymptomIds: ['lethargy', 'off_feed', 'circling', 'down_animal'],
    description: 'Severe negative energy balance occurring in late-pregnant ewes and does carrying twins or triplets. Fetuses consume available glucose, forcing fat breakdown that floods blood with toxic ketones.',
    immediateFirstAid: [
      'Drench immediately with 60–100 mL of Propylene Glycol OR warm water mixed with 4 tablespoons of glucose, honey, or jaggery.',
      'Repeat glucose drench every 6–8 hours to supply immediate metabolizable energy to the brain.',
      'Provide clean, sweet, lukewarm molasses water.',
      'Offer highly nutritious, palatable green forage (tender Lucerne/Alfalfa) and clean grain mash.',
      'Call veterinarian urgently for IV 20–50% Dextrose infusion and Vitamin B-Complex.'
    ],
    whatNotToDo: [
      'NEVER subject late-pregnant ewes/does to sudden fasting, transport, or harsh shearing stress.',
      'DO NOT force liquids into a comatose animal that lacks swallowing reflex.'
    ],
    whenToCallVet: [
      'Female is blind, trembling, star-gazing, or comatose.',
      'No improvement after 2 oral energy drenches within 12 hours.'
    ],
    preventiveTips: [
      'Increase concentrate energy feeding gradually during the final 4–6 weeks of gestation.',
      'Never allow does/ewes to become overly obese or severely thin during breeding.'
    ]
  },
  {
    id: 'pem_listeriosis_circling',
    name: 'Polioencephalomalacia (PEM / Goat Polio) / Listeriosis',
    hindiName: 'मस्तिष्क का रोग / चक्कर आना व कंपन (पोलियो/लिस्टेरिया)',
    species: 'Sheep & Goat',
    severity: 'emergency',
    matchingSymptomIds: ['circling', 'tremors', 'down_animal', 'off_feed'],
    description: 'Brain metabolic disturbance caused by Thiamine (Vitamin B1) deficiency (PEM) or brainstem infection from spoiled silage/decayed feed (Listeria). Causes acute blindness, star-gazing, and circling.',
    immediateFirstAid: [
      'Place animal in a quiet, softly padded, dimly lit pen to prevent head trauma against walls.',
      'Keep head and chest propped upright with straw bales to prevent aspiration of saliva.',
      'High-dose Thiamine (Vitamin B1) injectable treatment must be administered urgently by a veterinarian or skilled herdsman.',
      'If Listeriosis is suspected, high-dose antibiotic therapy (Procaine Penicillin) is required immediately.',
      'Suspend all spoiled, wet, or moldy silage/feed immediately.'
    ],
    whatNotToDo: [
      'NEVER drench fluids by mouth if the animal has lost its swallow reflex or has a twisted neck.',
      'DO NOT shout, shine bright lights, or stress an animal undergoing brain spasms.'
    ],
    whenToCallVet: [
      'Animal shows rapid nystagmus (eyes jerking sideways or up/down).',
      'Head is arched stiffly over the back (star-gazing) and animal is unresponsive.'
    ],
    preventiveTips: [
      'Never feed spoiled, moldy, or poorly preserved silage/fodder.',
      'Avoid high-sulfate water or sudden rumen disruptions that destroy natural thiamine-producing bacteria.'
    ]
  },
  {
    id: 'mange_scabies_parasites',
    name: 'Mange / Scabies / External Mites (Sarcoptic / Psoroptic)',
    hindiName: 'खुजली व दाद (जूँ व चिचड़ी का प्रकोप)',
    species: 'Sheep & Goat',
    severity: 'manageable',
    matchingSymptomIds: ['wool_loss', 'off_feed'],
    description: 'Microscopic mites burrowing in skin layers causing intense pruritus, self-trauma, thickened corrugated scabs, and severe wool/hair loss, reducing grazing efficiency and body condition.',
    immediateFirstAid: [
      'Isolate affected animal in a separate quarantine pen to avoid contact spreading across herd fences.',
      'Scrub crusty patches gently with warm soapy water to loosen superficial scabs.',
      'Apply veterinarian-approved acaricidal dip/spray (e.g. Deltamethrin, Cypermethrin, or Neem-oil based herbal dressing).',
      'Veterinarian may prescribe subcutaneous Ivermectin injection (0.2 mg/kg).',
      'Disinfect shed posts, scratching rails, and feed barriers.'
    ],
    whatNotToDo: [
      'DO NOT return treated animals back to un-disinfected pens where mites survive in cracks.',
      'DO NOT apply toxic agricultural pesticides directly on animal skin.'
    ],
    whenToCallVet: [
      'More than 25% of flock begins scratching or skin develops deep infected cracks with pus.'
    ],
    preventiveTips: [
      'Quarantine all newly introduced animals for 2 weeks.',
      'Regular post-shearing anti-parasitic dipping for sheep.'
    ]
  }
];

export const SymptomCheckerModal: React.FC<SymptomCheckerModalProps> = ({
  farm,
  isOpen,
  onClose,
  initialAnimalId,
  onAnimalHealthLogged
}) => {
  const { lang, t } = useLanguage();

  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedConditionId, setSelectedConditionId] = useState<string | null>(null);

  // Link to Animal Log state
  const [targetAnimalId, setTargetAnimalId] = useState<string>(initialAnimalId || farm.animals[0]?.id || '');
  const [showLogSuccess, setShowLogSuccess] = useState<boolean>(false);
  const [customNotes, setCustomNotes] = useState<string>('');

  // Category counts and filter
  const categories = [
    { id: 'all', label: 'All Symptoms', icon: '📋' },
    { id: 'general', label: 'General & Vitals', icon: '🌡️' },
    { id: 'digestive', label: 'Digestive & Belly', icon: '🌾' },
    { id: 'respiratory', label: 'Lungs & Breathing', icon: '🫁' },
    { id: 'head_mouth', label: 'Head, Mouth & Eyes', icon: '👄' },
    { id: 'locomotion', label: 'Legs & Hooves', icon: '🦶' },
    { id: 'neurological', label: 'Brain & Nerves', icon: '⚡' },
    { id: 'skin_wool', label: 'Skin & Wool', icon: '🐑' },
    { id: 'urinary', label: 'Urinary', icon: '💧' },
  ];

  // Helper to pick localized label
  const getLocalizedSymptom = (item: SymptomItem) => {
    switch (lang) {
      case 'hi': return item.hindiLabel || item.label;
      case 'kn': return item.kannadaLabel || item.label;
      case 'te': return item.teluguLabel || item.label;
      case 'ta': return item.tamilLabel || item.label;
      case 'ml': return item.malayalamLabel || item.label;
      case 'mr': return item.marathiLabel || item.label;
      default: return item.label;
    }
  };

  const getLocalizedConditionName = (cond: ConditionAdvice) => {
    if (lang === 'hi' && cond.hindiName) return cond.hindiName;
    return cond.name;
  };

  // Filter symptoms based on search and category
  const filteredSymptoms = useMemo(() => {
    return SYMPTOM_DEFINITIONS.filter(s => {
      const matchesCategory = activeCategory === 'all' || s.category === activeCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || 
        s.label.toLowerCase().includes(q) || 
        s.description.toLowerCase().includes(q) ||
        s.hindiLabel.toLowerCase().includes(q) ||
        s.kannadaLabel.toLowerCase().includes(q) ||
        s.teluguLabel.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  // Toggle symptom selection
  const handleToggleSymptom = (id: string) => {
    setSelectedSymptoms(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const handleClearSymptoms = () => {
    setSelectedSymptoms([]);
    setSelectedConditionId(null);
  };

  // Matched conditions ranked by match score
  const matchedConditions = useMemo(() => {
    if (selectedSymptoms.length === 0) return [];

    const scored = CONDITIONS_KNOWLEDGE_BASE.map(cond => {
      const matched = cond.matchingSymptomIds.filter(id => selectedSymptoms.includes(id));
      const matchScore = matched.length / cond.matchingSymptomIds.length;
      return {
        ...cond,
        matchedCount: matched.length,
        matchPercentage: Math.round(matchScore * 100)
      };
    }).filter(c => c.matchedCount > 0);

    // Sort by matchedCount descending, then matchPercentage descending
    return scored.sort((a, b) => {
      if (b.matchedCount !== a.matchedCount) {
        return b.matchedCount - a.matchedCount;
      }
      return b.matchPercentage - a.matchPercentage;
    });
  }, [selectedSymptoms]);

  // Set the default selected condition
  const activeCondition = useMemo(() => {
    if (selectedConditionId) {
      return CONDITIONS_KNOWLEDGE_BASE.find(c => c.id === selectedConditionId) || matchedConditions[0];
    }
    return matchedConditions[0] || null;
  }, [selectedConditionId, matchedConditions]);

  // Log first-aid record to animal health history
  const handleLogFirstAidRecord = () => {
    if (!targetAnimalId || !activeCondition) return;

    const targetAnimal = farm.animals.find(a => a.id === targetAnimalId);
    if (!targetAnimal) return;

    const newRecord: Omit<HealthRecord, 'id'> = {
      animalId: targetAnimal.id,
      date: new Date().toISOString().split('T')[0],
      type: 'Treatment',
      title: `First Aid: ${activeCondition.name}`,
      diagnosis: `${activeCondition.name} (${selectedSymptoms.join(', ')})`,
      treatmentGiven: `Administered First-Aid protocol: ${activeCondition.immediateFirstAid[0] || 'Supportive care'}. ${customNotes}`.trim(),
      temperatureC: 39.0,
      veterinarian: 'On-farm First Aid (Symptom Checker)',
      outcome: 'Monitoring',
      costInr: 0
    };

    try {
      db.addHealthRecord(farm.id, newRecord);
      
      // If severity is emergency/urgent, update animal health status to 'Needs Medicine' or 'Under Observation'
      if (activeCondition.severity === 'emergency') {
        db.updateAnimal(farm.id, targetAnimal.id, { healthStatus: 'Needs Medicine' });
      } else if (activeCondition.severity === 'urgent') {
        db.updateAnimal(farm.id, targetAnimal.id, { healthStatus: 'Under Observation' });
      }

      setShowLogSuccess(true);
      setTimeout(() => setShowLogSuccess(false), 3000);
      setCustomNotes('');
      if (onAnimalHealthLogged) onAnimalHealthLogged(targetAnimal.id);
    } catch (e) {
      console.error('Failed to log health record', e);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-stone-900/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="relative w-full max-w-5xl max-h-[92vh] bg-white rounded-3xl shadow-2xl border border-stone-200 flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-4 py-3 sm:px-6 sm:py-4 bg-gradient-to-r from-emerald-900 via-teal-900 to-stone-900 text-white flex items-center justify-between shrink-0 border-b border-emerald-800">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-xl shrink-0 shadow-inner">
              🩺
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight truncate">
                  {t('symptomChecker', 'Sheep & Goat Symptom Checker')}
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-200 text-[10px] font-black tracking-wider uppercase border border-emerald-400/30 hidden xs:inline">
                  Offline First Aid
                </span>
              </div>
              <p className="text-xs text-emerald-200/90 font-medium truncate">
                Select signs you observe to get immediate emergency & supportive care steps.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0 ml-2"
            title="Close Symptom Checker"
            aria-label="Close"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Normal Ruminant Vitals Quick Reference Strip */}
        <div className="bg-emerald-50/80 border-b border-emerald-100 px-3 py-1.5 sm:px-6 flex items-center justify-between text-[11px] text-emerald-950 font-bold overflow-x-auto whitespace-nowrap gap-4 shrink-0">
          <div className="flex items-center gap-1.5 text-emerald-900 shrink-0">
            <Thermometer className="w-3.5 h-3.5 text-emerald-700" />
            <span>Normal Temp: <strong>38.5°C – 39.7°C (101.5°F – 103.5°F)</strong></span>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-900 shrink-0">
            <HeartPulse className="w-3.5 h-3.5 text-rose-600" />
            <span>Pulse: <strong>70 – 90 bpm</strong></span>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-900 shrink-0">
            <Wind className="w-3.5 h-3.5 text-teal-700" />
            <span>Breaths: <strong>15 – 30 /min</strong></span>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-900 shrink-0">
            <Activity className="w-3.5 h-3.5 text-amber-700" />
            <span>Rumen Cud Chewing: <strong>1 – 2 /min</strong></span>
          </div>
        </div>

        {/* Main Body: Two Columns on Desktop, Stacked on Mobile */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 min-h-0">
          
          {/* Left Column: Symptom Picker (5 cols on lg) */}
          <div className="lg:col-span-5 p-3.5 sm:p-5 border-b lg:border-b-0 lg:border-r border-stone-200 flex flex-col space-y-3 bg-stone-50/40">
            
            {/* Search & Selection Counter */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
                  <span>1.</span>
                  <span>{t('selectSymptoms', 'Select Observed Symptoms')}</span>
                </span>
                {selectedSymptoms.length > 0 && (
                  <button
                    onClick={handleClearSymptoms}
                    className="text-[11px] font-bold text-red-600 hover:text-red-700 flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Clear all ({selectedSymptoms.length})</span>
                  </button>
                )}
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search signs (e.g., cough, bloat, fever)..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-white border border-stone-200 rounded-xl text-xs font-medium placeholder:text-stone-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-2 text-stone-400 hover:text-stone-600 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar shrink-0">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 flex items-center gap-1 ${
                    activeCategory === cat.id
                      ? 'bg-emerald-800 text-white shadow-xs'
                      : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>

            {/* Symptom Checkboxes List */}
            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 max-h-[320px] lg:max-h-none">
              {filteredSymptoms.length === 0 ? (
                <div className="p-6 text-center text-xs text-stone-500 font-medium">
                  No symptoms match &ldquo;{searchQuery}&rdquo;. Try another term.
                </div>
              ) : (
                filteredSymptoms.map(symptom => {
                  const isSelected = selectedSymptoms.includes(symptom.id);
                  const localizedTitle = getLocalizedSymptom(symptom);

                  return (
                    <button
                      key={symptom.id}
                      type="button"
                      onClick={() => handleToggleSymptom(symptom.id)}
                      className={`w-full p-2.5 rounded-2xl text-left border transition-all cursor-pointer flex items-start gap-2.5 ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50/90 ring-2 ring-emerald-500/40 shadow-xs'
                          : 'border-stone-200 bg-white hover:bg-stone-50 text-stone-800'
                      }`}
                    >
                      <div className="text-xl shrink-0 mt-0.5 leading-none">
                        {symptom.icon}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className={`text-xs font-black leading-tight ${isSelected ? 'text-emerald-950' : 'text-stone-900'}`}>
                            {localizedTitle}
                          </span>
                          <span className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                            isSelected ? 'bg-emerald-700 border-emerald-700 text-white' : 'border-stone-300 bg-white'
                          }`}>
                            {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-500 font-medium mt-0.5 line-clamp-2">
                          {symptom.description}
                        </p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            {/* Selected Symptoms Chips Summary */}
            {selectedSymptoms.length > 0 && (
              <div className="pt-2 border-t border-stone-200">
                <div className="text-[10px] font-black text-stone-500 uppercase tracking-wider mb-1.5">
                  Selected Signs ({selectedSymptoms.length}):
                </div>
                <div className="flex flex-wrap gap-1">
                  {selectedSymptoms.map(id => {
                    const item = SYMPTOM_DEFINITIONS.find(s => s.id === id);
                    if (!item) return null;
                    return (
                      <span 
                        key={id}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-950 text-[10px] font-black border border-emerald-300"
                      >
                        <span>{item.icon}</span>
                        <span className="truncate max-w-[120px]">{item.label}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleSymptom(id);
                          }}
                          className="hover:text-red-700 cursor-pointer ml-0.5"
                        >
                          ×
                        </button>
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

          </div>

          {/* Right Column: First-Aid Advice & Matched Conditions (7 cols on lg) */}
          <div className="lg:col-span-7 p-3.5 sm:p-5 flex flex-col space-y-4 overflow-y-auto bg-white">
            
            {/* Condition Results Selector (When symptoms selected) */}
            {selectedSymptoms.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3 my-auto">
                <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-3xl shadow-inner">
                  🌾
                </div>
                <div className="max-w-md">
                  <h3 className="text-base font-black text-stone-900">
                    No Symptoms Selected Yet
                  </h3>
                  <p className="text-xs text-stone-500 mt-1">
                    Tap on the symptoms observed in your sheep or goat (e.g. <em>Off Feed</em>, <em>Cough</em>, <em>Bloat</em>) in the list to reveal differential conditions and actionable first-aid steps.
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-1.5 pt-2">
                  <span className="text-[11px] font-bold text-stone-400">Quick Test:</span>
                  <button
                    onClick={() => setSelectedSymptoms(['bloat', 'off_feed'])}
                    className="px-2.5 py-1 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold hover:bg-amber-100 transition-colors cursor-pointer"
                  >
                    🎈 Bloat & Off Feed
                  </button>
                  <button
                    onClick={() => setSelectedSymptoms(['cough', 'fever'])}
                    className="px-2.5 py-1 rounded-xl bg-teal-50 border border-teal-200 text-teal-900 text-xs font-bold hover:bg-teal-100 transition-colors cursor-pointer"
                  >
                    🫁 Cough & Fever
                  </button>
                  <button
                    onClick={() => setSelectedSymptoms(['bottle_jaw', 'pale_mucosa'])}
                    className="px-2.5 py-1 rounded-xl bg-purple-50 border border-purple-200 text-purple-900 text-xs font-bold hover:bg-purple-100 transition-colors cursor-pointer"
                  >
                    💧 Bottle Jaw & Anemia
                  </button>
                </div>
              </div>
            ) : matchedConditions.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
                <h4 className="text-sm font-black text-stone-800">No Direct Match Found</h4>
                <p className="text-xs text-stone-500 max-w-sm mx-auto">
                  The combination of signs you selected did not match a specific predefined ailment. Please contact your local veterinarian for direct diagnosis.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                
                {/* Matched Conditions Tabs */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-black text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
                      <span>2.</span>
                      <span>Matching Possible Conditions ({matchedConditions.length}):</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {matchedConditions.map(cond => {
                      const isCurrent = activeCondition?.id === cond.id;
                      const severityBadge = cond.severity === 'emergency' 
                        ? 'bg-rose-100 text-rose-900 border-rose-300' 
                        : cond.severity === 'urgent'
                          ? 'bg-amber-100 text-amber-950 border-amber-300'
                          : 'bg-emerald-100 text-emerald-950 border-emerald-300';

                      return (
                        <button
                          key={cond.id}
                          onClick={() => setSelectedConditionId(cond.id)}
                          className={`p-3 rounded-2xl text-left border transition-all cursor-pointer relative ${
                            isCurrent
                              ? 'border-emerald-600 bg-white ring-2 ring-emerald-600/30 shadow-md'
                              : 'border-stone-200 bg-stone-50/70 hover:bg-stone-100 text-stone-800'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-1 mb-1">
                            <span className="text-xs font-black text-stone-900 leading-tight">
                              {getLocalizedConditionName(cond)}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase border shrink-0 ${severityBadge}`}>
                              {cond.severity}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2 text-[10px] text-stone-500 font-bold mt-1">
                            <span>{cond.species}</span>
                            <span>•</span>
                            <span className="text-emerald-700 font-black">
                              {cond.matchedCount} of {cond.matchingSymptomIds.length} signs ({cond.matchPercentage}%)
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Active Condition Details & First Aid Card */}
                {activeCondition && (
                  <div className="space-y-3.5 border border-stone-200 rounded-3xl p-4 bg-stone-50/30">
                    
                    {/* Severity Banner */}
                    <div className={`p-3 rounded-2xl border flex items-start gap-2.5 ${
                      activeCondition.severity === 'emergency'
                        ? 'bg-rose-50 border-rose-200 text-rose-950'
                        : activeCondition.severity === 'urgent'
                          ? 'bg-amber-50 border-amber-200 text-amber-950'
                          : 'bg-emerald-50 border-emerald-200 text-emerald-950'
                    }`}>
                      <div className="text-xl shrink-0 mt-0.5">
                        {activeCondition.severity === 'emergency' ? '🚨' : activeCondition.severity === 'urgent' ? '⚠️' : '✅'}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-black">
                            {activeCondition.severity === 'emergency' 
                              ? 'Critical Veterinary Emergency' 
                              : activeCondition.severity === 'urgent' 
                                ? 'Urgent Attention Needed' 
                                : 'Supportive First-Aid Management'}
                          </h4>
                        </div>
                        <p className="text-xs font-medium mt-0.5 opacity-90">
                          {activeCondition.description}
                        </p>
                      </div>
                    </div>

                    {/* Immediate First-Aid Steps */}
                    <div className="bg-white p-3.5 rounded-2xl border border-stone-200 space-y-2">
                      <div className="text-xs font-black text-emerald-950 flex items-center gap-1.5 uppercase tracking-wider">
                        <Stethoscope className="w-4 h-4 text-emerald-700" />
                        <span>Immediate First-Aid Protocol (What to Do Right Away)</span>
                      </div>
                      <ul className="space-y-2 text-xs text-stone-800">
                        {activeCondition.immediateFirstAid.map((step, idx) => (
                          <li key={idx} className="flex items-start gap-2 leading-relaxed">
                            <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-900 font-black text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                              {idx + 1}
                            </span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* What NOT to Do (Safety Warnings) */}
                    <div className="bg-rose-50/70 p-3.5 rounded-2xl border border-rose-200/90 space-y-1.5">
                      <div className="text-xs font-black text-rose-950 flex items-center gap-1.5 uppercase tracking-wider">
                        <AlertTriangle className="w-4 h-4 text-rose-600" />
                        <span>Critical Warnings (What NOT to Do)</span>
                      </div>
                      <ul className="space-y-1.5 text-xs text-rose-900">
                        {activeCondition.whatNotToDo.map((warn, idx) => (
                          <li key={idx} className="flex items-start gap-2 leading-relaxed font-medium">
                            <span className="text-rose-600 font-bold shrink-0">•</span>
                            <span>{warn}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* When to Call the Vet Immediately */}
                    <div className="bg-amber-50/70 p-3.5 rounded-2xl border border-amber-200/90 space-y-1.5">
                      <div className="text-xs font-black text-amber-950 flex items-center gap-1.5 uppercase tracking-wider">
                        <ShieldAlert className="w-4 h-4 text-amber-700" />
                        <span>When to Call Veterinarian Immediately</span>
                      </div>
                      <ul className="space-y-1 text-xs text-amber-900">
                        {activeCondition.whenToCallVet.map((callPoint, idx) => (
                          <li key={idx} className="flex items-start gap-2 leading-relaxed">
                            <span className="text-amber-700 font-bold shrink-0">→</span>
                            <span>{callPoint}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Log to Animal Health Record Action Box */}
                    <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-stone-50 border border-emerald-200 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-emerald-950 flex items-center gap-1.5">
                          <FileText className="w-4 h-4 text-emerald-700" />
                          <span>Record First Aid in Flock Diary</span>
                        </span>
                        {showLogSuccess && (
                          <span className="text-[11px] font-black text-emerald-700 flex items-center gap-1 animate-in fade-in">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Logged to Medical Diary!</span>
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <div>
                          <label className="block text-[10px] font-bold text-stone-600 mb-1">
                            Select Affected Animal:
                          </label>
                          <select
                            value={targetAnimalId}
                            onChange={e => setTargetAnimalId(e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-white border border-stone-200 rounded-xl text-xs font-bold text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
                          >
                            {farm.animals.map(a => (
                              <option key={a.id} value={a.id}>
                                {a.tagId} — {a.name || a.species} ({a.breed})
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-stone-600 mb-1">
                            Additional Notes (Optional):
                          </label>
                          <input
                            type="text"
                            placeholder="e.g., Given 60ml oil, isolated in pen 2"
                            value={customNotes}
                            onChange={e => setCustomNotes(e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-white border border-stone-200 rounded-xl text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleLogFirstAidRecord}
                        className="w-full py-2 px-3 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-black flex items-center justify-center gap-1.5 transition-all shadow-xs active:scale-98 cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Save First Aid Treatment to Animal Diary</span>
                      </button>
                    </div>

                  </div>
                )}

              </div>
            )}

          </div>

        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 sm:px-6 sm:py-3 bg-stone-100 border-t border-stone-200 flex items-center justify-between text-xs font-bold text-stone-600 shrink-0">
          <div className="flex items-center gap-1.5 text-[11px] text-stone-500">
            <Info className="w-3.5 h-3.5 text-stone-400 shrink-0" />
            <span>Standard offline veterinary first-aid guide for small ruminants. Always seek qualified veterinary diagnosis for serious illness.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-black cursor-pointer transition-colors"
          >
            {t('close', 'Close')}
          </button>
        </div>

      </div>
    </div>
  );
};
