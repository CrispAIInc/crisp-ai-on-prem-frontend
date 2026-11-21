import {
    Search,
    Sparkles,
    MessageCircle,
    FolderOpen,
    SquarePen,
} from "lucide-react";

/**
 * COMPONENT LIST
 */
import Media from "../components/Media";
import Discovery from "../components/Discovery";
import Enrich from "../components/Enrich";
import Engage from "../components/Engage";
import Create from "../components/Create";


export const NAV_ITEMS = [
    {
        key: "media", label: "Media", icon: FolderOpen, component: Media, description: "Ingest and handle your uploaded assets here."
    },
    {
        key: "discovery", label: "Discover", icon: Search, component: Discovery, description: "Ranked matches across your workspace catalog."
    },
    { key: "engage", label: "Engage", icon: MessageCircle, component: Engage, description: "Interact with your content and analyze your assets." },
    { key: "enrich", label: "Enrich", icon: Sparkles, component: Enrich, tab: "metadata", description: "Generate structured metadata and business intelligence from your assets." },
    { key: "create", label: "Create", icon: SquarePen, component: Create, tab: "blogs", description: "Generate blogs, shorts, and dashboards from your assets." },
];