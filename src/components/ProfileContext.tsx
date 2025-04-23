// context/ProfileContext.tsx

import React, { createContext, useContext, useState, ReactNode } from 'react';

type ProfileData = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  title: string;
  location: string;
  profileInfo: string;
  social: {
    linkedin: string;
    instagram: string;
    facebook: string;
    twitter: string;
  };
};

const defaultProfile: ProfileData = {
  firstName: 'Mücahid',
  lastName: 'Usta',
  email: 'mucahidusta9@gmail.com',
  phone: '+90',
  title: '',
  location: '',
  profileInfo: '',
  social: {
    linkedin: '',
    instagram: '',
    facebook: '',
    twitter: '',
  },
};

const ProfileContext = createContext<{
  profile: ProfileData;
  setProfile: (data: ProfileData) => void;
}>({
  profile: defaultProfile,
  setProfile: () => {},
});

export const useProfile = () => useContext(ProfileContext);

export const ProfileProvider = ({ children }: { children: ReactNode }) => {
  const [profile, setProfile] = useState<ProfileData>(defaultProfile);

  return (
    <ProfileContext.Provider value={{ profile, setProfile }}>
      {children}
    </ProfileContext.Provider>
  );
};
