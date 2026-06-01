import { memo } from 'react';

import HomeView from './views/HomeView';
import SearchView from './views/SearchView';
import LikedView from './views/LikedView';
import PlaylistView from './views/PlaylistView';
import CreateView from './views/CreateView';
import SettingsView from './views/SettingsView';
import ProfileView from './views/ProfileView';



const MainContent = memo(({ view, liked, likedSongs, toggleLike, song, playing, activePL, search, setSearch, filtered, createName, setCreateName, thumbnailPreview, handleThumbnailUpload, createDescription, setCreateDescription, handleCreatePlaylist, selectedColor, setSelectedColor, setMenuSong, setMenuPosition, play, playPlaylist, playSongFromPlaylist, setPlMenuOpen, setPlMenuPos, openPlaylist, recentPlaylists, recentSongs }) => {

    return (
        <>
            {/* HOME */}
            {view === "home" && (
                <HomeView song={song} recentPlaylists={recentPlaylists} recentSongs={recentSongs} openPlaylist={openPlaylist} play={play} />
            )}
            {/* SEARCH */}
            {view === "search" && (
                <SearchView search={search} setSearch={setSearch} filtered={filtered} song={song} playing={playing} liked={liked} toggleLike={toggleLike} play={play} recentSongs={recentSongs} setMenuPosition={setMenuPosition} setMenuSong={setMenuSong} />
            )}
            {/* LIKED */}
            {view === "liked" && (
                <LikedView liked={liked} likedSongs={likedSongs} song={song} playing={playing} toggleLike={toggleLike} play={play} setMenuPosition={setMenuPosition} setMenuSong={setMenuSong} />
            )}
            {/* PLAYLIST */}
            {view === "playlist" && activePL && (
                <PlaylistView activePL={activePL} song={song} playing={playing} liked={liked} toggleLike={toggleLike} playSongFromPlaylist={playSongFromPlaylist} setMenuPosition={setMenuPosition} setMenuSong={setMenuSong} setPlMenuOpen={setPlMenuOpen} setPlMenuPos={setPlMenuPos} playPlaylist={playPlaylist} />
            )}
            {view === "create" && (
                <CreateView thumbnailPreview={thumbnailPreview} handleThumbnailUpload={handleThumbnailUpload} createName={createName} setCreateName={setCreateName} createDescription={createDescription} setCreateDescription={setCreateDescription} selectedColor={selectedColor} setSelectedColor={setSelectedColor} handleCreatePlaylist={handleCreatePlaylist} />
            )}
            {/* PROFILE */}
            {view === "profile" && (
                <ProfileView song={song} playing={playing} liked={liked} toggleLike={toggleLike} play={play} setMenuPosition={setMenuPosition} setMenuSong={setMenuSong} />
            )}
            {/* SETTINGS */}
            {view === "settings" && (
                <SettingsView />
            )}
        </>
    );
});
export default MainContent;