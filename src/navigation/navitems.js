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
    { key: "media", label: "Media", icon: FolderOpen, component: Media },
    { key: "discovery", label: "Discover", icon: Search, component: Discovery },
    { key: "interaction", label: "Engage", icon: MessageCircle, component: Interaction },
    { key: "enrich", label: "Enrich", icon: Sparkles, component: Enrich, tab: "metadata" },
    { key: "create", label: "Create", icon: SquarePen, component: Create, tab: "blogs" },
    { key: "analytics", label: "Insights", icon: ClockFading, component: Analytics, tab: "time-segments" },
];