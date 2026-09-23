import { createFileRoute } from "@tanstack/react-router";
import { ExplorePage } from "@/components/TrekoPages";

export const Route = createFileRoute("/explore")({ component: ExplorePage });
