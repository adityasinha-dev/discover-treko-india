import goaImage from "@/assets/destination-manali.jpg";
import shimlaImage from "@/assets/destination-goa.jpg";
import rishikeshImage from "@/assets/destination-rishikesh.jpg";
import rishikeshStay from "@/assets/stay-rishikesh.jpg";
//Ujjain Images
import ujjainImage from "@/assets/hero-ujjain.jpg";
import ujjainCover_01 from "@/assets/ujjain-cover-1.jpg";
import ujjainCover_02 from "@/assets/ujjain-cover-2.jpg";
import ujjainCover_03 from "@/assets/ujjain-cover-3.jpg";
import ujjainCover_04 from "@/assets/ujjain-cover-4.jpg";
import ujjainCover_05 from "@/assets/ujjain-cover-5.jpg";


import ujjainStay from "@/assets/stay-ujjain.jpg";

export type Destination = {
  id: string;
  name: string;
  state: string;
  description: string;
  stays: string;
  cabs: string;
  image: string;
  images?: string[];
};

export const destinations: Destination[] = [
  { id: "rishikesh", name: "Rishikesh", state: "Uttarakhand", description: "Riverside calm, yoga retreats and mountain adventures.", stays: "70+ stays", cabs: "18 cab operators", image: rishikeshImage, images: [rishikeshImage, rishikeshStay] },
  { id: "ujjain", name: "Ujjain", state: "Madhya Pradesh", description: "Experience the spiritual heart of India, home to the famous Mahakaleshwar Jyotirlinga, sacred Shipra River, ancient temples, and vibrant cultural heritage.", stays: "Explore stays", cabs: "Local cabs", image: ujjainCover_01, images: [ujjainCover_02, ujjainCover_01, ujjainImage, ujjainCover_03, ujjainCover_04, ujjainCover_05] },
  { id: "shimla", name: "Shimla", state: "Himachal Pradesh", description: "Colonial hill architecture and cedar-lined mountain views.", stays: "Explore stays", cabs: "Local cabs", image: shimlaImage, images: [shimlaImage, rishikeshImage, rishikeshStay] },
  { id: "goa", name: "Goa", state: "Goa", description: "Coastal villages, heritage quarters and relaxed beaches.", stays: "150+ stays", cabs: "41 cab operators", image: goaImage, images: [goaImage, rishikeshImage, ujjainCover_03] },
  { id: "mumbai", name: "Mumbai", state: "Maharashtra", description: "A vibrant coastal city of culture, food and cinema.", stays: "Explore stays", cabs: "Local cabs", image: goaImage, images: [goaImage, rishikeshImage, ujjainCover_03] },
];

export const indianPlaces = destinations.map((destination) =>
  destination.state === destination.name ? destination.name : `${destination.name}, ${destination.state}`,
);
export const supportedDestinationIds = destinations.map((destination) => destination.id);
const supportedDestinationIdSet: ReadonlySet<string> = new Set(supportedDestinationIds);

export const isSupportedDestination = (value: string) =>
  destinations.some(
    (destination) =>
      destination.id === value.toLowerCase() || destination.name.toLowerCase() === value.toLowerCase(),
  );

export type RoomOption = {
  id: string;
  name: string;
  bedType: string;
  maxGuests: number;
  beds: number;
  price: number;
  description: string;
  amenities: string[];
  image: string;
};

export const buildHotelRoomOptions = (basePrice: number, image: string): RoomOption[] => [
  {
    id: "deluxe-double-room",
    name: "Deluxe Room",
    bedType: "Double Bed",
    maxGuests: 2,
    beds: 1,
    price: basePrice,
    description: "A bright, restful room with everyday essentials and a comfortable city stay experience.",
    amenities: ["AC", "Wi‑Fi", "Breakfast"],
    image,
  },
  {
    id: "luxury-king-room",
    name: "Luxury Room",
    bedType: "King Bed",
    maxGuests: 2,
    beds: 1,
    price: basePrice + 900,
    description: "An elevated room with premium finishes, extra comfort, and a more polished travel experience.",
    amenities: ["AC", "Wi‑Fi", "Breakfast", "City View"],
    image,
  },
  {
    id: "premium-room",
    name: "Premium Room",
    bedType: "King Bed",
    maxGuests: 3,
    beds: 1,
    price: basePrice + 1300,
    description: "A spacious stay for small families or friends wanting more room to relax and unwind.",
    amenities: ["AC", "Wi‑Fi", "Breakfast", "Workspace"],
    image,
  },
  {
    id: "family-room",
    name: "Family Room",
    bedType: "Queen + Extra Bed",
    maxGuests: 4,
    beds: 2,
    price: basePrice + 1700,
    description: "A flexible room configuration designed for families and longer stays with extra comfort.",
    amenities: ["AC", "Wi‑Fi", "Breakfast", "Family Dining"],
    image,
  },
  {
    id: "executive-room",
    name: "Executive Room",
    bedType: "King Bed",
    maxGuests: 3,
    beds: 1,
    price: basePrice + 2200,
    description: "A polished executive room with elevated amenities for a more premium overnight stay.",
    amenities: ["AC", "Wi‑Fi", "Breakfast", "Lounge Access"],
    image,
  },
  {
    id: "suite-room",
    name: "Suite",
    bedType: "King Bed + Sofa Bed",
    maxGuests: 5,
    beds: 2,
    price: basePrice + 3000,
    description: "A larger suite for travellers who want space, privacy, and a more indulgent stay.",
    amenities: ["AC", "Wi‑Fi", "Breakfast", "Premium Toiletries", "City View"],
    image,
  },
];

export const hotels = [
  {
    id: "hotel-grand-mahakal",
    slug: "hotel-grand-mahakal",
    destinationId: "ujjain",
    destination: "Ujjain",
    name: "Grand Mahakal Hotel",
    location: "Ujjain, Madhya Pradesh",
    type: "Hotel",
    rating: 4.8,
    price: 2499,
    priceLabel: "₹2,499 / night",
    image: ujjainStay,
    images: [ujjainStay, ujjainImage],
    description: "A refined stay near the Mahakaleshwar Temple corridor with comfortable rooms, temple transfers, and a calm evening ambience.",
    amenities: ["Breakfast", "Wi-Fi", "Temple transfer", "Room service", "Parking"],
    availability: "Available for 15 Oct – 30 Oct",
    terms: [
      "Check-in time: 2:00 PM",
      "Check-out time: 12:00 PM",
      "Cancellation free up to 24 hours before check-in.",
      "Government ID required at check-in.",
      "Extra guests are subject to room occupancy policy.",
    ],
    checkInTime: "14:00",
    checkOutTime: "12:00",
    roomInfo: "Deluxe Room • 2 Guests • 1 Room",
  },
  {
    id: "ganga-vista-retreat",
    slug: "ganga-vista-retreat",
    destinationId: "rishikesh",
    destination: "Rishikesh",
    name: "Ganga Vista Retreat",
    location: "Rishikesh, Uttarakhand",
    type: "Riverside resort",
    rating: 4.7,
    price: 4200,
    priceLabel: "₹4,200 / night",
    image: rishikeshStay,
    images: [rishikeshStay, rishikeshImage],
    description: "A peaceful riverside stay designed for early morning yoga, quiet evenings, and mountain-view breaks.",
    amenities: ["River view", "Yoga deck", "Parking", "Breakfast", "Wi-Fi"],
    availability: "Available throughout the season",
    terms: [
      "Check-in time: 1:00 PM",
      "Check-out time: 11:00 AM",
      "Cancellation within 12 hours incurs a 50% fee.",
      "Extra bedding is available on request.",
      "Quiet hours apply after 10:00 PM.",
    ],
    checkInTime: "13:00",
    checkOutTime: "11:00",
    roomInfo: "River View Room • 2 Guests • 1 Room",
  },
  {
    id: "mahakal-residency",
    slug: "mahakal-residency",
    destinationId: "ujjain",
    destination: "Ujjain",
    name: "Mahakal Residency",
    location: "Ujjain, Madhya Pradesh",
    type: "Hotel",
    rating: 4.6,
    price: 2199,
    priceLabel: "₹2,199 / night",
    image: ujjainStay,
    images: [ujjainStay, ujjainImage],
    description: "A comfortable city hotel with easy temple access, warm hospitality, and family-friendly rooms close to the religious core.",
    amenities: ["Breakfast", "Room service", "Wi-Fi", "Parking", "Temple shuttle"],
    availability: "Available all week",
    terms: [
      "Check-in time: 2:00 PM",
      "Check-out time: 12:00 PM",
      "Free cancellation within 24 hours before arrival.",
      "Photo ID required at check-in.",
      "Temple shuttle service is based on availability.",
    ],
    checkInTime: "14:00",
    checkOutTime: "12:00",
    roomInfo: "Standard Room • 2 Guests • 1 Room",
  },
  {
    id: "shipra-heritage-inn",
    slug: "shipra-heritage-inn",
    destinationId: "ujjain",
    destination: "Ujjain",
    name: "Shipra Heritage Inn",
    location: "Ujjain, Madhya Pradesh",
    type: "Heritage stay",
    rating: 4.7,
    price: 2899,
    priceLabel: "₹2,899 / night",
    image: ujjainStay,
    images: [ujjainStay, ujjainImage],
    description: "An elegant heritage-inspired inn near the ghats, designed for pilgrims and visitors who want a more local experience.",
    amenities: ["Breakfast", "Garden seating", "Wi-Fi", "Temple guide desk", "Parking"],
    availability: "Available for 14 Oct – 28 Oct",
    terms: [
      "Check-in time: 1:00 PM",
      "Check-out time: 11:00 AM",
      "Cancellation is free up to 12 hours before arrival.",
      "Sustainability-friendly policies apply after 9:00 PM.",
      "Extra bedding available on request.",
    ],
    checkInTime: "13:00",
    checkOutTime: "11:00",
    roomInfo: "Heritage Deluxe Room • 2 Guests • 1 Room",
  },
  {
    id: "maha-kaleshwar-stay",
    slug: "maha-kaleshwar-stay",
    destinationId: "ujjain",
    destination: "Ujjain",
    name: "Maha Kaleshwar Stay",
    location: "Ujjain, Madhya Pradesh",
    type: "Hotel",
    rating: 4.5,
    price: 1999,
    priceLabel: "₹1,999 / night",
    image: ujjainStay,
    images: [ujjainStay, ujjainImage],
    description: "A value-focused stay close to the old city, ideal for pilgrims planning temple visits and local experiences around Ujjain.",
    amenities: ["Breakfast", "Wi-Fi", "24x7 reception", "Parking", "Daily housekeeping"],
    availability: "Available all week",
    terms: [
      "Check-in time: 2:00 PM",
      "Check-out time: 12:00 PM",
      "Late checkout is subject to availability.",
      "Photo ID is required at the time of arrival.",
      "No loud music after 10:00 PM.",
    ],
    checkInTime: "14:00",
    checkOutTime: "12:00",
    roomInfo: "Comfort Room • 2 Guests • 1 Room",
  },
];

export const cabOperators = [
  {
    id: "ujjain-cab-services",
    slug: "ujjain-cab-services",
    destinationId: "ujjain",
    destination: "Ujjain",
    initials: "UT",
    name: "Ujjain Cab Services",
    image: ujjainImage,
    images: [ujjainImage, ujjainCover_01, ujjainCover_02],
    description: "Reliable local transport for temple routes, heritage pathways, and day trips around Ujjain with trained drivers.",
    rating: 4.7,
    vehicleTypes: ["Sedan", "SUV", "Tempo Traveller"],
    seatingCapacity: ["Up to 4 passengers", "Up to 6 passengers", "Up to 12 passengers"],
    pricing: "From ₹1,800 / day",
    price: 1800,
    services: ["Local sightseeing", "Airport transfer", "Outstation rides"],
    pickupInfo: "Railway station, bus stand, or hotel pickup",
    dropInfo: "Temple circuit and nearby landmarks",
    availability: "Available daily from 7:00 AM to 9:00 PM",
    terms: [
      "Cancellation up to 2 hours before pickup is free.",
      "Waiting time is capped at 15 minutes beyond the booked pickup time.",
      "Extra distance beyond the selected route is charged separately.",
      "Luggage restrictions depend on the selected vehicle type.",
      "Driver contact details are shared in your booking summary.",
    ],
  },
  {
    id: "mahakal-city-rides",
    slug: "mahakal-city-rides",
    destinationId: "ujjain",
    destination: "Ujjain",
    initials: "MC",
    name: "Mahakal City Rides",
    image: ujjainImage,
    images: [ujjainImage, ujjainCover_01, ujjainCover_02],
    description: "Fast and local city rides for temple circles, ghats, and airport-to-hotel transfers around Ujjain.",
    rating: 4.5,
    vehicleTypes: ["Sedan", "SUV", "Mini Van"],
    seatingCapacity: ["Up to 4 passengers", "Up to 6 passengers", "Up to 8 passengers"],
    pricing: "From ₹1,200 / day",
    price: 1200,
    services: ["Temple transfers", "City sightseeing", "Airport pickups"],
    pickupInfo: "Railway station, bus stand, or hotel pickup",
    dropInfo: "Temple circuit and key attractions",
    availability: "Available daily from 6:00 AM to 11:00 PM",
    terms: [
      "Cancellation must be notified at least 1 hour before pickup.",
      "Waiting beyond 15 minutes is charged at a standard local rate.",
      "Extra distance is billed separately after the chosen route.",
      "Luggage conditions depend on selected vehicle type.",
    ],
  },
  {
    id: "shipra-travel-link",
    slug: "shipra-travel-link",
    destinationId: "ujjain",
    destination: "Ujjain",
    initials: "ST",
    name: "Shipra Travel Link",
    image: ujjainImage,
    images: [ujjainImage, ujjainCover_01, ujjainCover_02],
    description: "Comfort-first cab service for pilgrims and travellers who want reliable local travel and smoother temple-day connections.",
    rating: 4.7,
    vehicleTypes: ["Sedan", "SUV", "Traveller"],
    seatingCapacity: ["Up to 4 passengers", "Up to 6 passengers", "Up to 12 passengers"],
    pricing: "From ₹1,600 / day",
    price: 1600,
    services: ["Local rides", "Temple route visits", "Outstation transfers"],
    pickupInfo: "Hotel pickup or local landmark pickup",
    dropInfo: "Mahakal, Ram Ghat, and nearby temple stops",
    availability: "Available every day",
    terms: [
      "Reschedule at least 2 hours before pickup for a free change.",
      "Extra wait time beyond 20 minutes is chargeable.",
      "Driver and duty contact details are shared after confirmation.",
      "No smoking or consumption of non-food items inside the vehicle.",
    ],
  },
  {
    id: "ujjain-heritage-cabs",
    slug: "ujjain-heritage-cabs",
    destinationId: "ujjain",
    destination: "Ujjain",
    initials: "UH",
    name: "Ujjain Heritage Cabs",
    image: ujjainImage,
    images: [ujjainImage, ujjainCover_01, ujjainCover_02],
    description: "A heritage-conscious local transport choice for guided temple itineraries, family outings, and spiritual day tours.",
    rating: 4.8,
    vehicleTypes: ["Sedan", "SUV", "Tempo Traveller"],
    seatingCapacity: ["Up to 4 passengers", "Up to 6 passengers", "Up to 12 passengers"],
    pricing: "From ₹1,800 / day",
    price: 1800,
    services: ["Pilgrimage rides", "Heritage tours", "Group travel"],
    pickupInfo: "Hotel, station, or designated city pickup point",
    dropInfo: "Temple district and heritage sightseeing circuit",
    availability: "Available daily from 7:00 AM to 9:00 PM",
    terms: [
      "Simple cancellation is allowed with 2 hours notice.",
      "Any extra route beyond the chosen itinerary is subject to extra distance charges.",
      "Luggage restrictions depend on the vehicle category.",
      "Driver details are shared only after booking confirmation.",
    ],
  },
];

export const travelGuides = [
  {
    id: "rahul-local-guide",
    slug: "rahul-local-guide",
    destinationId: "ujjain",
    destination: "Ujjain",
    name: "Rahul Local Guide",
    image: ujjainImage,
    description: "Rahul is a trusted local host for immersive temple walks, spiritual history, and temple district storytelling.",
    rating: 4.9,
    languages: ["Hindi", "English"],
    experience: "8 years",
    specialization: "Temple heritage & spiritual travel",
    price: 1200,
    priceLabel: "₹1,200 / day",
    availability: "Available on request for 2-day temple tours",
    duration: "2 days",
    destinationsCovered: ["Mahakaleshwar Temple", "Mahakal Lok", "Harsiddhi Temple", "Ram Ghat", "Kal Bhairav Temple", "Sandipani Ashram"],
    packages: [
      {
        id: "heritage-temple-tour",
        name: "Ujjain Heritage & Temple Tour",
        price: 2600,
        duration: "2 days",
        startingPoint: "Mahakaleshwar Temple",
        destinationsCovered: ["Mahakaleshwar Temple", "Mahakal Lok", "Harsiddhi Temple", "Ram Ghat", "Kal Bhairav Temple", "Sandipani Ashram"],
        itinerary: [
          { day: "Day 1", stops: ["Mahakaleshwar Temple", "Mahakal Lok", "Harsiddhi Temple"] },
          { day: "Day 2", stops: ["Ram Ghat", "Kal Bhairav Temple", "Sandipani Ashram"] },
        ],
      },
      {
        id: "temple-sunset-circuit",
        name: "Temple Sunset Circuit",
        price: 1800,
        duration: "1 day",
        startingPoint: "Railway Station",
        destinationsCovered: ["Mahakaleshwar Temple", "Ram Ghat", "Harsiddhi Temple"],
        itinerary: [
          { day: "Day 1", stops: ["Mahakaleshwar Temple", "Ram Ghat", "Harsiddhi Temple"] },
        ],
      },
    ],
    terms: [
      "Meet at the designated starting point before 8:00 AM.",
      "Tour durations are based on the selected package and route conditions.",
      "Cancellation up to 24 hours before the tour is free.",
      "Maximum group size is 6 guests per guide.",
      "Temple entry or special darshan charges are not included in the package.",
      "Additional site transfer charges are applicable beyond the quoted route.",
    ],
  },
  {
    id: "kavya-rishikesh-guide",
    slug: "kavya-rishikesh-guide",
    destinationId: "rishikesh",
    destination: "Rishikesh",
    name: "Kavya Rawat",
    image: rishikeshImage,
    description: "Kavya blends spiritual discovery with riverfront walking routes for a calmer and more grounded experience.",
    rating: 4.8,
    languages: ["Hindi", "English"],
    experience: "5 years",
    specialization: "River yoga & spiritual trails",
    price: 1000,
    priceLabel: "₹1,000 / day",
    availability: "Available for yoga and river routes",
    duration: "1 day",
    destinationsCovered: ["Ram Jhula", "Laxman Jhula", "Triveni Ghat", "Parmarth Niketan"],
    packages: [
      {
        id: "river-spiritual-trail",
        name: "River Spiritual Trail",
        price: 2200,
        duration: "1 day",
        startingPoint: "Rishikesh Station",
        destinationsCovered: ["Ram Jhula", "Laxman Jhula", "Triveni Ghat", "Parmarth Niketan"],
        itinerary: [{ day: "Day 1", stops: ["Ram Jhula", "Laxman Jhula", "Triveni Ghat", "Parmarth Niketan"] }],
      },
    ],
    terms: [
      "Meeting point and timing are confirmed in advance.",
      "Tour duration varies with group pace and weather.",
      "Free cancellation up to 24 hours before the tour.",
      "Group size is limited to 4 guests per experience.",
      "Yoga mats are not included unless requested.",
    ],
  },
  {
    id: "priya-ujjain-guide",
    slug: "priya-ujjain-guide",
    destinationId: "ujjain",
    destination: "Ujjain",
    name: "Priya Sharma",
    image: ujjainImage,
    description: "Priya creates calm, informative temple experiences for visitors who want to understand the city’s rituals and heritage with care.",
    rating: 4.9,
    languages: ["Hindi", "English", "Marathi"],
    experience: "7 years",
    specialization: "Temple discovery & spiritual stories",
    price: 1400,
    priceLabel: "₹1,400 / day",
    availability: "Available for spiritual city walks",
    duration: "1 day",
    destinationsCovered: ["Mahakaleshwar Temple", "Harsiddhi Temple", "Ram Ghat", "Kal Bhairav Temple"],
    packages: [
      {
        id: "spiritual-city-walk",
        name: "Spiritual City Walk",
        price: 2300,
        duration: "1 day",
        startingPoint: "Hotel",
        destinationsCovered: ["Mahakaleshwar Temple", "Harsiddhi Temple", "Ram Ghat", "Kal Bhairav Temple"],
        itinerary: [{ day: "Day 1", stops: ["Mahakaleshwar Temple", "Harsiddhi Temple", "Ram Ghat", "Kal Bhairav Temple"] }],
      },
    ],
    terms: [
      "Meet at the agreed start point before 8:00 AM.",
      "Tour schedule may change based on temple timings and crowd levels.",
      "Cancellation up to 24 hours before the tour is free.",
      "Maximum group size is 5 guests.",
      "Special darshan or entry fees are separate from the package cost.",
    ],
  },
  {
    id: "ankit-ujjain-guide",
    slug: "ankit-ujjain-guide",
    destinationId: "ujjain",
    destination: "Ujjain",
    name: "Ankit Verma",
    image: ujjainImage,
    description: "Ankit helps travellers discover the sacred lanes, ghats, and temple stories of Ujjain with a practical and welcoming approach.",
    rating: 4.8,
    languages: ["Hindi", "English"],
    experience: "6 years",
    specialization: "Pilgrimage routes & local heritage",
    price: 1300,
    priceLabel: "₹1,300 / day",
    availability: "Available for weekend temple journeys",
    duration: "2 days",
    destinationsCovered: ["Mahakaleshwar Temple", "Mahakal Lok", "Sandipani Ashram", "Ram Ghat"],
    packages: [
      {
        id: "ujjain-pilgrimage-route",
        name: "Ujjain Pilgrimage Route",
        price: 2800,
        duration: "2 days",
        startingPoint: "Railway Station",
        destinationsCovered: ["Mahakaleshwar Temple", "Mahakal Lok", "Sandipani Ashram", "Ram Ghat"],
        itinerary: [
          { day: "Day 1", stops: ["Mahakaleshwar Temple", "Mahakal Lok"] },
          { day: "Day 2", stops: ["Sandipani Ashram", "Ram Ghat"] },
        ],
      },
    ],
    terms: [
      "Meeting point and timing are confirmed in advance.",
      "Tour duration is subject to local temple operations.",
      "Free cancellation up to 24 hours before travel.",
      "Group size is capped at 6 guests.",
      "Temple access or special entry tickets are additional where applicable.",
    ],
  },
  {
    id: "neha-ujjain-guide",
    slug: "neha-ujjain-guide",
    destinationId: "ujjain",
    destination: "Ujjain",
    name: "Neha Malhotra",
    image: ujjainImage,
    description: "Neha offers a cultural and heritage-focused way to explore Ujjain through temple walks, local stories, and evening ghatside moments.",
    rating: 4.9,
    languages: ["Hindi", "English", "Gujarati"],
    experience: "9 years",
    specialization: "Temple heritage & evening routes",
    price: 1500,
    priceLabel: "₹1,500 / day",
    availability: "Available for custom temple itineraries",
    duration: "1 day",
    destinationsCovered: ["Mahakaleshwar Temple", "Ram Ghat", "Harsiddhi Temple", "Mahakal Lok"],
    packages: [
      {
        id: "temple-evening-heritage",
        name: "Temple Evening Heritage Tour",
        price: 2500,
        duration: "1 day",
        startingPoint: "Hotel",
        destinationsCovered: ["Mahakaleshwar Temple", "Ram Ghat", "Harsiddhi Temple", "Mahakal Lok"],
        itinerary: [{ day: "Day 1", stops: ["Mahakaleshwar Temple", "Ram Ghat", "Harsiddhi Temple", "Mahakal Lok"] }],
      },
    ],
    terms: [
      "Start time and meeting point are confirmed before the tour.",
      "Evening routes depend on temple timing and crowd flow.",
      "Free cancellation up to 24 hours before the scheduled time.",
      "Maximum group size is 4 guests per guide.",
      "Additional transport or private vehicle costs are excluded from the quoted package.",
    ],
  },
];

export const stays = hotels;
export const operators = cabOperators;
export const guides = travelGuides;

export const getDestination = (id: string) => destinations.find((destination) => destination.id === id);
export const getStaysForDestination = (destinationId: string) => stays.filter((stay) => stay.destinationId === destinationId);
export const getOperatorsForDestination = (destinationId: string) => operators.filter((operator) => operator.destinationId === destinationId);
export const getGuidesForDestination = (destinationId: string) => guides.filter((guide) => guide.destinationId === destinationId);
export const getStayBySlug = (slug: string) => stays.find((stay) => stay.slug === slug);
export const getCabBySlug = (slug: string) => operators.find((operator) => operator.slug === slug);
export const getGuideBySlug = (slug: string) => guides.find((guide) => guide.slug === slug);
export const createListingUrl = (destinationId: string, slug: string) =>
  supportedDestinationIdSet.has(destinationId) ? `/${destinationId}/${slug}` : "/explore";
export const getDestinationBySlug = (destinationId: string) => destinations.find((destination) => destination.id === destinationId);
export const getListingBySlug = (destinationId: string, slug: string) => {
  const stay = getStayBySlug(slug);
  if (stay && stay.destinationId === destinationId) return { kind: "stay", data: stay };
  const operator = getCabBySlug(slug);
  if (operator && operator.destinationId === destinationId) return { kind: "cab", data: operator };
  const guide = getGuideBySlug(slug);
  if (guide && guide.destinationId === destinationId) return { kind: "guide", data: guide };
  return null;
};