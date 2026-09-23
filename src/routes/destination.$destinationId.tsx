import { createFileRoute } from "@tanstack/react-router";
import { DestinationDetailsPage } from "@/components/TrekoPages";

export const Route = createFileRoute("/destination/$destinationId")({
  component: DestinationRouteComponent,
});

function DestinationRouteComponent() {
  const { destinationId } = Route.useParams();
  return <DestinationDetailsPage destinationId={destinationId} />;
}
