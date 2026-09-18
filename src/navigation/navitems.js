import {
    Search,
    Sparkles,
    MessageCircle,
    LineChart,
    BookOpen,
    FolderOpen,
    Braces,
    Clapperboard,
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
import Blogs from "../components/Blogs";


export const NAV_ITEMS = [
    { key: "media", label: "Media", icon: FolderOpen, component: Media },
    { key: "discovery", label: "Discover", icon: Search, component: Discovery },
    { key: "interaction", label: "Engage", icon: MessageCircle, component: Interaction },
    { key: "metadata", label: "Contextual Metadata", icon: Sparkles, component: ContextualMetadata, tab: "metadata" },
    { key: "shorts", label: "Shorts", icon: Clapperboard, component: Shorts, tab: "shorts" },
    { key: "analytics", label: "Insights", icon: LineChart, component: Analytics, tab: "time-segments" },
    { key: "blogs", label: "Blogs", icon: BookOpen, component: Blogs, disabled: true },
    { key: "business_intelligence", label: "Business Intelligence", icon: Braces, component: BusinessIntelligence, tab: "business-intelligence" },
];