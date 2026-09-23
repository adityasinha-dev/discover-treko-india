import goaImage from "@/assets/destination-goa.jpg";
import jaipurImage from "@/assets/destination-jaipur.jpg";
import manaliImage from "@/assets/destination-manali.jpg";
import rishikeshImage from "@/assets/destination-rishikesh.jpg";
import jaipurStay from "@/assets/stay-jaipur.jpg";
import rishikeshStay from "@/assets/stay-rishikesh.jpg";
import ujjainStay from "@/assets/stay-ujjain.jpg";

export type Destination = {
  id: string;
  name: string;
  state: string;
  description: string;
  stays: string;
  cabs: string;
  image: string;
};

const destinationRecords: Destination[] = [
  { id: "delhi", name: "Delhi", state: "Delhi", description: "Historic monuments, bustling markets and India’s capital story.", stays: "", cabs: "", image: jaipurImage },
  { id: "mumbai", name: "Mumbai", state: "Maharashtra", description: "A vibrant coastal city of culture, food and cinema.", stays: "", cabs: "", image: goaImage },
  { id: "goa", name: "Goa", state: "Goa", description: "Coastal villages, heritage quarters and relaxed beaches.", stays: "", cabs: "", image: goaImage },
  { id: "jaipur", name: "Jaipur", state: "Rajasthan", description: "Royal forts, lively bazaars and timeless architecture.", stays: "", cabs: "", image: jaipurImage },
  { id: "udaipur", name: "Udaipur", state: "Rajasthan", description: "Lakeside palaces, old city lanes and Aravalli views.", stays: "", cabs: "", image: jaipurImage },
  { id: "agra", name: "Agra", state: "Uttar Pradesh", description: "Mughal landmarks and the marble wonder of the Taj Mahal.", stays: "", cabs: "", image: jaipurImage },
  { id: "varanasi", name: "Varanasi", state: "Uttar Pradesh", description: "Ancient ghats, riverside rituals and storied lanes.", stays: "", cabs: "", image: rishikeshImage },
  { id: "ujjain", name: "Ujjain", state: "Madhya Pradesh", description: "Temple heritage and a spiritual journey along the Shipra.", stays: "", cabs: "", image: ujjainStay },
  { id: "rishikesh", name: "Rishikesh", state: "Uttarakhand", description: "Riverside calm, yoga retreats and mountain adventures.", stays: "", cabs: "", image: rishikeshImage },
  { id: "manali", name: "Manali", state: "Himachal Pradesh", description: "Mountain roads, pine valleys and Himalayan escapes.", stays: "", cabs: "", image: manaliImage },
  { id: "shimla", name: "Shimla", state: "Himachal Pradesh", description: "Colonial hill architecture and cedar-lined mountain views.", stays: "", cabs: "", image: manaliImage },
  { id: "amritsar", name: "Amritsar", state: "Punjab", description: "A welcoming city known for the Golden Temple and Punjabi cuisine.", stays: "", cabs: "", image: jaipurImage },
  { id: "hyderabad", name: "Hyderabad", state: "Telangana", description: "Deccan history, grand architecture and much-loved food.", stays: "", cabs: "", image: jaipurImage },
  { id: "bengaluru", name: "Bengaluru", state: "Karnataka", description: "Garden-city calm, creative neighbourhoods and local cafés.", stays: "", cabs: "", image: rishikeshImage },
  { id: "kolkata", name: "Kolkata", state: "West Bengal", description: "Art, literature and lively streets shaped by many eras.", stays: "", cabs: "", image: jaipurImage },
  { id: "chennai", name: "Chennai", state: "Tamil Nadu", description: "Coastal promenades, classical arts and South Indian flavours.", stays: "", cabs: "", image: goaImage },
  { id: "kerala", name: "Kerala", state: "Kerala", description: "Backwaters, green hill country and relaxed coastal escapes.", stays: "", cabs: "", image: goaImage },
  { id: "jaisalmer", name: "Jaisalmer", state: "Rajasthan", description: "Golden sandstone streets and desert journeys under open skies.", stays: "", cabs: "", image: jaipurImage },
  { id: "mysuru", name: "Mysuru", state: "Karnataka", description: "Palace heritage, broad boulevards and fragrant markets.", stays: "", cabs: "", image: jaipurImage },
  { id: "darjeeling", name: "Darjeeling", state: "West Bengal", description: "Tea gardens, toy-train heritage and Himalayan sunrises.", stays: "", cabs: "", image: manaliImage },
];

export const destinations: Destination[] = destinationRecords.map((destination) => ({
  ...destination,
  stays: "10 demo stays",
  cabs: "10 demo cab operators",
}));

export const indianPlaces = destinations.map(({ name, state }) => `${name}, ${state}`);

export type StayListing = {
  id: string;
  destinationId: string;
  name: string;
  location: string;
  type: string;
  description: string;
  price: string;
  pricePerNight: number;
  rating: number;
  amenities: string[];
  roomType: string;
  available: boolean;
  availability: "Available" | "Limited availability";
  image: string;
  demo: true;
};

const existingStays: StayListing[] = [
  { id: "ujjain-stay-01", destinationId: "ujjain", name: "Mahakal Residency", location: "Ujjain, Madhya Pradesh", type: "Hotel", description: "A comfortable city stay within easy reach of Mahakaleshwar Temple.", price: "₹2,499", pricePerNight: 2499, rating: 4.6, amenities: ["Breakfast", "Wi-Fi", "Temple transfer"], roomType: "Deluxe room", available: true, availability: "Available", image: ujjainStay, demo: true },
  { id: "rishikesh-stay-01", destinationId: "rishikesh", name: "Ganga Vista Retreat", location: "Rishikesh, Uttarakhand", type: "Riverside resort", description: "A peaceful riverside retreat with space for yoga and quiet mornings.", price: "₹4,200", pricePerNight: 4200, rating: 4.7, amenities: ["River view", "Yoga deck", "Parking"], roomType: "River view room", available: true, availability: "Available", image: rishikeshStay, demo: true },
  { id: "jaipur-stay-01", destinationId: "jaipur", name: "Amber Courtyard Haveli", location: "Jaipur, Rajasthan", type: "Heritage stay", description: "A heritage-inspired haveli with a shaded courtyard and local tours.", price: "₹3,850", pricePerNight: 3850, rating: 4.8, amenities: ["Breakfast", "Courtyard", "Local tours"], roomType: "Courtyard room", available: true, availability: "Available", image: jaipurStay, demo: true },
];

const stayProfiles = [
  { name: "Heritage Courtyard", type: "Heritage stay", roomType: "Courtyard room", amenities: ["Breakfast", "Courtyard", "Wi-Fi"], description: "A characterful base with thoughtful local touches and a calm shared courtyard." },
  { name: "Riverside Garden Retreat", type: "Boutique stay", roomType: "Garden view room", amenities: ["Garden", "Breakfast", "Parking"], description: "A restful retreat with leafy outdoor spaces and an easygoing atmosphere." },
  { name: "Old Quarter Guesthouse", type: "Guesthouse", roomType: "Classic double room", amenities: ["Wi-Fi", "Local breakfast", "Lounge"], description: "A welcoming guesthouse close to neighbourhood markets and everyday city life." },
  { name: "Mango Grove Residency", type: "Hotel", roomType: "Superior room", amenities: ["Air conditioning", "Restaurant", "Wi-Fi"], description: "A relaxed, practical stay with a restaurant and comfortable rooms." },
  { name: "Sunlit Boutique Suites", type: "Boutique hotel", roomType: "Junior suite", amenities: ["Breakfast", "Room service", "Wi-Fi"], description: "Bright suites with extra space for a slower, more comfortable trip." },
  { name: "Market Lane House", type: "Homestay", roomType: "Private ensuite room", amenities: ["Shared kitchen", "Local tips", "Wi-Fi"], description: "A friendly homestay near local shops, cafés and daily conveniences." },
  { name: "The Traveller’s Rest", type: "Lodge", roomType: "Standard room", amenities: ["Parking", "Breakfast", "Travel desk"], description: "A straightforward stop for travellers looking for comfort and helpful local advice." },
  { name: "Hillview Comfort Inn", type: "Hotel", roomType: "View room", amenities: ["View", "Restaurant", "Wi-Fi"], description: "Comfortable rooms with open views and a relaxed dining space." },
  { name: "Saffron Courtyard Stay", type: "Homestay", roomType: "Family room", amenities: ["Family space", "Breakfast", "Garden"], description: "A family-friendly home stay with shared outdoor space and warm hosting." },
  { name: "Palace View Residence", type: "Serviced apartment", roomType: "One-bedroom apartment", amenities: ["Kitchenette", "Laundry", "Wi-Fi"], description: "A self-contained residence for guests who prefer a little more independence." },
] as const;

export const stays: StayListing[] = [
  ...existingStays,
  ...destinationRecords.flatMap((destination, destinationIndex) => {
    const existingCount = existingStays.filter((stay) => stay.destinationId === destination.id).length;
    const missingCount = Math.max(0, 10 - existingCount);
    return stayProfiles.slice(0, missingCount).map((profile, index) => {
      const number = existingCount + index + 1;
      const pricePerNight = 1850 + destinationIndex * 115 + index * 285;
      const available = (destinationIndex + index) % 9 !== 0;
      return {
        id: `${destination.id}-stay-${String(number).padStart(2, "0")}`,
        destinationId: destination.id,
        name: `${destination.name} ${profile.name}`,
        location: `${destination.name}, ${destination.state}`,
        type: profile.type,
        description: `${profile.description} Convenient for exploring ${destination.name}.`,
        price: `₹${pricePerNight.toLocaleString("en-IN")}`,
        pricePerNight,
        rating: Number((4.1 + ((destinationIndex + index) % 9) / 10).toFixed(1)),
        amenities: [...profile.amenities],
        roomType: profile.roomType,
        available,
        availability: available ? "Available" as const : "Limited availability" as const,
        image: destination.image,
        demo: true as const,
      };
    });
  }),
];

export type CabOperator = {
  id: string;
  destinationId: string;
  name: string;
  operatorName: string;
  initials: string;
  serving: string;
  serviceArea: string;
  vehicles: string;
  vehicleType: string;
  services: string;
  description: string;
  rating: number;
  price: string;
  pricePerRide: number;
  image: string;
  demo: true;
};

const existingOperators: CabOperator[] = [
  { id: "ujjain-cab-01", destinationId: "ujjain", name: "Ujjain Travel Cabs", operatorName: "Ujjain Travel Cabs", initials: "UT", serving: "Ujjain • Omkareshwar • Indore • Maheshwar", serviceArea: "Ujjain and nearby routes", vehicles: "Sedan • SUV • Tempo Traveller", vehicleType: "Sedan, SUV, Tempo Traveller", services: "Local Sightseeing • Outstation • Airport Transfer", description: "Local drivers for temple visits, city journeys and nearby day trips.", rating: 4.7, price: "From ₹1,800", pricePerRide: 1800, image: destinationRecords.find(({ id }) => id === "ujjain")!.image, demo: true },
  { id: "manali-cab-01", destinationId: "manali", name: "Himalayan Route Travels", operatorName: "Himalayan Route Travels", initials: "HR", serving: "Manali • Solang • Kasol • Rohtang", serviceArea: "Manali and nearby mountain routes", vehicles: "Hatchback • SUV • Traveller", vehicleType: "Hatchback, SUV, Traveller", services: "Local Tours • Mountain Routes • Transfers", description: "A demo mountain travel operator for valley trips and local transfers.", rating: 4.8, price: "Contact for price", pricePerRide: 2100, image: destinationRecords.find(({ id }) => id === "manali")!.image, demo: true },
  { id: "jaipur-cab-01", destinationId: "jaipur", name: "Pink City Cabs", operatorName: "Pink City Cabs", initials: "JP", serving: "Jaipur • Ajmer • Pushkar • Ranthambore", serviceArea: "Jaipur and nearby heritage routes", vehicles: "Sedan • SUV • Premium", vehicleType: "Sedan, SUV, Premium car", services: "City Tours • Outstation • Airport Transfer", description: "City and outstation rides for exploring Jaipur and its surrounding region.", rating: 4.6, price: "From ₹1,500", pricePerRide: 1500, image: destinationRecords.find(({ id }) => id === "jaipur")!.image, demo: true },
];

const operatorProfiles = [
  { name: "City Loop Cabs", vehicleType: "Hatchback", services: "City rides • Station transfers", description: "Flexible short rides for neighbourhoods, markets and arrival transfers." },
  { name: "Heritage Route Travels", vehicleType: "Sedan", services: "Heritage tours • Day trips", description: "Comfortable rides between landmark districts and nearby heritage stops." },
  { name: "Sunrise Mobility", vehicleType: "SUV", services: "Family trips • Outstation", description: "Roomy vehicles for families and longer journeys around the region." },
  { name: "Regional Roadways", vehicleType: "Tempo Traveller", services: "Group tours • Outstation", description: "Group transport with space for day tours and regional routes." },
  { name: "Comfort Ride Company", vehicleType: "Premium sedan", services: "Airport transfer • City rides", description: "Pre-planned transfers and smooth city rides in comfortable cars." },
  { name: "Vista Tours and Cabs", vehicleType: "SUV", services: "Sightseeing • Photo stops", description: "Flexible sightseeing trips with time to enjoy scenic stops." },
  { name: "Local Miles Travel", vehicleType: "Hatchback", services: "Local errands • City rides", description: "Local drivers for convenient point-to-point trips across town." },
  { name: "Gateway Car Service", vehicleType: "Sedan", services: "Station pickup • Day hire", description: "Reliable demo transport for station pickups and full-day city hire." },
  { name: "Family Road Journeys", vehicleType: "MUV", services: "Family tours • Day trips", description: "A practical option for family outings and visits to nearby attractions." },
  { name: "Scenic Route Travels", vehicleType: "Luxury car", services: "Private tours • Outstation", description: "Private demo rides for guests seeking a more spacious regional journey." },
] as const;

export const operators: CabOperator[] = [
  ...existingOperators,
  ...destinationRecords.flatMap((destination, destinationIndex) => {
    const existingCount = existingOperators.filter((operator) => operator.destinationId === destination.id).length;
    const missingCount = Math.max(0, 10 - existingCount);
    return operatorProfiles.slice(0, missingCount).map((profile, index) => {
      const number = existingCount + index + 1;
      const operatorName = `${destination.name} ${profile.name}`;
      const pricePerRide = 1250 + destinationIndex * 70 + index * 160;
      return {
        id: `${destination.id}-cab-${String(number).padStart(2, "0")}`,
        destinationId: destination.id,
        name: operatorName,
        operatorName,
        initials: destination.name.slice(0, 1) + profile.name.split(" ").map((word) => word[0]).slice(0, 1).join(""),
        serving: `${destination.name} • nearby towns • regional day trips`,
        serviceArea: `${destination.name} and nearby routes`,
        vehicles: profile.vehicleType,
        vehicleType: profile.vehicleType,
        services: profile.services,
        description: `${profile.description} Service based in ${destination.name}; demo listing.`,
        rating: Number((4.1 + ((destinationIndex + index) % 9) / 10).toFixed(1)),
        price: `From ₹${pricePerRide.toLocaleString("en-IN")}`,
        pricePerRide,
        image: destination.image,
        demo: true as const,
      };
    });
  }),
];

export type LocalGuide = {
  id: string;
  destinationId: string;
  name: string;
  image: string;
  experience: number;
  languages: string[];
  specialization: string;
  price: string;
  pricePerTour: number;
  rating: number;
  description: string;
  demo: true;
};

const guideFirstNames = ["Aarav", "Ananya", "Ishaan", "Meera", "Kabir", "Kavya", "Rohan", "Aditi", "Dev", "Nisha", "Arjun", "Tara", "Vihaan", "Ira", "Rehan", "Sana", "Neel", "Mira", "Aditya", "Pooja"];
const guideSurnames = ["Sharma", "Patel", "Rao", "Kapoor", "Das", "Singh", "Nair", "Khan", "Mehta", "Joshi"];
const guideProfiles = [
  { specialization: "Heritage", languages: ["Hindi", "English"], years: 5, description: "Enjoys bringing local architecture and everyday stories to life." },
  { specialization: "Temples", languages: ["Hindi", "English"], years: 8, description: "Helps visitors understand temple traditions and respectful visiting customs." },
  { specialization: "History", languages: ["Hindi", "English"], years: 7, description: "Shares clear, engaging context about the people and events behind local landmarks." },
  { specialization: "Food & Culture", languages: ["Hindi", "English"], years: 4, description: "Introduces regional flavours, markets and the stories behind local food." },
  { specialization: "Adventure", languages: ["Hindi", "English"], years: 6, description: "Plans active outings with a focus on local routes and practical preparation." },
  { specialization: "Photography", languages: ["Hindi", "English"], years: 5, description: "Knows atmospheric viewpoints and helps guests find memorable photo stops." },
  { specialization: "Local Experiences", languages: ["Hindi", "English"], years: 3, description: "Connects visitors with neighbourhood crafts, community spaces and daily life." },
  { specialization: "Spiritual Tourism", languages: ["Hindi", "English"], years: 9, description: "Offers thoughtful introductions to the destination’s spiritual heritage." },
  { specialization: "Nature", languages: ["Hindi", "English"], years: 6, description: "Leads gentle nature outings and shares knowledge of the surrounding landscape." },
  { specialization: "Family Tours", languages: ["Hindi", "English"], years: 4, description: "Creates relaxed, family-friendly visits with engaging stops for all ages." },
] as const;

export const guides: LocalGuide[] = destinationRecords.flatMap((destination, destinationIndex) =>
  guideProfiles.map((profile, index) => {
    const globalIndex = destinationIndex * guideProfiles.length + index;
    const firstName = guideFirstNames[globalIndex % guideFirstNames.length]!;
    const surname = guideSurnames[Math.floor(globalIndex / guideFirstNames.length)]!;
    const pricePerTour = 800 + destinationIndex * 45 + index * 125;
    return {
      id: `${destination.id}-guide-${String(index + 1).padStart(2, "0")}`,
      destinationId: destination.id,
      name: `${firstName} ${surname}`,
      image: destination.image,
      experience: profile.years + (destinationIndex % 5),
      languages: [...profile.languages],
      specialization: profile.specialization,
      price: `From ₹${pricePerTour.toLocaleString("en-IN")} / tour`,
      pricePerTour,
      rating: Number((4.1 + ((destinationIndex + index) % 9) / 10).toFixed(1)),
      description: `${profile.description} Offers guided experiences in ${destination.name}.`,
      demo: true,
    };
  }),
);

export const isDemoListing = true;
