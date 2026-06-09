import AlbumArt from "../AlbumArt";
import toast from "react-hot-toast";
import { useState } from "react";
import { usePlaylistContext } from "../../context/PlaylistsContext";
import { useUIStateContext } from "../../context/UIStateContext";
import { BASE_URL } from "../../api/client";

const EditView = () => {
    const { activePL, handleUpdatePlaylist } = usePlaylistContext();
    const { setView } = useUIStateContext();

    const [name, setName] = useState(activePL?.name ?? "");
    const [description, setDescription] = useState(activePL?.description ?? "");
    const [selectedColor, setSelectedColor] = useState(activePL?.color ?? "#7c3aed");
    const [thumbnailPreview, setThumbnailPreview] = useState(activePL?.thumbnail ?? null);
    const [thumbnailFile, setThumbnailFile] = useState(null);



    function handleThumbnailUpload(e) {
        const file = e.target.files[0];
        if (!file) return;
        setThumbnailFile(file);
        const reader = new FileReader();
        reader.onload = (ev) => setThumbnailPreview(ev.target.result);
        reader.readAsDataURL(file);
    }


    if (!activePL) return null;

    return (
        <div className="fadein" style={{ maxWidth: 560 }}>
            <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.03em", color: "#f0ecff", marginBottom: 6 }}>Edit Playlist</div>
            <div style={{ fontSize: 14, color: "#5a507a", marginBottom: 24 }}>Update your playlist details</div>

            <div style={{ background: "#0e0c1c", border: "1px solid #1a1630", borderRadius: 14, padding: 20, marginBottom: 18 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#a78bfa", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 14 }}>Playlist Details</div>

                {/* Thumbnail Upload */}
                <div style={{ marginBottom: 20 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#a78bfa", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 10 }}>Cover Image</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                        <div
                            style={{
                                width: 110, height: 110, borderRadius: 12,
                                border: "2px dashed #2a2050",
                                background: thumbnailPreview ? "transparent" : "#131022",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                overflow: "hidden", cursor: "pointer", position: "relative",
                            }}
                            onClick={() => document.getElementById('edit-thumbnail-upload').click()}
                        >
                            {thumbnailPreview ? (
                                <img src={`${BASE_URL}${thumbnailPreview}`} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            ) : (
                                <div style={{ textAlign: "center", color: "#5a507a" }}>
                                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M12 5v14M5 12h14" />
                                    </svg>
                                    <div style={{ fontSize: 12, marginTop: 6 }}>Upload Image</div>
                                </div>
                            )}

                            {/* Hover overlay to re-pick */}
                            {thumbnailPreview && (
                                <div style={{
                                    position: "absolute", inset: 0, background: "rgba(0,0,0,0.55)",
                                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                                    opacity: 0, transition: "opacity .15s", borderRadius: 10,
                                }}
                                    onMouseEnter={e => e.currentTarget.style.opacity = 1}
                                    onMouseLeave={e => e.currentTarget.style.opacity = 0}
                                >
                                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#c4b5fd" strokeWidth="2">
                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4Z" />
                                    </svg>
                                    <div style={{ fontSize: 11, color: "#c4b5fd", marginTop: 5 }}>Change</div>
                                </div>
                            )}
                        </div>

                        <div>
                            <input
                                type="file" id="edit-thumbnail-upload" accept="image/*"
                                style={{ display: "none" }} onChange={handleThumbnailUpload}
                            />
                            <button
                                className="cbtn"
                                style={{ padding: "8px 16px", fontSize: 13, width: "auto" }}
                                onClick={() => document.getElementById('edit-thumbnail-upload').click()}
                            >
                                Choose Image
                            </button>
                            {thumbnailPreview && (
                                <button
                                    style={{ display: "block", marginTop: 8, background: "none", border: "none", color: "#5a507a", fontSize: 12, cursor: "pointer", fontFamily: "inherit", padding: 0 }}
                                    onClick={() => { setThumbnailPreview(null); setThumbnailFile(null); }}
                                >
                                    Remove image
                                </button>
                            )}
                            <div style={{ fontSize: 11, color: "#5a507a", marginTop: 8 }}>
                                Recommended: 300×300px or larger<br />
                                JPG, PNG, WebP
                            </div>
                        </div>
                    </div>
                </div>

                {/* Name & Description */}
                <input
                    className="cin"
                    placeholder="Playlist name…"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    style={{ marginBottom: 10 }}
                />
                <input
                    className="cin"
                    placeholder="Add a description…"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    style={{ marginBottom: 14 }}
                />

                {/* Color Picker */}
                <div style={{ fontSize: 11, color: "#5a507a", marginBottom: 8 }}>Cover color (fallback)</div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {["#7c3aed", "#0f766e", "#be185d", "#b45309", "#1d4ed8", "#065f46", "#4c1d95", "#831843"].map(c => (
                        <div
                            key={c}
                            style={{
                                width: 30, height: 30, borderRadius: 7, background: c,
                                cursor: "pointer", transition: "transform .15s",
                                border: selectedColor === c ? "2px solid #c4b5fd" : "none",
                            }}
                            onClick={() => setSelectedColor(c)}
                            onMouseEnter={e => e.currentTarget.style.transform = "scale(1.15)"}
                            onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
                        />
                    ))}
                </div>
            </div>

            {/* Songs in playlist */}
            {activePL.songs?.length > 0 && (
                <div style={{ marginBottom: 18 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#5a507a", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 12 }}>
                        Songs · {activePL.songs.length}
                    </div>
                    {activePL.songs.map(s => (
                        <div key={s.song_id} style={{ display: "flex", alignItems: "center", gap: 11, padding: "8px 10px", borderRadius: 9, cursor: "pointer" }}
                            onMouseEnter={e => e.currentTarget.style.background = "#0e0c1c"}
                            onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                            <AlbumArt song={s} size={40} radius={7} />
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: 13, fontWeight: 500, color: "#ddd6f3", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.title}</div>
                                <div style={{ fontSize: 11, color: "#5a507a" }}>{s.artist}</div>
                            </div>
                            <button className="iBtn" style={{ color: "#5a507a" }}
                                onClick={() => toast.success(`"${s.title}" removed`)}
                            >
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <path d="M18 6 6 18M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Action buttons */}
            <div style={{ display: "flex", gap: 10 }}>
                <button
                    className="cbtn"
                    onClick={() => handleUpdatePlaylist(
                        { id: activePL.id, name, description, color: selectedColor, thumbnailFile },
                        () => setView("playlist")
                    )}
                >
                    Save Changes
                </button>
                <button
                    style={{
                        flex: 1, background: "none", border: "1px solid #2a2050", color: "#8070a8",
                        borderRadius: 9, padding: "10px 18px", fontSize: 13.5, fontWeight: 700,
                        fontFamily: "inherit", cursor: "pointer", transition: "border-color .15s, color .15s",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = "#3a2f60"; e.currentTarget.style.color = "#c4b5fd"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "#2a2050"; e.currentTarget.style.color = "#8070a8"; }}
                    onClick={() => setView("playlist")}
                >
                    Cancel
                </button>
            </div>
        </div>
    );
};

export default EditView;
