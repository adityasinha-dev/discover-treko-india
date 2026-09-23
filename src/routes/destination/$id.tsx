import { createFileRoute } from "@tanstack/react-router";
import { DestinationDetailsPage } from "@/components/DestinationDetails";

export const Route = createFileRoute("/destination/$id")({ component: DestinationDetailsPage });
