import {
    Search,
    Sparkles,
    MessageCircle,
    LineChart,
    BookOpen,
    FolderOpen,
    Clapperboard,
} from "lucide-react";

/**
 * COMPONENT LIST
 */
import Media from "../components/Media";
import Discovery from "../components/Discovery";
import Shorts from "../components/Shorts";
import Interaction from "../components/Interaction";
import Analytics from "../components/Analytics";
import Enrich from "../components/Enrich";
import Blogs from "../components/Blogs";


export const NAV_ITEMS = [
    { key: "media", label: "Media", icon: FolderOpen, component: Media },
    { key: "discovery", label: "Discover", icon: Search, component: Discovery },
    { key: "interaction", label: "Engage", icon: MessageCircle, component: Interaction },
    { key: "enrich", label: "Enrich", icon: Sparkles, component: Enrich, tab: "metadata" },
    { key: "shorts", label: "Shorts", icon: Clapperboard, component: Shorts, tab: "shorts" },
    { key: "analytics", label: "Insights", icon: LineChart, component: Analytics, tab: "time-segments" },
    { key: "blogs", label: "Blogs", icon: BookOpen, component: Blogs, disabled: true },
];