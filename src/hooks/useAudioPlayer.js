import { useState, useRef, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { usePlayerStore } from "../stores/usePlayer.store";
import apiClient from "../api/client";

export default function useAudioPlayer() {
    const audioRef = useRef(new Audio());

    const queue = usePlayerStore((state) => state.queue);
    const currentIndex = usePlayerStore((state) => state.currentIndex);
    const currentSong = queue[currentIndex] || null;

    const nextSongAction = usePlayerStore((state) => state.nextSong);
    const prevSongAction = usePlayerStore((state) => state.prevSong);
    const setQueue = usePlayerStore((state) => state.setQueue);

    const [playing, setPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [volume, setVolume] = useState(75);
    const [shuffle, setShuffle] = useState(false);
    const [repeat, setRepeat] = useState(false);
    const [isLoadingAudio, setIsLoadingAudio] = useState(false);

    const justRestored = useRef(false);

    // -------------------------------------------------------------------------
    // Restore last played song on mount
    // -------------------------------------------------------------------------

    useEffect(() => {
        if (queue.length > 0) return;

        const restoreLastPlayed = async () => {
            try {
                const { data: song } = await apiClient.get("/songs/last-played");
                if (!song) return;

                justRestored.current = true;
                setQueue([{
                    id: song.song_id,
                    title: song.title,
                    artist: song.artist,
                    album: song.album || "",
                    thumbnail: song.thumbnail,
                    duration: song.duration_sec || 0,
                }], 0);

            } catch (err) {
                console.error("Failed to restore last played song:", err);
                // Interceptor already shows toast for most errors
            }
        };

        restoreLastPlayed();
    }, [queue.length, setQueue]);

    // -------------------------------------------------------------------------
    // Load and play current song
    // -------------------------------------------------------------------------

    useEffect(() => {
        if (!currentSong) return;
        if (justRestored.current) {
            justRestored.current = false;
            return;
        }

        let cancelled = false;

        const playCurrentSong = async () => {
            setIsLoadingAudio(true);
            const toastId = toast.loading(`Loading "${currentSong.title}"...`);

            try {
                audioRef.current.pause();
                audioRef.current.src = "";

                const { data } = await apiClient.get("/get-audio", {
                    params: { song_id: currentSong.song_id }
                });

                if (cancelled) return;
                if (!data?.stream_url) throw new Error("No stream URL available");

                document.title = `${currentSong.title} - ${currentSong.artist} | wavify`;
                audioRef.current.src = data.stream_url;

                await audioRef.current.play();
                toast.success(`Now playing: ${currentSong.title}`, { id: toastId });

            } catch (err) {
                console.error("Audio fetch failed:", err);
                if (cancelled) return;

                toast.error(
                    err.message?.includes("No stream URL")
                        ? "Could not load song. Try again."
                        : "Failed to play song",
                    { id: toastId }
                );
            } finally {
                setIsLoadingAudio(false);
            }
        };

        playCurrentSong();

        return () => { cancelled = true; };
    }, [currentSong]);

    // -------------------------------------------------------------------------
    // Audio event listeners
    // -------------------------------------------------------------------------

    useEffect(() => {
        const audio = audioRef.current;

        const onPlay = () => setPlaying(true);
        const onPause = () => setPlaying(false);
        const onTimeUpdate = () => setProgress(Math.floor(audio.currentTime));

        const onEnded = () => {
            if (repeat) {
                audio.currentTime = 0;
                audio.play().catch(() => { });
            } else {
                nextSongAction();
            }
        };

        const onError = (e) => {
            console.error("Audio playback error:", e);
            toast.error("Playback error — trying next song...");
            nextSongAction();
        };

        audio.addEventListener("play", onPlay);
        audio.addEventListener("pause", onPause);
        audio.addEventListener("timeupdate", onTimeUpdate);
        audio.addEventListener("ended", onEnded);
        audio.addEventListener("error", onError);

        return () => {
            audio.removeEventListener("play", onPlay);
            audio.removeEventListener("pause", onPause);
            audio.removeEventListener("timeupdate", onTimeUpdate);
            audio.removeEventListener("ended", onEnded);
            audio.removeEventListener("error", onError);
        };
    }, [nextSongAction, repeat]);

    // Volume control
    useEffect(() => {
        audioRef.current.volume = volume / 100;
    }, [volume]);

    // -------------------------------------------------------------------------
    // Controls
    // -------------------------------------------------------------------------

    const toggle = () => {
        const audio = audioRef.current;
        if (audio.paused) {
            audio.play().catch(() => toast.error("Failed to resume playback"));
        } else {
            audio.pause();
        }
    };

    const next = () => nextSongAction();

    const prev = () => {
        if (progress > 4) {
            audioRef.current.currentTime = 0;
            setProgress(0);
            return;
        }
        prevSongAction();
    };

    const play = useCallback((song) => {
        if (song) {
            usePlayerStore.getState().setQueue([song], 0);
        }
    }, []);

    const progressPercent = currentSong?.duration
        ? Math.floor((progress / currentSong.duration) * 100)
        : 0;

    return {
        playing,
        progress,
        progressPercent,
        setProgress,
        volume,
        setVolume,
        shuffle,
        setShuffle,
        repeat,
        setRepeat,
        play,
        toggle,
        next,
        prev,
        audioRef,
        queue,
        isLoadingAudio,
    };
}