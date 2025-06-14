import {useState, useEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useAuth} from '../contexts/AuthContext';

interface AppInitializationState {
  isLoading: boolean;
  showSplash: boolean;
  showOnboarding: boolean;
  initialRoute: 'Onboarding' | 'Auth' | 'Main';
}

export const useAppInitialization = (): AppInitializationState => {
  const {user, loading: authLoading} = useAuth();
  const [state, setState] = useState<AppInitializationState>({
    isLoading: true,
    showSplash: true,
    showOnboarding: true,
    initialRoute: 'Auth',
  });

  useEffect(() => {
    const initializeApp = async () => {
      try {
        const [onboardingCompleted, token, hasLaunched] = await Promise.all([
          AsyncStorage.getItem('onboardingCompleted'),
          AsyncStorage.getItem('token'),
          AsyncStorage.getItem('hasLaunched'),
        ]);

        let initialRoute: 'Onboarding' | 'Auth' | 'Main' = 'Auth';
        if (!onboardingCompleted) {
          initialRoute = 'Onboarding';
        } else if (user && token) {
          initialRoute = 'Main';
        }

        if (!hasLaunched) {
          await AsyncStorage.setItem('hasLaunched', 'true');
          setState({
            isLoading: false,
            showSplash: true,
            showOnboarding: !onboardingCompleted,
            initialRoute,
          });
        } else {
          setState({
            isLoading: false,
            showSplash: false,
            showOnboarding: !onboardingCompleted,
            initialRoute,
          });
        }
      } catch (error) {
        console.error('App initialization error:', error);
        setState({
          isLoading: false,
          showSplash: false,
          showOnboarding: false,
          initialRoute: 'Auth',
        });
      }
    };

    if (!authLoading) {
      initializeApp();
    }
  }, [authLoading, user]);

  useEffect(() => {
    if (!state.isLoading && state.showSplash) {
      const timer = setTimeout(() => {
        setState(prev => ({...prev, showSplash: false}));
      }, 10500);
      return () => clearTimeout(timer);
    }
  }, [state.isLoading, state.showSplash]);

  return state;
};

export const markOnboardingComplete = async (): Promise<void> => {
  try {
    await AsyncStorage.setItem('onboardingCompleted', 'true');
  } catch (error) {
    console.error('Error marking onboarding as complete:', error);
  }
};
