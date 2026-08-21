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


export const TOKEN_NAME = "idToken";
export const DEFAULT_TOTAL_PDF_PAGES = 1;


export const NAV_ITEMS = [
    { key: "media", label: "Media", icon: Image },
    { key: "discovery", label: "Discovery", icon: Search },
    { key: "metadata", label: "Contextual Metadata", icon: Star },
    { key: "wiz", label: "Crisp Wiz", icon: MessageCircle },
    { key: "reels", label: "Reels", icon: Clapperboard },
    { key: "analytics", label: "Analytics", icon: LineChart },
    { key: "stories_blogs", label: "Stories & Blogs", icon: BookOpen },
    { key: "business_intelligence", label: "Business Intelligence", icon: PieChart },
];