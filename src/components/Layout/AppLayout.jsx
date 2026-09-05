import { useContext } from "react";
import TopBar from "./TopBar";
import NavTabs from "./NavTabs";
import { MainContext } from '../../contexts/mainContext';

/**
 * AppLayout - the shared shell used across every page:
 * TopBar + NavTabs pinned to the top, with arbitrary
 * page content (e.g. the two-column media workspace)
 * rendered beneath it.
 */
export default function AppLayout({ children }) {

  const {
    activeTab,
  } = useContext(MainContext);

  return (
    <div className="h-screen overflow-hidden bg-gray-50 flex flex-col">
      <TopBar />
      <NavTabs active={activeTab} />
      <main className="flex-1 min-h-0 h-full">{children}</main>
    </div>
  );
}
