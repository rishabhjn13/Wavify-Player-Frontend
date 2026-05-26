import { useState, useRef, useEffect, useCallback } from "react";
import { SONGS, PLAYLISTS } from "./constants/dummy.data";

import AlbumArt from "./components/AlbumArt";
import SidebarContent from "./components/SidebarContent";
import MainContent from "./components/MainContent";
import RightPanel from "./components/RightPanel";

import fmt from "./utils/fmt";

import './App.css';

export default function App() {
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

  const [view, setView] = useState("home");
  const [song, setSong] = useState(SONGS[0]);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(75);
  const [liked, setLiked] = useState(new Set([1]));
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(false);

  const [playlists, setPlaylists] = useState([]);
  const [, setLoadingPlaylists] = useState(true);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [createDescription, setCreateDescription] = useState("");
  const [selectedColor, setSelectedColor] = useState("#6D28D9");

  const [activePL, setActivePL] = useState(null);
  const [activeArtist, setActiveArtist] = useState(null);


  const [search, setSearch] = useState("");
  const [notif, setNotif] = useState(null);
  const [createName, setCreateName] = useState("");
  const [rightPanel, setRightPanel] = useState("queue");
  const [sidebarOpen, setSidebarOpen] = useState(false); // mobile sidebar

  // const [mobileView, setMobileView] = useState("main"); // "main" | "player"

  const [menuSong, setMenuSong] = useState(null);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });

  const [playlistSubmenu, setPlaylistSubmenu] = useState(false);

  const [filtered, setFiltered] = useState(SONGS);

  const audioRef = useRef(null);
  if (audioRef.current === null) {
    audioRef.current = new Audio();
  }
  const menuRef = useRef(null);

  useEffect(() => {
    if (!menuSong || !menuRef.current) return;

    const el = menuRef.current;
    const { width, height } = el.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    setMenuPosition(prev => ({
      x: prev.x + width > vw ? prev.x - width : prev.x,
      y: prev.y + height > vh ? prev.y - height - 16 : prev.y,
    }));
  }, [menuSong]);
  useEffect(() => {
    if (!menuSong) return;
    const onKey = (e) => { if (e.key === "Escape") setMenuSong(null); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuSong]);
  const notify = msg => { setNotif(msg); setTimeout(() => setNotif(null), 2200); };

  useEffect(() => {
    const fetchPlaylists = async () => {
      try {
        const res = await fetch(`${API_URL}/playlists/`);

        if (!res.ok) throw new Error("Failed to fetch playlists");

        const data = await res.json();

        const formattedPlaylists = data.map(pl => ({
          id: pl.id,
          name: pl.name,
          description: pl.description || "",
          count: pl.song_count || 0,
          color: pl.color || "#6D28D9",
          thumbnail: `${API_URL}${pl.thumbnail}`,
          songs: []
        }));

        setPlaylists(formattedPlaylists);
      } catch (err) {
        console.error("Failed to load playlists:", err);
        notify("Could not load playlists from server");

        // Fallback to static data
        setPlaylists(PLAYLISTS);

      } finally {
        setLoadingPlaylists(false);
      }
    };
    fetchPlaylists();
  }, [API_URL]);

  const play = useCallback(async (s) => {
    if (!s) return;

    setSong(s);
    setPlaying(false);
    setProgress(0);

    try {
      audioRef.current.pause();
      audioRef.current.src = "";

      console.log("🎵 Fetching audio for:", s.title);
      const res = await fetch(`${API_URL}/get-audio?track=${encodeURIComponent(s.title)}`);
      const data = await res.json();

      console.log("Received audio data:", data);
      if (!data || !data.stream_url) {
        throw new Error("No stream URL received from backend");
      }

      setSong(prev => ({ ...prev, duration: data.duration, thumbnail: s.thumbnail }));

      document.title = `${s.title} - ${s.artist} | wavify`;
      audioRef.current.src = data.stream_url;

      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setPlaying(true))
          .catch(err => {
            if (err.name !== "AbortError") console.error("Playback error:", err);
          });
      }
    } catch (err) {
      console.error("Audio fetch failed:", err);
    }
  }, [API_URL]);
  const toggle = () => {
    if (audioRef.current.paused) {
      audioRef.current.play();
      setPlaying(true);
    } else {
      audioRef.current.pause();
      setPlaying(false);
    }
  };
  const next = useCallback(() => {
    const idx = SONGS.findIndex(s => s.id === song.id);
    play(shuffle ? SONGS[Math.floor(Math.random() * SONGS.length)] : SONGS[(idx + 1) % SONGS.length]);
  });

  const prev = () => {
    if (progress > 4) { setProgress(0); return; }
    const idx = SONGS.findIndex(s => s.id === song.id);
    play(SONGS[(idx - 1 + SONGS.length) % SONGS.length]);
  };

  const toggleLike = id => setLiked(prev => {
    const n = new Set(prev);
    if (n.has(id)) { n.delete(id); notify("Removed from Liked Songs"); }
    else { n.add(id); notify("Added to Liked Songs ♥"); }
    return n;
  });

  useEffect(() => {
    const audio = audioRef.current;

    const onTimeUpdate = () => setProgress(Math.floor(audio.currentTime));
    const onEnded = () => next();

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("ended", onEnded);
    };
  }, [next]);

  useEffect(() => {
    if (!search.trim()) {
      // setFiltered(SONGS);
      return;
    }

    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(`${API_URL}/search-metadata?query=${encodeURIComponent(search)}`);
        const data = await res.json();
        console.log("Recieving data", data);
        data.map(item => ({
          ...item,
          thumbnail: item.album_art,
          duration: item.duration_sec,
          plays: "",
          genre: "",
          color: "#7C3AED", // default color for AlbumArt fallback
        }));

        setFiltered(data);
      } catch (err) {
        console.error("Search failed:", err);
        // fallback to local filter if API is down
        // setFiltered(SONGS.filter(s =>
        //   s.title.toLowerCase().includes(search.toLowerCase()) ||
        //   s.artist.toLowerCase().includes(search.toLowerCase()) ||
        //   s.genre.toLowerCase().includes(search.toLowerCase())
        // ));
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [API_URL, search]);

  const handleThumbnailUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      notify("Please upload a valid image file");
      return;
    }

    setThumbnailFile(file);

    const reader = new FileReader();
    reader.onload = (event) => {
      setThumbnailPreview(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleCreatePlaylist = async () => {
    const name = createName.trim();
    if (!name) {
      notify("Enter a playlist name!");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", name);
      if (createDescription?.trim()) formData.append("description", createDescription.trim());
      formData.append("color", selectedColor);

      if (thumbnailFile) {
        formData.append("thumbnail", thumbnailFile);
      }

      console.log("Sending FormData...");

      const response = await fetch(`${API_URL}/playlists/`, {
        method: 'POST',
        body: formData,
      });
      console.log("Response", response);
      console.log("Response Status:", response.status);

      const responseText = await response.text();   // ← Read raw first
      console.log("Raw Response:", responseText);

      if (!response.ok) {
        let errorDetail = "Unknown error";
        try {
          const errJson = JSON.parse(responseText);
          errorDetail = errJson.detail || errJson.message || responseText;
        } catch { [] }
        throw new Error(errorDetail);
      }

      // Safe JSON parse
      const result = responseText ? JSON.parse(responseText) : null;

      if (!result || !result.id) {
        throw new Error("Backend did not return playlist ID");
      }

      console.log("✅ Playlist created:", result);

      // Update UI
      setPlaylists(prev => [{
        id: result.id,
        name: name,
        description: createDescription || "",
        count: 0,
        color: selectedColor,
        thumbnail: result.thumbnail
          ? `${API_URL}${result.thumbnail}`   // ← Full URL
          : thumbnailPreview,
        songs: []
      }, ...prev]);

      notify(`"${name}" created successfully!`);

      // Reset
      setCreateName("");
      setCreateDescription("");
      setThumbnailPreview(null);
      setThumbnailFile(null);
      setSelectedColor("#6D28D9");
      setView("home");

    } catch (error) {
      console.error("Create playlist failed:", error);
      notify(error.message || "Failed to create playlist");
    }
  };

  const addToPlaylist = async (playlistId, song) => {
    try {
      const payload = {
        song_id: song.id,
        title: song.title,
        artist: song.artist,
        album: song.album || "",
        album_art: song.thumbnail || song.album_art || null,
        duration_sec: song.duration_sec || song.duration || 0,
      };

      console.log("Sending payload:", payload);

      const res = await fetch(
        `${API_URL}/playlists/${playlistId}/songs`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        }
      );

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || "Failed to add song");
      }

      console.log("✅ Song added successfully");
      return await res.json();
    } catch (err) {
      console.error("Add to playlist failed:", err);
      notify(err.message || "Failed to add song");
    }
  };
  const openPlaylist = async (pl) => {
    setActivePL(pl);
    setView("playlist");
    setSidebarOpen(false);

    try {
      const res = await fetch(`${API_URL}/playlists/${pl.id}/songs`);
      const data = await res.json();

      console.log("Raw playlist songs from DB:", data);

      const songDetails = await Promise.all(
        data.map(async ({ song_id }) => {
          try {
            // Use search-metadata with song_id (it works well as query)
            const metaRes = await fetch(
              `${API_URL}/search-metadata?query=${encodeURIComponent(song_id)}`
            );
            const meta = await metaRes.json();

            // Handle both array and single object response
            const d = Array.isArray(meta) ? meta[0] : meta;

            console.log(`Metadata for "${song_id}":`, d);

            return {
              id: song_id,
              title: d.title || "Unknown Title",
              artist: d.artist || "Unknown Artist",
              album: d.album || "",
              thumbnail: d.album_art || d.thumbnail,
              duration: d.duration_sec || d.duration || 0,
              color: "#7C3AED"
            };
          } catch (err) {
            console.warn(`Failed to fetch metadata for song ${song_id}:`, err);
            return {
              id: song_id,
              title: "Unknown Track",
              artist: "Unknown",
              album: "",
              thumbnail: null,
              duration: 0,
              color: "#7C3AED"
            };
          }
        })
      );

      console.log("✅ Final populated songs:", songDetails);

      setActivePL(prev => ({ ...prev, songs: songDetails }));
    } catch (err) {
      console.error("Failed to load playlist songs:", err);
      notify("Could not load playlist songs");
    }
  };
  const pct = (progress / song.duration) * 100;
  const submenuSide = menuPosition.x + 215 + 190 > window.innerWidth ? "right" : "left";

  const navTo = (v) => { setView(v); setActivePL(null); setActiveArtist(null); setSidebarOpen(false); };

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


      {menuSong && (
        <>
          {/* Backdrop to close */}
          <div
            style={{ position: "fixed", inset: 0, zIndex: 999 }}
            onClick={() => setMenuSong(null)}
          />
          <div
            ref={menuRef}
            style={{
              position: "fixed",
              left: menuPosition.x,
              top: menuPosition.y,
              background: "#0e0c1c",
              border: "1px solid #1a1630",
              borderRadius: 12,
              padding: "6px 0",
              zIndex: 1000,
              minWidth: 215,
              overflow: "visible",
              boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
            }}
          >
            {/* Song header */}
            <div style={{
              padding: "10px 14px 10px",
              display: "flex", alignItems: "center", gap: 10,
              borderBottom: "1px solid #131126",
              marginBottom: 4,
            }}>
              <AlbumArt song={menuSong} size={34} radius={6} />
              <div style={{ minWidth: 0 }}>
                <div style={{
                  fontSize: 13, fontWeight: 600, color: "#f0ecff",
                  whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                }}>
                  {menuSong.title}
                </div>
                <div style={{ fontSize: 11, color: "#5a507a", marginTop: 1 }}>
                  {menuSong.artist}
                </div>
              </div>
            </div>

            <div className="ctx-item" onClick={() => { toggleLike(menuSong.id); setMenuSong(null); }}>
              <svg width="15" height="15" viewBox="0 0 24 24"
                fill={liked.has(menuSong.id) ? "#f472b6" : "none"}
                stroke={liked.has(menuSong.id) ? "#f472b6" : "#8070a8"}
                strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              <span style={{ color: liked.has(menuSong.id) ? "#f472b6" : "#c4b5fd" }}>
                {liked.has(menuSong.id) ? "Unlike" : "Like"}
              </span>
            </div>

            <div className="ctx-item" onClick={() => { notify("Added to queue"); setMenuSong(null); }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#8070a8" strokeWidth="2">
                <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" />
                <line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" />
                <line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
                <line x1="19" y1="9" x2="19" y2="3" /><line x1="16" y1="6" x2="22" y2="6" />
              </svg>
              Add to queue
            </div>

            <div
              className="ctx-item"
              style={{ position: "relative" }}
              onMouseEnter={() => setPlaylistSubmenu(true)}
              onMouseLeave={() => setPlaylistSubmenu(false)}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#8070a8" strokeWidth="2">
                <path d="M21 15V6" /><path d="M18.5 18a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z" />
                <path d="M12 12H3" /><path d="M16 6H3" /><path d="M12 18H3" />
              </svg>
              Add to playlist
              {/* Arrow indicator */}
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#5a507a" strokeWidth="2" style={{ marginLeft: "auto" }}>
                <path d="m9 18 6-6-6-6" />
              </svg>

              {/* Submenu */}
              {playlistSubmenu && (
                <div style={{
                  position: "absolute",
                  top: -6,
                  left: submenuSide === "left" ? "100%" : "auto",
                  right: submenuSide === "right" ? "100%" : "auto",
                  background: "#0e0c1c",
                  border: "1px solid #1a1630",
                  borderRadius: 10,
                  padding: "6px 0",
                  minWidth: 190,
                  maxHeight: 240,
                  overflowY: "auto",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
                  zIndex: 1001,
                }}>
                  {playlists.length === 0
                    ? <div style={{ padding: "10px 14px", fontSize: 12, color: "#5a507a" }}>No playlists yet</div>
                    : playlists.map(pl => (
                      <div
                        key={pl.id}
                        className="ctx-item"
                        onClick={async (e) => {
                          e.stopPropagation();
                          await addToPlaylist(pl.id, menuSong); ``
                          notify(`Added to "${pl.name}"`);
                          setMenuSong(null);
                          setPlaylistSubmenu(false);
                        }}
                      >
                        {/* Playlist thumbnail */}
                        <div style={{
                          width: 28, height: 28, borderRadius: 5, flexShrink: 0,
                          background: pl.color || "#1a1635",
                          backgroundImage: pl.thumbnail ? `url(${pl.thumbnail})` : "none",
                          backgroundSize: "cover", backgroundPosition: "center",
                        }} />
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: 13, color: "#ddd6f3", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{pl.name}</div>
                          <div style={{ fontSize: 11, color: "#5a507a" }}>{pl.count} songs</div>
                        </div>
                      </div>
                    ))
                  }

                  {/* Quick shortcut to create new */}
                  <div style={{ height: 1, background: "#131126", margin: "4px 0" }} />
                  <div className="ctx-item" onClick={() => { setMenuSong(null); navTo("create"); }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8070a8" strokeWidth="2">
                      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    <span style={{ color: "#8070a8", fontSize: 13 }}>New playlist</span>
                  </div>
                </div>
              )}
            </div>

            <div className="ctx-item" onClick={() => { notify("Going to artist"); setMenuSong(null); }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#8070a8" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              Go to artist
            </div>

            {view === "playlist" && (
              <>
                <div style={{ height: 1, background: "#131126", margin: "4px 0" }} />
                <div className="ctx-item ctx-danger" onClick={() => { notify("Song removed from playlist"); setMenuSong(null); }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" />
                    <path d="M10 11v6" /><path d="M14 11v6" />
                    <path d="M9 6V4h6v2" />
                  </svg>
                  Remove from playlist
                </div>
              </>
            )}

            <div style={{ height: 1, background: "#131126", margin: "4px 0" }} />

            <div className="ctx-item" onClick={() => { notify("Link copied"); setMenuSong(null); }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#8070a8" strokeWidth="2">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
              Share
              <span style={{
                marginLeft: "auto", fontSize: 10, fontWeight: 600,
                background: "#1a1635", color: "#5a507a",
                padding: "2px 8px", borderRadius: 20,
                border: "1px solid #2a2050", letterSpacing: "0.03em",
              }}>
                Copy link
              </span>
            </div>
          </div>
        </>
      )}



      {/* Mobile sidebar overlay */}
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

      {/* Mobile top bar */}
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

      {/* Main shell */}
      <div className="layout-shell">

        {/* LEFT SIDEBAR (desktop) */}
        <aside className="sidebar-left" style={{ background: "#09081a", borderRight: "1px solid #131126", display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <SidebarContent
            view={view} navTo={navTo} liked={liked} playlists={playlists}
            activePL={activePL} setActivePL={setActivePL} setView={setView}
            openPlaylist={openPlaylist}
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
            <button className="iBtn" onClick={() => { setView("home"); setActivePL(null); setActiveArtist(null); }} style={{ color: "#5a507a" }}>
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
              view={view} song={song} playing={playing} liked={liked}
              activePL={activePL} activeArtist={activeArtist}
              setActivePL={setActivePL} setActiveArtist={setActiveArtist}
              setView={setView} playlists={playlists} setPlaylists={setPlaylists}
              play={play} toggleLike={toggleLike} notify={notify}
              search={search} setSearch={setSearch} filtered={filtered}
              createName={createName} setCreateName={setCreateName}
              thumbnailPreview={thumbnailPreview} handleThumbnailUpload={handleThumbnailUpload}
              createDescription={createDescription} setCreateDescription={setCreateDescription}
              handleCreatePlaylist={handleCreatePlaylist}
              selectedColor={selectedColor} setSelectedColor={setSelectedColor}
              menuSong={menuSong} setMenuSong={setMenuSong}
              menuPosition={menuPosition} setMenuPosition={setMenuPosition}
              openPlaylist={openPlaylist}
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
            <RightPanel rightPanel={rightPanel} song={song} playing={playing} liked={liked} toggleLike={toggleLike} play={play} setView={setView} setActiveArtist={setActiveArtist} />
          </div>
        </aside>
      </div>

      {/* DESKTOP PLAYER BAR */}
      <div className="player-bar player-bar-desktop" style={{
        background: "#09081a", borderTop: "1px solid #131126",
        display: "grid", gridTemplateColumns: "1fr auto 1fr",
        alignItems: "center", padding: "0 24px", gap: 16, zIndex: 20, height: 90,
      }}>
        {/* Left: song info */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, minWidth: 0 }}>
          <AlbumArt song={song} size={52} radius={9} />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#f0ecff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{song.title}</div>
            <div style={{ fontSize: 12, color: "#5a507a", marginTop: 1 }}>{song.artist} · {song.album}</div>
          </div>
          <button className={`iBtn${liked.has(song.id) ? " heart-lit" : ""}`} onClick={() => toggleLike(song.id)} style={{ marginLeft: 4, flexShrink: 0 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill={liked.has(song.id) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>
        </div>

        {/* Center: controls + progress */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, minWidth: 420 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button className={`iBtn${shuffle ? " lit" : ""}`} onClick={() => { setShuffle(s => !s); notify(shuffle ? "Shuffle off" : "Shuffle on"); }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 3 21 3 21 8" /><line x1="4" y1="20" x2="21" y2="3" /><polyline points="21 16 21 21 16 21" /><line x1="15" y1="15" x2="21" y2="21" /></svg>
            </button>
            <button className="iBtn" onClick={prev} style={{ color: "#c4b5fd" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6 8.5 6V6z" /></svg>
            </button>

            {/* Play Button  */}
            <button onClick={toggle} style={{ width: 46, height: 46, borderRadius: "50%", background: "#a78bfa", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, boxShadow: "0 0 18px #a78bfa44", transition: "transform .1s,box-shadow .15s" }}
              onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.08)"; e.currentTarget.style.boxShadow = "0 0 28px #a78bfa66"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = "0 0 18px #a78bfa44"; }}>
              {playing
                ? <svg width="18" height="18" viewBox="0 0 24 24" fill="#08080f"><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></svg>
                : <svg width="18" height="18" viewBox="0 0 24 24" fill="#08080f"><polygon points="5 3 19 12 5 21 5 3" /></svg>}
            </button>
            <button className="iBtn" onClick={next} style={{ color: "#c4b5fd" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" /></svg>
            </button>
            <button className={`iBtn${repeat ? " lit" : ""}`} onClick={() => { setRepeat(r => !r); notify(repeat ? "Repeat off" : "Repeat on"); }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="17 1 21 5 17 9" /><path d="M3 11V9a4 4 0 0 1 4-4h14" /><polyline points="7 23 3 19 7 15" /><path d="M21 13v2a4 4 0 0 1-4 4H3" /></svg>
            </button>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, width: "100%" }}>
            <span style={{ fontSize: 11, color: "#5a507a", minWidth: 34, textAlign: "right" }}>{fmt(progress)}</span>
            <input type="range" className="pbar" min={0} max={song.duration} value={progress} onChange={e => {
              const val = Number(e.target.value);
              setProgress(val);
              audioRef.current.currentTime = val;
            }}
              style={{ background: `linear-gradient(to right, #a78bfa ${pct}%, #1a1635 ${pct}%)` }} />
            <span style={{ fontSize: 11, color: "#5a507a", minWidth: 34 }}>
              {song.duration ? fmt(song.duration) : "0:00"}
            </span>
          </div>
        </div>

        {/* Right: volume */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 10 }}>
          <button className="iBtn" onClick={() => setRightPanel("queue")} style={{ color: rightPanel === "queue" ? "#a78bfa" : "#5a507a" }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg>
          </button>
          <button className="iBtn" onClick={() => setRightPanel("nowplaying")} style={{ color: rightPanel === "nowplaying" ? "#a78bfa" : "#5a507a" }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="3" /><circle cx="12" cy="12" r="4" /></svg>
          </button>
          <button className="iBtn" onClick={() => setVolume(v => v === 0 ? 75 : 0)} style={{ color: "#8070a8" }}>
            {volume === 0
              ? <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><line x1="23" y1="9" x2="17" y2="15" /><line x1="17" y1="9" x2="23" y2="15" /></svg>
              : <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14" /><path d="M15.54 8.46a5 5 0 0 1 0 7.07" /></svg>}
          </button>
          <input type="range" className="vbar" min={0} max={100} value={volume} onChange={e => setVolume(Number(e.target.value))}
            style={{ background: `linear-gradient(to right, #a78bfa ${volume}%, #1a1635 ${volume}%)` }} />
        </div>
      </div>

      {/* MOBILE PLAYER BAR */}
      <div className="player-bar player-bar-mobile">
        <div className="mobile-progress">
          <div className="mobile-progress-fill" style={{ width: `${pct}%` }} />
        </div>
        <div className="mobile-mini-player">
          <AlbumArt song={song} size={42} radius={7} />
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#f0ecff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{song.title}</div>
            <div style={{ fontSize: 11, color: "#5a507a" }}>{song.artist}</div>
          </div>
          <button className={`iBtn${liked.has(song.id) ? " heart-lit" : ""}`} onClick={() => toggleLike(song.id)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill={liked.has(song.id) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
          </button>
          <button onClick={toggle} style={{ width: 40, height: 40, borderRadius: "50%", background: "#a78bfa", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            {playing
              ? <svg width="16" height="16" viewBox="0 0 24 24" fill="#08080f"><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></svg>
              : <svg width="16" height="16" viewBox="0 0 24 24" fill="#08080f"><polygon points="5 3 19 12 5 21 5 3" /></svg>}
          </button>
          <button className="iBtn" onClick={next}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={{ color: "#c4b5fd" }}><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
}
