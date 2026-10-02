import { createFileRoute } from "@tanstack/react-router";
import { ListingDetailPage } from "@/components/ListingDetailPage";

export const Route = createFileRoute("/$destination/$listingSlug")({
  component: ListingDetailPage,
});
