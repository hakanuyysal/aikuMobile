import {create} from 'zustand';
import {persist, createJSONStorage} from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Startup {
  id: string;
  name: string;
  description: string;
  logo?: string;
  website?: string;
  isHighlighted?: boolean;
  // Diğer startup bilgileri buraya eklenebilir
}

interface FavoritesState {
  favorites: Startup[];
  addToFavorites: (startup: Startup) => void;
  removeFromFavorites: (startupId: string) => void;
  isFavorite: (startupId: string) => boolean;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: [],
      addToFavorites: (startup) =>
        set((state) => {
          if (state.favorites.some((s) => s.id === startup.id)) {
            console.log(`Startup already in favorites: ${startup.name}`);
            return state; // Already in favorites, do not add again
          }
          return { favorites: [...state.favorites, startup] };
        }),
      removeFromFavorites: (startupId) => {
        console.log(`Attempting to remove favorite with ID: ${startupId}`);
        set((state) => ({
          favorites: state.favorites.filter((s) => s.id !== startupId),
        }));
      },
      isFavorite: (startupId) => {
        if (!startupId) return false;
        return get().favorites.some((startup) => startup.id === startupId);
      },
    }),
    {
      name: 'favorites-storage',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
); 