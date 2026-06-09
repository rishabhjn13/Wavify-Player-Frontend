import { useState, useEffect, useCallback } from "react";
import { usePlayerStore } from "../stores/usePlayer.store";
import apiClient from "../api/client";
import { useAudioContext } from "../context/AudioContext";
import toast from "react-hot-toast";

export default function useAudioPlayer() {
    const { audioRef } = useAudioContext();

    const lastPlayedId = usePlayerStore((state) => state.lastPlayedId);
    const setLastPlayedId = usePlayerStore((state) => state.setLastPlayedId);
    const currentSong = usePlayerStore((state) => state.currentSong());
    const queue = usePlayerStore((state) => state.queue);
    const nextSongAction = usePlayerStore((state) => state.nextSong);
    const prevSongAction = usePlayerStore((state) => state.prevSong);
    const setQueue = usePlayerStore((state) => state.setQueue);
    const { playing, setPlaying, progress, setProgress, volume, setVolume, shuffle, setShuffle, repeat, setRepeat } = usePlayerStore();
    const [isLoadingAudio, setIsLoadingAudio] = useState(false);

    // -------------------------------------------------------------------------
    // Restore last played song on mount
    // -------------------------------------------------------------------------

    useEffect(() => {
        if (queue.length > 0) return;

        const restoreLastPlayed = async () => {
            try {
                const { data: song } = await apiClient.get("/songs/last-played");
                if (!song) return;

                setQueue([{
                    song_id: song.song_id,
                    title: song.title,
                    artist: song.artist,
                    album: song.album || "",
                    thumbnail: song.thumbnail,
                    duration: song.duration_sec || 0,
                }], 0);

            } catch (err) {
                console.error("Failed to restore last played song:", err);
            }
        };

        restoreLastPlayed();
    }, [queue.length, setQueue]);

    // -------------------------------------------------------------------------
    // Load and play current song
    // -------------------------------------------------------------------------

    useEffect(() => {
        if (!currentSong) return;
        if (lastPlayedId === currentSong.song_id) return;

        let cancelled = false;

        const playCurrentSong = async () => {
            setIsLoadingAudio(true);
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
                setLastPlayedId(currentSong.song_id);
            } catch (err) {
                console.error("Audio fetch failed:", err);
            } finally {
                setIsLoadingAudio(false);
            }
        };

        playCurrentSong();
        return () => { cancelled = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
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

        audio.addEventListener("play", onPlay);
        audio.addEventListener("pause", onPause);
        audio.addEventListener("timeupdate", onTimeUpdate);
        audio.addEventListener("ended", onEnded);

        return () => {
            audio.removeEventListener("play", onPlay);
            audio.removeEventListener("pause", onPause);
            audio.removeEventListener("timeupdate", onTimeUpdate);
            audio.removeEventListener("ended", onEnded);
        };
    }, [audioRef, nextSongAction, repeat, setPlaying, setProgress]);

    // Volume control
    useEffect(() => {
        audioRef.current.volume = volume / 100;
    }, [audioRef, volume]);

    // -------------------------------------------------------------------------
    // Controls
    // -------------------------------------------------------------------------

    const toggle = () => {
        const audio = audioRef.current;
        if (!audio.src || audio.src === window.location.href) {
            toast.error("This song isn't loaded");
            return;
        }
        if (audio.paused) {
            audio.play();
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
        console.log(song);
        if (song) {
            setProgress(0);
            audioRef.current.currentTime = 0;
            usePlayerStore.getState().setQueue([{
                ...song,
                duration: song.duration ?? song.duration_sec ?? 0,
                thumbnail: song.thumbnail ?? song.album_art ?? "",
            }], 0);
        }
    }, [audioRef, setProgress]);

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
        currentSong
    };
}
