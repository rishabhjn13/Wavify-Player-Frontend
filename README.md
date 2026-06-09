<div align="center">

# 🎵 Wavify

**A local-first music player built with React — search, stream, and organize your music with a clean, fast UI.**

![React](https://img.shields.io/badge/React-18+-61DAFB?style=flat&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-5+-646CFF?style=flat&logo=vite&logoColor=white)
![Zustand](https://img.shields.io/badge/Zustand-state-FF6B35?style=flat)
![Web Audio API](https://img.shields.io/badge/Web%20Audio%20API-analyser-blueviolet?style=flat)
![License](https://img.shields.io/badge/license-MIT-green?style=flat)

</div>

---

## What is Wavify?

Wavify is a **local-first music player frontend** — a React app that connects to the [Wavify Backend Engine](https://github.com/rishabhjn13/Wavify-Player-Backend) running on your machine. It lets you search songs via YouTube Music, stream audio, manage playlists, track recently played songs, and visualize audio — all in a focused, distraction-free UI.

> **Requires the backend running locally.** See [wavify-backend-engine](https://github.com/rishabhjn13/Wavify-Player-Backend) to get that up first.

---

## Features

- 🔍 **Song Search** — Search via YouTube Music metadata. Results show title, artist, album, thumbnail, and duration.
- ▶️ **Audio Playback** — Stream audio using the backend's yt-dlp pipeline. Full playback controls: play/pause, seek, skip, volume.
- 📊 **Audio Visualizer** — Real-time frequency visualization via the Web Audio API analyser node.
- 📋 **Playlist Management** — Create, edit, and delete playlists with custom names, descriptions, and thumbnails.
- ❤️ **Liked Songs** — Like any song and find it again in a dedicated Liked Songs view.
- 🕘 **Recently Played** — Tracks recently played songs and playlists, automatically surfaced in the sidebar.
- ⚡ **Optimistic UI** — Actions feel instant; state updates locally before the backend confirms.
- 🎨 **Responsive Layout** — Three-panel layout with collapsible right panel for playlists and song queues.

---

## Tech Stack

| Tool | Purpose |
|------|---------|
| **React 18** | UI framework |
| **Vite** | Build tool & dev server |
| **Zustand** | Global audio player state (`usePlayerStore`) |
| **React Context** | UI state, playlists, recents, liked songs |
| **Web Audio API** | Audio analyser for visualization |
| **Axios / Fetch** | Backend API communication |

---

## Architecture

Wavify uses a deliberate separation between **playback state** and **UI state**, with a layered provider pattern.

### State Architecture

```
main.jsx
└── UIStateProvider          ← panel visibility, active views, right panel
    └── PlaylistProvider     ← playlist CRUD + song lists
        └── RecentsProvider  ← recently played songs & playlists
            └── LikedSongsProvider  ← liked song management
                └── App
                    └── PlayerBar  ← only component that calls useAudioPlayer()
```

### Data Flow

```
User Action
    │
    ▼
React Context / Zustand Store  ──► Optimistic UI update
    │
    ▼
Backend API (localhost:8000)
    │
    ▼
State confirmed / corrected
```

### Key Principle

> `useAudioPlayer` is called **once** — in `PlayerBar`. All other components read from `usePlayerStore` (Zustand) or `UIStateContext` (React Context) directly. No prop drilling.

---

## Project Structure

```
wavify/
├── index.html
├── vite.config.js
├── src/
│   ├── main.jsx                   # Provider nesting, app entry
│   ├── App.jsx                    # Layout shell, route structure
│   │
│   ├── contexts/
│   │   ├── UIStateContext.jsx     # Panel state, active views
│   │   ├── PlaylistContext.jsx    # Playlist data + mutations
│   │   ├── RecentsContext.jsx     # Recently played tracking
│   │   └── LikedSongsContext.jsx  # Liked song state
│   │
│   ├── store/
│   │   └── usePlayerStore.js      # Zustand: playback, queue, current song
│   │
│   ├── hooks/
│   │   ├── useAudioPlayer.js      # Web Audio API + playback logic
│   │   └── ...                    # Other feature hooks
│   │
│   ├── components/
│   │   ├── PlayerBar/             # Playback controls, seeker, volume
│   │   ├── Sidebar/               # Nav, playlists, recents
│   │   ├── MainPanel/             # Search results, playlist views
│   │   ├── RightPanel/            # Queue, song details
│   │   └── Visualizer/            # Web Audio frequency bars
│   │
│   └── api/
│       └── index.js               # All backend API calls
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- [Wavify Backend Engine](https://github.com/rishabhjn13/Wavify-Player-Backend) running on `localhost:8000`

### Installation

**1. Clone the repository**
```bash
git clone https://github.com/rishabhjn13/wavify.git
cd wavify
```

**2. Install dependencies**
```bash
npm install
```

**3. Start the dev server**
```bash
npm run dev
```

Open `http://localhost:5173` — the app connects to the backend at `localhost:8000` by default.

### Build for production

```bash
npm run build
npm run preview
```

---

## Backend Integration

Wavify talks to the local backend for all data. The relevant endpoints it uses:

| Method | Endpoint | Used for |
|--------|----------|---------|
| `GET` | `/search-metadata` | Song search results |
| `GET` | `/get-audio` | Streaming URL by song ID |
| `GET` | `/playlists/` | Load all playlists |
| `POST` | `/playlists/` | Create a playlist |
| `POST` | `/playlists/{id}/songs` | Add song to playlist |
| `DELETE` | `/playlists/{id}` | Delete a playlist |
| `GET` | `/playlists/recently-played` | Recently played playlists |
| `POST` | `/playlists/{id}/played` | Mark playlist as played |
| `GET` | `/songs/last-played` | Last played song on load |

> **Note:** Audio streaming via yt-dlp is currently under maintenance on the backend. See [backend README](https://github.com/rishabhjn13/Wavify-Player-Backend) for status.

---

## Known Issues

- ⚠️ **Audio streaming** depends on the backend's yt-dlp pipeline, which is currently under maintenance due to YouTube signature challenge requirements.
- 🔄 Audio analyser visualizer requires a streaming URL to be active — falls back gracefully when unavailable.

---

## Contributing

This is a personal project but issues and PRs are welcome — especially around the audio visualizer, state architecture, or the streaming workaround once the backend yt-dlp fix lands.

---

<div align="center">
Built locally, played loudly. ☕
</div>
