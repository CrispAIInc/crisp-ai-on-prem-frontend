import {
    Search,
    Sparkles,
    MessageCircle,
    Film,
    LineChart,
    BookOpen,
    FolderOpen,
    Braces,
} from "lucide-react";

/**
 * COMPONENT LIST
 */
import Media from "../components/Media";
import Discovery from "../components/Discovery";
import ContextualMetadata from "../components/ContextualMetadata";
import Shorts from "../components/Shorts";
import Interaction from "../components/Interaction";
import Analytics from "../components/Analytics";
import BusinessIntelligence from "../components/BusinessIntelligence";


export const NAV_ITEMS = [
    { key: "media", label: "Media", icon: FolderOpen, component: Media },
    { key: "discovery", label: "Discovery", icon: Search, component: Discovery },
    { key: "interaction", label: "Interaction", icon: MessageCircle, component: Interaction },
    { key: "metadata", label: "Contextual Metadata", icon: Sparkles, component: ContextualMetadata, tab: "metadata" },
    { key: "shorts", label: "Shorts", icon: Film, component: Shorts, tab: "shorts" },
    { key: "analytics", label: "Analytics", icon: LineChart, component: Analytics, tab: "time-segments" },
    { key: "stories_blogs", label: "Stories & Blogs", icon: BookOpen },
    { key: "business_intelligence", label: "Business Intelligence", icon: Braces, component: BusinessIntelligence },
];