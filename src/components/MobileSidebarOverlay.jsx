import SidebarContent from "./SidebarContent";

export default function MobileSidebarOverlay({ 
    view, sidebarOpen, setSidebarOpen, navTo, liked, playlists, activePL, setActivePL, setView
 }) {
    if (!["home", "search"].includes(view)) return null;

    return (

        <div className={`mobile-overlay${sidebarOpen ? " open" : ""}`}>
            <div className="mobile-backdrop" onClick={() => setSidebarOpen(false)} />
            <div className="mobile-sidebar">
                <SidebarContent
                    view={view} navTo={navTo} liked={liked} playlists={playlists}
                    activePL={activePL} setActivePL={setActivePL} setView={setView}
                    setSidebarOpen={setSidebarOpen}
                // loadingPlaylists={loadingPlaylists}
                />
            </div>
        </div>
    );
}