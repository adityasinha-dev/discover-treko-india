import { destinationDetails } from "@/data/destination-details";

export interface StayListing {
  id: string; slug: string; name: string; destinationId: string; destinationName: string; state: string;
  image: string; description: string; rating: string; price: string; propertyType: string; amenities: string[];
}

export interface CabOperatorListing {
  id: string; slug: string; name: string; destinationId: string; destinationName: string; state: string;
  description: string; rating: string; vehicleTypes: string; serviceTypes: string[];
}

const slugify = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export const stayListings: StayListing[] = destinationDetails.flatMap(destination =>
  destination.stays.map((stay, index) => ({
    id: `${destination.slug}-stay-${index + 1}`,
    slug: slugify(stay.name),
    name: stay.name,
    destinationId: destination.slug,
    destinationName: destination.name,
    state: destination.state,
    image: stay.image,
    description: index === 0 ? `A comfortable base for exploring ${destination.name}'s most-loved places.` : `A relaxed stay near the experiences that make ${destination.name} special.`,
    rating: stay.rating,
    price: stay.price,
    propertyType: index === 0 ? "Hotel" : "Retreat",
    amenities: index === 0 ? ["Wi-Fi", "Breakfast", "Parking"] : ["Local tours", "Comfort stay", "Helpful hosts"],
  }))
);

export const cabOperatorListings: CabOperatorListing[] = destinationDetails.flatMap(destination =>
  destination.cabOperators.map((operator, index) => ({
    id: `${destination.slug}-cab-${index + 1}`,
    slug: slugify(operator.name),
    name: operator.name,
    destinationId: destination.slug,
    destinationName: destination.name,
    state: destination.state,
    description: operator.description,
    rating: operator.rating,
    vehicleTypes: operator.vehicles,
    serviceTypes: index === 0 ? ["Sightseeing", "Outstation", "Airport transfer"] : ["Local rides", "Day trips", "Flexible transfers"],
  }))
);
