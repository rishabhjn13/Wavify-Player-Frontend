import { create } from 'zustand';

export const usePlayerStore = create((set, get) => ({
  queue: [],
  currentIndex: 0,
  playing: false,
  progress: 0,
  volume: 75,
  shuffle: false,
  repeat: false,

  sleepTimer: null,

  lastPlayedId: null,
  setLastPlayedId: (id) => set({ lastPlayedId: id }),

  // Usage: const currentSong = usePlayerStore((s) => s.currentSong());
  currentSong: () => {
    const { queue, currentIndex } = get();
    return queue[currentIndex] ?? null;
  },

  // ── Actions ───────────────────────────────────────────────────────────────

  /** Load a full queue and start from a given index. */
  setQueue: (songs, startWithIndex = 0) => {
    set({ queue: songs, currentIndex: startWithIndex });
  },

  /** Advance to the next track (no-op at end of queue). */
  nextSong: () => {
    const { queue, currentIndex } = get();
    if (currentIndex < queue.length - 1) {
      set({ currentIndex: currentIndex + 1 });
    }
  },

  /** Go back one track (no-op at start of queue). */
  prevSong: () => {
    const { currentIndex } = get();
    if (currentIndex > 0) {
      set({ currentIndex: currentIndex - 1 });
    }
  },

  /** Insert a song immediately after the current track. */
  playNext: (song) => {
    const { queue, currentIndex } = get();
    const updated = [...queue];
    updated.splice(currentIndex + 1, 0, song);
    set({ queue: updated });
  },

  reorderQueue: (newQueue) => {
    set({ queue: newQueue });
  },

  setPlaying: (v) => set({ playing: v }),
  setProgress: (v) => set({ progress: v }),
  setVolume: (v) => set({ volume: v }),

  setSleepTimer: (val) => set({ sleepTimer: val }),
  clearSleepTimer: () => set({ sleepTimer: null }),
}));