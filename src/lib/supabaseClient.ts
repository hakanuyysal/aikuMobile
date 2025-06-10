import { supabase } from '../config/supabase';

export const signInWithLinkedIn = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'linkedin',
    options: {
      redirectTo: 'http://aikuaiplatform://auth/social-callback'
    }
  });

  if (error) throw error;
  return data;
}; 