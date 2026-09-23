import { createFileRoute } from "@tanstack/react-router";
import { StaysPage } from "@/components/TrekoPages";

export const Route = createFileRoute("/stays")({ component: StaysPage });
