import toast from "react-hot-toast";
const SettingsView = () => {
    return (<div className="fadein" style={{ maxWidth: 520 }}>
        <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.03em", color: "#f0ecff", marginBottom: 24 }}>Settings</div>
        {[
            { title: "Account", items: ["Edit profile", "Change email", "Change password", "Delete account"] },
            { title: "Playback", items: ["Audio quality", "Crossfade", "Equalizer", "Normalize volume"] },
            { title: "Notifications", items: ["New releases", "Playlist updates", "Friend activity"] },
            { title: "Privacy", items: ["Private session", "Listening history", "Social sharing"] },
        ].map(sec => (
            <div key={sec.title} style={{ background: "#0e0c1c", border: "1px solid #1a1630", borderRadius: 14, marginBottom: 14, overflow: "hidden" }}>
                <div style={{ padding: "14px 18px", borderBottom: "1px solid #13112a", fontSize: 12, fontWeight: 700, color: "#5a507a", textTransform: "uppercase", letterSpacing: ".08em" }}>{sec.title}</div>
                {sec.items.map(item => (
                    <div key={item} onClick={() => toast.info(`${item} — coming soon`)} style={{ display: "flex", alignItems: "center", padding: "13px 18px", cursor: "pointer", borderBottom: "1px solid #0d0b1a", fontSize: 14, color: "#c4b5fd", transition: "background .12s" }}
                        onMouseEnter={e => e.currentTarget.style.background = "#13112a"}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                        {item}
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3a3060" strokeWidth="2" style={{ marginLeft: "auto" }}><path d="m9 18 6-6-6-6" /></svg>
                    </div>
                ))}
            </div>
        ))}
    </div>)
};
export default SettingsView;