import { createFileRoute } from "@tanstack/react-router";
import { PartnerPage } from "@/components/TrekoPages";

export const Route = createFileRoute("/partner")({ component: PartnerPage });
