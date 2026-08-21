import {
    Image,
    Search,
    Star,
    MessageCircle,
    Clapperboard,
    LineChart,
    BookOpen,
    PieChart,
} from "lucide-react";

/**
 * COMPONENT LIST
 */
import Media from "../components/Media";


export const NAV_ITEMS = [
    { key: "media", label: "Media", icon: Image, component: Media },
    { key: "discovery", label: "Discovery", icon: Search },
    { key: "metadata", label: "Contextual Metadata", icon: Star },
    { key: "wiz", label: "Crisp Wiz", icon: MessageCircle },
    { key: "reels", label: "Reels", icon: Clapperboard },
    { key: "analytics", label: "Analytics", icon: LineChart },
    { key: "stories_blogs", label: "Stories & Blogs", icon: BookOpen },
    { key: "business_intelligence", label: "Business Intelligence", icon: PieChart },
];