import { createFileRoute } from "@tanstack/react-router";
import { StaysPage } from "@/components/ListingPages";
export const Route = createFileRoute("/stays")({ head: () => ({ meta: [{ title: "Find Your Stay | Treko" }, { name: "description", content: "Discover stays across destinations in India with Treko." }] }), component: StaysPage });
