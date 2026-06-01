import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { PLAYLISTS } from "../constants/dummy.data";
import { usePlayerStore } from "../stores/usePlayer.store";
import { useRecents } from "./useRecents";
import apiClient, { multipartConfig } from "../api/client";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Map a raw playlist object from the API to the shape used by the UI. */
const mapPlaylist = (pl) => ({
  id: pl.id,
  name: pl.name,
  description: pl.description || "",
  count: pl.song_count || 0,
  color: pl.color || "#6D28D9",
  thumbnail: pl.thumbnail ? `${apiClient.defaults.baseURL}${pl.thumbnail}` : null,
  songs: [],
});

/** Map a raw song object from the API to the shape used by the UI. */
const mapSong = (d, song_id) => ({
  id: song_id,
  song_id,
  title: d?.title || "Unknown Track",
  artist: d?.artist || "Unknown Artist",
  album: d?.album || "",
  thumbnail: d?.album_art || d?.thumbnail || null,
  duration: d?.duration_sec || 0,
  color: "#7C3AED",
});

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function usePlaylists() {
  const [playlists, setPlaylists] = useState([]);
  const [activePL, setActivePL] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [createDescription, setCreateDescription] = useState("");
  const [createName, setCreateName] = useState("");
  const [selectedColor, setSelectedColor] = useState("#6D28D9");
  const [isLoadingPlaylists, setIsLoadingPlaylists] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isOpeningPlaylist, setIsOpeningPlaylist] = useState(false);

  const { markPlaylistPlayed } = useRecents();
  const setQueue = usePlayerStore((state) => state.setQueue);

  // -------------------------------------------------------------------------
  // Load playlists on mount
  // -------------------------------------------------------------------------

  useEffect(() => {
    (async () => {
      setIsLoadingPlaylists(true);
      try {
        const { data } = await apiClient.get("/playlists/");
        setPlaylists(data.map(mapPlaylist));
      } catch (err) {
        console.error("Failed to load playlists:", err);
        // toast already shown by interceptor
        setPlaylists(PLAYLISTS); // fallback to dummy data
      } finally {
        setIsLoadingPlaylists(false);
      }
    })();
  }, []);

  // -------------------------------------------------------------------------
  // Playback
  // -------------------------------------------------------------------------

  const playPlaylist = useCallback(
    async (playlist) => {
      if (!playlist?.songs?.length) {
        toast.error("Playlist has no songs");
        return;
      }
      setQueue(playlist.songs, 0);
      markPlaylistPlayed(playlist.id);
      toast.success(`Playing "${playlist.name}"`);
    },
    [setQueue, markPlaylistPlayed]
  );

  const playSongFromPlaylist = useCallback(
    (song, playlistSongs, startIndex = 0) => {
      if (!playlistSongs?.length) return;
      setQueue(playlistSongs, startIndex);
      toast.success(`Playing: ${song.title}`);
    },
    [setQueue]
  );

  // -------------------------------------------------------------------------
  // Uploading Thumbnail
  // -------------------------------------------------------------------------

  const handleThumbnailUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload a valid image file");
      return;
    }
    setThumbnailFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setThumbnailPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  // -------------------------------------------------------------------------
  // Create playlist
  // -------------------------------------------------------------------------

  const handleCreatePlaylist = async (onSuccess) => {
    const name = createName.trim();
    if (!name) { toast.error("Enter a playlist name!"); return; }
    if (isCreating) return;

    setIsCreating(true);
    const toastId = toast.loading("Creating playlist...");

    try {
      // Step 1: Create playlist with JSON
      const { data: result } = await apiClient.post("/playlists/", {
        name,
        description: createDescription.trim() || null,
        color: selectedColor,
      });

      if (!result?.id) throw new Error("Backend did not return playlist ID");

      // Step 2: Upload thumbnail separately if provided
      let thumbnailUrl = null;
      if (thumbnailFile) {
        try {
          const thumbForm = new FormData();
          thumbForm.append("thumbnail", thumbnailFile);
          const { data: thumbResult } = await apiClient.post(
            `/playlists/${result.id}/thumbnail`,
            thumbForm,
            multipartConfig
          );
          thumbnailUrl = thumbResult?.thumbnail
            ? `${apiClient.defaults.baseURL}${thumbResult.thumbnail}`
            : thumbnailPreview;
        } catch {
          // Non-fatal — playlist was created, thumbnail just failed
          toast.error("Playlist created but thumbnail upload failed", { id: toastId });
        }
      }

      // Step 3: Update local state
      setPlaylists((prev) => [
        {
          id: result.id,
          name,
          description: createDescription || "",
          count: 0,
          color: selectedColor,
          thumbnail: thumbnailUrl || thumbnailPreview || null,
          songs: [],
        },
        ...prev,
      ]);

      toast.success(`"${name}" created!`, { id: toastId });

      // Reset form
      setCreateName("");
      setCreateDescription("");
      setThumbnailPreview(null);
      setThumbnailFile(null);
      setSelectedColor("#6D28D9");
      onSuccess?.();

    } catch (err) {
      console.error("Failed to create playlist:", err);
      toast.error(err.message || "Failed to create playlist", { id: toastId });
    } finally {
      setIsCreating(false);
    }
  };

  // -------------------------------------------------------------------------
  // Add song to playlist
  // -------------------------------------------------------------------------

  const addToPlaylist = async (playlistId, song) => {
    const toastId = toast.loading("Adding song...");
    try {
      const { data } = await apiClient.post(`/playlists/${playlistId}/songs`, {
        song_id: song.song_id,
        title: song.title,
        artist: song.artist,
        album: song.album || "",
        album_art: song.thumbnail || song.album_art || null,
        duration_sec: song.duration_sec || song.duration || 0,
      });

      setPlaylists((prev) =>
        prev.map((p) =>
          p.id === playlistId ? { ...p, count: (p.count || 0) + 1 } : p
        )
      );

      toast.success("Song added to playlist", { id: toastId });
      return data;
    } catch (err) {
      console.error("Failed to add song:", err);
      toast.error(err.message || "Failed to add song", { id: toastId });
    }
  };

  // -------------------------------------------------------------------------
  // Open playlist and load songs
  // -------------------------------------------------------------------------

  const fetchingRef = useRef(null);

  const openPlaylist = async (pl, setView, setSidebarOpen) => {
    if (fetchingRef.current === pl.id) return;
    fetchingRef.current = pl.id;

    setActivePL(pl);
    setView("playlist");
    setSidebarOpen?.(false);
    setIsOpeningPlaylist(true);

    try {
      // Step 1: Get song IDs in this playlist
      const { data } = await apiClient.get(`/playlists/${pl.id}/songs`);

      if (!data?.length) {
        setActivePL((prev) => ({ ...prev, songs: [] }));
        return;
      }

      // Step 2: Fetch metadata for each song in parallel
      // NOTE: using song_id directly as search query is a workaround —
      // ideally playlist_songs should store full metadata.
      const results = await Promise.allSettled(
        data.map(async ({ song_id }) => {
          try {
            const { data: meta } = await apiClient.get("/search-metadata", {
              params: { query: song_id, limit: 1 },
            });
            const d = Array.isArray(meta) ? meta[0] : meta;
            return mapSong(d, song_id);
          } catch {
            return mapSong(null, song_id); // skeleton fallback
          }
        })
      );

      const resolvedSongs = results
        .filter((r) => r.status === "fulfilled")
        .map((r) => r.value);

      setActivePL((prev) => ({ ...prev, songs: resolvedSongs }));
      return { ...pl, songs: resolvedSongs };

    } catch (err) {
      console.error("Failed to load playlist songs:", err);
      toast.error("Could not load playlist songs");
    } finally {
      fetchingRef.current = null;
      setIsOpeningPlaylist(false);
    }
  };

  // -------------------------------------------------------------------------
  // Delete playlist
  // -------------------------------------------------------------------------

  const deletePlaylist = async (playlistId) => {
    const toastId = toast.loading("Deleting playlist...");
    try {
      await apiClient.delete(`/playlists/${playlistId}`);
      setPlaylists((prev) => prev.filter((p) => p.id !== playlistId));
      if (activePL?.id === playlistId) setActivePL(null);
      toast.success("Playlist deleted", { id: toastId });
    } catch (err) {
      console.error("Failed to delete playlist:", err);
      toast.error(err.message || "Failed to delete playlist", { id: toastId });
    }
  };

  // -------------------------------------------------------------------------

  return {
    playlists, setPlaylists,
    activePL, setActivePL,
    thumbnailPreview, thumbnailFile, handleThumbnailUpload,
    createDescription, setCreateDescription,
    createName, setCreateName,
    selectedColor, setSelectedColor,
    isLoadingPlaylists, isCreating, isOpeningPlaylist,
    handleCreatePlaylist, addToPlaylist, openPlaylist,
    playPlaylist, playSongFromPlaylist, deletePlaylist,
  };
}
