import { supabase } from './supabase';

const DEFAULT_CONFIG = {
  sessionSecret: 'default-secret',
  companyName: 'Company',
  defaultSalary: 5000000,
  defaultMealAllowance: 25000
};

export async function getConfig() {
  const { data, error } = await supabase
    .from('config')
    .select('*')
    .eq('id', 'main')
    .single();
  if (error || !data) return DEFAULT_CONFIG;
  return { ...DEFAULT_CONFIG, ...data.settings };
}

export async function saveConfig(newConfig) {
  const current = await getConfig();
  const merged = { ...current, ...newConfig };
  const { error } = await supabase
    .from('config')
    .upsert({ id: 'main', settings: merged, updated_at: new Date().toISOString() }, { onConflict: 'id' });
  if (error) console.error('saveConfig error:', error);
}
