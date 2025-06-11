import {create} from 'zustand';
import {persist, createJSONStorage} from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Social {
  linkedin?: string;
  instagram?: string;
  facebook?: string;
  twitter?: string;
}

interface Profile {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  title?: string;
  location?: string;
  profileInfo?: string;
  photoURL?: string;
  social: Social;
}

interface ProfileState {
  profile: Profile;
  updateProfile: (newProfile: Profile) => void;
  updateProfilePhoto: (photoURL: string) => void;
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      profile: {
        social: {},
      },
      updateProfile: (newProfile) => set(() => ({profile: newProfile})),
      updateProfilePhoto: (photoURL) =>
        set((state) => ({
          profile: {
            ...state.profile,
            photoURL,
          },
        })),
    }),
    {
      name: 'profile-storage',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);