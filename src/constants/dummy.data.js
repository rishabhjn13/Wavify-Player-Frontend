const SONGS = [
    { id: 1, title: "Neon Frequencies", artist: "Synthwave Ghost", album: "Voltage Dreams", duration: 214, genre: "Electronic", color: "#7C3AED", plays: "2.4M", year: 2024 },
];

const PLAYLISTS = [
    { id: 1, name: "Chill Vibes", count: 18, color: "#7C3AED", songs: [1] },
];

const ARTISTS = [
    { name: "CIPHER", color: "#4C1D95", songs: [2, 8, 15] },
    { name: "Synthwave Ghost", color: "#7C3AED", songs: [1, 13] },
    { name: "Stellar Wreck", color: "#BE185D", songs: [3, 10] },
    { name: "Haze&Form", color: "#1D4ED8", songs: [5, 9] },
    { name: "Dune Chorus", color: "#7C2D12", songs: [7, 14] },
    { name: "The Vaultmen", color: "#065F46", songs: [6, 11] },
    { name: "Auric", color: "#B45309", songs: [4, 12] },
];

const RECENT = [1];
const TRENDING = [1];
const NEW_REL = [1];

export { SONGS, PLAYLISTS, ARTISTS, RECENT, TRENDING, NEW_REL };