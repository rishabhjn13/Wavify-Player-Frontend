import { useState } from "react";
import { useAudioPlayer } from "./hooks/useAudioPlayer";
import { useContextMenu } from "./hooks/useContextMenu";
import { useNotify } from "./hooks/useNotify";
import { usePlaylists } from "./hooks/usePlaylists";
import { useSearch } from "./hooks/useSearch";

import './App.css';
import ContextMenu from "./components/ContextMenu";
import MainContent from "./components/MainContent";
import MobileSidebarOverlay from "./components/MobileSidebarOverlay";
import RightPanel from "./components/RightPanel";
import SidebarContent from "./components/SidebarContent";
import MobileTopBar from "./components/MobileTopBar";
import PlayerBar from "./components/PlayerBar";

export default function App() {
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

  const { notif, notify } = useNotify();
  const audio = useAudioPlayer(API_URL, notify);
  const pl = usePlaylists(API_URL, notify);
  const { search, setSearch, filtered } = useSearch(API_URL);
  const ctx = useContextMenu();

  const [view, setView] = useState("home");
  const [liked, setLiked] = useState(new Set([1]));
  const [rightPanel, setRightPanel] = useState("queue");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeArtist, setActiveArtist] = useState(null);

  const toggleLike = (id) => setLiked(prev => {
    const n = new Set(prev);
    if (n.has(id)) { n.delete(id); notify("Removed from Liked Songs"); }
    else { n.add(id); notify("Added to Liked Songs ♥"); }
    return n;
  });

  const navTo = (v) => {
    setView(v); pl.setActivePL(null); setActiveArtist(null); setSidebarOpen(false);
  };
  const pct = (audio.progress / audio.song.duration) * 100;

  return (
    <div style={{
      fontFamily: "'Space Grotesk', 'DM Sans', sans-serif",
      background: "#080810",
      color: "#ddd6f3",
      height: "100dvh",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
      position: "relative",
    }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=DM+Sans:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #1e1a35; border-radius: 3px; }

        @keyframes wave1 { 0%{height:4px} 100%{height:13px} }
        @keyframes wave2 { 0%{height:11px} 100%{height:4px} }
        @keyframes wave3 { 0%{height:4px} 100%{height:10px} }
        @keyframes wave4 { 0%{height:8px} 100%{height:4px} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes notifIn { 0%{opacity:0;transform:translate(-50%,-10px)} 12%{opacity:1;transform:translate(-50%,0)} 85%{opacity:1} 100%{opacity:0} }
        @keyframes slideIn { from{transform:translateX(-100%)} to{transform:translateX(0)} }

        .wbar { display:block; }
        .wbar-1 { animation: wave1 .55s ease-in-out infinite alternate; }
        .wbar-2 { animation: wave2 .70s ease-in-out infinite alternate; }
        .wbar-3 { animation: wave3 .60s ease-in-out infinite alternate; }
        .wbar-4 { animation: wave4 .65s ease-in-out infinite alternate; }
        .wbar-s { display:block; }

        .nav-item {
          display:flex; align-items:center; gap:11px; padding:9px 14px;
          border-radius:9px; cursor:pointer; color:#8070a8; font-size:13.5px;
          font-weight:500; transition:background .15s,color .15s; border:none;
          background:none; width:100%; text-align:left; font-family:inherit;
        }
        .nav-item:hover { background:#13102244; color:#c4b5fd; }
        .nav-item.active { background:#1a1635; color:#c4b5fd; }

        .song-row { transition: background .12s; }
        .song-row:hover { background:#100e1e; }
        .song-row.active-row { background:#130f22; }

        .iBtn {
          background:none; border:none; cursor:pointer; display:flex;
          align-items:center; justify-content:center; border-radius:50%;
          width:32px; height:32px; transition:background .15s,color .15s; color:#8070a8;
        }
        .iBtn:hover { background:#1a1635; color:#c4b5fd; }
        .iBtn.lit { color:#a78bfa; }
        .iBtn.heart-lit { color:#f472b6; }

        .pbar, .vbar {
          appearance:none; -webkit-appearance:none;
          border-radius:4px; outline:none; cursor:pointer;
        }
        .pbar { height:4px; width:100%; }
        .pbar::-webkit-slider-thumb {
          appearance:none; width:13px; height:13px; border-radius:50%;
          background:#a78bfa; cursor:pointer; box-shadow:0 0 6px #a78bfa55;
        }
        .vbar { height:3px; width:72px; }
        .vbar::-webkit-slider-thumb {
          appearance:none; width:11px; height:11px; border-radius:50%;
          background:#a78bfa; cursor:pointer;
        }

        .card {
          background:#0e0c1c; border:1px solid #1a1630; border-radius:14px;
          padding:14px; cursor:pointer; transition:border-color .2s,transform .2s;
        }
        .card:hover { border-color:#3a2f60; transform:translateY(-3px); }

        .pl-li { display:flex; align-items:center; gap:11px; padding:9px 12px; border-radius:9px; cursor:pointer; transition:background .12s; }
        .pl-li:hover { background:#10091f; }
        .pl-li.active-pl { background:#130f22; }

        .notif {
          position:fixed; top:18px; left:50%; transform:translateX(-50%);
          background:#1a1635; border:1px solid #3a2f60; color:#c4b5fd;
          font-size:13px; padding:9px 22px; border-radius:24px; z-index:9999;
          animation:notifIn 2.2s forwards; white-space:nowrap; pointer-events:none;
        }

        .rp-tab {
          background:none; border:none; cursor:pointer; font-family:inherit;
          font-size:12px; font-weight:600; padding:7px 12px; border-radius:20px;
          transition:background .15s,color .15s; letter-spacing:.04em; white-space:nowrap;
        }
        .rp-tab.on { background:#1a1635; color:#c4b5fd; }
        .rp-tab.off { color:#5a507a; }

        .cin {
          background:#0e0c1c; border:1px solid #1a1630; color:#ddd6f3;
          border-radius:9px; padding:10px 13px; font-size:13.5px;
          font-family:inherit; outline:none; width:100%;
        }
        .cin:focus { border-color:#a78bfa; }

        .cbtn {
          background:#a78bfa; color:#08080f; border:none; border-radius:9px;
          padding:10px 18px; font-size:13.5px; font-weight:700; font-family:inherit;
          cursor:pointer; width:100%; transition:opacity .15s;
        }
        .cbtn:hover { opacity:.88; }

        .hero-scroll {
          display:grid; grid-auto-flow:column; grid-auto-columns:170px;
          gap:14px; overflow-x:auto; padding:2px 4px 10px; scrollbar-width:none;
        }
        .hero-scroll::-webkit-scrollbar { display:none; }

        .fadein { animation: fadeUp .25s ease both; }

        /* ── DESKTOP LAYOUT ── */
        .layout-shell {
          flex: 1;
          display: grid;
          grid-template-columns: 240px 1fr 300px;
          grid-template-rows: 1fr;
          overflow: hidden;
          min-height: 0;
        }
        .sidebar-left  { grid-column: 1; grid-row: 1; }
        .main-content  { grid-column: 2; grid-row: 1; }
        .sidebar-right { grid-column: 3; grid-row: 1; display:flex; flex-direction:column; overflow:hidden; }
        .player-bar    { flex-shrink: 0; }

        /* mobile overlay sidebar */
        .mobile-overlay {
          display: none;
          position: fixed; inset: 0; z-index: 500;
        }
        .mobile-sidebar {
          position:absolute; top:0; left:0; bottom:0; width:260px;
          background:#09081a; border-right:1px solid #131126;
          display:flex; flex-direction:column; animation:slideIn .22s ease;
          overflow:hidden;
        }
        .mobile-backdrop {
          position:absolute; inset:0; background:rgba(0,0,0,.6);
        }

        /* ── RESPONSIVE ── */
        @media (max-width: 1024px) {
          .layout-shell { grid-template-columns: 220px 1fr; }
          .sidebar-right { display:none; }
        }
        @media (max-width: 768px) {
          .layout-shell { grid-template-columns: 1fr; }
          .sidebar-left { display:none; }
          .mobile-overlay.open { display:block; }
          .player-bar-desktop { display:none !important; }
          .player-bar-mobile  { display:flex !important; }
          .mobile-topbar { display:flex !important; }
        }
        @media (min-width: 769px) {
          .player-bar-mobile { display:none !important; }
          .mobile-topbar { display:none !important; }
        }

        .mobile-topbar {
          display:none; align-items:center; gap:10px;
          padding:12px 16px; background:#09081a; border-bottom:1px solid #131126;
          flex-shrink:0;
        }
        .player-bar-mobile {
          display:none; flex-direction:column;
          background:#09081a; border-top:1px solid #131126;
          flex-shrink:0; z-index:20;
        }
        .mobile-mini-player {
          display:flex; align-items:center; gap:10px;
          padding:10px 16px;
        }
        .mobile-progress {
          height:3px; background:#1a1635; position:relative;
        }
        .mobile-progress-fill {
          position:absolute; left:0; top:0; height:100%;
          background:#a78bfa; transition:width .5s linear;
        }

        /* genre chips */
        .chip {
          background:#100e1e; border:1px solid #1a1630; color:#8070a8;
          border-radius:20px; padding:5px 14px; font-size:12px; cursor:pointer;
          white-space:nowrap; font-family:inherit; transition:background .15s,color .15s;
        }
        .chip:hover,.chip.on { background:#1a1635; color:#c4b5fd; border-color:#3a2f60; }
      `}</style>


      {notif && <div className="notif">{notif}</div>}


      <ContextMenu
        menuSong={ctx.menuSong}
        menuRef={ctx.menuRef}
        menuPosition={ctx.menuPosition}
        liked={liked}
        toggleLike={toggleLike}
        notify={notify}
        playlists={pl.playlists}
        addToPlaylist={pl.addToPlaylist}
        view={view}
        navTo={navTo}
        playlistSubmenu={ctx.playlistSubmenu}
        setPlaylistSubmenu={ctx.setPlaylistSubmenu}
        submenuSide={ctx.submenuSide}
        setMenuSong={ctx.setMenuSong}
      />


      <MobileSidebarOverlay
        sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}
        view={view} navTo={navTo} liked={liked}
        playlists={pl.playlists} activePL={pl.activePL}
        setActivePL={pl.setActivePL} setView={setView}
        openPlaylist={(p) => pl.openPlaylist(p, setView, setSidebarOpen)}
      />

      <MobileTopBar setSidebarOpen={setSidebarOpen} navTo={navTo} />


      {/* Main shell */}
      <div className="layout-shell">

        {/* LEFT SIDEBAR (desktop) */}
        <aside className="sidebar-left" style={{ background: "#09081a", borderRight: "1px solid #131126", display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <SidebarContent
            view={view} navTo={navTo} liked={liked} playlists={pl.playlists}
            activePL={pl.activePL} setActivePL={pl.setActivePL} setView={setView}
            openPlaylist={(p) => pl.openPlaylist(p, setView, setSidebarOpen)}
          />
        </aside>

        {/* MAIN CONTENT */}
        <main style={{ overflowY: "auto", background: "#08080f", position: "relative" }}>
          {/* Sticky header */}
          <div style={{
            position: "sticky", top: 0, zIndex: 10,
            background: "linear-gradient(180deg,#08080f 70%,transparent)",
            padding: "18px 28px 10px", display: "flex", alignItems: "center", gap: 10,
          }}>
            <button className="iBtn" onClick={() => { setView("home"); pl.setActivePL(null); setActiveArtist(null); }} style={{ color: "#5a507a" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="m15 18-6-6 6-6" /></svg>
            </button>
            <button className="iBtn" style={{ color: "#5a507a" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="m9 18 6-6-6-6" /></svg>
            </button>
            {view === "search" && (
              <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 10, background: "#0e0c1c", border: "1px solid #1a1630", borderRadius: 10, padding: "9px 14px" }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#5a507a" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search songs, artists, genres…" autoFocus style={{ background: "none", border: "none", outline: "none", color: "#ddd6f3", fontSize: 14, width: "100%", fontFamily: "inherit" }} />
                {search && <button className="iBtn" style={{ width: 20, height: 20, color: "#5a507a" }} onClick={() => setSearch("")}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6 6 18M6 6l12 12" /></svg></button>}
              </div>
            )}
            {view !== "search" && <div style={{ flex: 1 }} />}
            <button className="iBtn" onClick={() => navTo("settings")} style={{ color: "#5a507a" }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M19.07 4.93 17.66 6.34M4.93 4.93l1.41 1.41M12 2v2M12 20v2M2 12h2M20 12h2M17.66 17.66l1.41 1.41M6.34 17.66 4.93 19.07" /></svg>
            </button>
          </div>

          <div style={{ padding: "0 28px 28px" }}>
            <MainContent
              view={view} song={audio.song} playing={audio.playing}
              liked={liked} activePL={pl.activePL} activeArtist={activeArtist}
              setActivePL={pl.setActivePL} setActiveArtist={setActiveArtist}
              setView={setView} playlists={pl.playlists} setPlaylists={pl.setPlaylists}
              play={audio.play} toggleLike={toggleLike} notify={notify}
              search={search} setSearch={setSearch} filtered={filtered}
              createName={pl.createName} setCreateName={pl.setCreateName}
              thumbnailPreview={pl.thumbnailPreview}
              handleThumbnailUpload={pl.handleThumbnailUpload}
              createDescription={pl.createDescription}
              setCreateDescription={pl.setCreateDescription}
              handleCreatePlaylist={() => pl.handleCreatePlaylist(() => setView("home"))}
              selectedColor={pl.selectedColor} setSelectedColor={pl.setSelectedColor}
              menuSong={ctx.menuSong} setMenuSong={ctx.setMenuSong}
              menuPosition={ctx.menuPosition} setMenuPosition={ctx.setMenuPosition}
              openPlaylist={(p) => pl.openPlaylist(p, setView, setSidebarOpen)}
            />
          </div>
        </main>

        {/* RIGHT PANEL (desktop/tablet) */}
        <aside className="sidebar-right" style={{ background: "#09081a", borderLeft: "1px solid #131126" }}>
          <div style={{ display: "flex", gap: 4, padding: "18px 14px 12px", borderBottom: "1px solid #13112a", flexShrink: 0, flexWrap: "wrap" }}>
            {[["queue", "Queue"], ["nowplaying", "Now Playing"], ["related", "Related"]].map(([id, label]) => (
              <button key={id} className={`rp-tab ${rightPanel === id ? "on" : "off"}`} onClick={() => setRightPanel(id)}>{label}</button>
            ))}
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: "12px 14px" }}>
            <RightPanel
              rightPanel={rightPanel} song={audio.song} playing={audio.playing}
              liked={liked} toggleLike={toggleLike} play={audio.play}
              setView={setView} setActiveArtist={setActiveArtist}
            />
          </div>
        </aside>
      </div>

      <PlayerBar
        song={audio.song} playing={audio.playing} toggle={audio.toggle}
        next={audio.next} prev={audio.prev} progress={audio.progress}
        setProgress={audio.setProgress} volume={audio.volume} setVolume={audio.setVolume}
        shuffle={audio.shuffle} setShuffle={audio.setShuffle}
        repeat={audio.repeat} setRepeat={audio.setRepeat}
        liked={liked} toggleLike={toggleLike}
        rightPanel={rightPanel} setRightPanel={setRightPanel}
        pct={pct} audioRef={audio.audioRef} notify={notify}
      />
    </div>
  );
}
