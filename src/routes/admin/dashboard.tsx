import { createFileRoute } from "@tanstack/react-router";
import { AdminPartnerApplicationsPage } from "@/components/PartnerPortal";

export const Route = createFileRoute("/admin/dashboard")({
  component: AdminPartnerApplicationsPage,
});
