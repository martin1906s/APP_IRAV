import { supabase } from './src/infrastructure/supabase/supabaseConfig';
async function test() {
  const r1 = await supabase.from('users').select('*').limit(1);
  console.log('users:', r1.error || r1.data);
  const r2 = await supabase.from('mood_logs').select('*').limit(1);
  console.log('mood_logs:', r2.error || r2.data);
  const r3 = await supabase.from('announcements').select('*').limit(1);
  console.log('announcements:', r3.error || r3.data);
}
test();
