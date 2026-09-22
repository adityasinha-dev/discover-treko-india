import { createFileRoute } from "@tanstack/react-router";
import { DestinationDetailsPage } from "@/components/DestinationDetails";

export const Route = createFileRoute("/destinations/$slug")({
  head: ({ params }) => ({ meta: [{ title: `${params.slug.replace(/-/g, " ")} | Treko` }] }),
  component: () => <DestinationDetailsPage slug={Route.useParams().slug} />,
});
