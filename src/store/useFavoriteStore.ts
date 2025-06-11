import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Company } from '../services/companyService';

interface FavoriteState {
  favorites: Company[];
  addFavorite: (company: Company) => void;
  removeFavorite: (companyId: string) => void;
  isFavorite: (companyId: string) => boolean;
  clearFavorites: () => void;
  hasHydrated: boolean;
}

export const useFavoriteStore = create<FavoriteState>()(
  persist(
    (set, get) => {
      console.log('useFavoriteStore: Initializing store');
      return {
        favorites: [],
        addFavorite: (company) =>
          set((state) => {
            console.log('useFavoriteStore: Adding favorite', company._id);
            const exists = state.favorites.some(item => item._id === company._id);
            if (exists) return state;
            return {
              favorites: [...state.favorites, company],
            };
          }),
        removeFavorite: (companyId) =>
          set((state) => {
            console.log('useFavoriteStore: Removing favorite', companyId);
            return {
              favorites: state.favorites.filter((item) => item._id !== companyId),
            };
          }),
        isFavorite: (companyId) => {
          const currentFavorites = get().favorites;
          console.log('useFavoriteStore: Checking isFavorite for', companyId, ', currentFavorites:', currentFavorites);
          return Array.isArray(currentFavorites) && currentFavorites.some((item) => item._id === companyId);
        },
        clearFavorites: () => {
          console.log('useFavoriteStore: Clearing favorites');
          set({ favorites: [] });
        },
        hasHydrated: false,
      };
    },
    {
      name: 'favorite-storage',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        console.log('useFavoriteStore: onRehydrateStorage called', state?.favorites);
        state?.setState({ hasHydrated: true });
      },
      // Hata durumunda veya bozuk veride varsayılan değeri döndürmek için
      deserialize: (stateStr) => {
        const state = JSON.parse(stateStr);
        // favorites'in bir dizi olduğundan emin ol
        if (state && !Array.isArray(state.state.favorites)) {
          console.warn('useFavoriteStore: Deserialized favorites is not an array, resetting to empty array.');
          state.state.favorites = [];
        }
        return state;
      },
    },
  )
);