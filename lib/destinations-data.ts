import { safaris, type SafariTab } from './tours-data';

export interface Destination {
  slug: SafariTab;
  name: string;
  tagline: string;
  heroImage: string;
  intro: string;
  wildlifeHighlights: string[];
  bestSeason: string;
  faqs: { q: string; a: string }[];
}

export const destinations: Destination[] = [
  {
    slug: 'tsavo',
    name: 'Tsavo',
    tagline: "Kenya's largest wilderness — red-dusted elephants and endless horizons",
    heroImage: '/images/safaris/safari-experience-tsavo.jpg',
    intro:
      "Tsavo East and West together form one of the world's largest protected wildlife areas. It's famous for its red-earth elephants — the dust here stains their hides the colour of the soil — plus the Yatta Plateau, Mzima Springs, and rolling savannah that stretches to the horizon. It's also the closest major safari destination to the coast, making it easy to combine with a Watamu beach stay.",
    wildlifeHighlights: [
      'Large elephant herds (Tsavo\u2019s signature red elephants)',
      'Lions, including the historically maneless Tsavo lions',
      'Rhino sanctuary within Tsavo West',
      'Mzima Springs hippos and crocodiles, viewable from an underwater tank',
      'Yatta Plateau — the world\u2019s longest lava flow',
    ],
    bestSeason:
      'June–October (dry season) offers the best game viewing as animals gather near rivers and waterholes. November–May is greener and quieter, with fewer vehicles on the tracks.',
    faqs: [
      {
        q: 'How far is Tsavo from Watamu/Mombasa?',
        a: 'Roughly 3–4 hours by road from the coast, which is why most of our Tsavo safaris depart from and return to Watamu or Mombasa.',
      },
      {
        q: 'Is Tsavo good for a short safari?',
        a: "Yes — Tsavo East in particular works well for 2–3 day safaris since it's the closest major park to the coast, without the long transfer times Masai Mara requires.",
      },
      {
        q: 'Will we definitely see elephants?',
        a: "Tsavo has one of Kenya's largest elephant populations, so sightings are very likely, especially near water sources in the dry season — though wildlife viewing is never 100% guaranteed.",
      },
    ],
  },
  {
    slug: 'amboseli',
    name: 'Amboseli',
    tagline: 'Big-tusker elephants beneath the shadow of Kilimanjaro',
    heroImage: '/images/safaris/safari-inside-tsavo-amboseli.jpg',
    intro:
      "Amboseli National Park is best known for one unbeatable combination: large elephant herds walking across open plains with Mount Kilimanjaro rising in the background — Africa's classic postcard image. The park's swamps and marshes, fed by underground water from Kilimanjaro's snowmelt, keep it green even in the dry season, drawing wildlife (and photographers) from across the region.",
    wildlifeHighlights: [
      'Free-ranging elephant herds with Kilimanjaro as a backdrop',
      'Swamp-fed grasslands supporting year-round wildlife',
      'Maasai giraffe, buffalo, zebra and wildebeest',
      'Excellent birdlife around Amboseli\u2019s marshes',
    ],
    bestSeason:
      'June–October and January–February are best for clear Kilimanjaro views and concentrated wildlife near the swamps. Clouds more often obscure the mountain during the March–May rains.',
    faqs: [
      {
        q: 'Can we combine Amboseli with Tsavo?',
        a: 'Yes — several of our itineraries combine the two since they\u2019re on the same route, giving you Kilimanjaro views and Tsavo\u2019s red elephants in one trip.',
      },
      {
        q: 'Is Kilimanjaro visible year-round?',
        a: 'The mountain is often cloud-covered, especially during the rains. Early morning is generally the clearest time to photograph it.',
      },
    ],
  },
  {
    slug: 'mara',
    name: 'Masai Mara',
    tagline: "Kenya's most famous reserve — home to the Great Migration",
    heroImage: 'https://images.pexels.com/photos/631317/pexels-photo-631317.jpeg?auto=compress&cs=tinysrgb&w=1200',
    intro:
      'The Masai Mara National Reserve is Kenya\u2019s flagship safari destination — an extension of Tanzania\u2019s Serengeti ecosystem, and the stage for the annual wildebeest migration. Beyond the migration, the Mara holds year-round resident populations of lion, leopard, cheetah, and elephant across open grassland that makes for exceptional game viewing at any time of year.',
    wildlifeHighlights: [
      'The Great Migration — river crossings of wildebeest and zebra (seasonal)',
      'High density of big cats: lion, leopard, cheetah',
      'Large resident elephant and buffalo herds',
      'Maasai cultural visits to local villages',
    ],
    bestSeason:
      'July–October for the migration and river crossings. The Mara has good game viewing year-round, but the dry season (Jun–Oct) concentrates wildlife most predictably.',
    faqs: [
      {
        q: 'How far is the Masai Mara from Watamu?',
        a: 'It\u2019s a significant journey — typically a flight via Nairobi is more practical than driving from the coast. Our longer, multi-park itineraries (5+ days) are built around this.',
      },
      {
        q: 'Is the migration guaranteed?',
        a: 'No sighting in nature is ever guaranteed, but July–October gives the strongest odds of witnessing river crossings, based on typical migration patterns.',
      },
    ],
  },
  {
    slug: 'taita',
    name: 'Taita Hills',
    tagline: 'A private, less-crowded sanctuary between Tsavo East and West',
    heroImage: '/images/safaris/safari-nala-taita.jpg',
    intro:
      'The Taita Hills Wildlife Sanctuary sits between Tsavo East and Tsavo West, offering a quieter, more exclusive game-viewing experience with fewer vehicles than the main parks. Its varied terrain — hills, forest patches, and open plains — supports a good diversity of wildlife in a relatively compact, easy-to-explore area.',
    wildlifeHighlights: [
      'Elephant, buffalo, and giraffe in a quieter, less-trafficked setting',
      'Varied terrain — hills, plains and forest patches',
      'Often combined with Tsavo East/West for a fuller circuit',
    ],
    bestSeason:
      'June–October (dry season) for the best game concentration, similar to neighbouring Tsavo.',
    faqs: [
      {
        q: 'Is Taita Hills a standalone destination?',
        a: 'It\u2019s usually combined with Tsavo East and/or West as part of a multi-park itinerary rather than visited alone, since it sits right between them.',
      },
    ],
  },
];

export function getSafarisForDestination(slug: SafariTab) {
  return safaris.filter((s) => s.tabs.includes(slug));
}
