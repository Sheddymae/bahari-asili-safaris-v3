export type SafariTab = 'tsavo' | 'amboseli' | 'mara' | 'taita';

export interface Safari {
  id: string;
  name: string;
  tagline: string;
  days: number;
  nights: number;
  parks: string[];
  lodges: string[];
  tabs: SafariTab[];
  rating: number;
  reviewCount: number;
  image: string;
  category: 'short' | 'medium' | 'long';
  popular?: boolean;
  highlights: string[];
  itinerary: { day: string; title: string; morning: string; afternoon: string; overnight: string }[];
  packingTips: string[];
  included?: string[];
  excluded?: string[];
  activityLevel?: number; // 1-5
  comfortLevel?: number; // 1-5
}

// Standard inclusions/exclusions shared across every safari package unless a
// specific package overrides them below. Reflects Bahari Asili's normal
// operating model — adjust per-package via the `included`/`excluded` fields
// on individual entries if a package genuinely differs (e.g. a balloon add-on).
export const DEFAULT_INCLUDED = [
  'KWS park entry fees',
  '4x4 safari vehicle with pop-up roof',
  'English & Italian-speaking driver-guide',
  'Full board (breakfast, lunch, dinner)',
  'Drinking water during game drives',
  'All accommodation as per itinerary',
  'Airport / hotel pickup & drop-off',
];

export const DEFAULT_EXCLUDED = [
  'International & domestic flights',
  'Visa fees',
  'Travel & medical insurance',
  'Tips and gratuities for guides & staff',
  'Alcoholic & premium bottled drinks',
  'Personal expenses & souvenirs',
  'Optional activities (balloon safaris, spa, etc.)',
];

const packingTips = [
  'High SPF sunscreen (50+)',
  'Wide-brim hat',
  'Tropical insect repellent (DEET-based)',
  'Light long-sleeved shirts and trousers (neutral colours)',
  'English 3-pin plug adapter (Type G)',
  'Binoculars (7x50 or 10x42)',
  'Comfortable closed-toe shoes for game walks',
  'Swimwear and flip-flops for lodge pool',
  'Small torch/headlamp',
  'Camera with spare battery',
  'NO DRONES — strictly prohibited in all national parks',
];

export const safaris: Safari[] = [
  {
    id: 'experience',
    name: 'Safari EXPERIENCE',
    tagline: 'Your first taste of the wild Kenya',
    days: 2,
    nights: 1,
    parks: ['Tsavo East'],
    lodges: ['Voi Wildlife Lodge', 'Manyatta Camp'],
    rating: 4.9,
    reviewCount: 148,
    tabs: ['tsavo'],
    image: '/images/safaris/safari-experience-tsavo.jpg',
    category: 'short',
    activityLevel: 2, // 1-5 scale, illustrative — review against real trip pace
    comfortLevel: 4, // 1-5 scale, illustrative — review against actual lodges
    popular: true,
    highlights: ['Red-dust elephants', 'Mudanda Rock viewpoint', 'Aruba Dam wildlife', 'Big tusker sightings'],
    itinerary: [
      {
        day: 'Day 1',
        title: 'Watamu → Tsavo East',
        morning: 'Early departure from Watamu. Drive through scenic Malindi and Galana River landscapes, entering Tsavo East through the Voi gate. Check into Voi Wildlife Lodge and enjoy the spectacular waterhole view over lunch.',
        afternoon: 'Afternoon game drive across the Voi Plains. Spot the famous red-dust elephants, buffalo herds, zebras, and if you are lucky, lions resting under the acacia trees. Sundowner at the lodge.',
        overnight: 'Voi Wildlife Lodge or Manyatta Camp',
      },
      {
        day: 'Day 2',
        title: 'Tsavo East → Watamu',
        morning: 'Sunrise game drive — golden light makes for incredible photography. Visit Mudanda Rock, a dramatic natural dam attracting hundreds of elephants, and Aruba Dam teeming with hippos and crocodiles.',
        afternoon: 'Depart Tsavo East after a late breakfast. Return drive through the bush back to Watamu, arriving late afternoon.',
        overnight: 'Return to Watamu',
      },
    ],
    packingTips,
  },
  {
    id: 'inside',
    name: 'Safari INSIDE',
    tagline: 'Elephants, red dust, and Kilimanjaro skies',
    days: 3,
    nights: 2,
    parks: ['Tsavo East', 'Amboseli'],
    lodges: ['Voi Wildlife Lodge', 'AA Lodge Amboseli'],
    rating: 4.9,
    reviewCount: 122,
    tabs: ['tsavo', 'amboseli'],
    image: '/images/safaris/safari-inside-tsavo-amboseli.jpg',
    category: 'short',
    activityLevel: 2, // 1-5 scale, illustrative — review against real trip pace
    comfortLevel: 4, // 1-5 scale, illustrative — review against actual lodges
    highlights: ['Big Five wildlife', 'Mt Kilimanjaro panoramas', '400+ elephant herds', 'Observation Hill'],
    itinerary: [
      {
        day: 'Day 1',
        title: 'Watamu → Tsavo East',
        morning: 'Depart Watamu at dawn. Enter Tsavo East National Park through Voi gate. Settle into the lodge with sweeping waterhole views.',
        afternoon: 'Afternoon game drive spotting red elephants, lions, leopards, and cheetahs on the Voi plains. Campfire dinner at the lodge.',
        overnight: 'Voi Wildlife Lodge',
      },
      {
        day: 'Day 2',
        title: 'Tsavo East → Amboseli',
        morning: 'Morning game drive in Tsavo East — best hours for predator sightings. Visit the classic Mudanda Rock viewpoint.',
        afternoon: 'Transfer to Amboseli National Park via Tsavo East\'s Kimana gate. First views of Kilimanjaro at sunset are breathtaking. Afternoon game drive with massive elephant herds.',
        overnight: 'AA Lodge Amboseli',
      },
      {
        day: 'Day 3',
        title: 'Amboseli → Watamu',
        morning: 'Dawn game drive — catch elephants silhouetted against the snow-capped Kilimanjaro at sunrise. Visit Observation Hill for panoramic views of the swamp.',
        afternoon: 'Late breakfast at lodge. Return journey to Watamu, arriving evening.',
        overnight: 'Return to Watamu',
      },
    ],
    packingTips,
  },
  {
    id: 'nala',
    name: 'Safari NALA',
    tagline: 'The secret garden of the Taita Hills',
    days: 3,
    nights: 2,
    parks: ['Tsavo East', 'Taita Hills'],
    lodges: ['Sentrim Tsavo', 'Salt Lick Safari Lodge'],
    rating: 4.8,
    reviewCount: 94,
    tabs: ['taita', 'tsavo'],
    image: '/images/safaris/safari-nala-taita.jpg',
    category: 'short',
    activityLevel: 3, // 1-5 scale, illustrative — review against real trip pace
    comfortLevel: 4, // 1-5 scale, illustrative — review against actual lodges
    highlights: ['Salt Lick waterhole by night', 'Taita Hills endemic birds', 'Red elephants of Tsavo', 'Underground bunker hide'],
    itinerary: [
      {
        day: 'Day 1',
        title: 'Watamu → Tsavo East',
        morning: 'Early morning departure from Watamu to Tsavo East. Enter through Sala gate with views over the Galana River corridor.',
        afternoon: 'Afternoon game drive focusing on the riverine areas where lions and leopards hunt. Overnight at Sentrim Tsavo with spectacular savanna views.',
        overnight: 'Sentrim Tsavo',
      },
      {
        day: 'Day 2',
        title: 'Tsavo East → Taita Hills',
        morning: 'Game drive to the iconic Mudanda Rock. Watch elephants queue to drink at the natural dam below.',
        afternoon: 'Transfer to the magical Taita Hills Wildlife Sanctuary. Salt Lick Safari Lodge is built on stilts above a floodlit waterhole — animals arrive freely at all hours. Underground bunker viewing at dusk.',
        overnight: 'Salt Lick Safari Lodge',
      },
      {
        day: 'Day 3',
        title: 'Taita Hills → Watamu',
        morning: 'Early morning waterhole watch from the lodge. Spot hyenas, buffalo, and nocturnal animals returning to the bush. Final game drive through the Taita Hills sanctuary.',
        afternoon: 'Depart after brunch. Return to Watamu coast.',
        overnight: 'Return to Watamu',
      },
    ],
    packingTips,
  },
  {
    id: 'simba-timon',
    name: 'Safari SIMBA & TIMON',
    tagline: 'Three parks, one legendary journey',
    days: 4,
    nights: 3,
    parks: ['Tsavo East', 'Tsavo West', 'Amboseli'],
    lodges: ['Voi Wildlife Lodge', 'Kilima Camp', 'AA Lodge Amboseli'],
    rating: 4.9,
    reviewCount: 107,
    tabs: ['tsavo', 'amboseli'],
    image: 'https://images.pexels.com/photos/33045/lion-wild-africa-african.jpg?auto=compress&cs=tinysrgb&w=800',
    category: 'medium',
    activityLevel: 3, // 1-5 scale, illustrative — review against real trip pace
    comfortLevel: 4, // 1-5 scale, illustrative — review against actual lodges
    popular: true,
    highlights: ['Mzima Springs hippos', 'Shetani Lava flow', 'Kilimanjaro elephants', 'Man-Eaters of Tsavo history'],
    itinerary: [
      {
        day: 'Day 1',
        title: 'Watamu → Tsavo East',
        morning: 'Departure from Watamu at dawn. Drive to Tsavo East, Kenya\'s largest national park.',
        afternoon: 'Afternoon game drive on the Voi Plains. Settle into Voi Wildlife Lodge overlooking the active waterhole.',
        overnight: 'Voi Wildlife Lodge',
      },
      {
        day: 'Day 2',
        title: 'Full day Tsavo East',
        morning: 'Sunrise game drive visiting Mudanda Rock and the famous Aruba Dam — one of Africa\'s great wildlife spectacles.',
        afternoon: 'Afternoon drives to the Yatta Plateau. Learn the story of the Man-Eaters of Tsavo at the park information centre.',
        overnight: 'Voi Wildlife Lodge',
      },
      {
        day: 'Day 3',
        title: 'Tsavo West → Amboseli',
        morning: 'Cross to Tsavo West. Snorkel with hippos and crocodiles at the crystal-clear Mzima Springs. Walk the Shetani Lava flow boardwalk.',
        afternoon: 'Transfer to Amboseli through Chyulu Hills. First views of Kilimanjaro at sunset. Evening game drive with tuskers.',
        overnight: 'Kilima Camp / AA Lodge Amboseli',
      },
      {
        day: 'Day 4',
        title: 'Amboseli → Watamu',
        morning: 'Final sunrise game drive. Elephants at the swamp with Kilimanjaro glowing behind them — the iconic Kenya photograph.',
        afternoon: 'Return journey to the Watamu coast.',
        overnight: 'Return to Watamu',
      },
    ],
    packingTips,
  },
  {
    id: 'zazu',
    name: 'Safari ZAZU',
    tagline: 'The Masai Mara — Africa\'s greatest wildlife show',
    days: 3,
    nights: 2,
    parks: ['Masai Mara'],
    lodges: ['Manyatta Camp', 'Sentrim Mara'],
    rating: 5.0,
    reviewCount: 183,
    tabs: ['mara'],
    image: 'https://images.pexels.com/photos/631317/pexels-photo-631317.jpeg?auto=compress&cs=tinysrgb&w=800',
    category: 'short',
    activityLevel: 2, // 1-5 scale, illustrative — review against real trip pace
    comfortLevel: 5, // 1-5 scale, illustrative — review against actual lodges
    popular: true,
    highlights: ['Great Wildebeest Migration (Jul–Oct)', 'Big Five in one day', 'Maasai village visit', 'Hot air balloon optional'],
    itinerary: [
      {
        day: 'Day 1',
        title: 'Watamu → Masai Mara',
        morning: 'Early flight or road transfer from the coast to the Masai Mara. Check into camp and enjoy a welcome bush lunch with views over the Mara River.',
        afternoon: 'Afternoon game drive on the open Mara plains — lions, cheetahs, and massive elephant herds await. Sundowner with acacia silhouettes.',
        overnight: 'Manyatta Camp or Sentrim Mara',
      },
      {
        day: 'Day 2',
        title: 'Full Day Masai Mara',
        morning: 'Full-day game drive with packed bush picnic. Witness the famous wildebeest migration river crossing (July–October) — one of the most dramatic scenes in nature.',
        afternoon: 'Afternoon drive tracking the big cats. Visit a traditional Maasai village in the late afternoon, meet the warriors and elders.',
        overnight: 'Manyatta Camp or Sentrim Mara',
      },
      {
        day: 'Day 3',
        title: 'Masai Mara → Watamu',
        morning: 'Dawn game drive — catch the sunrise over the Mara River. Lions are most active at this hour.',
        afternoon: 'Transfer back to Watamu coast.',
        overnight: 'Return to Watamu',
      },
    ],
    packingTips,
  },
  {
    id: 'twiga',
    name: 'Safari TWIGA',
    tagline: 'Tall horizons across four landscapes',
    days: 4,
    nights: 3,
    parks: ['Tsavo East', 'Taita Hills', 'Amboseli'],
    lodges: ['Voi Wildlife Lodge', 'Salt Lick Safari Lodge', 'AA Lodge Amboseli'],
    rating: 4.8,
    reviewCount: 79,
    tabs: ['taita', 'amboseli'],
    image: 'https://images.pexels.com/photos/247502/pexels-photo-247502.jpeg?auto=compress&cs=tinysrgb&w=800',
    category: 'medium',
    activityLevel: 3, // 1-5 scale, illustrative — review against real trip pace
    comfortLevel: 4, // 1-5 scale, illustrative — review against actual lodges
    highlights: ['Salt Lick nocturnal waterhole', 'Amboseli elephant families', 'Tsavo big tuskers', 'Taita Hills biodiversity'],
    itinerary: [
      {
        day: 'Day 1',
        title: 'Watamu → Tsavo East',
        morning: 'Depart Watamu early and drive to Tsavo East. Enter through Sala gate following the Galana River.',
        afternoon: 'Afternoon game drive through the open plains. Red dust elephants are the star attraction.',
        overnight: 'Voi Wildlife Lodge',
      },
      {
        day: 'Day 2',
        title: 'Tsavo East → Taita Hills',
        morning: 'Early game drive at Mudanda Rock and Aruba Dam.',
        afternoon: 'Transfer to the Taita Hills Wildlife Sanctuary. Check into the iconic Salt Lick Safari Lodge. Underground bunker game viewing at dusk as animals crowd the waterhole.',
        overnight: 'Salt Lick Safari Lodge',
      },
      {
        day: 'Day 3',
        title: 'Taita Hills → Amboseli',
        morning: 'Dawn waterhole watch and final drive in Taita Hills sanctuary.',
        afternoon: 'Transfer to Amboseli. Afternoon game drive with the first views of Kilimanjaro and massive elephant herds.',
        overnight: 'AA Lodge Amboseli',
      },
      {
        day: 'Day 4',
        title: 'Amboseli → Watamu',
        morning: 'Sunrise drive in Amboseli — elephants at the swamp with Kilimanjaro.',
        afternoon: 'Return to Watamu coast.',
        overnight: 'Return to Watamu',
      },
    ],
    packingTips,
  },
  {
    id: 'rafiki',
    name: 'Safari RAFIKI',
    tagline: 'Five days of pure Kenya wilderness',
    days: 5,
    nights: 4,
    parks: ['Tsavo East', 'Tsavo West', 'Taita Hills', 'Amboseli'],
    lodges: ['Voi Wildlife Lodge', 'Sentrim Tsavo', 'Salt Lick Safari Lodge', 'AA Lodge Amboseli'],
    rating: 4.9,
    reviewCount: 61,
    tabs: ['taita', 'tsavo'],
    image: 'https://images.pexels.com/photos/2116960/pexels-photo-2116960.jpeg?auto=compress&cs=tinysrgb&w=800',
    category: 'medium',
    activityLevel: 3, // 1-5 scale, illustrative — review against real trip pace
    comfortLevel: 4, // 1-5 scale, illustrative — review against actual lodges
    highlights: ['Mzima Springs hippos', 'Salt Lick by night', 'Shetani Lava flow', 'Full Big Five experience', 'Kilimanjaro views'],
    itinerary: [
      {
        day: 'Day 1',
        title: 'Watamu → Tsavo East',
        morning: 'Early departure from Watamu to Tsavo East. Enter through Sala gate following the scenic Galana River.',
        afternoon: 'Afternoon game drive on the Voi Plains. Spot the famous red-dust elephants and settle into the lodge.',
        overnight: 'Voi Wildlife Lodge',
      },
      {
        day: 'Day 2',
        title: 'Full day Tsavo East',
        morning: 'Sunrise game drive to Mudanda Rock and Aruba Dam. Hundreds of elephants gather here in the dry season.',
        afternoon: 'Afternoon drives toward the Yatta Plateau escarpment. Search for the elusive leopard and cheetah.',
        overnight: 'Sentrim Tsavo',
      },
      {
        day: 'Day 3',
        title: 'Tsavo West → Taita Hills',
        morning: 'Cross to Tsavo West. Explore Mzima Springs where hippos and crocodiles lurk in crystal water. Walk the Shetani Lava flow boardwalk.',
        afternoon: 'Transfer to Taita Hills Wildlife Sanctuary and check into Salt Lick Safari Lodge.',
        overnight: 'Salt Lick Safari Lodge',
      },
      {
        day: 'Day 4',
        title: 'Taita Hills → Amboseli',
        morning: 'Dawn waterhole watch and morning drive in Taita Hills.',
        afternoon: 'Transfer to Amboseli. Afternoon game drive in the shadow of Kilimanjaro.',
        overnight: 'AA Lodge Amboseli',
      },
      {
        day: 'Day 5',
        title: 'Amboseli → Watamu',
        morning: 'Final sunrise game drive in Amboseli — elephants at the Enkongo Narok swamp.',
        afternoon: 'Return to Watamu coast.',
        overnight: 'Return to Watamu',
      },
    ],
    packingTips,
  },
  {
    id: 'tumbili',
    name: 'Safari TUMBILI',
    tagline: 'Flamingos, Mara lions, and endless savanna',
    days: 4,
    nights: 3,
    parks: ['Lake Nakuru', 'Masai Mara'],
    lodges: ['Milimani Hotel Nakuru', 'Manyatta Camp'],
    rating: 4.8,
    reviewCount: 88,
    tabs: ['mara'],
    image: 'https://images.pexels.com/photos/158251/pexels-photo-158251.jpeg?auto=compress&cs=tinysrgb&w=800',
    category: 'medium',
    activityLevel: 3, // 1-5 scale, illustrative — review against real trip pace
    comfortLevel: 3, // 1-5 scale, illustrative — review against actual lodges
    highlights: ['Pink flamingo lake', 'White and black rhino sanctuary', 'Masai Mara Big Five', 'Mara River crossing'],
    itinerary: [
      {
        day: 'Day 1',
        title: 'Watamu → Lake Nakuru',
        morning: 'Long transfer from Watamu to the Great Rift Valley. Arrive Lake Nakuru and check into hotel.',
        afternoon: 'Afternoon game drive in Lake Nakuru National Park. The lake turns pink with thousands of flamingos. Search for the rare white rhino in the sanctuary.',
        overnight: 'Milimani Hotel Nakuru',
      },
      {
        day: 'Day 2',
        title: 'Lake Nakuru → Masai Mara',
        morning: 'Morning game drive around Lake Nakuru — spot waterbuck, baboon, and the resident lion pride.',
        afternoon: 'Transfer to the world-famous Masai Mara. Late afternoon arrival and first game drive at golden hour.',
        overnight: 'Manyatta Camp',
      },
      {
        day: 'Day 3',
        title: 'Full day Masai Mara',
        morning: 'Full-day game drive with bush picnic. Seek out the wildebeest migration and river crossings (Jul–Oct). Lions, cheetahs, leopards, and hyenas hunt on the open plains.',
        afternoon: 'Afternoon drive and optional Maasai village visit.',
        overnight: 'Manyatta Camp',
      },
      {
        day: 'Day 4',
        title: 'Masai Mara → Watamu',
        morning: 'Last sunrise drive on the Mara before transfer.',
        afternoon: 'Return to Watamu coast, arriving evening.',
        overnight: 'Return to Watamu',
      },
    ],
    packingTips,
  },
  {
    id: 'tembo',
    name: 'Safari TEMBO',
    tagline: 'Six days — the full heart of Kenya',
    days: 6,
    nights: 5,
    parks: ['Masai Mara', 'Lake Nakuru', 'Amboseli', 'Tsavo East'],
    lodges: ['Sentrim Mara', 'Milimani Hotel Nakuru', 'AA Lodge Amboseli', 'Voi Wildlife Lodge'],
    rating: 5.0,
    reviewCount: 52,
    tabs: ['mara', 'amboseli'],
    image: 'https://images.pexels.com/photos/2835436/pexels-photo-2835436.jpeg?auto=compress&cs=tinysrgb&w=800',
    category: 'long',
    activityLevel: 4, // 1-5 scale, illustrative — review against real trip pace
    comfortLevel: 4, // 1-5 scale, illustrative — review against actual lodges
    popular: true,
    highlights: ['Great Migration', 'Flamingo shores', 'Kilimanjaro sunrise', 'Big tuskers of Tsavo', 'Full Big Five'],
    itinerary: [
      {
        day: 'Day 1',
        title: 'Watamu → Lake Nakuru',
        morning: 'Drive from Watamu to the Rift Valley. Arrive Lake Nakuru and settle into the hotel.',
        afternoon: 'Afternoon drive: flamingo lake, lion pride, white rhinos in the sanctuary.',
        overnight: 'Milimani Hotel Nakuru',
      },
      {
        day: 'Day 2',
        title: 'Lake Nakuru → Masai Mara',
        morning: 'Morning game drive in Nakuru — waterbuck, giraffe, tree-climbing lions.',
        afternoon: 'Transfer to Masai Mara. Late afternoon game drive on arrival.',
        overnight: 'Sentrim Mara',
      },
      {
        day: 'Day 3',
        title: 'Full day Masai Mara',
        morning: 'Full-day game drive. Witness the Mara River wildebeest crossing (Jul–Oct). Cheetahs, leopards, elephants, and massive hippo pods.',
        afternoon: 'Maasai village cultural visit. Sundowner on the Mara escarpment.',
        overnight: 'Sentrim Mara',
      },
      {
        day: 'Day 4',
        title: 'Masai Mara → Amboseli',
        morning: 'Dawn game drive, then transfer south to Amboseli National Park.',
        afternoon: 'Afternoon drive with Kilimanjaro and elephant herds.',
        overnight: 'AA Lodge Amboseli',
      },
      {
        day: 'Day 5',
        title: 'Amboseli → Tsavo East',
        morning: 'Sunrise at Amboseli swamp — elephants, hippos, birds. Transfer to Tsavo East.',
        afternoon: 'Afternoon game drive in Tsavo East. Red-dust elephants and big tuskers.',
        overnight: 'Voi Wildlife Lodge',
      },
      {
        day: 'Day 6',
        title: 'Tsavo East → Watamu',
        morning: 'Morning drive: Mudanda Rock and Aruba Dam.',
        afternoon: 'Return to Watamu coast.',
        overnight: 'Return to Watamu',
      },
    ],
    packingTips,
  },
  {
    id: 'sarabi',
    name: 'Safari SARABI',
    tagline: 'Seven parks, seven unforgettable nights',
    days: 7,
    nights: 6,
    parks: ['Masai Mara', 'Lake Nakuru', 'Amboseli', 'Tsavo East', 'Tsavo West'],
    lodges: ['Sentrim Mara', 'Milimani Hotel Nakuru', 'AA Lodge Amboseli', 'Kilima Camp', 'Voi Wildlife Lodge'],
    rating: 5.0,
    reviewCount: 38,
    tabs: ['mara', 'tsavo'],
    image: 'https://images.pexels.com/photos/1670187/pexels-photo-1670187.jpeg?auto=compress&cs=tinysrgb&w=800',
    category: 'long',
    activityLevel: 4, // 1-5 scale, illustrative — review against real trip pace
    comfortLevel: 3, // 1-5 scale, illustrative — review against actual lodges
    highlights: ['Great Wildebeest Migration', 'Mzima Springs snorkelling', 'All Big Five parks', 'Shetani Lava walk', 'Flamingo lake'],
    itinerary: [
      {
        day: 'Day 1',
        title: 'Watamu → Lake Nakuru',
        morning: 'Long drive from Watamu to the Rift Valley.',
        afternoon: 'Game drive: flamingos, rhinos, lions in Lake Nakuru.',
        overnight: 'Milimani Hotel Nakuru',
      },
      {
        day: 'Day 2',
        title: 'Lake Nakuru → Masai Mara',
        morning: 'Morning Nakuru drive, then transfer to the Mara.',
        afternoon: 'Arrival game drive on the Mara plains.',
        overnight: 'Sentrim Mara',
      },
      {
        day: 'Day 3',
        title: 'Full day Masai Mara',
        morning: 'All-day game drive: wildebeest crossing, cheetahs, leopards, lions.',
        afternoon: 'Maasai village visit and cultural experience.',
        overnight: 'Sentrim Mara',
      },
      {
        day: 'Day 4',
        title: 'Masai Mara → Amboseli',
        morning: 'Sunrise Mara drive, then transfer south.',
        afternoon: 'Amboseli game drive — Kilimanjaro at sunset.',
        overnight: 'AA Lodge Amboseli',
      },
      {
        day: 'Day 5',
        title: 'Amboseli → Tsavo West',
        morning: 'Dawn elephant watch at Amboseli swamp.',
        afternoon: 'Transfer to Tsavo West. Mzima Springs hippos and crocodiles. Shetani Lava walk.',
        overnight: 'Kilima Camp',
      },
      {
        day: 'Day 6',
        title: 'Tsavo West → Tsavo East',
        morning: 'Morning drive in Tsavo West. Transfer to Tsavo East via Tsavo River.',
        afternoon: 'Afternoon game drive: red elephants, Mudanda Rock.',
        overnight: 'Voi Wildlife Lodge',
      },
      {
        day: 'Day 7',
        title: 'Tsavo East → Watamu',
        morning: 'Sunrise drive: Aruba Dam and Galana River.',
        afternoon: 'Return to Watamu coast.',
        overnight: 'Return to Watamu',
      },
    ],
    packingTips,
  },
  {
    id: 'mufasa',
    name: 'Safari MUFASA',
    tagline: 'The ultimate Kenya safari — eight days, no compromises',
    days: 8,
    nights: 7,
    parks: ['Masai Mara', 'Lake Nakuru', 'Amboseli', 'Taita Hills', 'Tsavo West', 'Tsavo East'],
    lodges: ['Sentrim Mara', 'Milimani Hotel Nakuru', 'AA Lodge Amboseli', 'Salt Lick Safari Lodge', 'Kilima Camp', 'Voi Wildlife Lodge'],
    rating: 5.0,
    reviewCount: 27,
    tabs: ['mara', 'taita', 'amboseli', 'tsavo'],
    image: 'https://images.pexels.com/photos/1382269/pexels-photo-1382269.jpeg?auto=compress&cs=tinysrgb&w=800',
    category: 'long',
    activityLevel: 5, // 1-5 scale, illustrative — review against real trip pace
    comfortLevel: 3, // 1-5 scale, illustrative — review against actual lodges
    highlights: ['All six major parks', 'Full Big Five multiple encounters', 'Salt Lick nocturnal waterhole', 'Mzima Springs', 'Great Migration', 'Kilimanjaro at dawn'],
    itinerary: [
      {
        day: 'Day 1',
        title: 'Watamu → Lake Nakuru',
        morning: 'Long drive from Watamu to the Rift Valley — the spine of Kenya.',
        afternoon: 'Game drive in Lake Nakuru: flamingos, rhinos, buffalos.',
        overnight: 'Milimani Hotel Nakuru',
      },
      {
        day: 'Day 2',
        title: 'Lake Nakuru → Masai Mara',
        morning: 'Morning Nakuru drive, then cross the Mau Escarpment.',
        afternoon: 'Arrival at Masai Mara, first game drive at golden hour.',
        overnight: 'Sentrim Mara',
      },
      {
        day: 'Day 3',
        title: 'Full day Masai Mara',
        morning: 'All-day game drive: the Great Migration, river crossings, Big Five.',
        afternoon: 'Maasai cultural village visit.',
        overnight: 'Sentrim Mara',
      },
      {
        day: 'Day 4',
        title: 'Masai Mara → Amboseli',
        morning: 'Dawn game drive before long transfer south.',
        afternoon: 'Amboseli: elephant families at Enkongo Narok swamp, Kilimanjaro at sunset.',
        overnight: 'AA Lodge Amboseli',
      },
      {
        day: 'Day 5',
        title: 'Amboseli → Taita Hills',
        morning: 'Sunrise elephant and Kilimanjaro session.',
        afternoon: 'Transfer to Taita Hills. Salt Lick Safari Lodge — underground bunker waterhole.',
        overnight: 'Salt Lick Safari Lodge',
      },
      {
        day: 'Day 6',
        title: 'Taita Hills → Tsavo West',
        morning: 'Dawn waterhole watch at Salt Lick, final drive in Taita Hills.',
        afternoon: 'Tsavo West: Mzima Springs (hippos, crocs), Shetani Lava flow.',
        overnight: 'Kilima Camp',
      },
      {
        day: 'Day 7',
        title: 'Tsavo West → Tsavo East',
        morning: 'Drive across to Tsavo East — 13,747 km² of pure wilderness.',
        afternoon: 'Red-dust elephants, Mudanda Rock, Aruba Dam at sunset.',
        overnight: 'Voi Wildlife Lodge',
      },
      {
        day: 'Day 8',
        title: 'Tsavo East → Watamu',
        morning: 'Final sunrise game drive on the Voi Plains.',
        afternoon: 'Return to Watamu coast.',
        overnight: 'Return to Watamu',
      },
    ],
    packingTips,
  },
];

export interface Excursion {
  id: string;
  name: string;
  nameIt: string;
  duration: string;
  image: string;
  description: string;
  descriptionIt: string;
  highlights: string[];
  popular?: boolean;
}

export const excursions: Excursion[] = [
  {
    id: 'safari-blu-mida',
    name: 'Blue Safari — Mida Creek',
    nameIt: 'Safari Blu a Mida Creek',
    duration: 'Half Day',
    image: 'https://images.pexels.com/photos/1320684/pexels-photo-1320684.jpeg?auto=compress&cs=tinysrgb&w=800',
    description: 'Snorkelling safari in the shallow coral gardens of Mida Creek. Glass-bottom boat and snorkel equipment included. Perfect for all ages.',
    descriptionIt: 'Safari di snorkelling nei giardini di corallo poco profondi della Mida Creek. Barca a fondo di vetro e attrezzatura da snorkelling incluse. Perfetto per tutte le età.',
    popular: true,
    highlights: ['Glass-bottom boat', 'Shallow coral gardens', 'Sea turtles possible', 'Suitable for children'],
  },
  {
    id: 'safari-blu-sardegna',
    name: 'Blue Safari — Sardegna 2 Island',
    nameIt: 'Safari Blu Sardegna 2',
    duration: 'Half Day',
    image: 'https://images.pexels.com/photos/2765872/pexels-photo-2765872.jpeg?auto=compress&cs=tinysrgb&w=800',
    description: 'Boat excursion to the famous Sardegna 2 sandbar with dolphin watching opportunities. One of the best snorkelling spots on the entire Kenyan coast.',
    descriptionIt: 'Escursione in barca al famoso banco di sabbia Sardegna 2 con possibilità di avvistare i delfini. Uno dei migliori posti per fare snorkelling su tutta la costa keniana.',
    highlights: ['Dolphin watching', 'Famous sandbar', 'Deep coral reefs', 'Vibrant tropical fish'],
  },
  {
    id: 'isola-amore',
    name: "Love Island",
    nameIt: "Isola dell'Amore",
    duration: 'Half Day',
    image: 'https://images.pexels.com/photos/1032650/pexels-photo-1032650.jpeg?auto=compress&cs=tinysrgb&w=800',
    description: 'A short boat ride to a pristine sandbar surrounded by crystal-clear Indian Ocean waters. Perfect for snorkelling, swimming, and relaxing on white sand.',
    descriptionIt: 'Una breve gita in barca verso un banco di sabbia incontaminato circondato dalle acque cristalline dell\'Oceano Indiano. Perfetto per lo snorkelling, il nuoto e il relax sulla sabbia bianca.',
    highlights: ['Snorkelling in coral gardens', 'White sand beach', 'Crystal Indian Ocean water'],
  },
  {
    id: 'robinson-golden',
    name: 'Robinson Island & Golden Beach',
    nameIt: 'Isola di Robinson + Spiaggia Dorata',
    duration: 'Full Day',
    image: 'https://images.pexels.com/photos/457882/pexels-photo-457882.jpeg?auto=compress&cs=tinysrgb&w=800',
    description: 'A full day escape to two of Watamu\'s most secluded spots. Robinson Island for snorkelling and Golden Beach for a picnic lunch under the palms.',
    descriptionIt: 'Una giornata intera alla scoperta di due tra i luoghi più appartati di Watamu. Isola di Robinson per lo snorkelling e Spiaggia Dorata per un pranzo sull\'erba sotto le palme.',
    highlights: ['Secluded island beach', 'Snorkelling reef', 'Picnic lunch included', 'Dolphins possible'],
  },
  {
    id: 'mangrovie-canoa',
    name: 'Mangrove Canoe — Mida Creek',
    nameIt: 'Mangrovie in Canoa – Mida Creek',
    duration: '3 Hours',
    image: 'https://images.pexels.com/photos/1174732/pexels-photo-1174732.jpeg?auto=compress&cs=tinysrgb&w=800',
    description: 'Paddle through the otherworldly mangrove forests of Mida Creek at low tide. Spot kingfishers, sea eagles, mudskippers, and crabs in this UNESCO Biosphere Reserve.',
    descriptionIt: 'Pagaiata attraverso le foreste di mangrovie della Mida Creek con la bassa marea. Avvistamento di martin pescatori, aquile di mare e granchi in questa Riserva della Biosfera UNESCO.',
    highlights: ['UNESCO Biosphere Reserve', 'Kingfishers & sea eagles', 'Traditional dugout canoe', 'Mangrove ecosystem'],
  },
  {
    id: 'gede-ruins',
    name: 'Gede Ruins',
    nameIt: 'Rovine di Gede',
    duration: '3 Hours',
    image: 'https://images.pexels.com/photos/994605/pexels-photo-994605.jpeg?auto=compress&cs=tinysrgb&w=800',
    description: 'Explore the mysterious 13th-century Swahili city hidden in the coastal forest. Stone palaces, mosques, and water systems of a once-prosperous civilization.',
    descriptionIt: 'Esplora la misteriosa città Swahili del XIII secolo nascosta nella foresta costiera. Palazzi in pietra, moschee e sistemi idrici di una civiltà un tempo prospera.',
    popular: true,
    highlights: ['13th-century Swahili ruins', 'Giant forest trees', 'Friendly colobus monkeys', 'Local guide stories'],
  },
  {
    id: 'marafa-kitchen',
    name: "Marafa Hell's Kitchen",
    nameIt: "Marafa Hell's Kitchen",
    duration: 'Half Day',
    image: 'https://images.pexels.com/photos/1670187/pexels-photo-1670187.jpeg?auto=compress&cs=tinysrgb&w=800',
    description: "A dramatic gorge of red and white sandstone carved by erosion over millions of years. Locals call it Nyari — 'the place broken by itself'. Sunset here is unforgettable.",
    descriptionIt: "Un drammatico canyon di arenaria rossa e bianca scolpita dall'erosione in milioni di anni. I locali lo chiamano Nyari — 'il luogo spezzato da sé'. Il tramonto qui è indimenticabile.",
    highlights: ['Dramatic sandstone gorge', 'Sunset photography', 'Local legend storytelling', 'Short guided walk'],
  },
  {
    id: 'malindi-tour',
    name: 'Malindi Town Tour',
    nameIt: 'Tour di Malindi',
    duration: 'Half Day',
    image: 'https://images.pexels.com/photos/3889928/pexels-photo-3889928.jpeg?auto=compress&cs=tinysrgb&w=800',
    description: 'Discover Malindi — the oldest Portuguese settlement on the East African coast. Visit the Vasco da Gama pillar, the Fish Market, Malindi Marine Park, and the Italian quarter.',
    descriptionIt: 'Scopri Malindi, il più antico insediamento portoghese della costa dell\'Africa orientale. Visita il pilastro di Vasco da Gama, il Mercato del Pesce, il Parco Marino e il quartiere italiano.',
    highlights: ['Vasco da Gama pillar (1498)', 'Malindi Marine Park', 'Italian quarter', 'Fish market colours'],
  },
  {
    id: 'dabaso-village',
    name: 'Real Africa — Dabaso Village Tour',
    nameIt: 'Tour nella vera Africa – Villaggio Dabaso',
    duration: '3 Hours',
    image: 'https://images.pexels.com/photos/1386604/pexels-photo-1386604.jpeg?auto=compress&cs=tinysrgb&w=800',
    description: 'An authentic cultural immersion into everyday life in a local Giriama village. Visit schools, homes, the local market, and learn about traditional medicine and food.',
    descriptionIt: 'Un\'autentica immersione culturale nella vita quotidiana di un villaggio Giriama. Visita scuole, case, mercato locale e scopri la medicina tradizionale e il cibo locale.',
    highlights: ['Giriama cultural experience', 'Local school visit', 'Traditional cooking demo', 'Community support tourism'],
  },
];
