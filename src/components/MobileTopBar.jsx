export default function MobileTopBar({ setSidebarOpen, navTo }) {
    return (
        <div className="mobile-topbar">
            <button className="iBtn" onClick={() => setSidebarOpen(true)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
                </svg>
            </button>
            <div style={{ fontSize: 18, fontWeight: 800 }}>
                <span style={{ color: "#a78bfa" }}>wa</span><span style={{ color: "#ddd6f3" }}>vify</span>
            </div>
            <button className="iBtn" style={{ marginLeft: "auto" }} onClick={() => navTo("search")}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                </svg>
            </button>
        </div>
    );
}