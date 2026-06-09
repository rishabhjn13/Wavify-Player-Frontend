import { useUIStateContext } from '../context/UIStateContext';
import { usePlaylistContext } from '../context/PlaylistsContext';

import CreateView from './views/CreateView';
import HomeView from './views/HomeView';
import LikedView from './views/LikedView';
import PlaylistView from './views/PlaylistView';
import ProfileView from './views/ProfileView';
import SearchView from './views/SearchView';
import SettingsView from './views/SettingsView';
import EditView from './views/EditView';


const MainContent = (() => {
    const { activePL } = usePlaylistContext();
    const { view } = useUIStateContext();
    return (
        <>
            {view === "home" && (
                < HomeView />
            )}
            {view === "search" && (
                <SearchView />
            )}
            {view === 'edit' && (
                <EditView />
            )
            }
            {view === "liked" && (
                <LikedView />
            )}
            {view === "playlist" && activePL && (
                <PlaylistView />
            )}
            {view === "create" && (
                <CreateView />
            )}
            {view === "profile" && (
                <ProfileView />
            )}
            {view === "settings" && (
                <SettingsView />
            )}
        </>
    );
});
export default MainContent;