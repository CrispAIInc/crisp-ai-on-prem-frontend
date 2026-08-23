import {
    Search,
    Sparkles,
    MessageCircle,
    Film,
    LineChart,
    BookOpen,
    FolderOpen,
    PieChart,
} from "lucide-react";

/**
 * COMPONENT LIST
 */
import Media from "../components/Media";
import Discovery from "../components/Discovery";


export const NAV_ITEMS = [
    { key: "media", label: "Media", icon: FolderOpen, component: Media },
    { key: "discovery", label: "Discovery", icon: Search, component: Discovery },
    { key: "wiz", label: "Crisp Wiz", icon: MessageCircle },
    { key: "metadata", label: "Contextual Metadata", icon: Sparkles },
    { key: "reels", label: "Reels", icon: Film },
    { key: "analytics", label: "Analytics", icon: LineChart },
    { key: "stories_blogs", label: "Stories & Blogs", icon: BookOpen },
    { key: "business_intelligence", label: "Business Intelligence", icon: PieChart },
];