import { createFileRoute } from "@tanstack/react-router";
import { ExploreDestinationsPage } from "@/components/ExploreDestinations";

export const Route = createFileRoute("/explore")({
  head: () => ({
    meta: [
      { title: "Explore India | Treko" },
      { name: "description", content: "Search, filter and discover destinations across India with Treko." },
    ],
  }),
  component: ExploreDestinationsPage,
});