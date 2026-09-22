import { destinationDirectory, type Destination } from "@/data/destinations";

export interface DestinationPlace {
  name: string;
  description: string;
  tag?: string;
}

export interface DestinationStay {
  name: string;
  location: string;
  rating: string;
  price: string;
  image: string;
}

export interface DestinationOperator {
  name: string;
  vehicles: string;
  rating: string;
  description: string;
}

export interface DestinationDetails extends Destination {
  about: string;
  placesToVisit: DestinationPlace[];
  stays: DestinationStay[];
  cabOperators: DestinationOperator[];
  nearbySlugs: string[];
}

const placeOverrides: Record<string, DestinationPlace[]> = {
  ujjain: [
    { name: "Mahakaleshwar Temple", description: "A revered Jyotirlinga temple at the heart of Ujjain.", tag: "Spiritual" },
    { name: "Ram Ghat", description: "A peaceful Shipra River ghat, especially memorable at sunrise.", tag: "Riverside" },
    { name: "Kal Bhairav Temple", description: "An iconic temple dedicated to the guardian deity of Ujjain.", tag: "Temple" },
  ],
  jaipur: [
    { name: "Amber Fort", description: "Hilltop fort palaces with sweeping views over the Aravallis.", tag: "Heritage" },
    { name: "Hawa Mahal", description: "Jaipur’s striking five-storey palace of winds.", tag: "Landmark" },
    { name: "City Palace", description: "Courtyards, museums and royal architecture in the old city.", tag: "Culture" },
  ],
  goa: [
    { name: "Palolem Beach", description: "A crescent beach for slow afternoons and sunset walks.", tag: "Beach" },
    { name: "Fontainhas", description: "Colourful Portuguese-era lanes in Panaji.", tag: "Heritage" },
    { name: "Dudhsagar Falls", description: "A dramatic four-tier waterfall in the Western Ghats.", tag: "Nature" },
  ],
  manali: [
    { name: "Solang Valley", description: "A high-altitude valley known for mountain sports and views.", tag: "Adventure" },
    { name: "Hadimba Temple", description: "A quiet cedar-forest temple with distinctive wooden architecture.", tag: "Culture" },
    { name: "Old Manali", description: "Cafés, riverside paths and a relaxed Himalayan atmosphere.", tag: "Local life" },
  ],
};

const nearbyOverrides: Record<string, string[]> = {
  ujjain: ["indore", "omkareshwar", "maheshwar"],
  jaipur: ["udaipur", "jaisalmer", "agra"],
  goa: ["mumbai", "lonavala", "kerala"],
  manali: ["shimla", "leh", "rishikesh"],
};

const makePlaces = (destination: Destination): DestinationPlace[] =>
  placeOverrides[destination.slug] ?? [
    { name: `${destination.name} Heritage Walk`, description: `Discover the landmarks, stories and local character of ${destination.name}.`, tag: destination.type },
    { name: "Local Market", description: "Browse regional crafts, flavours and everyday culture.", tag: "Local life" },
    { name: "Scenic Viewpoint", description: `Take in a memorable view of ${destination.name} and its surroundings.`, tag: "Nature" },
  ];

const makeStays = (destination: Destination): DestinationStay[] => [
  { name: `${destination.name} Residency`, location: `${destination.name}, ${destination.state}`, rating: destination.rating.toFixed(1), price: `From ₹${destination.startingBudget.toLocaleString("en-IN")}`, image: destination.image },
  { name: `The ${destination.name} Retreat`, location: `Near key attractions, ${destination.name}`, rating: (destination.rating - 0.1).toFixed(1), price: `From ₹${(destination.startingBudget + 1200).toLocaleString("en-IN")}`, image: destination.image },
];

const makeOperators = (destination: Destination): DestinationOperator[] => [
  { name: `${destination.name} Local Cabs`, vehicles: "Sedan • SUV • Tempo Traveller", rating: destination.rating.toFixed(1), description: `Local sightseeing, station transfers and outstation travel from ${destination.name}.` },
  { name: `${destination.name} Travel Co.`, vehicles: "Hatchback • Sedan • SUV", rating: (destination.rating - 0.1).toFixed(1), description: "Flexible point-to-point rides and curated day trips with local drivers." },
];

const makeNearby = (destination: Destination) => {
  const override = nearbyOverrides[destination.slug];
  if (override) return override;
  const regional = destinationDirectory.filter(item => item.region === destination.region && item.slug !== destination.slug).slice(0, 3).map(item => item.slug);
  return regional.length ? regional : destinationDirectory.filter(item => item.slug !== destination.slug).slice(0, 3).map(item => item.slug);
};

export const destinationDetails: DestinationDetails[] = destinationDirectory.map(destination => ({
  ...destination,
  about: `${destination.name} is one of ${destination.state}'s most rewarding escapes. ${destination.description} Treko helps you shape a comfortable trip with handpicked stays and trusted local travel options.`,
  placesToVisit: makePlaces(destination),
  stays: makeStays(destination),
  cabOperators: makeOperators(destination),
  nearbySlugs: makeNearby(destination),
}));

export const getDestinationDetails = (slug: string) => destinationDetails.find(destination => destination.slug === slug);
