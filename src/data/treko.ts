import goaImage from "@/assets/destination-goa.jpg";
import jaipurImage from "@/assets/destination-jaipur.jpg";
import manaliImage from "@/assets/destination-manali.jpg";
import rishikeshImage from "@/assets/destination-rishikesh.jpg";
import jaipurStay from "@/assets/stay-jaipur.jpg";
import rishikeshStay from "@/assets/stay-rishikesh.jpg";
import ujjainStay from "@/assets/stay-ujjain.jpg";
import ujjainImage from "@/assets/hero-ujjain.jpg";

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
  { id: "delhi", name: "Delhi", state: "Delhi", description: "Historic monuments, bustling markets and India’s capital story.", stays: "Explore stays", cabs: "Local cabs", image: jaipurImage },
  { id: "mumbai", name: "Mumbai", state: "Maharashtra", description: "A vibrant coastal city of culture, food and cinema.", stays: "Explore stays", cabs: "Local cabs", image: goaImage },
  { id: "goa", name: "Goa", state: "Goa", description: "Coastal villages, heritage quarters and relaxed beaches.", stays: "150+ stays", cabs: "41 cab operators", image: goaImage },
  { id: "jaipur", name: "Jaipur", state: "Rajasthan", description: "Royal forts, lively bazaars and timeless architecture.", stays: "120+ stays", cabs: "32 cab operators", image: jaipurImage },
  { id: "udaipur", name: "Udaipur", state: "Rajasthan", description: "Lakeside palaces, old city lanes and Aravalli views.", stays: "Explore stays", cabs: "Local cabs", image: jaipurImage },
  { id: "agra", name: "Agra", state: "Uttar Pradesh", description: "Mughal landmarks and the marble wonder of the Taj Mahal.", stays: "Explore stays", cabs: "Local cabs", image: jaipurImage },
  { id: "varanasi", name: "Varanasi", state: "Uttar Pradesh", description: "Ancient ghats, riverside rituals and storied lanes.", stays: "Explore stays", cabs: "Local cabs", image: rishikeshImage },
  { id: "ujjain", name: "Ujjain", state: "Madhya Pradesh", description: "Temple heritage and a spiritual journey along the Shipra.", stays: "Explore stays", cabs: "Local cabs", image: ujjainImage },
  { id: "rishikesh", name: "Rishikesh", state: "Uttarakhand", description: "Riverside calm, yoga retreats and mountain adventures.", stays: "70+ stays", cabs: "18 cab operators", image: rishikeshImage },
  { id: "manali", name: "Manali", state: "Himachal Pradesh", description: "Mountain roads, pine valleys and Himalayan escapes.", stays: "85+ stays", cabs: "24 cab operators", image: manaliImage },
  { id: "shimla", name: "Shimla", state: "Himachal Pradesh", description: "Colonial hill architecture and cedar-lined mountain views.", stays: "Explore stays", cabs: "Local cabs", image: manaliImage },
  { id: "amritsar", name: "Amritsar", state: "Punjab", description: "A welcoming city known for the Golden Temple and Punjabi cuisine.", stays: "Explore stays", cabs: "Local cabs", image: jaipurImage },
  { id: "hyderabad", name: "Hyderabad", state: "Telangana", description: "Deccan history, grand architecture and much-loved food.", stays: "Explore stays", cabs: "Local cabs", image: jaipurImage },
  { id: "bengaluru", name: "Bengaluru", state: "Karnataka", description: "Garden-city calm, creative neighbourhoods and local cafés.", stays: "Explore stays", cabs: "Local cabs", image: rishikeshImage },
  { id: "kolkata", name: "Kolkata", state: "West Bengal", description: "Art, literature and lively streets shaped by many eras.", stays: "Explore stays", cabs: "Local cabs", image: jaipurImage },
  { id: "chennai", name: "Chennai", state: "Tamil Nadu", description: "Coastal promenades, classical arts and South Indian flavours.", stays: "Explore stays", cabs: "Local cabs", image: goaImage },
  { id: "kerala", name: "Kerala", state: "Kerala", description: "Backwaters, green hill country and relaxed coastal escapes.", stays: "Explore stays", cabs: "Local cabs", image: goaImage },
  { id: "jaisalmer", name: "Jaisalmer", state: "Rajasthan", description: "Golden sandstone streets and desert journeys under open skies.", stays: "Explore stays", cabs: "Local cabs", image: jaipurImage },
  { id: "mysuru", name: "Mysuru", state: "Karnataka", description: "Palace heritage, broad boulevards and fragrant markets.", stays: "Explore stays", cabs: "Local cabs", image: jaipurImage },
  { id: "darjeeling", name: "Darjeeling", state: "West Bengal", description: "Tea gardens, toy-train heritage and Himalayan sunrises.", stays: "Explore stays", cabs: "Local cabs", image: manaliImage },
];

export const stays = [
  { id: "mahakal-residency", destinationId: "ujjain", name: "Mahakal Residency", location: "Ujjain, Madhya Pradesh", type: "Hotel", rating: "4.6", price: "₹2,499", amenities: ["Breakfast", "Wi-Fi", "Temple transfer"], image: ujjainImage, images: [ujjainStay, ujjainImage] },
  { id: "ganga-vista-retreat", destinationId: "rishikesh", name: "Ganga Vista Retreat", location: "Rishikesh, Uttarakhand", type: "Riverside resort", rating: "4.7", price: "₹4,200", amenities: ["River view", "Yoga deck", "Parking"], image: rishikeshStay },
  { id: "amber-courtyard-haveli", destinationId: "jaipur", name: "Amber Courtyard Haveli", location: "Jaipur, Rajasthan", type: "Heritage stay", rating: "4.8", price: "₹3,850", amenities: ["Breakfast", "Courtyard", "Local tours"], image: jaipurStay },
];

export const operators = [
  { id: "ujjain-travel-cabs", destinationId: "ujjain", initials: "UT", name: "Ujjain Travel Cabs", serving: "Ujjain • Omkareshwar • Indore • Maheshwar", vehicles: "Sedan • SUV • Tempo Traveller", services: "Local Sightseeing • Outstation • Airport Transfer", rating: "4.7", price: "From ₹1,800" },
  { id: "himalayan-route-travels", destinationId: "manali", initials: "HR", name: "Himalayan Route Travels", serving: "Manali • Solang • Kasol • Rohtang", vehicles: "Hatchback • SUV • Traveller", services: "Local Tours • Mountain Routes • Transfers", rating: "4.8", price: "Contact for price" },
  { id: "pink-city-cabs", destinationId: "jaipur", initials: "JP", name: "Pink City Cabs", serving: "Jaipur • Ajmer • Pushkar • Ranthambore", vehicles: "Sedan • SUV • Premium", services: "City Tours • Outstation • Airport Transfer", rating: "4.6", price: "From ₹1,500" },
];

export const guides = [
  { id: "meera-ujjain", destinationId: "ujjain", name: "Meera Sharma", initials: "MS", specialization: "Temple heritage and local history", experience: "8 years", languages: "Hindi • English", price: "From ₹1,200 / day", rating: "4.9", description: "A Ujjain local who brings the city's sacred history and riverside traditions to life." },
  { id: "arjun-jaipur", destinationId: "jaipur", name: "Arjun Singh", initials: "AS", specialization: "Forts, food and old-city walks", experience: "6 years", languages: "Hindi • English • French", price: "From ₹1,500 / day", rating: "4.8", description: "Discover Jaipur's royal stories, neighbourhood kitchens and colourful bazaars with a local." },
  { id: "kavya-rishikesh", destinationId: "rishikesh", name: "Kavya Rawat", initials: "KR", specialization: "Yoga, nature and river trails", experience: "5 years", languages: "Hindi • English", price: "From ₹1,000 / day", rating: "4.8", description: "A guide to the quieter riverside paths, wellness spaces and mountain views around Rishikesh." },
];

export const getDestination = (id: string) => destinations.find((destination) => destination.id === id);
export const getStaysForDestination = (destinationId: string) => stays.filter((stay) => stay.destinationId === destinationId);
export const getOperatorsForDestination = (destinationId: string) => operators.filter((operator) => operator.destinationId === destinationId);
export const getGuidesForDestination = (destinationId: string) => guides.filter((guide) => guide.destinationId === destinationId);