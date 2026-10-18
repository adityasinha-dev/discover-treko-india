import { createFileRoute } from "@tanstack/react-router";
import { BusinessDashboardPage } from "@/components/PartnerPortal";

export const Route = createFileRoute("/business-dashboard")({
  component: BusinessDashboardPage,
});
