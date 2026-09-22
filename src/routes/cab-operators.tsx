import { createFileRoute } from "@tanstack/react-router";
import { CabOperatorsPage } from "@/components/ListingPages";
export const Route = createFileRoute("/cab-operators")({ head: () => ({ meta: [{ title: "Cab Operators | Treko" }, { name: "description", content: "Discover trusted local cab and travel operators across India." }] }), component: CabOperatorsPage });
