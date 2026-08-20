import { useState } from "react";
import TopBar from "./TopBar";
import NavTabs from "./NavTabs";

/**
 * AppLayout - the shared shell used across every page:
 * TopBar + NavTabs pinned to the top, with arbitrary
 * page content (e.g. the two-column media workspace)
 * rendered beneath it.
 */
export default function AppLayout({ children }) {
  const [activeTab, setActiveTab] = useState("media");

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <TopBar />
      <NavTabs active={activeTab} onChange={setActiveTab} />
      <main className="flex-1 min-h-0">{children}</main>
    </div>
  );
}
