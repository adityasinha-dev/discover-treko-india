import { createFileRoute } from "@tanstack/react-router";
import { ExploreDestinationsPage } from "@/components/ExploreDestinations";

export const Route = createFileRoute("/destinations")({
  head: () => ({ meta: [{ title: "Explore Destinations | Treko" }, { name: "description", content: "Search and discover destinations across India with Treko." }] }),
  component: ExploreDestinationsPage,
});
