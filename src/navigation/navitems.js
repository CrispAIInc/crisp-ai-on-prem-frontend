import {
    Search,
    Sparkles,
    MessageCircle,
    ClockFading,
    FolderOpen,
    SquarePen,
} from "lucide-react";

/**
 * COMPONENT LIST
 */
import Media from "../components/Media";
import Discovery from "../components/Discovery";
import Interaction from "../components/Interaction";
import Analytics from "../components/Analytics";
import Enrich from "../components/Enrich";
import Create from "../components/Create";


export const NAV_ITEMS = [
    {
        key: "media", label: "Media", icon: FolderOpen, component: Media, description: "Ingest and handle your uploaded assets here."
    },
    {
        key: "discovery", label: "Discover", icon: Search, component: Discovery, description: "Ranked matches across your workspace catalog."
    },
    { key: "interaction", label: "Engage", icon: MessageCircle, component: Interaction, description: "Ask Crisp Wiz questions and interact with your content conversationally." },
    { key: "enrich", label: "Enrich", icon: Sparkles, component: Enrich, tab: "metadata", description: "Generate structured metadata and business intelligence from your assets." },
    { key: "create", label: "Create", icon: SquarePen, component: Create, tab: "blogs", description: "Generate blogs, shorts, and dashboards from your assets." },
    { key: "analytics", label: "Insights", icon: ClockFading, component: Analytics, tab: "time-segments", description: "Analyze content to identify important information, events, and insights, linked directly to the timestamp or page where they appear." },
];