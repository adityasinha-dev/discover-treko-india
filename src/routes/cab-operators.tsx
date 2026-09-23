import { createFileRoute } from "@tanstack/react-router";
import { CabOperatorsPage } from "@/components/TrekoPages";

export const Route = createFileRoute("/cab-operators")({ component: CabOperatorsPage });
