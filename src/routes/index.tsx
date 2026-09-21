import { createFileRoute } from "@tanstack/react-router";
import { TrekoLanding } from "@/components/TrekoLanding";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Treko — Explore India. Stay Better. Travel Local." },
      { name: "description", content: "Discover stays and local cab operators for destinations across India with Treko." },
      { property: "og:title", content: "Treko — India Travel, Stays & Local Cabs" },
      { property: "og:description", content: "Choose an Indian destination, compare stays and discover local cab operators in one place." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TrekoLanding,
});
