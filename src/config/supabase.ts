import {createClient} from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = 'https://bevakpqfycmxnpzrkecv.supabase.co';
const supabaseAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJldmFrcHFmeWNteG5wenJrZWN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIzMDI5NzQsImV4cCI6MjA1Nzg3ODk3NH0.TQ6yWAkQXJuzDyZiaNX-J_kbtAqrF6aIn2mABe0n3NY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
