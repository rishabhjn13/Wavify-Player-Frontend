import { useState, useEffect, useRef, useCallback } from "react";
import toast from "react-hot-toast";

import { PLAYLISTS } from "../constants/dummy.data";
import { usePlayerStore } from "../stores/usePlayer.store";
import apiClient, { multipartConfig } from "../api/client";
import { fetchPlaylistWithSongs } from "../utils/playlistUtils";
import { PlaylistContext } from "../context/PlaylistsContext";
import { useRecentContext } from "../context/RecentsContext";

export function PlaylistProvider({ children }) {
    const fetchingRef = useRef(null);
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

    const [isUpdating, setIsUpdating] = useState(false);
    const { markPlaylistPlayed } = useRecentContext();
    const setQueue = usePlayerStore((state) => state.setQueue);

    useEffect(() => {
        (async () => {
            setIsLoadingPlaylists(true);
            try {
                const { data: playlistsData } = await apiClient.get("/playlists/");

                const playlistsWithSongs = await Promise.all(
                    playlistsData.map((pl) => fetchPlaylistWithSongs(pl, apiClient))
                );

                setPlaylists(playlistsWithSongs);

            } catch (err) {
                console.error("Failed to load playlists:", err);
                setPlaylists(PLAYLISTS);
            } finally {
                setIsLoadingPlaylists(false);
            }
        })();
    }, []);

    const normalizeSong = (song) => ({
        ...song,
        duration: song.duration ?? song.duration_sec ?? 0,
        thumbnail: song.thumbnail ?? song.album_art ?? "",
    });

    const playPlaylist = useCallback(
        async (playlist) => {
            if (!playlist?.songs?.length) {
                toast.error("Playlist has no songs");
                return;
            }
            setQueue(playlist.songs.map(normalizeSong), 0);
            markPlaylistPlayed(playlist.id);
            toast.success(`Playing "${playlist.name}"`);
        },
        [setQueue, markPlaylistPlayed]
    );

    const playSongFromPlaylist = useCallback(
        (song, playlistSongs, startIndex = 0) => {
            if (!playlistSongs?.length) return;
            setQueue(playlistSongs.map(normalizeSong), startIndex);
        },
        [setQueue]
    );

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
                        ? `${thumbResult.thumbnail}`
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

    const handleUpdatePlaylist = async ({ id, name, description, color, thumbnailFile }, onSuccess) => {
        const trimmedName = name.trim();
        if (!trimmedName) { toast.error("Playlist name can't be empty!"); return; }
        if (isUpdating) return;

        setIsUpdating(true);
        const toastId = toast.loading("Saving changes...");

        try {
            // Step 1: PATCH text fields (only send what changed)
            const { data: result } = await apiClient.patch(`/playlists/${id}`, {
                name: trimmedName,
                description: description.trim() || null,
                color,
            });

            // Step 2: Upload new thumbnail if user picked one
            let thumbnailUrl = result.thumbnail ?? null;
            if (thumbnailFile) {
                try {
                    const thumbForm = new FormData();
                    thumbForm.append("thumbnail", thumbnailFile);
                    const { data: thumbResult } = await apiClient.post(
                        `/playlists/${id}/thumbnail`,
                        thumbForm,
                        multipartConfig
                    );
                    thumbnailUrl = thumbResult?.thumbnail ?? thumbnailUrl;
                } catch {
                    toast.error("Changes saved but thumbnail upload failed", { id: toastId });
                }
            }

            // Step 3: Sync local state
            setPlaylists((prev) =>
                prev.map((pl) =>
                    pl.id === id
                        ? { ...pl, name: trimmedName, description: description || "", color, thumbnail: thumbnailUrl }
                        : pl
                )
            );

            toast.success(`"${trimmedName}" updated!`, { id: toastId });
            onSuccess?.();

        } catch (err) {
            console.error("Failed to update playlist:", err);
            toast.error(err.message || "Failed to update playlist", { id: toastId });
        } finally {
            setIsUpdating(false);
        }
    };

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

    const openPlaylist = async (pl, setView) => {
        if (fetchingRef.current === pl.id) return;
        fetchingRef.current = pl.id;

        setActivePL(pl);
        setView("playlist");
        setIsOpeningPlaylist(true);
    };

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

    const removeSongFromPlaylist = async (playlistId, songId) => {
        const toastId = toast.loading("Removing song...");
        try {
            await apiClient.delete(`/playlists/${playlistId}/songs/${songId}`);
            setPlaylists((prev) =>
                prev.map((p) =>
                    p.id === playlistId
                        ? { ...p, songs: p.songs.filter((s) => s.song_id !== songId), count: (p.count || 1) - 1 }
                        : p
                )
            );
            toast.success("Song removed from playlist", { id: toastId });
        } catch (err) {
            console.error("Failed to remove song:", err);
            toast.error(err.message || "Failed to remove song", { id: toastId });
        }
    };

    const state = { playlists, setPlaylists, activePL, setActivePL, thumbnailPreview, setThumbnailPreview, thumbnailFile, setThumbnailFile, createDescription, setCreateDescription, createName, setCreateName, selectedColor, setSelectedColor, isLoadingPlaylists, setIsLoadingPlaylists, isCreating, setIsCreating, isOpeningPlaylist, setIsOpeningPlaylist, playPlaylist, playSongFromPlaylist, handleThumbnailUpload, handleCreatePlaylist, addToPlaylist, openPlaylist, deletePlaylist, removeSongFromPlaylist, isUpdating, setIsUpdating, handleUpdatePlaylist };

    return (
        <PlaylistContext.Provider value={state}>{children}</PlaylistContext.Provider>
    )
}