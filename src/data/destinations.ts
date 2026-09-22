export interface Destination {
  slug: string; name: string; state: string; region: string; image: string; description: string;
  type: string; category: string; rating: number; startingBudget: number; duration: string; bestTime: string;
  popularFor: string[]; accommodationCount: number; cabOperatorCount: number; servicesAvailable: "accommodation" | "cabs" | "both"; popularity: number; dateAdded: string; featured?: boolean;
}

const image = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=85`;
const make = (name: string, state: string, region: string, type: string, description: string, id: string, popularity: number, featured = false): Destination => ({
  slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""), name, state, region, type, category: type, description, image: image(id),
  rating: 4.5 + (popularity % 4) / 10, startingBudget: 2200 + popularity * 35, duration: popularity % 3 === 0 ? "4–5 days" : "2–3 days",
  bestTime: region === "North India" ? "Oct – Mar" : region === "South India" ? "Sep – Mar" : "Oct – Feb",
  popularFor: [type, "Local experiences"], accommodationCount: 40 + popularity, cabOperatorCount: 12 + popularity % 30,
  servicesAvailable: "both", popularity, dateAdded: "2026-09-22", featured,
});

export const destinationDirectory: Destination[] = [
  make("Ujjain","Madhya Pradesh","Central India","Spiritual","Sacred temples, riverside rituals and centuries of living history.","photo-1600100397608-f01073b8a61f",92,true),
  make("Kashmir","Jammu & Kashmir","North India","Mountains","Lakes, valleys and unforgettable Himalayan stays.","photo-1506377247377-2a5b3b417ebb",98,true),
  make("Manali","Himachal Pradesh","North India","Adventure","Pine valleys, mountain roads and alpine adventures.","photo-1506905925346-21bda4d32df4",96,true),
  make("Shimla","Himachal Pradesh","North India","Hill Stations","Colonial charm and cool mountain escapes.","photo-1518002054494-4f6f94352b7a",85),
  make("Leh","Ladakh","North India","Adventure","High-altitude landscapes, monasteries and dramatic roads.","photo-1530789253388-582c481c54b0",93,true),
  make("Rishikesh","Uttarakhand","North India","Adventure","River rafting, yoga and a peaceful Ganga setting.","photo-1500530855697-b586d89ba3ee",91,true),
  make("Amritsar","Punjab","North India","Spiritual","Golden Temple calm, rich food and living history.","photo-1585135497273-1a86b09fe70e",84),
  make("Agra","Uttar Pradesh","North India","Heritage","Timeless Mughal architecture and the Taj Mahal.","photo-1564507592333-c60657eea523",90),
  make("Varanasi","Uttar Pradesh","North India","Spiritual","Ancient ghats, rituals and a city unlike any other.","photo-1561361513-2d000a50f0dc",88),
  make("Goa","Goa","West India","Beaches","Sunlit beaches, heritage lanes and easy coastal days.","photo-1512343879784-a960bf40e7f2",99,true),
  make("Mumbai","Maharashtra","West India","Cities","Sea views, neighbourhoods and relentless energy.","photo-1529253355930-ddbe423a2ac7",89),
  make("Udaipur","Rajasthan","West India","Heritage","Palaces, lakes and romantic old-city evenings.","photo-1477587458883-47145ed94245",94,true),
  make("Jaipur","Rajasthan","West India","Heritage","Royal forts, bazaars and pink-hued architecture.","photo-1599661046827-dacde697654a",95,true),
  make("Jaisalmer","Rajasthan","West India","Cultural","Golden fort walls and sweeping desert horizons.","photo-1477587458883-47145ed94245",83),
  make("Mount Abu","Rajasthan","West India","Hill Stations","A calm Aravalli retreat with lake views.","photo-1551632811-561732d1e306",72),
  make("Lonavala","Maharashtra","West India","Nature","Waterfalls, misty hills and quick monsoon breaks.","photo-1464822759023-fed622ff2c3b",78),
  make("Rann of Kutch","Gujarat","West India","Cultural","Vast white salt desert and vibrant craft traditions.","photo-1500534623283-312aade485b7",82),
  make("Kerala","Kerala","South India","Nature","Backwaters, coconut groves and slow tropical travel.","photo-1501785888041-af3ef285b470",97,true),
  make("Munnar","Kerala","South India","Hill Stations","Tea-covered slopes and cool cloud forests.","photo-1548021686-3d7e56b5e8a0",91,true),
  make("Wayanad","Kerala","South India","Nature","Forest trails, waterfalls and quiet green escapes.","photo-1441974231531-c6227db76b6e",80),
  make("Ooty","Tamil Nadu","South India","Hill Stations","Gardens, toy trains and rolling Nilgiri hills.","photo-1469474968028-56623f02e42e",86),
  make("Coorg","Karnataka","South India","Nature","Coffee estates, rainforests and misty mornings.","photo-1500534314209-a25ddb2bd429",84),
  make("Mysore","Karnataka","South India","Heritage","Grand palaces, silk markets and local culture.","photo-1597055181300-e3633a917c9c",76),
  make("Hampi","Karnataka","South India","Heritage","Boulder-strewn ruins in a surreal riverside landscape.","photo-1528127269322-539801943592",87),
  make("Pondicherry","Puducherry","South India","Cultural","French quarters, cafés and a breezy coastline.","photo-1530789253388-582c481c54b0",79),
  make("Darjeeling","West Bengal","East India","Hill Stations","Tea gardens, mountain views and a beloved toy train.","photo-1544735716-392fe2489ffa",88),
  make("Puri","Odisha","East India","Spiritual","Temple heritage and long Bay of Bengal beaches.","photo-1500534314209-a25ddb2bd429",75),
  make("Sundarbans","West Bengal","East India","Wildlife","Mangrove waterways and rare wildlife encounters.","photo-1511497584788-876760111969",82),
  make("Gangtok","Sikkim","Northeast India","Mountains","Himalayan views, monasteries and mountain culture.","photo-1519681393784-d120267933ba",86),
  make("Shillong","Meghalaya","Northeast India","Nature","Pine hills, music and rain-washed scenery.","photo-1511497584788-876760111969",81),
  make("Tawang","Arunachal Pradesh","Northeast India","Spiritual","Remote mountains and centuries-old monasteries.","photo-1500530855697-b586d89ba3ee",74),
  make("Kaziranga","Assam","Northeast India","Wildlife","One-horned rhinos and immersive safari landscapes.","photo-1549366021-9f761d450615",83),
];
export const destinationTypes = ["Beaches","Mountains","Heritage","Adventure","Nature","Wildlife","Spiritual","Cities","Hill Stations","Cultural","Lakes"];