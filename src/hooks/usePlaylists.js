import { useState, useEffect } from "react";
import { PLAYLISTS } from "../constants/dummy.data";

export function usePlaylists(API_URL, notify) {
  const [playlists, setPlaylists] = useState([]);
  const [activePL, setActivePL] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [createDescription, setCreateDescription] = useState("");
  const [createName, setCreateName] = useState("");
  const [selectedColor, setSelectedColor] = useState("#6D28D9");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_URL}/playlists/`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        setPlaylists(data.map(pl => ({
          id: pl.id, name: pl.name, description: pl.description || "",
          count: pl.song_count || 0, color: pl.color || "#6D28D9",
          thumbnail: `${API_URL}${pl.thumbnail}`, songs: []
        })));
      } catch {
        notify("Could not load playlists from server");
        setPlaylists(PLAYLISTS);
      }
    })();
  }, [API_URL, notify]);

  const handleThumbnailUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { notify("Please upload a valid image file"); return; }
    setThumbnailFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setThumbnailPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleCreatePlaylist = async (onSuccess) => {
    const name = createName.trim();
    if (!name) { notify("Enter a playlist name!"); return; }
    try {
      const formData = new FormData();
      formData.append("name", name);
      if (createDescription?.trim()) formData.append("description", createDescription.trim());
      formData.append("color", selectedColor);
      if (thumbnailFile) formData.append("thumbnail", thumbnailFile);
      const res = await fetch(`${API_URL}/playlists/`, { method: "POST", body: formData });
      const text = await res.text();
      if (!res.ok) throw new Error(JSON.parse(text)?.detail || text);
      const result = JSON.parse(text);
      if (!result?.id) throw new Error("Backend did not return playlist ID");
      setPlaylists(prev => [{
        id: result.id, name, description: createDescription || "",
        count: 0, color: selectedColor,
        thumbnail: result.thumbnail ? `${API_URL}${result.thumbnail}` : thumbnailPreview,
        songs: []
      }, ...prev]);
      notify(`"${name}" created successfully!`);
      setCreateName(""); setCreateDescription(""); setThumbnailPreview(null);
      setThumbnailFile(null); setSelectedColor("#6D28D9");
      onSuccess?.();
    } catch (err) {
      notify(err.message || "Failed to create playlist");
    }
  };

  const addToPlaylist = async (playlistId, song) => {
    try {
      const res = await fetch(`${API_URL}/playlists/${playlistId}/songs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          song_id: song.id, title: song.title, artist: song.artist,
          album: song.album || "", album_art: song.thumbnail || song.album_art || null,
          duration_sec: song.duration_sec || song.duration || 0,
        }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).detail || "Failed");
      return await res.json();
    } catch (err) { notify(err.message || "Failed to add song"); }
  };

  const openPlaylist = async (pl, setView, setSidebarOpen) => {
    setActivePL(pl);
    setView("playlist");
    setSidebarOpen?.(false);
    try {
      const res = await fetch(`${API_URL}/playlists/${pl.id}/songs`);
      const data = await res.json();
      const songs = await Promise.all(data.map(async ({ song_id }) => {
        try {
          const meta = await fetch(`${API_URL}/search-metadata?query=${encodeURIComponent(song_id)}`).then(r => r.json());
          const d = Array.isArray(meta) ? meta[0] : meta;
          return { id: song_id, title: d.title || "Unknown", artist: d.artist || "Unknown",
                   album: d.album || "", thumbnail: d.album_art || d.thumbnail,
                   duration: d.duration_sec || 0, color: "#7C3AED" };
        } catch { return { id: song_id, title: "Unknown Track", artist: "Unknown", thumbnail: null, duration: 0, color: "#7C3AED" }; }
      }));
      setActivePL(prev => ({ ...prev, songs }));
    } catch { notify("Could not load playlist songs"); }
  };

  return {
    playlists, setPlaylists, activePL, setActivePL,
    thumbnailPreview, thumbnailFile, handleThumbnailUpload,
    createDescription, setCreateDescription, createName, setCreateName,
    selectedColor, setSelectedColor, handleCreatePlaylist, addToPlaylist, openPlaylist,
  };
}