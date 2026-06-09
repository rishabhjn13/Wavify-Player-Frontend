import { useUIStateContext } from "../context/UIStateContext";
import { usePlaylistContext } from "../context/PlaylistsContext";

export default function PlaylistMenu({ onClose, onDelete, notify }) {
    const { activePL, playPlaylist } = usePlaylistContext();
    const { plMenuPos, setPlMenuOpen, setView } = useUIStateContext();
    return (
        <>
            <div style={{ position: "fixed", inset: 0, zIndex: 999 }} onClick={() => setPlMenuOpen(false)} />
            <div style={{
                position: "fixed", left: plMenuPos.x, top: plMenuPos.y,
                background: "#0e0c1c", border: "1px solid #1a1630", borderRadius: 12,
                padding: "6px 0", zIndex: 1000, minWidth: 200,
                boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
            }}>
                <div style={{ padding: "10px 14px 10px", borderBottom: "1px solid #131126", marginBottom: 4 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#f0ecff" }}>{activePL.name}</div>
                    <div style={{ fontSize: 11, color: "#5a507a", marginTop: 1 }}>{activePL.count} songs</div>
                </div>

                <div className="ctx-item" onClick={() => { playPlaylist(); onClose(); }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#8070a8" strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3" fill="#8070a8" /></svg>
                    Play
                </div>
                <div className="ctx-item" onClick={() => { setView("edit"); onClose(); }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#8070a8" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                    Edit details
                </div>
                <div style={{ height: 1, background: "#131126", margin: "4px 0" }} />
                <div className="ctx-item" onClick={() => { onDelete(activePL.id); onClose(); }}
                    style={{ color: "#f87171" }}
                    onMouseEnter={e => e.currentTarget.style.background = "#1a0f0f"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" /></svg>
                    Delete it
                </div>
            </div>
        </>
    );
}