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
  { name: "Jaipur", state: "Rajasthan", description: "Royal forts, lively bazaars and timeless architecture.", stays: "120+ stays", cabs: "32 cab operators", image: jaipurImage },
  { name: "Manali", state: "Himachal Pradesh", description: "Mountain roads, pine valleys and Himalayan escapes.", stays: "85+ stays", cabs: "24 cab operators", image: manaliImage },
  { name: "Rishikesh", state: "Uttarakhand", description: "Riverside calm, yoga retreats and mountain adventures.", stays: "70+ stays", cabs: "18 cab operators", image: rishikeshImage },
  { name: "Goa", state: "Goa", description: "Coastal villages, heritage quarters and relaxed beaches.", stays: "150+ stays", cabs: "41 cab operators", image: goaImage },
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

export { destinationDirectory, destinationTypes, type Destination } from "@/data/destinations";
