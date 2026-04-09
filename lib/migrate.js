import { supabase } from './supabase';

let dbReady = false;

export async function ensureTables() {
  if (dbReady) return true;

  try {
    // Cek apakah tabel users sudah ada dengan mencoba select
    const { error } = await supabase.from('users').select('id').limit(1);
    
    if (error && error.code === 'PGRST205') {
      console.error('❌ Tabel database belum dibuat!');
      console.error('📋 Buka: /api/migrate di browser untuk membuat tabel otomatis.');
      return false;
    }
    
    dbReady = true;
    return true;
  } catch (err) {
    console.error('❌ Error cek database:', err);
    return false;
  }
}
