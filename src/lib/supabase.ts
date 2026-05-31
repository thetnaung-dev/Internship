import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://blmwxotjyvwiqzuoujpm.supabase.co"; // Or your cloud URL
const SUPABASE_KEY = "sb_publishable_hJ0-6tAK18uYH6pi9xaYmg_ClrCAlqn";

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
