import { useEffect, useRef } from "react";
import { useAudioContext } from "../context/AudioContext";
import { usePlayerStore } from "../stores/usePlayer.store";
import useAudioPlayer from "./useAudioPlayer";

export function useSleepTimer() {
  const { sleepTimer, clearSleepTimer } = usePlayerStore();
  const { currentSong } = useAudioPlayer();
  const prevSong = useRef(currentSong);
  const { audioRef } = useAudioContext();
  useEffect(() => {
    if (!sleepTimer) return;

    // "end of song" mode — watch for song change
    if (sleepTimer === "song") {
      if (prevSong.current?.song_id !== currentSong?.song_id && prevSong.current) {
        audioRef.current.pause(); clearSleepTimer();
      }
      prevSong.current = currentSong;
      return;
    }

    // Countdown mode
    const remaining = sleepTimer - Date.now();
    if (remaining <= 0) { audioRef.current.pause(); clearSleepTimer(); return; }
    const timeout = setTimeout(() => { audioRef.current.pause(); clearSleepTimer(); }, remaining);
    return () => clearTimeout(timeout);
  }, [sleepTimer, currentSong, clearSleepTimer, audioRef]);
}