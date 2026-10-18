import { createFileRoute } from "@tanstack/react-router";
import { AdminLoginPage } from "@/components/PartnerPortal";

export const Route = createFileRoute("/admin/login")({
  component: AdminLoginPage,
});
