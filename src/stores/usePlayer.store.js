import { create } from 'zustand';

export const usePlayerStore = create((set, get) => ({
  queue: [],
  currentIndex: 0,

  // Action: Load an entire playlist and play from the start
  setQueue: (songs, startWithIndex = 0) => {
    set({ queue: songs, currentIndex: startWithIndex });
  },

  loadSongWithoutPlaying: (song) => {
    set({ queue: [song], currentIndex: 0, paused: true });
  },
  // Action: Skip to the next song
  nextSong: () => {
    const { queue, currentIndex } = get();
    if (currentIndex < queue.length - 1) {
      set({ currentIndex: currentIndex + 1 });
    }
  },

  // Action: Go back to the previous song
  prevSong: () => {
    const { currentIndex } = get();
    if (currentIndex > 0) {
      set({ currentIndex: currentIndex - 1 });
    }
  },

  // Action: Add a song to play right after the current one finishes
  playNext: (song) => {
    const { queue, currentIndex } = get();
    const updatedQueue = [...queue];

    // Insert the song right after the current index
    updatedQueue.splice(currentIndex + 1, 0, song);
    set({ queue: updatedQueue });
  },
}));