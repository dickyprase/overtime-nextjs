import { supabase } from './supabase';

// ========== USERS ==========

export async function loadUsers() {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: true });
  if (error) { console.error('loadUsers error:', error); return []; }
  return data || [];
}

export async function saveUser(user) {
  const { error } = await supabase
    .from('users')
    .upsert(user, { onConflict: 'id' });
  if (error) console.error('saveUser error:', error);
}

export async function deleteUser(id) {
  const { error } = await supabase
    .from('users')
    .delete()
    .eq('id', id);
  if (error) console.error('deleteUser error:', error);
}

export async function findUserByUsername(username) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('username', username)
    .single();
  if (error) return null;
  return data;
}

export async function findUserById(id) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single();
  if (error) return null;
  return data;
}

// ========== OVERTIME ==========

export async function loadOvertime() {
  const { data, error } = await supabase
    .from('overtime')
    .select('*')
    .order('created_at', { ascending: true });
  if (error) { console.error('loadOvertime error:', error); return []; }
  return data || [];
}

export async function loadOvertimeByUserId(userId) {
  const { data, error } = await supabase
    .from('overtime')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: true });
  if (error) { console.error('loadOvertimeByUserId error:', error); return []; }
  return data || [];
}

export async function saveOvertimeRecord(record) {
  const { error } = await supabase
    .from('overtime')
    .upsert(record, { onConflict: 'id' });
  if (error) console.error('saveOvertimeRecord error:', error);
}

export async function insertOvertimeRecord(record) {
  const { data, error } = await supabase
    .from('overtime')
    .insert(record)
    .select()
    .single();
  if (error) { console.error('insertOvertimeRecord error:', error); return null; }
  return data;
}

export async function deleteOvertimeRecord(id) {
  const { error } = await supabase
    .from('overtime')
    .delete()
    .eq('id', id);
  if (error) console.error('deleteOvertimeRecord error:', error);
}

export async function updateOvertimeFields(id, fields) {
  const { error } = await supabase
    .from('overtime')
    .update(fields)
    .eq('id', id);
  if (error) console.error('updateOvertimeFields error:', error);
}

export async function bulkUpsertOvertime(records) {
  const { error } = await supabase
    .from('overtime')
    .upsert(records, { onConflict: 'id' });
  if (error) console.error('bulkUpsertOvertime error:', error);
}

// ========== INCOME ==========

export async function loadIncome() {
  const { data, error } = await supabase
    .from('income')
    .select('*')
    .order('created_at', { ascending: true });
  if (error) { console.error('loadIncome error:', error); return []; }
  return data || [];
}

export async function loadIncomeByUserId(userId) {
  const { data, error } = await supabase
    .from('income')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: true });
  if (error) { console.error('loadIncomeByUserId error:', error); return []; }
  return data || [];
}

export async function insertIncomeRecord(record) {
  const { data, error } = await supabase
    .from('income')
    .insert(record)
    .select()
    .single();
  if (error) { console.error('insertIncomeRecord error:', error); return null; }
  return data;
}

export async function deleteIncomeRecord(id) {
  const { error } = await supabase
    .from('income')
    .delete()
    .eq('id', id);
  if (error) console.error('deleteIncomeRecord error:', error);
}
