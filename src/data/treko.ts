import goaImage from "@/assets/destination-goa.jpg";
import jaipurImage from "@/assets/destination-jaipur.jpg";
import manaliImage from "@/assets/destination-manali.jpg";
import rishikeshImage from "@/assets/destination-rishikesh.jpg";
import jaipurStay from "@/assets/stay-jaipur.jpg";
import rishikeshStay from "@/assets/stay-rishikesh.jpg";
import ujjainStay from "@/assets/stay-ujjain.jpg";

export const indianPlaces = [
  "Ujjain, Madhya Pradesh",
  "Indore, Madhya Pradesh",
  "Jaipur, Rajasthan",
  "Agra, Uttar Pradesh",
  "Manali, Himachal Pradesh",
  "Shimla, Himachal Pradesh",
  "Rishikesh, Uttarakhand",
  "Haridwar, Uttarakhand",
  "Goa",
  "Varanasi, Uttar Pradesh",
  "Amritsar, Punjab",
  "Ayodhya, Uttar Pradesh",
];

export const destinations = [
  { name: "Delhi", state: "Delhi", description: "Historic monuments, bustling markets and India’s capital story.", stays: "Explore stays", cabs: "Local cabs", image: jaipurImage },
  { name: "Mumbai", state: "Maharashtra", description: "A vibrant coastal city of culture, food and cinema.", stays: "Explore stays", cabs: "Local cabs", image: goaImage },
  { name: "Goa", state: "Goa", description: "Coastal villages, heritage quarters and relaxed beaches.", stays: "150+ stays", cabs: "41 cab operators", image: goaImage },
  { name: "Jaipur", state: "Rajasthan", description: "Royal forts, lively bazaars and timeless architecture.", stays: "120+ stays", cabs: "32 cab operators", image: jaipurImage },
  { name: "Udaipur", state: "Rajasthan", description: "Lakeside palaces, old city lanes and Aravalli views.", stays: "Explore stays", cabs: "Local cabs", image: jaipurImage },
  { name: "Agra", state: "Uttar Pradesh", description: "Mughal landmarks and the marble wonder of the Taj Mahal.", stays: "Explore stays", cabs: "Local cabs", image: jaipurImage },
  { name: "Varanasi", state: "Uttar Pradesh", description: "Ancient ghats, riverside rituals and storied lanes.", stays: "Explore stays", cabs: "Local cabs", image: rishikeshImage },
  { name: "Ujjain", state: "Madhya Pradesh", description: "Temple heritage and a spiritual journey along the Shipra.", stays: "Explore stays", cabs: "Local cabs", image: ujjainStay },
  { name: "Rishikesh", state: "Uttarakhand", description: "Riverside calm, yoga retreats and mountain adventures.", stays: "70+ stays", cabs: "18 cab operators", image: rishikeshImage },
  { name: "Manali", state: "Himachal Pradesh", description: "Mountain roads, pine valleys and Himalayan escapes.", stays: "85+ stays", cabs: "24 cab operators", image: manaliImage },
  { name: "Shimla", state: "Himachal Pradesh", description: "Colonial hill architecture and cedar-lined mountain views.", stays: "Explore stays", cabs: "Local cabs", image: manaliImage },
  { name: "Amritsar", state: "Punjab", description: "A welcoming city known for the Golden Temple and Punjabi cuisine.", stays: "Explore stays", cabs: "Local cabs", image: jaipurImage },
  { name: "Hyderabad", state: "Telangana", description: "Deccan history, grand architecture and much-loved food.", stays: "Explore stays", cabs: "Local cabs", image: jaipurImage },
  { name: "Bengaluru", state: "Karnataka", description: "Garden-city calm, creative neighbourhoods and local cafés.", stays: "Explore stays", cabs: "Local cabs", image: rishikeshImage },
  { name: "Kolkata", state: "West Bengal", description: "Art, literature and lively streets shaped by many eras.", stays: "Explore stays", cabs: "Local cabs", image: jaipurImage },
  { name: "Chennai", state: "Tamil Nadu", description: "Coastal promenades, classical arts and South Indian flavours.", stays: "Explore stays", cabs: "Local cabs", image: goaImage },
  { name: "Kerala", state: "Kerala", description: "Backwaters, green hill country and relaxed coastal escapes.", stays: "Explore stays", cabs: "Local cabs", image: goaImage },
  { name: "Jaisalmer", state: "Rajasthan", description: "Golden sandstone streets and desert journeys under open skies.", stays: "Explore stays", cabs: "Local cabs", image: jaipurImage },
  { name: "Mysuru", state: "Karnataka", description: "Palace heritage, broad boulevards and fragrant markets.", stays: "Explore stays", cabs: "Local cabs", image: jaipurImage },
  { name: "Darjeeling", state: "West Bengal", description: "Tea gardens, toy-train heritage and Himalayan sunrises.", stays: "Explore stays", cabs: "Local cabs", image: manaliImage },
];

export const stays = [
  { name: "Mahakal Residency", location: "Ujjain, Madhya Pradesh", type: "Hotel", rating: "4.6", price: "₹2,499", amenities: ["Breakfast", "Wi-Fi", "Temple transfer"], image: ujjainStay },
  { name: "Ganga Vista Retreat", location: "Rishikesh, Uttarakhand", type: "Riverside resort", rating: "4.7", price: "₹4,200", amenities: ["River view", "Yoga deck", "Parking"], image: rishikeshStay },
  { name: "Amber Courtyard Haveli", location: "Jaipur, Rajasthan", type: "Heritage stay", rating: "4.8", price: "₹3,850", amenities: ["Breakfast", "Courtyard", "Local tours"], image: jaipurStay },
];

export const operators = [
  { initials: "UT", name: "Ujjain Travel Cabs", serving: "Ujjain • Omkareshwar • Indore • Maheshwar", vehicles: "Sedan • SUV • Tempo Traveller", services: "Local Sightseeing • Outstation • Airport Transfer", rating: "4.7", price: "From ₹1,800" },
  { initials: "HR", name: "Himalayan Route Travels", serving: "Manali • Solang • Kasol • Rohtang", vehicles: "Hatchback • SUV • Traveller", services: "Local Tours • Mountain Routes • Transfers", rating: "4.8", price: "Contact for price" },
  { initials: "JP", name: "Pink City Cabs", serving: "Jaipur • Ajmer • Pushkar • Ranthambore", vehicles: "Sedan • SUV • Premium", services: "City Tours • Outstation • Airport Transfer", rating: "4.6", price: "From ₹1,500" },
];