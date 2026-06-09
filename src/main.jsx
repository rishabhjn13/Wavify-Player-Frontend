import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { AudioProvider } from './providers/AudioProvider.jsx';
import { LikedSongsProvider } from './providers/LikedSongsProvider.jsx';
import { PlaylistProvider } from './providers/PlaylistProvider.jsx';
import { RecentsProvider } from './providers/RecentsProvider.jsx';
import { SearchProvider } from './providers/SearchProvider.jsx';
import { ContextMenuProvider } from './providers/SongContextProvider.jsx';
import { UIStateProvider } from './providers/UIStateProvider';

createRoot(document.getElementById('root')).render(
  <SearchProvider>
    <AudioProvider>
      <UIStateProvider>
        <RecentsProvider>
          <LikedSongsProvider>
            <PlaylistProvider>
              <ContextMenuProvider>
                <App />
              </ContextMenuProvider>
            </PlaylistProvider>
          </LikedSongsProvider>
        </RecentsProvider>
      </UIStateProvider>
    </AudioProvider>
  </SearchProvider>
)
