import { createFileRoute } from "@tanstack/react-router";
import { MyPlansPage } from "@/components/MyPlansPage";

export const Route = createFileRoute("/my-plans")({
  component: MyPlansPage,
});
