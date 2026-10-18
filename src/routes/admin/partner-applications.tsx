import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/partner-applications")({
  beforeLoad: () => {
    throw redirect({ to: "/admin/dashboard" });
  },
});
